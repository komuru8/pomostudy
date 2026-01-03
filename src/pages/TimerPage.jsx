import React, { useEffect } from 'react';
import TimerDisplay from '../components/TimerDisplay';
import Controls from '../components/Controls';
import TaskItem from '../components/TaskItem';
import { useTimerContext } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import './TimerPage.css';

const TimerPage = () => {
    const { timeLeft, isActive, mode, MODES, switchMode, toggleTimer, resetTimer, totalTime, showConfetti } = useTimerContext();
    const { activeTask, tasks, selectActiveTask, updateTask, deleteTask, toggleToday } = useTasks();
    const { t } = useLanguage();

    const todayTasks = tasks.filter(t => t.priority === 'TODAY' && t.status !== 'DONE');

    const handleComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        updateTask(id, { status: newStatus });
    };

    const getModeLabel = (m) => {
        switch (m) {
            case 'FOCUS': return t('timer.focus');
            case 'SHORT_BREAK': return t('timer.shortBreak');
            case 'LONG_BREAK': return t('timer.longBreak');
            default: return m;
        }
    };

    return (
        <div className="timer-page">




            {/* Timer Card */}
            <div className="glass-container" style={{ margin: 0, width: '100%' }}>
                <h1 style={{ marginBottom: '0.2rem', fontSize: '1.5rem', marginTop: 0 }}>{getModeLabel(mode)}</h1>



                <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />

                <Controls
                    isActive={isActive}
                    toggleTimer={toggleTimer}
                    resetTimer={resetTimer}
                    mode={mode}
                    switchMode={switchMode}
                    MODES={MODES}
                />
            </div>

            {/* Today's Tasks List */}
            {todayTasks.length > 0 && (
                <div className="today-tasks-section" style={{ width: '90%', maxWidth: '450px', marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ☀️ {t('tasks.title')} (Today)
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {todayTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                isActive={task.id === activeTask?.id}
                                onSelect={selectActiveTask}
                                onDelete={deleteTask}
                                onComplete={handleComplete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Celebration Overlay */}
            {showConfetti && (
                <div className="celebration-overlay">
                    <div className="celebration-text">🎉 +25 XP!</div>
                </div>
            )}
        </div>
    );
};

export default TimerPage;
