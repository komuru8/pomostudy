import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { CloudRain, Sprout } from 'lucide-react';
import './VillagePage.css';

const VillagePage = () => {
    const { gameState, LEVELS, harvestCrop } = useGame();
    const { t } = useLanguage();
    const [lastHarvest, setLastHarvest] = useState(null);

    const LEVEL_VISUALS = {
        1: { icon: '🪨', label: t('village.wasteland') },
        2: { icon: '🌱', label: t('village.field') },
        3: { icon: '🌿', label: t('village.garden') },
        4: { icon: '🏡', label: t('village.farmhouse') },
        5: { icon: '🏰', label: t('village.villageStart') }
    };

    const currentLevelInfo = LEVELS.find(l => l.level === gameState.level) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === gameState.level + 1);

    // Dynamic label based on level for header
    const currentLabel = LEVEL_VISUALS[Math.min(gameState.level, 5)].label;

    const xpToNext = nextLevel ? Math.max(0, nextLevel.reqXp - gameState.xp) : 0;
    const focusSessionsNeeded = Math.ceil(xpToNext / 25);

    // Progress calc: (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
    const currentLevelReq = currentLevelInfo.reqXp;
    const nextLevelReq = nextLevel ? nextLevel.reqXp : currentLevelReq;

    const progressPercent = nextLevel
        ? Math.min(100, Math.max(0, ((gameState.xp - currentLevelReq) / (nextLevelReq - currentLevelReq)) * 100))
        : 100;

    const handleHarvest = () => {
        const crop = harvestCrop();
        if (crop) {
            setLastHarvest(crop);
            // Animation or alert?
            setTimeout(() => setLastHarvest(null), 3000);
        }
    };

    return (
        <div className="village-page">
            <header className="level-header">
                <span className="level-badge">{t('village.level')} {gameState.level}</span>
                <h1 className="level-title">{currentLabel || 'Unknown'}</h1>
                {nextLevel && (
                    <div className="next-level-info" style={{
                        marginTop: '8px',
                        fontSize: '0.8rem',
                        color: '#636e72',
                        fontWeight: '600',
                        background: 'rgba(255,255,255,0.5)',
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px'
                    }}>
                        {t('village.nextLevel') || 'Next Level'}: {LEVEL_VISUALS[Math.min(nextLevel.level, 5)].label}
                    </div>
                )}
            </header>

            <div className="village-visual">
                <div className="main-emoji animate-bounce-slow">
                    {LEVEL_VISUALS[Math.min(gameState.level, 5)].icon}
                </div>
            </div>

            <div className="stats-card">
                <div className="xp-bar-container">
                    <div className="xp-labels">
                        <span>XP: {gameState.xp}</span>
                        <span>Next: {nextLevel ? nextLevel.reqXp : 'MAX'}</span>
                    </div>
                    <div className="xp-track">
                        <div className="xp-fill" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}></div>
                    </div>

                    {nextLevel && (
                        <div className="level-requirements" style={{
                            textAlign: 'left',
                            background: 'rgba(46, 204, 113, 0.1)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginTop: '12px',
                            fontSize: '0.9rem',
                            color: 'var(--text-color)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
                                <span>🚀 {t('village.toNextLevel') || 'To Next Level'}:</span>
                                <span>{xpToNext} XP</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                💡 {t('village.tips') || 'Tip'}: {t('village.approxSessions', { count: focusSessionsNeeded }) || `Approx. ${focusSessionsNeeded} focus sessions (25m)`}
                            </div>
                        </div>
                    )}
                </div>

                <div className="resources-row">
                    <div className="resource-item">
                        <CloudRain size={20} color="#4ecdc4" />
                        <span className="res-count">{gameState.water || 0}</span>
                        <span className="res-name">{t('village.water')}</span>
                    </div>

                    <button
                        className={`harvest-btn ${(gameState.water || 0) < 4 ? 'disabled' : ''} `}
                        onClick={handleHarvest}
                        disabled={(gameState.water || 0) < 4}
                    >
                        <Sprout size={20} />
                        <span>{t('village.harvest')} (4💧)</span>
                    </button>
                </div>
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

            {lastHarvest && (
                <div className="harvest-popup">
                    <div className="popup-content">
                        <h1>{t('village.harvested')}</h1>
                        <div className="popup-icon">{lastHarvest.icon}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillagePage;
