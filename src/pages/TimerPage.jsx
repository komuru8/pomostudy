import React, { useEffect, useState } from 'react';
import TimerDisplay from '../components/TimerDisplay';
import Controls from '../components/Controls';
import TaskItem from '../components/TaskItem';
import { useTimerContext } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import { useGame } from '../context/GameContext'; // Import useGame
import './TimerPage.css';

const TimerPage = () => {
    const { timeLeft, isActive, mode, MODES, switchMode, toggleTimer, resetTimer, totalTime, showConfetti } = useTimerContext();
    const { activeTask, tasks, selectActiveTask, updateTask, deleteTask, toggleToday } = useTasks();
    const { t } = useLanguage();
    const [showResetConfirm, setShowResetConfirm] = useState(false);

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

    const handleResetRequest = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        resetTimer();
        setShowResetConfirm(false);
    };

    return (
        <div className="timer-page">




            {/* Timer Card */}
            <div className="glass-container" style={{ margin: 0, width: '100%' }}>
                {activeTask && mode === 'FOCUS' ? (
                    <div style={{
                        fontSize: '1.3rem',
                        marginTop: '0',
                        marginBottom: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        background: 'var(--primary-gradient)',
                        padding: '10px 30px',
                        borderRadius: '30px',
                        display: 'inline-block',
                        boxShadow: '0 4px 15px rgba(46, 204, 113, 0.4)',
                        maxWidth: '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {activeTask.title}
                    </div>
                ) : (
                    <h1 style={{ marginBottom: '0.2rem', fontSize: '1.5rem', marginTop: 0 }}>
                        {getModeLabel(mode)}
                    </h1>
                )}



                <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />

                <Controls
                    isActive={isActive}
                    toggleTimer={toggleTimer}
                    resetTimer={handleResetRequest}
                    mode={mode}
                    switchMode={switchMode}
                    MODES={MODES}
                />
            </div>

            {/* Today's Tasks List */}
            {todayTasks.length > 0 && (
                <div className="today-tasks-section" style={{ width: '90%', maxWidth: '450px', marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ☀️ 今日やるタスク
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

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
                }} onClick={() => setShowResetConfirm(false)}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '24px',
                        maxWidth: '300px', width: '85%', textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--text-color)' }}>
                            リセットしますか？
                        </h3>
                        <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
                            時間は元に戻りますが、そこまでの学習記録は保存されます。
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setShowResetConfirm(false)}
                                style={{
                                    padding: '12px 24px', borderRadius: '16px', border: '1px solid #e0e0e0',
                                    background: 'var(--bg-color)', color: '#666', fontWeight: 'bold', cursor: 'pointer', flex: 1
                                }}>
                                いいえ
                            </button>
                            <button onClick={confirmReset}
                                style={{
                                    padding: '12px 24px', borderRadius: '16px', border: 'none',
                                    background: 'var(--primary-color)', color: 'white', fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)', cursor: 'pointer', flex: 1
                                }}>
                                はい
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimerPage;
