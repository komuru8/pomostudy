import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useTimerContext } from '../context/TimerContext';
import { CloudRain, Sprout, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import './VillagePage.css';

const VillagePage = () => {
    const { gameState, LEVELS, harvestCrop, changeTheme } = useGame();
    const { t } = useLanguage();
    const { timeLeft, totalTime, mode } = useTimerContext();
    const [lastHarvest, setLastHarvest] = useState(null);
    const [viewLevel, setViewLevel] = useState(gameState.level);

    const LEVEL_VISUALS = {
        1: { icon: '🏜️', label: t('village.wasteland') || 'Wasteland' },
        2: { icon: '🏕️', label: t('village.field') || 'Camping Ground' },
        3: { icon: '🏡', label: t('village.garden') || 'Small Settlement' },
        4: { icon: '🚜', label: t('village.farmhouse') || 'Farm' },
        5: { icon: '🏘️', label: t('village.villageStart') || 'The Village' }
    };

    // Calculate Total Study Time from History to match History Tab
    let totalStudyTime = 0;

    // 1. Completed Sessions
    const sessionHistory = gameState.sessionHistory || [];
    sessionHistory.forEach(s => {
        let isFocus = s.type === 'FOCUS' || (!s.type && s.category !== 'Break');
        if (isFocus) {
            totalStudyTime += (s.duration || 0);
        }
    });

    // 2. Live Session
    // Only if in FOCUS mode and at least 1 minute passed
    if (mode === 'FOCUS' && (totalTime - timeLeft) >= 60) {
        const elapsed = Math.floor((totalTime - timeLeft) / 60);
        totalStudyTime += elapsed;
    }

    // Determine max viewable level (Current Level + 1)
    const maxViewable = Math.min(gameState.level + 1, LEVELS.length);
    const visibleLevels = LEVELS.slice(0, maxViewable);

    const handleNext = () => {
        if (viewLevel < maxViewable) setViewLevel(l => l + 1);
    };

    const handlePrev = () => {
        if (viewLevel > 1) setViewLevel(l => l - 1);
    };

    const handleHarvest = () => {
        const crop = harvestCrop();
        if (crop) {
            setLastHarvest(crop);
            setTimeout(() => setLastHarvest(null), 3000);
        }
    };

    return (
        <div className="village-page">
            {/* Carousel Navigation Layer */}
            {viewLevel > 1 && (
                <button className="nav-arrow left" onClick={handlePrev}>
                    <ChevronLeft size={32} />
                </button>
            )}
            {viewLevel < maxViewable && (
                <button className="nav-arrow right" onClick={handleNext}>
                    <ChevronRight size={32} />
                </button>
            )}

            <div className="carousel-window">
                <div
                    className="carousel-track"
                    style={{
                        transform: `translateX(-${(viewLevel - 1) * (100 / visibleLevels.length)}%)`,
                        width: `${visibleLevels.length * 100}%`
                    }}
                >
                    {visibleLevels.map((lvl) => {
                        const isLocked = lvl.level > gameState.level;
                        const levelData = LEVEL_VISUALS[Math.min(lvl.level, 5)] || { icon: '❓', label: '???' };

                        // Identify Next Level relative to THIS slide's level (for requirements)
                        const nextLevelTarget = LEVELS.find(l => l.level === lvl.level + 1);

                        // Requirements calculation (for Next Level, if it exists)
                        let reqTime = 0;
                        let reqTasks = 0;
                        if (nextLevelTarget) {
                            reqTime = Math.max(0, nextLevelTarget.reqTime - totalStudyTime);
                            reqTasks = Math.max(0, nextLevelTarget.reqTasks - (gameState.completedTasksCount || 0));
                        }

                        // Harvest Button Logic
                        const cost = gameState.level >= 2 ? 25 : 0;
                        // Check if Lv1 limit reached (Tutorial Weed)
                        const hasWeed = gameState.level === 1 && gameState.harvested && gameState.harvested.some(c => c.type === 'weed' || c.name === 'Weed');
                        const canAfford = (gameState.water || 0) >= cost;
                        // Disable if: Not enough water OR (Lv1 and already harvested)
                        const isHarvestDisabled = !canAfford || hasWeed;

                        return (
                            <div key={lvl.level} className={`carousel-slide ${isLocked ? 'locked' : ''}`} style={{ width: `${100 / visibleLevels.length}%` }}>
                                <header className="level-header">
                                    <span className="level-badge">{t('village.level')} {lvl.level}</span>
                                    <h1 className="level-title">
                                        {levelData.label}
                                        {isLocked && <Lock size={16} className="lock-icon" />}
                                    </h1>
                                </header>

                                <div className="village-visual">
                                    <div className={`main-emoji ${isLocked ? 'grayscale' : 'animate-bounce-slow'}`}>
                                        {levelData.icon}
                                    </div>
                                </div>

                                <div className="stats-card">
                                    {isLocked ? (
                                        // LOCKED VIEW: Just teaser information
                                        <div className="locked-info">
                                            <div className="locked-message">
                                                {t('village.lockedArea')}
                                            </div>
                                            <div className="locked-subtext">
                                                {t('village.unlockHint')}
                                            </div>
                                            {/* Disabled Harvest Button for effect */}
                                            <button className="harvest-btn disabled" disabled style={{ marginTop: '2rem', margin: '0 auto' }}>
                                                <Sprout size={20} />
                                                <span>{t('village.harvestLocked')}</span>
                                            </button>
                                        </div>
                                    ) : (
                                        // UNLOCKED (Active) VIEW
                                        <div className="active-level-info">

                                            {/* REQUIREMENTS BOX (Moved Here) */}
                                            {nextLevelTarget ? (
                                                <div className="level-requirements-box">
                                                    <h4>{t('village.toNextLevel') || 'To Next Level'}</h4>

                                                    {/* Study Time Progress */}
                                                    <div className="req-row">
                                                        <div className="req-header">
                                                            <span className={reqTime <= 0 ? 'done' : ''}>
                                                                ・ {(t('village.studyTime') || 'Study Time')}:
                                                                {` ${Math.min(totalStudyTime, nextLevelTarget.reqTime)}/${nextLevelTarget.reqTime}m`}
                                                                {reqTime <= 0 && ' ✅'}
                                                            </span>
                                                            <span className="req-percent">
                                                                {nextLevelTarget.reqTime > 0
                                                                    ? Math.min(100, Math.floor((totalStudyTime / nextLevelTarget.reqTime) * 100))
                                                                    : 100}%
                                                            </span>
                                                        </div>
                                                        <div className="req-progress-track">
                                                            <div
                                                                className="req-progress-fill"
                                                                style={{ width: `${nextLevelTarget.reqTime > 0 ? Math.min(100, (totalStudyTime / nextLevelTarget.reqTime) * 100) : 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Tasks Progress */}
                                                    <div className="req-row">
                                                        <div className="req-header">
                                                            <span className={reqTasks <= 0 ? 'done' : ''}>
                                                                ・ {t('village.tasks') || 'Tasks Completed'}:
                                                                {` ${Math.min(gameState.completedTasksCount, nextLevelTarget.reqTasks)}/${nextLevelTarget.reqTasks}`}
                                                                {reqTasks <= 0 && ' ✅'}
                                                            </span>
                                                            <span className="req-percent">
                                                                {nextLevelTarget.reqTasks > 0
                                                                    ? Math.min(100, Math.floor((gameState.completedTasksCount / nextLevelTarget.reqTasks) * 100))
                                                                    : 100}%
                                                            </span>
                                                        </div>
                                                        <div className="req-progress-track">
                                                            <div
                                                                className="req-progress-fill"
                                                                style={{ width: `${nextLevelTarget.reqTasks > 0 ? Math.min(100, (gameState.completedTasksCount / nextLevelTarget.reqTasks) * 100) : 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="level-max">MAX LEVEL REACHED</div>
                                            )}

                                            <div className="resources-row">
                                                <div className="resource-item">
                                                    <CloudRain size={20} color="#4ecdc4" />
                                                    <span className="res-count">{gameState.water || 0}</span>
                                                    <div className="res-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '6px' }}>
                                                        <span className="res-name">{t('village.water')}</span>
                                                        <span className="res-note" style={{ fontSize: '0.65rem', opacity: 0.8 }}>{t('village.waterNote')}</span>
                                                    </div>
                                                </div>


                                            </div>

                                            <div className="field-section">
                                                <h3>{t('field.yourField')}</h3>
                                                {gameState.level === 1 ? (
                                                    <div className="field-locked-panel">
                                                        <Lock size={20} />
                                                        <span>{t('field.locked')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="field-grid">
                                                        {/* Placeholder plots for Level 2+ */}
                                                        {Array.from({ length: gameState.level + 2 }).map((_, i) => (
                                                            <div key={i} className="field-plot empty"></div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Moved Harvest Button Here */}
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                                <button
                                                    className={`harvest-btn ${isHarvestDisabled ? 'disabled' : ''} `}
                                                    onClick={handleHarvest}
                                                    disabled={isHarvestDisabled}
                                                    style={{ width: '100%', justifyContent: 'center' }}
                                                >
                                                    <Sprout size={20} />
                                                    <span>
                                                        {hasWeed ? t('village.harvestLimit') : (cost === 0 ? t('village.harvest') : `${t('village.harvest')} (${cost}💧)`)}
                                                    </span>
                                                </button>
                                            </div>

                                            <div className="inventory-section">
                                                <h3>{t('village.harvestCollection')}</h3>
                                                <div className="crop-grid">
                                                    {(gameState.harvested && gameState.harvested.length > 0) ? (
                                                        gameState.harvested.map(crop => (
                                                            <div key={crop.id} className="crop-item" title={new Date(crop.date).toLocaleDateString()}>
                                                                {crop.icon}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="empty-crops">{t('village.emptyCollection')}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Theme Selector Section */}
                                            <div className="theme-section" style={{ marginTop: '24px', width: '100%', paddingBottom: '20px' }}>
                                                <h3>{t('village.themes') || 'Themes'}</h3>
                                                <div className="theme-grid" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    {['default', 'wood', 'cafe'].map((themeName, idx) => {
                                                        const unlockLevel = idx + 1; // 1, 2, 3
                                                        const isLocked = gameState.level < unlockLevel;
                                                        const isActive = (gameState.theme || 'default') === themeName;

                                                        const themeLabels = {
                                                            default: t('village.themeNames.default'),
                                                            wood: t('village.themeNames.wood'),
                                                            cafe: t('village.themeNames.cafe')
                                                        };

                                                        return (
                                                            <button
                                                                key={themeName}
                                                                className={`theme-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                                                onClick={() => !isLocked && changeTheme(themeName)}
                                                                disabled={isLocked}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    borderRadius: '12px',
                                                                    border: isActive ? '2px solid var(--primary-color)' : '1px solid #ddd',
                                                                    background: isActive ? '#e8f8f5' : (isLocked ? '#f5f5f5' : '#fff'),
                                                                    opacity: isLocked ? 0.6 : 1,
                                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                                    fontWeight: isActive ? 'bold' : 'normal',
                                                                    fontSize: '0.9rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                {isLocked && <Lock size={12} />}
                                                                {themeLabels[themeName]}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {lastHarvest && (
                <div className="harvest-popup">
                    <div className="popup-content">
                        <div className="popup-icon">{lastHarvest.icon}</div>
                        <h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#27ae60' }}>
                            {t(`crops.${lastHarvest.type || 'weed'}`) || lastHarvest.name}
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillagePage;
