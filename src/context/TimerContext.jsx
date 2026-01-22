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
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    const ignoreSnapshotUntilRef = useRef(0); // Race condition protection
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
            const subCategory = activeTask ? activeTask.subCategory : null;

            completeFocusSession(minutesCompleted, category, subCategory);

            if (activeTaskId) {
                incrementPomodoroCount(activeTaskId);
            }
            setShowConfetti(true);
            setIsSessionComplete(true); // Trigger modal
            setTimeout(() => setShowConfetti(false), 5000);
        } else {
            const minutesCompleted = Math.floor(MODES[mode].time / 60);
            completeBreakSession(minutesCompleted, mode);
            setIsSessionComplete(true); // Trigger modal for breaks too
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
                // RACE CONDITION PROTECTION: Ignore updates immediately after local reset/switch
                if (Date.now() < ignoreSnapshotUntilRef.current) {
                    console.log("Ignoring Firestore update due to recent local action");
                    return;
                }

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

    // Manual Save Helper (for explicit actions)
    const saveStateEventually = useCallback(async (newState) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.id);
            await setDoc(userRef, { timerState: { ...newState, lastUpdated: Date.now() } }, { merge: true });
        } catch (e) {
            console.error("Immediate save failed", e);
        }
    }, [user]);


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

    // Save partial progress before resetting or switching
    const savePartialProgress = useCallback(() => {
        try {
            if (mode !== 'FOCUS') return; // Only save focus sessions for now? Or breaks too? Usually only Focus counts for "Study Time".

            const currentInitial = initialTimeRef.current;
            const elapsedSeconds = currentInitial - timeLeft;

            // Save if at least 1 second has passed (lowered for better UX/testing)
            if (elapsedSeconds >= 1) {
                // Allow partial minutes (e.g. 0 min) if we want to be strict, 
                // but usually we want at least 1 min? 
                // Wait, Math.floor(59/60) is 0. 0 minutes saved is useless.
                // We need to support seconds? Or just round up/accumulate seconds?
                // The history assumes minutes.
                // If I change to 1s, I should probably ceil or round if it's significant?
                // Or just keep the logic: if < 1 min, it records 0 min?
                // User wants "5 mins + 3 mins = 8 mins".
                // If they test "10s + 10s", they get 0.
                // Let's stick to minute granularity but maybe round up if > 30s?
                // Or accumulate seconds in a separate "partial buffer"? Too complex.
                // Let's use Math.round? 30s -> 1m.

                let minutesCompleted = Math.floor(elapsedSeconds / 60);

                // Special case: If user deliberately did > 10s and reset, maybe give them 1m for effort?
                // No, that cheats.
                // Let's stick to: if >= 30s, round up.
                if (elapsedSeconds < 60 && elapsedSeconds >= 30) {
                    minutesCompleted = 1;
                }

                if (minutesCompleted > 0) {
                    // Find active task category - handle tasks being undefined/loading
                    let category = 'General';
                    let subCategory = null;

                    if (tasks && Array.isArray(tasks)) {
                        const activeTask = tasks.find(t => t.id === activeTaskId);
                        if (activeTask) {
                            category = activeTask.category || 'General';
                            subCategory = activeTask.subCategory || null;
                        }
                    }

                    completeFocusSession(minutesCompleted, category, subCategory);
                    console.log(`Saved partial progress: ${minutesCompleted} minutes (${category}/${subCategory})`);
                }
            }
        } catch (error) {
            console.error("Error saving partial progress:", error);
        }
    }, [mode, timeLeft, tasks, activeTaskId, completeFocusSession]);

    const switchMode = useCallback((newMode) => {
        savePartialProgress(); // Save before switching

        // Block Snapshot Listener
        ignoreSnapshotUntilRef.current = Date.now() + 2000;

        setMode(newMode);
        setIsSessionComplete(false); // Reset modal status
        const newTime = MODES[newMode].time;
        setTimeLeft(newTime);
        initialTimeRef.current = newTime;
        setIsActive(false);
        endTimeRef.current = null;

        // Force save state to Firestore
        saveStateEventually({
            mode: newMode,
            timeLeft: newTime,
            isActive: false,
            endTime: null
        });
    }, [savePartialProgress, MODES, saveStateEventually]);

    const toggleTimer = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        savePartialProgress(); // Save before resetting

        // Block Snapshot Listener
        ignoreSnapshotUntilRef.current = Date.now() + 2000;

        // Reset Logic
        setIsActive(false);
        setIsSessionComplete(false); // Reset modal status
        const resetTime = MODES[mode].time;
        setTimeLeft(resetTime);
        initialTimeRef.current = resetTime; // Sync initial time ref!
        endTimeRef.current = null;

        // Force save state to Firestore to verify reset
        saveStateEventually({
            mode: mode,
            timeLeft: resetTime,
            isActive: false,
            endTime: null
        });
    }, [mode, savePartialProgress, MODES, saveStateEventually]);

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
            setCustomTime,
            isSessionComplete,
            setIsSessionComplete
        }}>
            {children}
        </TimerContext.Provider>
    );
};
