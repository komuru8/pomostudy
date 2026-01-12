import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import turnipIcon from '../assets/crops/turnip.png';

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
    { level: 1, label: '始まりの荒野', reqTime: 0, description: '何もないからこそ、何でもできる場所。', quote: '俺はレオ！君と一緒に伝説の村を目指す冒険者さ。これからよろしくな！', tsukkomi: '私はノア。この方向音痴のガイド役よ。……ま、悪いようにはしないから、よろしくね。', luca: 'ボクは彼らと契約した精霊ルカ✨人間を素敵な未来に導くのが僕らの一族の使命なんだ' },
    { level: 2, label: '旅人の休息地', reqTime: 25, description: '焚き火を囲み、冒険の疲れを癒やす拠点。', quote: '休むのも戦略のうちさ。研いでない剣じゃ、ドラゴンどころか雑草も切れないからね。', tsukkomi: 'その剣、そもそも抜いたことあったっけ？まあ、お茶でも飲みましょ。' },
    { level: 3, label: '若草色のミニ農園', reqTime: 180, description: '荒野に初めて生まれた、小さな緑の奇跡。', quote: 'あの小さな芽を見てよ。自分が小さいなんて気にしてない、ただ空に届きたいだけさ。僕らみたいにね。', tsukkomi: 'ポエムはいいけど、水やり忘れてるわよ。夢を見る前に、まずは現実を見てよね、、' },
    { level: 4, label: 'こがねに揺れる庭', reqTime: 600, description: '収穫の喜びを知り、一面がキラキラと輝く畑。', quote: 'キラキラしてるだろ？あれはただの野菜じゃない、君が流した汗の結晶さ。だから格別に美味いんだ。', tsukkomi: '泥だらけの手で食べないでね。結晶というか、ただの立派なカボチャよ。' },
    { level: 5, label: '風が通る冒険者の家', reqTime: 1800, description: '柱の匂いと風が心地よい、自慢の大きな我が家。', quote: '雨風をしのぐだけなら洞窟でいい。でも、心を温めるには『家』が必要だ。戦利品を飾る壁もね！', tsukkomi: '掃除が大変なだけでしょう？ 私は洞窟の方がミニマリストで好きかもしれないわ。' },
    { level: 6, label: '清流を臨む水辺の宿', reqTime: 3600, description: '川のせせらぎが聞こえ、涼やかな空気が満ちる場所。', quote: '耳を澄ませて。川はずっと流れてるけど、決して急いじゃいない。遠くまで行く秘訣、かもね。', tsukkomi: '流されているだけに見えるけど。まあ、たまには流れに身を任せるのも悪くないわね。' },
    { level: 7, label: 'ときわ色の苗木屋', reqTime: 9000, description: '職人が育てた苗木が並び、村に彩りが定着する。', quote: '木を植えるってのは、未来への約束さ。「大きくなったお前を見に、必ずまた来るよ」っていうね。', tsukkomi: '気が早いわね。まずは枯らさないこと。約束より毎日の手入れが大事よ。' },
    { level: 8, label: '琥珀色のミルク牧場', reqTime: 18000, description: '動物の温もりと、搾りたてのミルクの甘い香り。', quote: '強さってのは、剣の腕だけじゃない。温かいミルクと柔らかなベッド、それが一番の「無敵」を作るのさ。', tsukkomi: '結局、寝たいだけでしょ？ でも、温かいミルクは賛成。半分もらうわね。' },
    { level: 9, label: '陽だまりの公会堂', reqTime: 30000, description: '街灯が灯り、夜な夜な仲間が笑い合う村の中心。', quote: 'あの灯りを見て。人が集まってくる。君の頑張りが、誰かの足元まで照らし始めた証拠だよ。', tsukkomi: '良いこと言うじゃない。でも、燃料代の心配もしてね。現実はシビアよ。' },
    { level: 10, label: '七色のパレットタウン', reqTime: 60000, description: 'どんな夢も描ける、世界で一番鮮やかな僕らの村。', quote: '見てよ、この景色！景色が変わったんじゃない、君が歩き続けたから、君が世界を変えたんだ。', tsukkomi: '大袈裟ね。でも…悪くない景色だわ。ここまで連れてきてくれて、少しだけ感謝してる。' }
];

// Crop Definitions by Level
const LEVEL_CROPS = {
    1: { type: 'potato', icon: '🥔', xp: 15, cost: 25, price: 10 },
    2: { type: 'turnip', icon: turnipIcon, xp: 20, cost: 30, price: 15 },
    3: { type: 'carrot', icon: '🥕', xp: 25, cost: 40, price: 20 },
    4: { type: 'corn', icon: '🌽', xp: 30, cost: 50, price: 30 },
    5: { type: 'pumpkin', icon: '🎃', xp: 35, cost: 55, price: 35 },
    6: { type: 'grapes', icon: '🍇', xp: 40, cost: 70, price: 40 },
    7: { type: 'melon', icon: '🍈', xp: 50, cost: 90, price: 60 },
    8: { type: 'tomato', icon: '🍅', xp: 60, cost: 120, price: 80 },
    9: { type: 'strawberry', icon: '🍓', xp: 80, cost: 150, price: 100 },
    10: { type: 'diamond', icon: '💎', xp: 100, cost: 500, price: 200 }
};

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

    // Twice Daily Seed Logic (9:00 and 21:00)
    useEffect(() => {
        if (!user || loading) return;

        const checkAndDeliverSeeds = () => {
            const now = new Date();
            // Define delivery times relative to now
            const today9 = new Date(now); today9.setHours(9, 0, 0, 0);
            const today21 = new Date(now); today21.setHours(21, 0, 0, 0);
            const yesterday21 = new Date(now); yesterday21.setDate(yesterday21.getDate() - 1); yesterday21.setHours(21, 0, 0, 0);

            // Determine the *most recent* delivery time that should have happened
            let lastDeliveryTime = yesterday21;
            if (now >= today9) lastDeliveryTime = today9;
            if (now >= today21) lastDeliveryTime = today21;

            const lastSeedDate = gameState.lastSeedDate ? new Date(gameState.lastSeedDate) : null;

            // If we haven't received seeds since the last delivery time, deliver now!
            if (!lastSeedDate || lastSeedDate < lastDeliveryTime) {
                const maxSlots = gameState.level + 2;
                const currentPlots = gameState.fieldPlots || [];

                if (currentPlots.length < maxSlots) {
                    const slotsToFill = maxSlots - currentPlots.length;
                    const newPlots = [];
                    const candidateLevels = Object.keys(LEVEL_CROPS)
                        .map(Number)
                        .filter(l => l <= gameState.level);

                    if (candidateLevels.length > 0) {
                        for (let i = 0; i < slotsToFill; i++) {
                            const randomLevel = candidateLevels[Math.floor(Math.random() * candidateLevels.length)];
                            const cropDef = LEVEL_CROPS[randomLevel];
                            if (cropDef) {
                                newPlots.push({
                                    id: Date.now() + i,
                                    type: cropDef.type,
                                    icon: '🌱',
                                    realIcon: cropDef.icon,
                                    stage: 'growing',
                                    cost: cropDef.cost,
                                    xp: cropDef.xp
                                });
                            }
                        }

                        if (newPlots.length > 0) {
                            setGameState(prev => ({
                                ...prev,
                                lastSeedDate: new Date().toISOString(), // Mark as received now
                                fieldPlots: [...(prev.fieldPlots || []), ...newPlots]
                            }));
                            console.log(`Merchant Delivery! Added ${newPlots.length} crops at ${now.toLocaleTimeString()}`);
                        }
                    }
                } else {
                    // Even if full, mark as checked so we don't keep checking every render
                    setGameState(prev => ({ ...prev, lastSeedDate: new Date().toISOString() }));
                }
            }
        };

        checkAndDeliverSeeds();
        // Check every minute in case the time crosses while app is open
        const interval = setInterval(checkAndDeliverSeeds, 60000);
        return () => clearInterval(interval);

    }, [user, loading, gameState.lastSeedDate]);

    const checkCanLevelUp = (currentState) => {
        const currentLevel = currentState.level;

        // STRICT CALCULATION: Sum from history to match UI
        const sessionHistory = currentState.sessionHistory || [];
        let totalMinutes = 0;
        sessionHistory.forEach(s => {
            // Match VillagePage logic: FOCUS type or non-break category
            let isFocus = s.type === 'FOCUS' || (!s.type && s.category !== 'Break');
            if (isFocus) {
                totalMinutes += (s.duration || 0);
            }
        });

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
    // Crop Definitions (Moved to top-level)


    const harvestPlot = (plotIndex) => {
        const currentState = gameState;
        const plots = [...(currentState.fieldPlots || [])];

        if (!plots[plotIndex]) return null;
        const plot = plots[plotIndex];

        // Validation (double check)
        if ((currentState.water || 0) < plot.cost) return null;

        // 1. Remove from Plots
        plots.splice(plotIndex, 1);

        // 2. Create New Crop Item
        const newCrop = {
            id: Date.now(),
            icon: plot.realIcon || plot.icon,
            name: plot.type, // keeping 'name' as type for consistency with legacy
            type: plot.type,
            xp: plot.xp || 10,
            date: new Date().toISOString()
        };

        // 3. Update State
        const newState = {
            ...currentState,
            water: (currentState.water || 0) - plot.cost,
            fieldPlots: plots,
            harvested: [newCrop, ...(currentState.harvested || [])], // Add to front
            xp: (currentState.xp || 0) + newCrop.xp,
            unlockedCrops: (currentState.unlockedCrops || []).includes(newCrop.type)
                ? currentState.unlockedCrops
                : [...(currentState.unlockedCrops || []), newCrop.type]
        };

        setGameState(newState);
        saveGame(newState);

        return newCrop;
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
            if (newHistory.length > 20) {
                finalHistory = newHistory.slice(newHistory.length - 20);
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

    const completeFocusSession = (minutes, category = 'General', subCategory = null) => {
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
                        subCategory,
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

    const debugResetField = () => {
        setGameState(prev => ({
            ...prev,
            fieldPlots: [],
            lastSeedDate: null
        }));
    };

    const debugAddWater = () => {
        setGameState(prev => {
            const newState = {
                ...prev,
                water: (prev.water || 0) + 1000
            };
            saveGame(newState);
            return newState;
        });
    };

    const debugAddStudyTime = () => {
        setGameState(prev => {
            const addedMinutes = 6000; // 100 hours
            const newState = {
                ...prev,
                totalWP: (prev.totalWP || 0) + addedMinutes, // Level progress
                water: (prev.water || 0) + addedMinutes,     // Currency
                xp: (prev.xp || 0) + (addedMinutes * 0.5)    // Some XP too?
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
            harvestPlot,
            sellCrop,
            addChatMessage,
            changeTheme,
            updateUsername,
            checkCanLevelUp,
            upgradeLevel,
            LEVEL_CROPS,
            setActiveCoach,
            debugResetField,
            debugAddWater,
            debugAddStudyTime,
            loading
        }}>
            {children}
        </GameContext.Provider>
    );
};
