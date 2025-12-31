import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from './GameContext';
import { useTasks } from './TaskContext';

const TimerContext = createContext();

export const useTimerContext = () => useContext(TimerContext);

const MODES = {
    FOCUS: { id: 'FOCUS', label: 'Focus', time: 25 * 60 },
    SHORT_BREAK: { id: 'SHORT_BREAK', label: 'Short Break', time: 5 * 60 },
    LONG_BREAK: { id: 'LONG_BREAK', label: 'Long Break', time: 15 * 60 },
};

export const TimerProvider = ({ children }) => {
    const { completeFocusSession } = useGame();
    const { tasks, activeTaskId, incrementPomodoroCount } = useTasks();

    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
    const [isActive, setIsActive] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false); // For visual feedback

    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const initialTimeRef = useRef(MODES.FOCUS.time);

    // Sound effect (simple beep using Web Audio API to avoid assets for now, or just a placeholder)
    const playSound = () => {
        // Basic beep
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
            setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 sec
        }

        // Auto switch? Or wait for user?
        // Requirement says "Operation: Start, Pause, Reset, Complete". 
        // Usually timer stops at 0.
    }, [mode, completeFocusSession, activeTaskId, incrementPomodoroCount, tasks]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleCompletion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, handleCompletion]);

    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
        initialTimeRef.current = MODES[newMode].time;
        setIsActive(false);
    }, []);

    const toggleTimer = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
    }, [mode]);

    const setCustomTime = (minutes) => {
        // Custom logic
        const seconds = minutes * 60;
        // We might need a CUSTOM mode or just override FOCUS
        setTimeLeft(seconds);
        initialTimeRef.current = seconds;
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
