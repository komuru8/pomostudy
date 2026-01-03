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

    // Load/Listen to Firestore
    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const userRef = doc(db, 'users', user.id);

            unsubscribe = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.tasks && Array.isArray(data.tasks)) {
                        setTasks(data.tasks);
                    }
                    if (data.activeTaskId !== undefined) {
                        setActiveTaskId(data.activeTaskId);
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore tasks listener error:", error);
                setLoading(false);
            });
        } else {
            setTasks([]);
            setActiveTaskId(null);
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
                // Save tasks and activeTaskId together
                await setDoc(userRef, { tasks: tasks, activeTaskId: activeTaskId || null }, { merge: true });
            } catch (e) {
                console.error("Error saving tasks:", e);
            }
        };

        const timeoutId = setTimeout(saveToFirestore, 1000); // 1s debounce
        return () => clearTimeout(timeoutId);

    }, [tasks, activeTaskId, user, loading]);


    const addTask = (taskData) => {
        const newTask = {
            id: Date.now().toString(),
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
        setTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter(t => t.id !== id));
        if (activeTaskId === id) setActiveTaskId(null);
    };

    const selectActiveTask = (id) => {
        setActiveTaskId(id);
        // Automatically set status to IN_PROGRESS if it was TODO
        const task = tasks.find(t => t.id === id);
        if (task && task.status === 'TODO') {
            updateTask(id, { status: 'IN_PROGRESS' });
        }
    };

    const incrementPomodoroCount = (id) => {
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
