import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Controls.css';

const Controls = ({ isActive, toggleTimer, resetTimer, mode, switchMode, MODES }) => {
    const { t } = useLanguage();

    const getModeLabel = (key) => {
        switch (key) {
            case 'FOCUS': return t('timer.focus');
            case 'SHORT_BREAK': return t('timer.shortBreak');
            case 'LONG_BREAK': return t('timer.longBreak');
            default: return MODES[key].label;
        }
    };

    return (
        <div className="controls">

            <div className="mode-switcher">
                {Object.keys(MODES).map((key) => (
                    <button
                        key={key}
                        onClick={() => switchMode(key)}
                        className={`mode-btn ${mode === key ? 'active' : ''}`}
                    >
                        {getModeLabel(key)}
                    </button>
                ))}
            </div>

            <div className="main-controls">
                <button
                    onClick={toggleTimer}
                    className={`toggle-timer-btn ${isActive ? 'active' : ''}`}
                >
                    {isActive ? t('timer.pause') : t('timer.start')}
                </button>

                <button
                    onClick={resetTimer}
                    className="reset-btn"
                    aria-label={t('timer.reset')}
                >
                    <RefreshCw size={20} style={{ pointerEvents: 'none' }} />
                </button>
            </div>
        </div>
    );
};

export default Controls;
