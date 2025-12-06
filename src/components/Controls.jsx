import React from 'react';

const Controls = ({ isActive, toggleTimer, resetTimer, mode, switchMode, MODES }) => {
    return (
        <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>

            <div className="mode-switcher" style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50px' }}>
                {Object.keys(MODES).map((key) => (
                    <button
                        key={key}
                        onClick={() => switchMode(key)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '25px',
                            background: mode === key ? '#fff' : 'transparent',
                            color: mode === key ? 'var(--primary-color)' : '#fff',
                            fontWeight: mode === key ? 'bold' : 'normal',
                            fontSize: '0.9rem'
                        }}
                    >
                        {MODES[key].label}
                    </button>
                ))}
            </div>

            <div className="main-controls" style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        padding: '1rem 3rem',
                        borderRadius: '50px',
                        background: '#fff',
                        color: 'var(--primary-color)',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                >
                    {isActive ? 'PAUSE' : 'START'}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.2rem'
                    }}
                    aria-label="Reset"
                >
                    ↻
                </button>
            </div>
        </div>
    );
};

export default Controls;
