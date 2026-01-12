import React, { useEffect, useState } from 'react';
import { Palette, Coffee, Play, X } from 'lucide-react';
import TimerDisplay from '../components/TimerDisplay';
import Controls from '../components/Controls';
import TaskItem from '../components/TaskItem';
import { useTimerContext } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import { useGame } from '../context/GameContext'; // Import useGame
import './TimerPage.css';

const TimerPage = () => {
    const { gameState, changeTheme } = useGame();
    const { timeLeft, isActive, mode, MODES, switchMode, toggleTimer, resetTimer, totalTime, showConfetti, isSessionComplete, setIsSessionComplete } = useTimerContext();
    const { activeTask, tasks, selectActiveTask, updateTask, deleteTask, toggleToday } = useTasks();
    const { t } = useLanguage();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showModeConfirm, setShowModeConfirm] = useState(false);
    const [pendingMode, setPendingMode] = useState(null);

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

    // New: Handle Mode Switch Request
    const handleModeSwitchRequest = (newMode) => {
        // If switching to the SAME mode, do nothing
        if (newMode === mode) return;

        // If timer is active OR has progress (timeLeft < totalTime), confirm
        if (isActive || timeLeft < totalTime) {
            setPendingMode(newMode);
            setShowModeConfirm(true);
        } else {
            // Safe to switch
            switchMode(newMode);
        }
    };

    const confirmModeSwitch = () => {
        if (pendingMode) {
            switchMode(pendingMode);
            setPendingMode(null);
        }
        setShowModeConfirm(false);
    };

    return (
        <div className="timer-page">




            {/* Timer Card */}
            <div className="glass-container" style={{ margin: 0, width: '100%', position: 'relative' }}>

                {/* Background Settings Button */}
                <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10 }}>
                    <div className="bg-selector-wrapper" style={{ position: 'relative' }}>
                        <button
                            onClick={() => setPendingMode(pendingMode === 'THEME' ? null : 'THEME')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#95a5a6', // Gray color
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#7f8c8d'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
                            title={t('village.themes')}
                        >
                            <Palette size={24} />
                        </button>

                        {/* Theme Dropdown */}
                        {pendingMode === 'THEME' && (
                            <div style={{
                                position: 'absolute',
                                top: '40px',
                                right: '0',
                                background: 'white',
                                borderRadius: '12px',
                                padding: '8px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                width: '180px',
                                zIndex: 20
                            }}>
                                <h4 style={{ margin: '0 0 8px 8px', fontSize: '0.85rem', color: '#666' }}>{t('village.themes')}</h4>
                                {['default', 'wood', 'cafe'].map((themeName) => {
                                    const isActive = (gameState.theme || 'default') === themeName;
                                    const themeLabels = {
                                        default: t('village.themeNames.default'),
                                        wood: t('village.themeNames.wood'),
                                        cafe: t('village.themeNames.cafe')
                                    };

                                    return (
                                        <button
                                            key={themeName}
                                            onClick={() => {
                                                changeTheme(themeName);
                                                setPendingMode(null);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '8px 12px',
                                                marginBottom: '4px',
                                                border: 'none',
                                                borderRadius: '8px',
                                                background: isActive ? '#e8f8f5' : 'transparent',
                                                color: '#333',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <span>{themeLabels[themeName]}</span>
                                            {isActive && <span style={{ color: '#2ecc71' }}>✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

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
                        boxShadow: '0 4px 15px var(--shadow-color)',
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
                    switchMode={handleModeSwitchRequest}
                    MODES={MODES}
                />
            </div>


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

            {/* Mode Switch Confirmation Modal */}
            {showModeConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
                }} onClick={() => setShowModeConfirm(false)}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '24px',
                        maxWidth: '300px', width: '85%', textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--text-color)' }}>
                            {t('timer.switchConfirmTitle', 'タイマーを切り替えますか？')}
                        </h3>
                        <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
                            {t('timer.switchConfirmMsg', '進行中のタイマーはリセットされます。')}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setShowModeConfirm(false)}
                                style={{
                                    padding: '12px 24px', borderRadius: '16px', border: '1px solid #e0e0e0',
                                    background: 'var(--bg-color)', color: '#666', fontWeight: 'bold', cursor: 'pointer', flex: 1
                                }}>
                                {t('tasks.no', 'いいえ')}
                            </button>
                            <button onClick={confirmModeSwitch}
                                style={{
                                    padding: '12px 24px', borderRadius: '16px', border: 'none',
                                    background: 'var(--primary-color)', color: 'white', fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)', cursor: 'pointer', flex: 1
                                }}>
                                {t('tasks.yes', 'はい')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Completion Modal */}
            {isSessionComplete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3100
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)', padding: '32px', borderRadius: '32px',
                        maxWidth: '360px', width: '90%', textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        {mode === 'FOCUS' ? (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                                <h2 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '1.5rem' }}>お疲れ様でした！</h2>
                                <p style={{ color: '#7f8c8d', marginBottom: '32px', lineHeight: '1.5' }}>
                                    25分の集中が完了しました。<br />次はどうしますか？
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* 5 min Break */}
                                    <button
                                        onClick={() => {
                                            switchMode('SHORT_BREAK');
                                            setIsSessionComplete(false);
                                            setTimeout(() => toggleTimer(), 300);
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: '16px', border: 'none',
                                            background: '#e0f2f1', color: '#00695c',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Coffee size={20} /> 5分休憩する
                                    </button>

                                    {/* 15 min Break */}
                                    <button
                                        onClick={() => {
                                            switchMode('LONG_BREAK');
                                            setIsSessionComplete(false);
                                            setTimeout(() => toggleTimer(), 300);
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: '16px', border: 'none',
                                            background: '#e3f2fd', color: '#1565c0',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Coffee size={20} /> 15分休憩する
                                    </button>

                                    {/* Continue Focus */}
                                    <button
                                        onClick={() => {
                                            resetTimer(); // Resets to current mode (FOCUS)
                                            setIsSessionComplete(false);
                                            setTimeout(() => toggleTimer(), 300);
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: '16px', border: 'none',
                                            background: 'var(--primary-gradient)', color: 'white',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                                        }}
                                    >
                                        <Play size={20} /> 休憩せず続ける
                                    </button>

                                    {/* Finish */}
                                    <button
                                        onClick={() => setIsSessionComplete(false)}
                                        style={{
                                            padding: '12px', borderRadius: '16px', border: 'none',
                                            background: 'transparent', color: '#95a5a6',
                                            fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
                                            marginTop: '8px'
                                        }}
                                    >
                                        終了
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔋</div>
                                <h2 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '1.5rem' }}>休憩終了！</h2>
                                <p style={{ color: '#7f8c8d', marginBottom: '32px', lineHeight: '1.5' }}>
                                    リフレッシュできましたか？<br />次は集中モードに戻りますか？
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Start Focus Logic */}
                                    <button
                                        onClick={() => {
                                            switchMode('FOCUS');
                                            setIsSessionComplete(false);
                                            setTimeout(() => toggleTimer(), 300);
                                        }}
                                        style={{
                                            padding: '14px', borderRadius: '16px', border: 'none',
                                            background: 'var(--primary-gradient)', color: 'white',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                                        }}
                                    >
                                        <Play size={20} /> はい、集中する
                                    </button>

                                    {/* Finish Logic */}
                                    <button
                                        onClick={() => setIsSessionComplete(false)}
                                        style={{
                                            padding: '12px', borderRadius: '16px', border: 'none',
                                            background: 'transparent', color: '#95a5a6',
                                            fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
                                            marginTop: '8px'
                                        }}
                                    >
                                        終了
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimerPage;
