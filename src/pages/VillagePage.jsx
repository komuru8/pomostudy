import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useTimerContext } from '../context/TimerContext';
import { CloudRain, Sprout, ChevronLeft, ChevronRight, Lock, Edit2, Check } from 'lucide-react';
import './VillagePage.css';

const VillagePage = () => {
    const { gameState, LEVELS, harvestCrop, sellCrop, changeTheme, updateUsername, checkCanLevelUp, upgradeLevel, LEVEL_CROPS } = useGame();
    const { t } = useLanguage();
    const { timeLeft, totalTime, mode } = useTimerContext();
    const [lastHarvest, setLastHarvest] = useState(null);
    const [viewLevel, setViewLevel] = useState(gameState.level);
    const [pendingSell, setPendingSell] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');

    // Init edit name when editing starts
    const startEditing = () => {
        setEditName(gameState.username || '');
        setIsEditingName(true);
    };

    const saveName = () => {
        updateUsername(editName);
        setIsEditingName(false);
    };

    const handleSellRequest = (type) => {
        const cropDef = Object.values(LEVEL_CROPS).find(c => c.type === type);
        const price = cropDef?.price || 10;
        setPendingSell({ type, price, icon: cropDef?.icon || '🥔', name: t(`crops.${type}`) });
    };

    const confirmSell = () => {
        if (pendingSell) {
            sellCrop(pendingSell.type);
            setPendingSell(null);
        }
    };

    const cancelSell = () => {
        setPendingSell(null);
    };

    const LEVEL_VISUALS = {
        1: { icon: '🏜️', label: t('village.wasteland') || 'Wasteland' },
        2: { icon: '🏕️', label: t('village.field') || 'Camping Ground' },
        3: { icon: '🛖', label: t('village.hut', '小さな小屋') },
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

    const handleHarvest = (cropData) => {
        const crop = harvestCrop(cropData);
        if (crop) {
            setLastHarvest(crop);
            setTimeout(() => setLastHarvest(null), 3000);
        }
    };

    return (
        <div className="village-page">
            {/* User Name Header */}
            <div className="user-greeting-section" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {isEditingName ? (
                    <div className="name-edit-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="name-input"
                            style={{
                                fontSize: '1.2rem',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                border: '2px solid var(--primary-color)',
                                width: '150px',
                                textAlign: 'center'
                            }}
                            autoFocus
                        />
                        <button
                            onClick={saveName}
                            className="icon-btn-circle"
                            style={{
                                background: '#2ecc71',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Check size={18} />
                        </button>
                    </div>
                ) : (
                    <div onClick={startEditing} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.4rem',
                            color: 'var(--primary-dark)',
                            fontWeight: '800',
                            borderBottom: '1px dashed transparent'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px dashed #ccc'}
                            onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dashed transparent'}
                        >
                            {(t('village.titleFormat') || '{{name}}の村').replace('{{name}}', gameState.username || t('village.defaultName'))}
                        </h2>
                        <Edit2 size={16} color="#95a5a6" />
                    </div>
                )}
            </div>

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
                        const canAfford = (gameState.water || 0) >= cost;

                        // Disable if: Level 1 (Hard Lock) OR Not enough water
                        const isHarvestDisabled = gameState.level === 1 || !canAfford;

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

                                {/* Requirements Box (Moved Outside) */}
                                {!isLocked && (
                                    nextLevelTarget ? (
                                        <div className="level-requirements-box detachable" style={{ marginBottom: '16px' }}>
                                            {(() => {
                                                const isEligible = checkCanLevelUp(gameState) && gameState.level < nextLevelTarget.level;

                                                return isEligible ? (
                                                    <div className="level-up-ready">
                                                        <h3 className="ready-text">✨ Condition Met! ✨</h3>
                                                        <button
                                                            className="level-up-btn"
                                                            onClick={() => {
                                                                upgradeLevel();
                                                                // Force refresh view to next level
                                                                setTimeout(() => setViewLevel(l => l + 1), 500);
                                                            }}
                                                        >
                                                            LEVEL UP!
                                                            <span className="btn-shine"></span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4>{t('village.toNextLevel') || 'To Next Level'}</h4>
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
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="level-max" style={{ marginBottom: '16px' }}>MAX LEVEL REACHED</div>
                                    )
                                )}



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



                                            <div className="field-section">
                                                <h3>{t('field.yourField')}</h3>
                                                {gameState.level === 1 ? (
                                                    <div className="field-locked-panel">
                                                        <Lock size={20} />
                                                        <span>{t('field.locked')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="field-grid">
                                                        {/* Render Interactive Slots */}
                                                        {Array.from({ length: gameState.level + 2 }).map((_, i) => {
                                                            const levelCrop = LEVEL_CROPS?.[gameState.level] || LEVEL_CROPS?.[2]; // Fallback to Lv2 Radish
                                                            const currentWater = gameState.water || 0;
                                                            // Logic: If I have enough water to harvest ONE, does it show on all?
                                                            // We want to simulate multiple plots.
                                                            // Simple logic:
                                                            // User has X water. Cost is Y.
                                                            // Number of harvestable slots = floor(X / Y).
                                                            // If i < numHarvestable, this slot is READY.
                                                            // Else, it is growing.

                                                            const cost = levelCrop.cost;
                                                            const numHarvestable = Math.floor(currentWater / cost);
                                                            const isReady = i < numHarvestable;

                                                            // To make it feel like "individual" slots, we only allow clicking `isReady` ones.
                                                            // And we show progress on the FIRST non-ready slot?
                                                            // Or just show "Ready" on as many slots as we can afford? Yes.

                                                            return (
                                                                <button
                                                                    key={i}
                                                                    className={`field-plot ${isReady ? 'ready' : 'growing'}`}
                                                                    onClick={() => isReady && handleHarvest(levelCrop)}
                                                                    disabled={!isReady}
                                                                    title={isReady ? t('village.harvest') : `${currentWater}/${cost} pts`}
                                                                >
                                                                    <div className="plot-icon">
                                                                        {isReady ? levelCrop.icon : (i === numHarvestable ? '🌱' : '🕳️')}
                                                                    </div>
                                                                    {isReady && <div className="harvest-badge">!</div>}

                                                                    {/* Show progress only on the next plot regarding points */}
                                                                    {i === numHarvestable && (
                                                                        <div className="plot-progress-text">
                                                                            {currentWater % cost}/{cost}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Removed Old Harvest Button */}

                                            <div className="inventory-section">
                                                <h3>{t('village.harvestCollection')}</h3>
                                                {gameState.level === 1 ? (
                                                    <div className="inventory-locked-panel">
                                                        <Lock size={20} />
                                                        <span>Lv2で開放</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="crop-grid">
                                                            {(gameState.unlockedCrops || (gameState.harvested && gameState.harvested.length > 0)) ? (
                                                                (() => {
                                                                    // Get all unlocked types (from new state OR fallback to existing harvested)
                                                                    const allUnlocked = gameState.unlockedCrops || [...new Set((gameState.harvested || []).map(c => c.type))];

                                                                    // Count current inventory
                                                                    const inventoryCounts = (gameState.harvested || []).reduce((acc, crop) => {
                                                                        const type = crop.type || 'weed';
                                                                        acc[type] = (acc[type] || 0) + 1;
                                                                        return acc;
                                                                    }, {});

                                                                    if (allUnlocked.length === 0) return <div className="empty-crops">{t('village.emptyCollection')}</div>;

                                                                    return allUnlocked.map(type => {
                                                                        const count = inventoryCounts[type] || 0;
                                                                        const cropDef = Object.values(LEVEL_CROPS).find(c => c.type === type);
                                                                        const icon = cropDef ? cropDef.icon : '❓';

                                                                        return (
                                                                            <div
                                                                                key={type}
                                                                                className={`crop-item ${count > 0 ? 'clickable' : 'disabled'}`}
                                                                                title={`${t(`crops.${type}`)} x${count}`}
                                                                                onClick={() => count > 0 && handleSellRequest(type)}
                                                                                style={{ opacity: count > 0 ? 1 : 0.6, cursor: count > 0 ? 'pointer' : 'default' }}
                                                                            >
                                                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                                    {icon}
                                                                                    {count >= 0 && (
                                                                                        <div className="crop-count-badge">x{count}</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()
                                                            ) : (
                                                                <div className="empty-crops">{t('village.emptyCollection')}</div>
                                                            )}
                                                        </div>

                                                        {/* Shop Section */}
                                                        <div className="shop-section">
                                                            <h3 className="shop-title">{t('village.tradeShop')}</h3>

                                                            <div className="shop-content-box">
                                                                {/* VP Display Moved Here */}
                                                                <div className="vp-display animate-pop">
                                                                    <span className="vp-label">{t('village.vp')}:</span>
                                                                    <span className="vp-value">{gameState.vp || 0}</span>
                                                                    <span className="vp-unit">VP</span>
                                                                </div>
                                                                <div style={{ margin: '16px 0', borderTop: '1px dashed #ddd' }}></div>

                                                                <div className="coming-soon-container">
                                                                    <p>{t('village.shopDesc')}</p>
                                                                    <div className="coming-soon-badge">{t('village.comingSoon')}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="theme-section" style={{ marginTop: '24px', width: '100%', paddingBottom: '20px', textAlign: 'left' }}>
                                                <h3 style={{ color: '#333', fontWeight: 'bold' }}>{t('village.themes') || 'タイマーの背景'}</h3>
                                                <div className="theme-grid" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
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
                                                                    gap: '4px',
                                                                    color: '#333'
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

            {/* Harvest Celebration Pop-up */}
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

            {/* Sell Confirmation Modal */}
            {pendingSell && (
                <div className="harvest-popup">
                    <div className="popup-content sell-modal">
                        <div className="popup-icon">{pendingSell.icon}</div>
                        <h3 style={{ margin: '0 0 16px', color: '#333' }}>
                            {t('village.sellConfirm').replace('{{price}}', pendingSell.price)}
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
                            <button
                                onClick={cancelSell}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#ecf0f1',
                                    color: '#7f8c8d',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('tasks.no') || 'Cancel'}
                            </button>
                            <button
                                onClick={confirmSell}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#2ecc71',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 0 #27ae60'
                                }}
                            >
                                {t('tasks.yes') || 'Sell'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillagePage;
