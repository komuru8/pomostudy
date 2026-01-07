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
    username: '',
    vp: 0,
    activeCoachId: 'neko',
    fieldPlots: [], // Array of { id, type, plantDate, stage }
    lastSeedDate: null // ISO String of last daily seed
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
                    if (!loadedState.unlockedCrops) {
                        loadedState.unlockedCrops = [];
                        // Migration: Backfill from harvested
                        if (loadedState.harvested && loadedState.harvested.length > 0) {
                            const uniqueTypes = [...new Set(loadedState.harvested.map(c => c.type))];
                            loadedState.unlockedCrops = uniqueTypes;
                        }
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

    // Daily Seed Logic
    useEffect(() => {
        if (!user || loading) return;
        const todayStr = new Date().toDateString();
        const lastSeedStr = gameState.lastSeedDate ? new Date(gameState.lastSeedDate).toDateString() : '';

        if (todayStr !== lastSeedStr) {
            // It's a new day! Add a seed if there's space.
            const maxSlots = gameState.level + 2;
            const currentPlots = gameState.fieldPlots || [];

            if (currentPlots.length < maxSlots) {
                // Determine available crops based on level
                const availableLevelCrops = Object.values(LEVEL_CROPS).filter(c => {
                    // Find the level this crop belongs to. 
                    // Note: LEVEL_CROPS key is level. We need to check key <= gameState.level.
                    // But LEVEL_CROPS is object. Let's iterate keys.
                    return true; // We'll refine filtration inside the reduce/map or just pick from current level downwards
                });

                // Actually, let's just pick a random level from 2 up to currentLevel (max 10)
                // Then pick the crop for that level.
                // Simple logic: Candidate levels = [2 ... currentLevel]
                const candidateLevels = Object.keys(LEVEL_CROPS)
                    .map(Number)
                    .filter(l => l <= gameState.level);

                if (candidateLevels.length > 0) {
                    const randomLevel = candidateLevels[Math.floor(Math.random() * candidateLevels.length)];
                    const cropDef = LEVEL_CROPS[randomLevel];

                    if (cropDef) {
                        const newPlot = {
                            id: Date.now(), // Unique ID for the plot
                            type: cropDef.type,
                            icon: '🌱', // Start as seed
                            realIcon: cropDef.icon, // Reveal later? Or show immediately? User said "Seed added". Let's show Seed always for now or Growing.
                            // User said "Seed added". Let's use 'Growing' stage.
                            stage: 'growing',
                            cost: cropDef.cost,
                            xp: cropDef.xp
                        };

                        setGameState(prev => ({
                            ...prev,
                            lastSeedDate: new Date().toISOString(),
                            fieldPlots: [...(prev.fieldPlots || []), newPlot]
                        }));
                        console.log("Daily Seed Added:", newPlot);
                    }
                }
            } else {
                // Even if full, mark today as checked so we don't retry loop
                setGameState(prev => ({ ...prev, lastSeedDate: new Date().toISOString() }));
            }
        }
    }, [user, loading, gameState.lastSeedDate]); // Depend on lastSeedDate to prevent loops, but verify logic carefully.

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

    // Crop Definitions by Level
    const LEVEL_CROPS = {
        2: { type: 'potato', icon: '🥔', xp: 15, cost: 25, price: 10 },
        3: { type: 'potato', icon: '🥔', xp: 15, cost: 50, price: 10 },
        4: { type: 'carrot', icon: '🥕', xp: 20, cost: 75, price: 15 },
        5: { type: 'tomato', icon: '🍅', xp: 25, cost: 100, price: 20 },
        6: { type: 'corn', icon: '🌽', xp: 30, cost: 125, price: 25 },
        7: { type: 'pumpkin', icon: '🎃', xp: 40, cost: 150, price: 30 },
        8: { type: 'grapes', icon: '🍇', xp: 50, cost: 200, price: 40 },
        9: { type: 'melon', icon: '🍈', xp: 75, cost: 300, price: 60 },
        10: { type: 'diamond', icon: '💎', xp: 100, cost: 500, price: 100 }
    };

    const harvestPlot = (plotIndex) => {
        setGameState(prev => {
            const plots = [...(prev.fieldPlots || [])];
            if (!plots[plotIndex]) return prev;

            const plot = plots[plotIndex];
            const cost = plot.cost || 25;

            // Check money
            if ((prev.water || 0) < cost) return prev; // Should be handled by UI, but safety check

            // Remove from plots
            plots.splice(plotIndex, 1);

            // Add to harvested
            const newCrop = {
                id: Date.now(),
                icon: plot.realIcon || plot.icon, // Ensure we get the real icon if it was hidden
                name: plot.type,
                type: plot.type,
                xp: plot.xp || 10,
                date: new Date().toISOString()
            };

            const currentUnlocked = prev.unlockedCrops || [];
            const newUnlocked = currentUnlocked.includes(newCrop.type)
                ? currentUnlocked
                : [...currentUnlocked, newCrop.type];

            const newState = {
                ...prev,
                water: (prev.water || 0) - cost,
                fieldPlots: plots,
                harvested: [newCrop, ...(prev.harvested || [])],
                xp: (prev.xp || 0) + newCrop.xp,
                totalXP: (prev.totalXP || 0) + newCrop.xp,
                unlockedCrops: newUnlocked
            };
            saveGame(newState);
            return newState;
        });
        return true;
    };

    // Deprecated procedural harvest - keeping for safety but not used in UI
    const harvestCrop = (cropData) => {
        // ... (Old logic, effectively replaced by harvestPlot)
        return false;
    };

    const sellCrop = (type) => {
        setGameState(prev => {
            const harvested = prev.harvested || [];
            const index = harvested.findIndex(c => c.type === type);
            // If not found, return state (or maybe we allow selling by ID, but Grouped View sends Type)
            if (index === -1) return prev;

            // Price lookup (fallback to 10 if not found)
            const cropDef = Object.values(LEVEL_CROPS).find(c => c.type === type);
            const price = cropDef?.price || 10;

            const newHarvested = [...harvested];
            newHarvested.splice(index, 1);

            const newState = {
                ...prev,
                harvested: newHarvested,
                vp: (prev.vp || 0) + price
            };
            saveGame(newState);
            return newState;
        });
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
        setGameState(prev => {
            const newState = { ...prev, theme: themeName };
            saveGame(newState);
            return newState;
        });
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

    const setActiveCoach = (coachId) => {
        setGameState(prev => {
            const newState = { ...prev, activeCoachId: coachId };
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
            harvestPlot,
            sellCrop,
            addChatMessage,
            changeTheme,
            updateUsername,
            checkCanLevelUp,
            upgradeLevel,
            LEVEL_CROPS,
            setActiveCoach,
            loading
        }}>
            {children}
        </GameContext.Provider>
    );
};
