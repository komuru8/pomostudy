import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const INITIAL_STATE = {
    xp: 0,
    level: 1,
    water: 0,
    fertilizer: 0,
    harvested: [],
    sessionHistory: [],
};

const LEVELS = [
    { level: 1, reqXp: 0, label: '荒れ地' },
    { level: 2, reqXp: 100, label: '耕された畑' }, // 4 pomodoros (25*4=100)
    { level: 3, reqXp: 300, label: '小さな芽' },
    { level: 4, reqXp: 600, label: '実り' },
    { level: 5, reqXp: 1000, label: '村の始まり' },
];

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState(INITIAL_STATE);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`pomodoro_game_state_${user.id}`);
            const parsed = saved ? JSON.parse(saved) : INITIAL_STATE;
            setGameState({ ...INITIAL_STATE, ...parsed });
        } else {
            setGameState(INITIAL_STATE);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`pomodoro_game_state_${user.id}`, JSON.stringify(gameState));
        }
    }, [gameState, user]);

    const addXP = (amount) => {
        setGameState((prev) => {
            const newXp = prev.xp + amount;
            // Check level up
            let newLevel = prev.level;
            for (let i = LEVELS.length - 1; i >= 0; i--) {
                if (newXp >= LEVELS[i].reqXp) {
                    newLevel = Math.max(newLevel, LEVELS[i].level);
                    break;
                }
            }

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
            };
        });
    };

    const addResource = (type, amount) => {
        setGameState((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + amount,
        }));
    };

    const harvestCrop = () => {
        if ((gameState.water || 0) < 4) return false;

        const veggies = ['🍅', '🍆', '🌽', '🥕', '🥔', '🥦', '🥒', '🥬', '🎃', '🧅'];
        const randomVeggie = veggies[Math.floor(Math.random() * veggies.length)];
        const newCrop = {
            id: Date.now(),
            icon: randomVeggie,
            date: new Date().toISOString()
        };

        setGameState((prev) => ({
            ...prev,
            water: prev.water - 4,
            harvested: [newCrop, ...(prev.harvested || [])]
        }));
        return newCrop;
    };

    const completeFocusSession = (minutes, category = 'General') => {
        addXP(minutes); // 1 min = 1 XP
        // 25 min session gives 1 water usually
        if (minutes >= 20) {
            addResource('water', 1);
        }

        setGameState((prev) => ({
            ...prev,
            sessionHistory: [
                {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    duration: minutes,
                    category
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
            completeFocusSession,
            harvestCrop
        }}>
            {children}
        </GameContext.Provider>
    );
};
