import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from './GameContext';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';

const TimerContext = createContext();

export const useTimerContext = () => useContext(TimerContext);

const MODES = {
    FOCUS: { id: 'FOCUS', label: 'Focus', time: 25 * 60 },
    SHORT_BREAK: { id: 'SHORT_BREAK', label: 'Short Break', time: 5 * 60 },
    LONG_BREAK: { id: 'LONG_BREAK', label: 'Long Break', time: 15 * 60 },
};

import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const TimerProvider = ({ children }) => {
    const { completeFocusSession, completeBreakSession } = useGame();
    const { tasks, activeTaskId, incrementPomodoroCount } = useTasks();
    const { user } = useAuth(); // Get user for keyed storage

    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
    const [isActive, setIsActive] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const initialTimeRef = useRef(MODES.FOCUS.time);
    const endTimeRef = useRef(null); // Ref to track end time for background accuracy

    // Sound effect (Function kept same)
    const playSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.1;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 500);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const handleCompletion = useCallback(() => {
        setIsActive(false);
        playSound();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        if (mode === 'FOCUS') {
            const minutesCompleted = Math.floor(MODES[mode].time / 60);

            // Find active task category
            const activeTask = tasks.find(t => t.id === activeTaskId);
            const category = activeTask ? activeTask.category : 'General';

            completeFocusSession(minutesCompleted, category);

            if (activeTaskId) {
                incrementPomodoroCount(activeTaskId);
            }
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        } else {
            const minutesCompleted = Math.floor(MODES[mode].time / 60);
            completeBreakSession(minutesCompleted, mode);
        }

        // Reset or Clear timer state in Firestore??
        // Actually rely on useEffect to save the "Stopped / Completed" state.
    }, [mode, completeFocusSession, completeBreakSession, activeTaskId, incrementPomodoroCount, tasks]);

    // Load/Listen to Firestore
    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const userRef = doc(db, 'users', user.id);

            unsubscribe = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.timerState) {
                        const parsed = data.timerState;
                        setMode(parsed.mode || 'FOCUS');
                        initialTimeRef.current = MODES[parsed.mode || 'FOCUS'].time;

                        if (parsed.isActive && parsed.endTime) {
                            const now = Date.now();
                            const remaining = Math.ceil((parsed.endTime - now) / 1000);

                            if (remaining > 0) {
                                setTimeLeft(remaining);
                                setIsActive(true);
                                endTimeRef.current = parsed.endTime;
                            } else {
                                setTimeLeft(0);
                                setIsActive(false);
                            }
                        } else {
                            setTimeLeft(parsed.timeLeft || MODES.FOCUS.time);
                            setIsActive(false);
                        }
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore timer listener error:", error);
                setLoading(false);
            });
        } else {
            setTimeLeft(MODES.FOCUS.time);
            setIsActive(false);
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    // Save to Firestore (Debounced)
    useEffect(() => {
        if (!user || loading) return;

        const saveToFirestore = async () => {
            try {
                const userRef = doc(db, 'users', user.id);
                const stateToSave = {
                    mode,
                    timeLeft,
                    isActive,
                    endTime: isActive ? endTimeRef.current : null,
                    lastUpdated: Date.now()
                };
                await setDoc(userRef, { timerState: stateToSave }, { merge: true });
            } catch (e) {
                console.error("Error saving timer state:", e);
            }
        };

        const timeoutId = setTimeout(saveToFirestore, 1000);
        return () => clearTimeout(timeoutId);

    }, [mode, timeLeft, isActive, user, loading]);


    // Timer Interval Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            // If starting fresh (no endTimeRef), set it
            if (!endTimeRef.current) {
                endTimeRef.current = Date.now() + timeLeft * 1000;
            }

            timerRef.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.ceil((endTimeRef.current - now) / 1000);

                if (remaining <= 0) {
                    clearInterval(timerRef.current);
                    setTimeLeft(0);
                    endTimeRef.current = null;
                    handleCompletion();
                } else {
                    setTimeLeft(remaining);
                }
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            if (!isActive) {
                endTimeRef.current = null; // Clear if paused
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, handleCompletion]); // Removed timeLeft dependency to avoid interval reset jitter, but added internal check

    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
        initialTimeRef.current = MODES[newMode].time;
        setIsActive(false);
        endTimeRef.current = null;
    }, []);

    const toggleTimer = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
        endTimeRef.current = null;
    }, [mode]);

    const setCustomTime = (minutes) => {
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        initialTimeRef.current = seconds;
        setIsActive(false);
        endTimeRef.current = null;
    };

    return (
        <TimerContext.Provider value={{
            timeLeft,
            totalTime: initialTimeRef.current,
            isActive,
            mode,
            MODES,
            showConfetti,
            switchMode,
            toggleTimer,
            resetTimer,
            setCustomTime
        }}>
            {children}
        </TimerContext.Provider>
    );
};
