import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const TaskProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [loading, setLoading] = useState(true);

    const ignoreSnapshotUntilRef = React.useRef(0); // Race condition protection

    const notifyLocalChange = () => {
        ignoreSnapshotUntilRef.current = Date.now() + 2000; // Lock snapshot for 2 seconds
    };

    // Load/Listen to Firestore
    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const userRef = doc(db, 'users', user.id);

            unsubscribe = onSnapshot(userRef, (docSnap) => {
                // RACE CONDITION PROTECTION
                if (Date.now() < ignoreSnapshotUntilRef.current) {
                    console.log("Ignoring Firestore task update due to recent local action");
                    return;
                }

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Merge/Load logic could be complex, for now simple overwrite from DB preferred source of truth
                    if (data.tasks && Array.isArray(data.tasks)) {
                        setTasks(data.tasks);
                    }
                    if (data.activeTaskId !== undefined) {
                        setActiveTaskId(data.activeTaskId);
                    }
                } else {
                    // MIGRATION: Firestore empty -> Check LocalStorage guest data
                    const saved = localStorage.getItem('pomodoro_tasks_guest');
                    if (saved) {
                        try {
                            console.log("Migrating Guest Tasks to Firestore...");
                            const parsed = JSON.parse(saved);
                            setTasks(parsed.tasks || []);
                            setActiveTaskId(parsed.activeTaskId || null);
                            // It will be auto-saved to Firestore by the other useEffect
                        } catch (e) {
                            console.error("Task migration user error", e);
                        }
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore tasks listener error:", error);
                setLoading(false);
            });
        } else {
            // Guest Mode: Load from LocalStorage
            setLoading(true);
            const saved = localStorage.getItem('pomodoro_tasks_guest');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setTasks(parsed.tasks || []);
                    setActiveTaskId(parsed.activeTaskId || null);
                } catch (e) {
                    console.error("Failed to parse guest tasks", e);
                    setTasks([]);
                }
            } else {
                setTasks([]);
                setActiveTaskId(null);
            }
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    // Save to Firestore OR LocalStorage (Debounced)
    useEffect(() => {
        if (loading) return;

        const saveToStorage = async () => {
            if (user) {
                // Logged in: Sync to Firestore
                try {
                    const userRef = doc(db, 'users', user.id);
                    await setDoc(userRef, { tasks: tasks, activeTaskId: activeTaskId || null }, { merge: true });
                } catch (e) {
                    console.error("Error saving tasks:", e);
                }
            } else {
                // Guest: Sync to LocalStorage
                try {
                    const guestData = { tasks, activeTaskId };
                    localStorage.setItem('pomodoro_tasks_guest', JSON.stringify(guestData));
                } catch (e) {
                    console.error("Error saving guest tasks:", e);
                }
            }
        };

        const timeoutId = setTimeout(saveToStorage, 1000); // 1s debounce
        return () => clearTimeout(timeoutId);

    }, [tasks, activeTaskId, user, loading]);


    const addTask = (taskData) => {
        notifyLocalChange();
        const newTask = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            status: 'TODO', // TODO, IN_PROGRESS, DONE
            pomodorosSpent: 0,
            isToday: false,
            category: 'General',
            ...taskData,
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    const updateTask = (id, updates) => {
        notifyLocalChange();
        setTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTask = (id) => {
        notifyLocalChange();
        setTasks((prev) => prev.filter(t => t.id !== id));
        if (activeTaskId === id) setActiveTaskId(null);
    };

    const selectActiveTask = (id) => {
        notifyLocalChange();
        setActiveTaskId(id);
        // Automatically set status to IN_PROGRESS if it was TODO
        const task = tasks.find(t => t.id === id);
        if (task && task.status === 'TODO') {
            updateTask(id, { status: 'IN_PROGRESS' });
        }
    };

    const incrementPomodoroCount = (id) => {
        // notifyLocalChange(); // OPTIONAL: Frequent updates might not need hard locking, but safer to have it
        setTasks((prev) => prev.map(t =>
            t.id === id ? { ...t, pomodorosSpent: (t.pomodorosSpent || 0) + 1 } : t
        ));
    };

    const activeTask = tasks.find(t => t.id === activeTaskId);

    return (
        <TaskContext.Provider value={{
            tasks,
            activeTaskId,
            activeTask,
            addTask,
            updateTask,
            deleteTask,
            selectActiveTask,
            incrementPomodoroCount,
            loading
        }}>
            {children}
        </TaskContext.Provider>
    );
};
