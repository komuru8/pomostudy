import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const INITIAL_STATE = {
    xp: 0, // current xp for display/progress bar? Roadmap says "XP based on harvest".
    totalWP: 0, // Water Points (minutes learned)
    totalXP: 0, // Cumulative XP
    level: 1,
    water: 0, // Current spendable WP
    fertilizer: 0,
    harvested: [],
    sessionHistory: [],
    streakDays: 0,
    loginDays: 1,
    lastLoginDate: new Date().toISOString(),
    completedTasksCount: 0 // Track total tasks
};

// Simplified Requirement Schema for auto-check or manual check
const LEVELS = [
    { level: 1, label: '荒れ地', reqTime: 0, reqTasks: 0 },
    { level: 2, label: '耕された土', reqTime: 25, reqTasks: 3, reqChat: 1 }, // 25min (1 Pomo), 3 Tasks
    { level: 3, label: '小さな芽', reqTime: 600, reqTasks: 10 }, // 10 hours
    { level: 4, label: '実りの農家', reqTime: 1800, reqTasks: 10 }, // 30 hours
    { level: 5, label: '集いの集落', reqTime: 3600, reqTasks: 10 }, // 60 hours
    { level: 6, label: '賑わいの市場', reqTime: 9000, reqTasks: 10 }, // 150 hours
    { level: 7, label: '学園都市', reqTime: 0, reqTasks: 300 }, // 300 tasks implies high hours usually
    { level: 8, label: '賢者の城下町', reqTime: 30000, reqTasks: 300 }, // 500 hours
    { level: 9, label: '天空の庭園', reqTime: 48000, reqTasks: 300 }, // 800 hours
    { level: 10, label: '叡智のユートピア', reqTime: 60000, reqTasks: 300 } // 1000 hours
];

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState(INITIAL_STATE);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`pomodoro_game_state_${user.id}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Schema migration: ensure new fields exist
                    setGameState(parsed ? { ...INITIAL_STATE, ...parsed } : INITIAL_STATE);
                } catch (e) {
                    console.error("Failed to parse game state", e);
                    setGameState(INITIAL_STATE);
                }
            } else {
                setGameState(INITIAL_STATE);
            }
        } else {
            setGameState(INITIAL_STATE);
        }
    }, [user]);

    // Login Streak Logic (Simple check on mount/user change)
    useEffect(() => {
        if (!user) return;
        const today = new Date().toDateString();
        const lastLogin = new Date(gameState.lastLoginDate).toDateString();

        if (today !== lastLogin) {
            const diffTime = Math.abs(new Date(today) - new Date(lastLogin));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = gameState.streakDays;
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1; // Reset streak
            }

            setGameState(prev => ({
                ...prev,
                loginDays: (prev.loginDays || 0) + 1,
                streakDays: newStreak,
                lastLoginDate: new Date().toISOString()
            }));
        }
    }, [user]); // Logic typically needs to run once per session load, or check periodically. 

    useEffect(() => {
        if (user) {
            localStorage.setItem(`pomodoro_game_state_${user.id}`, JSON.stringify(gameState));
        }
    }, [gameState, user]);

    const checkLevelUp = (currentState) => {
        let newLevel = currentState.level;
        const totalMinutes = currentState.totalWP || 0;
        const tasks = currentState.completedTasksCount || 0;

        // Naive Level Check (Iterative)
        // User requested Lv 1->2 condition: 3 hours (180mins) AND AI Chat (ignored for now/mocked) 
        // OR Task 3 & Pomo 1 for Phase 1 Tutorial? 
        // Doc says: Lv.1 -> Lv.2 Promotion Condition: "Task 3 completed, Pomodoro 1 achieved" (Wait, doc says for WASTELAND promotion?)
        // Ah, Lv.1 is Wasteland. Promotion TO Lv.2 requires: "3 Tasks, 1 Pomodoro".
        // My LEVELS array above had 3 hours. Let's fix LEVELS to match Design Doc accurately.

        // Accurate Logic based on Doc:
        // To Reach Lv 2: 3 Tasks, 1 Pomodoro (assumed >25min session)
        if (newLevel < 2) {
            // Check if tasks >= 3 and Pomo >= 1
            // We need to track pomodoro count? totalWP/25 is roughly pomodoros? 
            // Or sessionHistory count of FOCUS > 1.
            const pomoCount = currentState.sessionHistory?.filter(s => s.type === 'FOCUS' && s.duration >= 25).length || 0;
            if (tasks >= 3 && pomoCount >= 1) newLevel = 2;
        }
        // To Reach Lv 3: 3 Hours (180m), 1 AI Chat
        else if (newLevel < 3) {
            if (totalMinutes >= 180) newLevel = 3;
        }

        return newLevel;
    };

    const addXP = (amount) => {
        setGameState((prev) => ({
            ...prev,
            xp: prev.xp + amount,
            totalXP: (prev.totalXP || 0) + amount
        }));
    };

    const addResource = (type, amount) => {
        setGameState((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + amount,
        }));
    };

    const incrementTaskStat = () => {
        // Call this when task completed
        setGameState(prev => {
            const newState = {
                ...prev,
                completedTasksCount: (prev.completedTasksCount || 0) + 1
            };
            const nextLevel = checkLevelUp(newState);
            return { ...newState, level: nextLevel };
        });
    };

    // Updated Harvest Logic for roadmap crops
    const harvestCrop = (cropType = 'random') => {
        // Roadmap: 
        // Lv 1: Weed (0 WP, 5 XP) - ONE TIME ONLY
        // Lv 2+: Radish (25 WP, 10 XP)

        let cost = 0;
        let crop = { type: 'weed', icon: '🌿', xp: 5 };

        if (gameState.level >= 2) {
            cost = 25;
            crop = { type: 'radish', icon: '🥔', xp: 10 };
        }

        // Logic Check: Lv 1 Limit (Tutorial)
        if (gameState.level === 1) {
            const hasWeed = gameState.harvested.some(c => c.type === 'weed' || c.name === 'Weed');
            if (hasWeed) return false;
        }

        // Logic Check: Cost
        if ((gameState.water || 0) < cost) return false;

        const newCrop = {
            id: Date.now(),
            icon: crop.icon,
            name: crop.type, // Store key as name for internal ref
            type: crop.type,
            xp: crop.xp,
            date: new Date().toISOString()
        };

        setGameState((prev) => {
            const newState = {
                ...prev,
                water: (prev.water || 0) - cost,
                harvested: [newCrop, ...(prev.harvested || [])],
                xp: (prev.xp || 0) + newCrop.xp,
                totalXP: (prev.totalXP || 0) + newCrop.xp
            };
            return newState;
        });
        return newCrop;
    };

    const completeFocusSession = (minutes, category = 'General') => {
        // 1 min = 1 WP
        setGameState((prev) => {
            const newState = {
                ...prev,
                water: (prev.water || 0) + minutes, // WP = minutes
                totalWP: (prev.totalWP || 0) + minutes,
                sessionHistory: [
                    {
                        id: Date.now(),
                        date: new Date().toISOString(),
                        duration: minutes,
                        category,
                        type: 'FOCUS'
                    },
                    ...(prev.sessionHistory || [])
                ]
            };
            const nextLevel = checkLevelUp(newState);
            return { ...newState, level: nextLevel };
        });
    };

    const completeBreakSession = (minutes, type = 'SHORT_BREAK') => {
        setGameState((prev) => ({
            ...prev,
            sessionHistory: [
                {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    duration: minutes,
                    category: 'Break',
                    type
                },
                ...(prev.sessionHistory || [])
            ]
        }));
    };

    return (
        <GameContext.Provider value={{
            gameState,
            LEVELS,
            addXP,
            addResource,
            incrementTaskStat, // New export
            completeFocusSession,
            completeBreakSession,
            harvestCrop
        }}>
            {children}
        </GameContext.Provider>
    );
};
