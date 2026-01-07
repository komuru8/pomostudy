import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import VillagersSection from '../components/VillagersSection';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useTimerContext } from '../context/TimerContext';
import { Droplets, Sprout, Store, ArrowUpCircle, Trophy, ShoppingBag, CloudRain, ChevronLeft, ChevronRight, Lock, Edit2, Check } from 'lucide-react';
import { CROP_TRIVIA } from '../constants/cropTrivia';
import './VillagePage.css';

// Helper component for animation
const FlyingObject = ({ start, target, icon, onComplete }) => {
    const [style, setStyle] = useState({
        position: 'fixed',
        top: start.y,
        left: start.x,
        fontSize: '3rem',
        zIndex: 9999,
        transition: 'all 0.4s ease-out', // Initial pop up
        opacity: 1,
        pointerEvents: 'none',
        transform: 'scale(1)'
    });

    React.useEffect(() => {
        // Step 1: Pull Up
        const step1 = requestAnimationFrame(() => {
            setStyle(prev => ({
                ...prev,
                top: start.y - 80, // Move UP 80px
                transform: 'scale(1.3)',
                opacity: 1
            }));
        });

        // Step 2: Fly to Target
        const step2Timer = setTimeout(() => {
            setStyle(prev => ({
                ...prev,
                top: target.y + 20,
                left: target.x + 20,
                transform: 'scale(0.5)',
                opacity: 0,
                transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            }));
        }, 350); // Delay for "up" motion

        const endTimer = setTimeout(onComplete, 1000);

        return () => { cancelAnimationFrame(step1); clearTimeout(step2Timer); clearTimeout(endTimer); };
    }, []);

    return ReactDOM.createPortal(
        <div style={style}>{icon}</div>,
        document.body
    );
};

const VillagePage = () => {
    const { gameState, LEVELS, harvestCrop, harvestPlot, sellCrop, changeTheme, updateUsername, checkCanLevelUp, upgradeLevel, LEVEL_CROPS } = useGame();
    const { t } = useLanguage();
    const { timeLeft, totalTime, mode } = useTimerContext();
    const [lastHarvest, setLastHarvest] = useState(null);
    const [viewLevel, setViewLevel] = useState(gameState.level);
    const [pendingSell, setPendingSell] = useState(null);
    const [pendingHarvest, setPendingHarvest] = useState(null); // { plot, index }
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [flyingCrops, setFlyingCrops] = useState([]); // Flying animation state

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
        setPendingSell({ type, price, amount: 1, icon: cropDef?.icon || '🥔', name: t('crops.' + type) });
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
        1: { type: 'image', src: '/assets/levels/wasteland.jpg', label: t('village.wasteland') },
        2: { type: 'image', src: '/assets/levels/camp.jpg', label: t('village.field') },
        3: { type: 'image', src: '/assets/levels/farm.jpg', label: t('village.hut') },
        4: { type: 'image', src: '/assets/level_4_update.jpg', label: t('village.farmhouse') },
        5: { type: 'image', src: '/assets/levels/farm.jpg', label: t('village.villageStart') }
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

    const handleHarvest = (cropData, e) => {
        const crop = harvestCrop(cropData);
        if (crop) {
            // Trigger flying animation
            if (e) {
                const startRect = e.currentTarget.getBoundingClientRect();
                const targetElem = document.querySelector('.crop-grid') || document.querySelector('.inventory-section');
                const targetRect = targetElem
                    ? targetElem.getBoundingClientRect()
                    : { top: window.innerHeight - 100, left: window.innerWidth / 2 };

                const newFlying = {
                    id: Date.now(),
                    icon: cropData.icon,
                    start: { x: startRect.left, y: startRect.top },
                    target: { x: targetRect.left, y: targetRect.top }
                };
                setFlyingCrops(prev => [...prev, newFlying]);
            }
            // Removed pop-up: setLastHarvest(crop);
            // setTimeout(() => setLastHarvest(null), 3000);
        }
    };

    return (
        <div className="village-page">
            {/* Unified Card Section (White Background Wrapper) */}
            <div className="farm-section unified-card">
                {/* User Name Header (Inside Card) */}
                <div className="user-greeting-section">
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

                            return (
                                <div key={lvl.level} className={`carousel-slide ${isLocked ? 'locked' : ''}`} style={{ width: `${100 / visibleLevels.length}%` }}>
                                    <header className="level-header" style={{ position: 'relative', zIndex: 5, marginBottom: '10px' }}>
                                        <span className="level-badge">{t('village.level')} {lvl.level}</span>
                                        <h1 className="level-title" style={{ color: '#2c3e50', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                                            {isLocked ? '???' : levelData.label}
                                            {isLocked && <Lock size={16} className="lock-icon" />}
                                        </h1>
                                    </header>

                                    <div className="village-visual" style={{ position: 'relative', overflow: 'visible', marginBottom: '16px' }}>
                                        <div className={`main-visual-container ${isLocked ? 'locked-visual' : ''}`}>
                                            {levelData.type === 'image' ? (
                                                <img
                                                    src={levelData.src}
                                                    alt={levelData.label}
                                                    className="level-image"
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        borderRadius: '24px', // Increased rounding
                                                        boxShadow: 'none',
                                                        filter: isLocked ? 'grayscale(100%) brightness(0.4)' : 'none',
                                                        transition: 'all 0.5s ease',
                                                        display: 'block' // Remove inline gap
                                                    }}
                                                />
                                            ) : (
                                                <div className={`main-emoji ${isLocked ? 'grayscale' : 'animate-bounce-slow'}`}>
                                                    {levelData.icon}
                                                </div>
                                            )}
                                        </div>
                                        {isLocked && (
                                            <div className="locked-overlay" style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                                width: '90%',
                                                zIndex: 10,
                                                pointerEvents: 'none'
                                            }}>
                                                <div className="locked-message" style={{
                                                    color: 'white',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold',
                                                    marginBottom: '8px',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                                                }}>
                                                    {t('village.lockedArea') || '未開放エリア'}
                                                </div>
                                                <div className="locked-subtext" style={{
                                                    color: 'rgba(255,255,255,0.9)',
                                                    fontSize: '0.9rem',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                                                }}>
                                                    {t('village.unlockHint') || '学習をしてレベルを上げよう！'}
                                                </div>
                                            </div>
                                        )}
                                    </div>



                                    <div className="stats-card">
                                        {isLocked ? null : (
                                            // UNLOCKED (Active) VIEW
                                            <div className="active-level-info">

                                                {/* Requirements Box (Integrated into Stats Card) */}
                                                {nextLevelTarget ? (
                                                    <div className="level-requirements-box" style={{
                                                        marginBottom: '24px',
                                                        background: 'rgba(236, 240, 241, 0.5)',
                                                        borderRadius: '16px',
                                                        padding: '16px',
                                                        border: '1px solid rgba(0,0,0,0.05)'
                                                    }}>
                                                        {(() => {
                                                            const isEligible = checkCanLevelUp(gameState) && gameState.level < nextLevelTarget.level;

                                                            return isEligible ? (
                                                                <div className="level-up-ready" style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                    <h3 className="ready-text" style={{ color: '#e67e22', marginBottom: '12px', fontSize: '1.2rem', margin: '0 0 12px 0' }}>✨ 条件達成！ ✨</h3>
                                                                    <button
                                                                        className="level-up-btn"
                                                                        style={{
                                                                            background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                                                                            color: 'white',
                                                                            padding: '12px 24px',
                                                                            borderRadius: '24px',
                                                                            border: 'none',
                                                                            fontWeight: 'bold',
                                                                            boxShadow: '0 4px 12px rgba(211, 84, 0, 0.4)',
                                                                            cursor: 'pointer',
                                                                            fontSize: '1rem',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.currentTarget.style.transform = 'scale(0.95)';
                                                                            upgradeLevel();
                                                                            setTimeout(() => setViewLevel(l => l + 1), 500);
                                                                        }}
                                                                    >
                                                                        村をグレードアップ
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>{t('village.toNextLevel')}</h4>
                                                                    <div className="req-row">
                                                                        <div className="req-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                                                            <span className={reqTime <= 0 ? 'done' : ''} style={{ fontSize: '0.85rem' }}>
                                                                                ・ {(t('village.studyTime'))}:<br />
                                                                                <span style={{ marginLeft: '12px', fontWeight: 'bold' }}>
                                                                                    {` ${Math.min(totalStudyTime, nextLevelTarget.reqTime)}/${nextLevelTarget.reqTime}m`}
                                                                                </span>
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
                                                    <div className="level-max" style={{
                                                        marginBottom: '24px',
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        background: 'rgba(46, 204, 113, 0.1)',
                                                        borderRadius: '12px',
                                                        color: '#27ae60',
                                                        fontWeight: 'bold'
                                                    }}>MAX LEVEL REACHED</div>
                                                )}

                                                <VillagersSection />

                                                <div className="field-section">
                                                    <h3>{t('field.yourField')}</h3>
                                                    <p className="section-desc">畑には毎日新しい苗がランダムで1つ増えます。学習時間に応じて水ポイントが貯まり、消費することで作物を収穫できます。</p>
                                                    {gameState.level === 1 ? (
                                                        <div className="field-locked-panel">
                                                            <Lock size={20} />
                                                            <span>{t('field.locked')}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Water Points Bar */}
                                                            <div className="water-points-bar" style={{
                                                                marginBottom: '16px',
                                                                padding: '8px 12px',
                                                                background: '#e0f7fa',
                                                                borderRadius: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                color: '#006064',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                <span>水ポイント</span>
                                                                <span>{gameState.water || 0} pts</span>
                                                            </div>

                                                            <div className="field-grid">
                                                                {/* Render STATEFUL Field Plots */}
                                                                {(gameState.fieldPlots || []).length === 0 ? (
                                                                    <div className="empty-field-msg" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
                                                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍃</div>
                                                                        新しい種を待っています...<br />
                                                                        <span style={{ fontSize: '0.8rem' }}>(毎日新しい種が届きます！)</span>
                                                                    </div>
                                                                ) : (
                                                                    (gameState.fieldPlots || []).map((plot, i) => {
                                                                        const canAfford = (gameState.water || 0) >= plot.cost;
                                                                        return (
                                                                            <button
                                                                                key={plot.id}
                                                                                className={`field-plot ready`} // Always look "ready" to interact? Or show growing? User said "Click to popup".
                                                                                onClick={() => setPendingHarvest({ plot, index: i })}
                                                                                title={`Harvest ${plot.type}`}
                                                                            >
                                                                                <div className="plot-icon">
                                                                                    {/* Show real icon for preview? Or Seed? Let's show real icon to tempt user */}
                                                                                    {plot.realIcon}
                                                                                </div>
                                                                                {canAfford && <div className="harvest-badge">!</div>}

                                                                                <div className="plot-progress-text" style={{ color: canAfford ? '#27ae60' : '#e74c3c' }}>
                                                                                    {plot.cost} WP
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })
                                                                )}

                                                                {/* Show placeholders for remaining capacity? Optional. */}
                                                                {Array.from({ length: Math.max(0, (gameState.level + 2) - (gameState.fieldPlots || []).length) }).map((_, i) => (
                                                                    <div key={`empty-${i}`} className="field-plot empty" style={{ opacity: 0.3, background: '#eee', cursor: 'default', border: 'none' }}>
                                                                        <div className="plot-icon">🕳️</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="inventory-section">
                                                    <h3>{t('village.harvestCollection')}</h3>
                                                    <p className="section-desc">タップすると野菜の詳細情報が見れます。売却するとベジタブルポイントが貯まります。</p>
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


                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Harvest Celebration Pop-up REPLACED by Flying Animation */}
                {/* 
                {
                    lastHarvest && (
                        <div className="harvest-popup">...</div>
                    )
                } 
                */}

                {/* Sell Confirmation Modal */}
                {
                    pendingSell && ReactDOM.createPortal(
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            zIndex: 9999, // High Z-Index
                            backdropFilter: 'blur(5px)'
                        }} onClick={cancelSell}>
                            <div style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '24px',
                                width: 'auto',
                                minWidth: '300px',
                                maxWidth: '90%',
                                textAlign: 'center',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                animation: 'popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                                position: 'relative', // Flex centering handles position
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }} onClick={e => e.stopPropagation()}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', marginTop: '1rem' }}>
                                    {pendingSell.icon}
                                </div>

                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#34495e', fontWeight: 'bold' }}>
                                    {t('village.sellMessage', { amount: pendingSell.amount, name: t(`crops.${pendingSell.type}`), price: 10 * pendingSell.amount }) || `Sell ${pendingSell.amount} ${t(`crops.${pendingSell.type}`)}?`}
                                    <br />
                                    <span style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'normal' }}>
                                        (+{10 * pendingSell.amount} VP)
                                    </span>
                                </p>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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

                                {/* Trivia Section (Moved to Bottom) */}
                                {CROP_TRIVIA[pendingSell.type] && (
                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        marginTop: '24px',
                                        textAlign: 'left',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <h4 style={{
                                            margin: '0 0 10px 0',
                                            fontSize: '1rem',
                                            color: 'var(--primary-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span>📖</span> {t(`crops.${pendingSell.type}`)}豆知識
                                        </h4>
                                        <div style={{ fontSize: '0.9rem', color: '#2c3e50', marginBottom: '8px' }}>
                                            <strong>旬:</strong> {CROP_TRIVIA[pendingSell.type].season}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#2c3e50', marginBottom: '8px' }}>
                                            <strong>おすすめ料理:</strong> {CROP_TRIVIA[pendingSell.type].recipe}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#57606f', lineHeight: '1.5', borderTop: '1px dashed #ced6e0', paddingTop: '8px', marginTop: '8px' }}>
                                            {CROP_TRIVIA[pendingSell.type].trivia}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>,
                        document.body
                    )
                }

                {/* Harvesting Confirmation Modal */}
                {
                    pendingHarvest && ReactDOM.createPortal(
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            zIndex: 9999,
                            backdropFilter: 'blur(5px)'
                        }} onClick={() => setPendingHarvest(null)}>
                            <div style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '24px',
                                width: '300px',
                                maxWidth: '90%',
                                textAlign: 'center',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                animation: 'popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                            }} onClick={e => e.stopPropagation()}>

                                <div style={{ fontSize: '4rem', marginBottom: '1rem', marginTop: '1rem' }}>
                                    {pendingHarvest.plot.realIcon}
                                </div>

                                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#34495e', fontWeight: 'bold' }}>
                                    水ポイントを使用して収穫しますか？
                                </p>

                                <div style={{
                                    background: '#f1f2f6',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    color: (gameState.water || 0) >= pendingHarvest.plot.cost ? '#27ae60' : '#e74c3c',
                                    fontWeight: 'bold',
                                    display: 'inline-block',
                                    paddingLeft: '16px',
                                    paddingRight: '16px'
                                }}>
                                    Cost: {pendingHarvest.plot.cost} WP
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setPendingHarvest(null)}
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
                                        いいえ
                                    </button>

                                    <button
                                        onClick={() => {
                                            const { index } = pendingHarvest;
                                            if ((gameState.water || 0) >= pendingHarvest.plot.cost) {
                                                harvestPlot(index);
                                                setPendingHarvest(null);
                                                // Optional: Trigger harvest celebration/flying crop
                                                const rect = document.querySelector(`.field-grid button:nth-child(${index + 1})`)?.getBoundingClientRect();
                                                if (rect) {
                                                    setFlyingCrops(prev => [...prev, {
                                                        id: Date.now(),
                                                        icon: pendingHarvest.plot.realIcon,
                                                        start: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
                                                        target: { x: window.innerWidth - 60, y: window.innerHeight - 60 } // Roughly bottom right inventory
                                                    }]);
                                                }
                                            }
                                        }}
                                        disabled={(gameState.water || 0) < pendingHarvest.plot.cost}
                                        style={{
                                            padding: '10px 24px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: (gameState.water || 0) >= pendingHarvest.plot.cost ? '#2ecc71' : '#95a5a6',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            cursor: (gameState.water || 0) >= pendingHarvest.plot.cost ? 'pointer' : 'not-allowed',
                                            boxShadow: (gameState.water || 0) >= pendingHarvest.plot.cost ? '0 4px 0 #27ae60' : 'none',
                                            opacity: (gameState.water || 0) >= pendingHarvest.plot.cost ? 1 : 0.7
                                        }}
                                    >
                                        はい
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }

                {/* Render Flying Crops */}
                {flyingCrops.map(item => (
                    <FlyingObject
                        key={item.id}
                        icon={item.icon}
                        start={item.start}
                        target={item.target}
                        onComplete={() => setFlyingCrops(prev => prev.filter(p => p.id !== item.id))}
                    />
                ))}
            </div >
        </div >
    );
};

export default VillagePage;
