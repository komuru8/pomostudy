import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe, LogIn, LogOut, Menu, X } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleAuthClick = () => {
        if (user) {
            logout();
            navigate('/'); // Redirect to home after logout
        } else {
            navigate('/auth');
        }
        setIsMenuOpen(false); // Close menu on action
    };

    const handleLanguageClick = () => {
        toggleLanguage();
        // setIsMenuOpen(false); // Optional: Keep open to toggle back? Or close. Let's keep open for easier switching.
    };

    return (
        <div className="app-container">
            {/* Fixed Global Header */}
            <header className="app-header">
                {/* App Logo */}
                <div className="app-logo">
                    <span style={{ fontSize: '1.8rem' }}>🌱</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>
                        Pomodoro Farm
                    </span>
                </div>

                <div className="header-controls">
                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="hamburger-btn control-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Menu Items */}
                    <div className={`menu-items ${isMenuOpen ? 'open' : ''}`}>
                        <button
                            className="control-btn"
                            onClick={handleLanguageClick}
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
                </div>
            </header>

            <main className="content-area">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;
