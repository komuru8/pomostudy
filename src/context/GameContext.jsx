import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
    const [loading, setLoading] = useState(true);

    // Load/Listen to Firestore
    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const userRef = doc(db, 'users', user.id);

            unsubscribe = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists() && docSnap.data().gameState) {
                    // Normal load from Firestore
                    setGameState(prev => ({ ...INITIAL_STATE, ...docSnap.data().gameState }));
                } else {
                    // Firestore is empty or missing gameState.
                    // Try to migrate from localStorage (Legacy Support)
                    const localKey = `pomodoro_game_state_${user.id}`;
                    const localSaved = localStorage.getItem(localKey);

                    if (localSaved) {
                        try {
                            const parsed = JSON.parse(localSaved);
                            console.log("Migrating local data to Firestore...", parsed);
                            setGameState({ ...INITIAL_STATE, ...parsed });
                            // The useEffect saving hook will auto-upload this to Firestore shortly.
                        } catch (e) {
                            console.error("Migration failed, using initial state", e);
                            setGameState(INITIAL_STATE);
                        }
                    } else {
                        // No local data, truly new user
                        setGameState(INITIAL_STATE);
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore listener error:", error);
                setLoading(false);
            });
        } else {
            setGameState(INITIAL_STATE);
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    // Save to Firestore (Debounced or direct?)
    // Using a ref to prevent infinite loops if we were using a 2-way binding effect efficiently, 
    // but simplifying by creating a helper that saves AND sets state is better.
    // However, existing code uses setsGameState extensively.
    // Let's attach a saver effect but check for deep equality or rely on Firestore client side deduplication.

    // Actually, simplest migration: use saveGameData helper for critical actions, 
    // OR persist-on-change effect with a debounce.
    // Given the prompt "Database persistence", let's use the effect to ensure EVERYTHING is saved.

    useEffect(() => {
        if (!user || loading) return;

        const saveToFirestore = async () => {
            try {
                const userRef = doc(db, 'users', user.id);
                // We utilize setDoc with merge.
                // Note: This will write to DB on every local change.
                // Be careful of write costs. Debouncing recommended.
                await setDoc(userRef, { gameState }, { merge: true });
            } catch (e) {
                console.error("Error saving game state:", e);
            }
        };

        const timeoutId = setTimeout(saveToFirestore, 1000); // 1 sec debounce
        return () => clearTimeout(timeoutId);

    }, [gameState, user, loading]);


    // Login Streak Logic (Simple check on mount/user change)
    useEffect(() => {
        if (!user || loading) return;
        const today = new Date().toDateString();
        // Guard against null lastLoginDate
        const lastLogin = gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toDateString() : new Date().toDateString();

        if (today !== lastLogin) {
            const diffTime = Math.abs(new Date(today) - new Date(lastLogin));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = gameState.streakDays || 0;
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
    }, [user, loading]); // Depend on loading to ensure we have fetched data first

    const checkLevelUp = (currentState) => {
        let newLevel = currentState.level;
        const totalMinutes = currentState.totalWP || 0;
        const tasks = currentState.completedTasksCount || 0;

        // Requirement: To Reach Lv 2: 3 Tasks, 1 Pomodoro
        if (newLevel < 2) {
            const pomoCount = currentState.sessionHistory?.filter(s => s.type === 'FOCUS' && s.duration >= 25).length || 0;
            if (tasks >= 3 && pomoCount >= 1) newLevel = 2;
        }
        // To Reach Lv 3: 3 Hours (180m)
        else if (newLevel < 3) {
            if (totalMinutes >= 180) newLevel = 3;
        }

        return newLevel;
    };

    const addXP = (amount) => {
        setGameState((prev) => ({
            ...prev,
            xp: (prev.xp || 0) + amount,
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
        setGameState(prev => {
            const newState = {
                ...prev,
                completedTasksCount: (prev.completedTasksCount || 0) + 1
            };
            const nextLevel = checkLevelUp(newState);
            return { ...newState, level: nextLevel };
        });
    };

    const harvestCrop = (cropType = 'random') => {
        let cost = 0;
        let crop = { type: 'weed', icon: '🌿', xp: 5 };

        if (gameState.level >= 2) {
            cost = 25;
            crop = { type: 'radish', icon: '🥔', xp: 10 };
        }

        if (gameState.level === 1) {
            const hasWeed = gameState.harvested.some(c => c.type === 'weed' || c.name === 'Weed');
            if (hasWeed) return false;
        }

        if ((gameState.water || 0) < cost) return false;

        const newCrop = {
            id: Date.now(),
            icon: crop.icon,
            name: crop.type,
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
        setGameState((prev) => {
            const newState = {
                ...prev,
                water: (prev.water || 0) + minutes,
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
            incrementTaskStat,
            completeFocusSession,
            completeBreakSession,
            harvestCrop,
            loading
        }}>
            {children}
        </GameContext.Provider>
    );
};
