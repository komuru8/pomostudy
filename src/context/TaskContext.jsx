import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activeTaskId, setActiveTaskId] = useState(null);

    // Load tasks when user changes
    useEffect(() => {
        if (user) {
            const savedTasks = localStorage.getItem(`pomodoro_tasks_${user.id}`);
            const savedActive = localStorage.getItem(`pomodoro_active_task_${user.id}`);
            setTasks(savedTasks ? JSON.parse(savedTasks) : []);
            setActiveTaskId(savedActive || null);
        } else {
            setTasks([]);
            setActiveTaskId(null);
        }
    }, [user]);

    // Save tasks when changed
    useEffect(() => {
        if (user) {
            localStorage.setItem(`pomodoro_tasks_${user.id}`, JSON.stringify(tasks));
        }
    }, [tasks, user]);

    // Save active task when changed
    useEffect(() => {
        if (user) {
            if (activeTaskId) {
                localStorage.setItem(`pomodoro_active_task_${user.id}`, activeTaskId);
            } else {
                localStorage.removeItem(`pomodoro_active_task_${user.id}`);
            }
        }
    }, [activeTaskId, user]);

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
            incrementPomodoroCount
        }}>
            {children}
        </TaskContext.Provider>
    );
};
