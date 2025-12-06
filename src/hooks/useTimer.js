import { useState, useEffect, useCallback } from 'react';

const MODES = {
  FOCUS: { id: 'focus', label: 'Focus', time: 25 * 60 },
  SHORT_BREAK: { id: 'short', label: 'Short Break', time: 5 * 60 },
  LONG_BREAK: { id: 'long', label: 'Long Break', time: 15 * 60 },
};

export const useTimer = () => {
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  }, [mode]);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound here
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  return {
    timeLeft,
    isActive,
    mode,
    MODES,
    switchMode,
    toggleTimer,
    resetTimer,
    totalTime: MODES[mode].time,
  };
};
