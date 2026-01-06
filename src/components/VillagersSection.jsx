import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useGame } from '../context/GameContext';
import { COACHES } from '../constants/coaches';
import { Check, Lock } from 'lucide-react';

const VillagersSection = () => {
    const { gameState, setActiveCoach } = useGame();
    const [selectedCoach, setSelectedCoach] = useState(null);

    const handleCoachClick = (coach) => {
        if (gameState.level >= coach.unlockLevel) {
            setSelectedCoach(coach);
        }
    };

    const handleConfirmSelection = () => {
        if (selectedCoach) {
            setActiveCoach(selectedCoach.id);
            setSelectedCoach(null);
        }
    };

    return (
        <div className="villagers-section" style={{
            marginBottom: '100px', // Increased from 24px to clear speech bubbles
            textAlign: 'left',
            marginTop: '24px' // Added top margin for spacing
        }}>
            <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '16px',
                color: 'var(--text-color)',
                fontWeight: '800',
                paddingLeft: '8px',
                borderLeft: '4px solid var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                村の住人たち
            </h3>

            <div className="villagers-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '15px'
            }}>
                {COACHES.map(coach => {
                    const isUnlocked = gameState.level >= coach.unlockLevel;
                    const isActive = gameState.activeCoachId === coach.id;

                    // Determine image source: normal or silhouette
                    // Assuming silhouette images follow naming convention: coach_[id]_silhouette.png
                    // But our generator made them. Let's construct path or update COACHES constant?
                    // Quickest is string manipulation: /assets/coach_[id].png -> /assets/coach_[id]_silhouette.png
                    const imageSrc = isUnlocked
                        ? coach.iconPath
                        : coach.iconPath.replace('.png', '_silhouette.png');

                    return (
                        <div
                            key={coach.id}
                            onClick={() => handleCoachClick(coach)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                opacity: isUnlocked ? 1 : 0.6,
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '70px',
                                minWidth: '70px', // Fixed size
                                height: '70px',
                                minHeight: '70px',
                                flexShrink: 0,
                                borderRadius: '50%',
                                // overflow: 'hidden',
                                border: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                background: isUnlocked ? '#f0f0f0' : 'transparent',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'transform 0.2s'
                            }}>
                                <img
                                    src={imageSrc}
                                    alt={coach.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                    }}
                                />

                            </div>

                            <span style={{
                                marginTop: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                color: 'var(--text-color)',
                                textAlign: 'center'
                            }}>
                                {isUnlocked ? coach.name : '???'}
                            </span>

                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: 5,
                                    background: 'var(--primary-color)',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    border: '2px solid white',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '20px'
                                }}>
                                    <Check size={12} color="white" />
                                </div>
                            )}

                            {isActive && coach.greetings && (
                                <div className="villager-bubble">
                                    {(() => {
                                        const seed = coach.id.length + new Date().getHours();
                                        return coach.greetings[seed % coach.greetings.length];
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Coach Profile Modal via Portal */}
            {selectedCoach && ReactDOM.createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedCoach(null)}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        animation: 'popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto 1.5rem',
                            border: '4px solid var(--bg-color)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                        }}>
                            <img
                                src={selectedCoach.iconPath}
                                alt={selectedCoach.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
                            {selectedCoach.name}
                        </h3>

                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-light)',
                            marginBottom: '1.5rem',
                            lineHeight: '1.6'
                        }}>
                            {selectedCoach.description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setSelectedCoach(null)} style={{
                                padding: '12px 24px',
                                borderRadius: '50px',
                                border: 'none',
                                background: '#f1f2f6',
                                color: 'var(--text-light)',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>
                                閉じる
                            </button>
                            {gameState.activeCoachId !== selectedCoach.id && (
                                <button onClick={handleConfirmSelection} style={{
                                    padding: '12px 24px',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: 'var(--primary-gradient)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px var(--shadow-color)'
                                }}>
                                    指名する
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body // Portal Target
            )}
        </div>
    );
};

export default VillagersSection;
