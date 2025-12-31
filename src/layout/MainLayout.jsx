import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe, LogIn, LogOut } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleAuthClick = () => {
        if (user) {
            logout();
            navigate('/'); // Redirect to home after logout
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="app-container">
            <div className="header-controls">
                <button
                    className="control-btn"
                    onClick={toggleLanguage}
                    title="Switch Language"
                >
                    <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>
                        {language === 'ja' ? '🇯🇵' : '🇺🇸'}
                    </span>
                    <span>Language</span>
                </button>
                <button
                    className={`control-btn ${user ? 'logout' : 'login'}`}
                    onClick={handleAuthClick}
                    title={user ? t('auth.logout') : t('auth.login')}
                >
                    {user ? <LogOut size={18} /> : <LogIn size={18} />}
                    <span>{user ? t('auth.logout') : t('auth.login')}</span>
                </button>
            </div>
            <main className="content-area">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;
