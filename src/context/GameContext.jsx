import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const INITIAL_STATE = {
    xp: 0,
    totalWP: 0,
    totalXP: 0,
    level: 1,
    water: 0,
    fertilizer: 0,
    harvested: [],
    sessionHistory: [],
    streakDays: 0,
    loginDays: 1,
    lastLoginDate: new Date().toISOString(),
    completedTasksCount: 0,
    chatHistory: [],
    theme: 'default',
    username: ''
};

const LEVELS = [
    { level: 1, label: '荒れ地', reqTime: 0 },
    { level: 2, label: '耕された土', reqTime: 25 },
    { level: 3, label: '小さな芽', reqTime: 180 },
    { level: 4, label: '実りの農家', reqTime: 600 },
    { level: 5, label: '集いの集落', reqTime: 1800 },
    { level: 6, label: '賑わいの市場', reqTime: 3600 },
    { level: 7, label: '学園都市', reqTime: 9000 },
    { level: 8, label: '賢者の城下町', reqTime: 18000 },
    { level: 9, label: '天空の庭園', reqTime: 30000 },
    { level: 10, label: '叡智のユートピア', reqTime: 60000 }
];

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(true);

    const gameStateRef = React.useRef(gameState);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Helper to save immediately (handles both Auth and Guest)
    const saveGame = async (state) => {
        if (user) {
            try {
                const userRef = doc(db, 'users', user.id);
                // Deep copy to ensure no undefined values
                const safeState = JSON.parse(JSON.stringify(state));
                await setDoc(userRef, { gameState: safeState }, { merge: true });
                console.log("Game State Saved to Firestore");
            } catch (e) {
                console.error("Error saving game state to Firestore:", e);
            }
        } else {
            // Guest mode: Save to LocalStorage
            try {
                localStorage.setItem('pomodoro_game_state_guest', JSON.stringify(state));
                console.log("Game State Saved to LocalStorage (Guest)");
            } catch (e) {
                console.error("Error saving to LocalStorage:", e);
            }
        }
    };

    // Load/Listen to Firestore or LocalStorage
    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const userRef = doc(db, 'users', user.id);

            unsubscribe = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists() && docSnap.data().gameState) {
                    const loadedState = { ...INITIAL_STATE, ...docSnap.data().gameState };
                    if (!loadedState.username && user.displayName) {
                        loadedState.username = user.displayName;
                    }
                    setGameState(loadedState);
                } else {
                    // Migration from LocalStorage if user just signed up/in and FireStore is empty
                    const guestSaved = localStorage.getItem('pomodoro_game_state_guest');
                    let newState = INITIAL_STATE;
                    if (guestSaved) {
                        try {
                            const parsed = JSON.parse(guestSaved);
                            console.log("Migrating Guest data to Firestore...");
                            newState = { ...INITIAL_STATE, ...parsed };
                        } catch (e) {
                            console.error("Migration failed", e);
                        }
                    } else if (user.displayName) {
                        newState.username = user.displayName;
                    }
                    setGameState(newState);
                    // We don't auto-save immediately here to avoid write loops, 
                    // but the first action or auto-save debounce will preserve it.
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore listener error:", error);
                setLoading(false);
            });
        } else {
            // GUEST MODE: Load from LocalStorage
            setLoading(true);
            const saved = localStorage.getItem('pomodoro_game_state_guest');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setGameState({ ...INITIAL_STATE, ...parsed });
                } catch (e) {
                    console.error("Failed to parse guest state", e);
                    setGameState(INITIAL_STATE);
                }
            } else {
                setGameState(INITIAL_STATE);
            }
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    // Debounced Auto-Save
    useEffect(() => {
        if (loading) return;

        const timeoutId = setTimeout(() => {
            saveGame(gameState);
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [gameState, user, loading]);

    // Save on Tab Close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!loading) {
                // If user is logged in, we try; if guest, we definitely write to LS
                if (user) {
                    // Best effort for Firestore
                    saveGame(gameStateRef.current);
                } else {
                    localStorage.setItem('pomodoro_game_state_guest', JSON.stringify(gameStateRef.current));
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user, loading]);

    // Login Streak Logic
    useEffect(() => {
        if (!user || loading) return;
        const today = new Date().toDateString();
        const lastLogin = gameState.lastLoginDate ? new Date(gameState.lastLoginDate).toDateString() : new Date().toDateString();

        if (today !== lastLogin) {
            const diffTime = Math.abs(new Date(today) - new Date(lastLogin));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = gameState.streakDays || 0;
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }

            setGameState(prev => ({
                ...prev,
                loginDays: (prev.loginDays || 0) + 1,
                streakDays: newStreak,
                lastLoginDate: new Date().toISOString()
            }));
        }
    }, [user, loading]);

    const checkCanLevelUp = (currentState) => {
        const currentLevel = currentState.level;
        const totalMinutes = currentState.totalWP || 0;

        const nextLevelReq = LEVELS.find(l => l.level === currentLevel + 1);
        if (!nextLevelReq) return false;

        if (totalMinutes >= nextLevelReq.reqTime) return true;
        return false;
    };

    const upgradeLevel = () => {
        setGameState(prev => {
            if (!checkCanLevelUp(prev)) return prev;
            const newLevel = prev.level + 1;
            const newState = { ...prev, level: newLevel };
            saveGame(newState);
            return newState;
        });
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
            saveGame(newState);
            return newState;
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
            saveGame(newState);
            return newState;
        });
        return newCrop;
    };

    const addChatMessage = (message) => {
        setGameState(prev => {
            const currentHistory = prev.chatHistory || [];
            const newHistory = [...currentHistory, message];
            let finalHistory = newHistory;
            if (newHistory.length > 50) {
                finalHistory = newHistory.slice(newHistory.length - 50);
            }
            const newState = { ...prev, chatHistory: finalHistory };
            saveGame(newState);
            return newState;
        });
    };

    const changeTheme = (themeName) => {
        setGameState(prev => ({ ...prev, theme: themeName }));
    };

    const updateUsername = (name) => {
        setGameState(prev => {
            const newState = { ...prev, username: name };
            saveGame(newState);
            return newState;
        });
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
            saveGame(newState);
            return newState;
        });
    };

    const completeBreakSession = (minutes, type = 'SHORT_BREAK') => {
        setGameState((prev) => {
            const newState = {
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
            };
            saveGame(newState);
            return newState;
        });
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
            addChatMessage,
            changeTheme,
            updateUsername,
            checkCanLevelUp,
            upgradeLevel,
            loading
        }}>
            {children}
        </GameContext.Provider>
    );
};
