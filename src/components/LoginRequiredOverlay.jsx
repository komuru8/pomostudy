import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Lock } from 'lucide-react';
import './LoginRequiredOverlay.css';

const LoginRequiredOverlay = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="login-overlay-backdrop">
            <div className="login-overlay-card">
                <div className="lock-icon-circle">
                    <Lock size={32} />
                </div>
                <h3>{t('auth.loginRequired')}</h3>
                <p>{t('auth.loginRequiredMsg')}</p>
                <button
                    className="login-action-btn"
                    onClick={() => navigate('/auth')}
                >
                    {t('auth.goToLogin')}
                </button>
            </div>
        </div>
    );
};

export default LoginRequiredOverlay;
