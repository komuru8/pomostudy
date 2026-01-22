import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Globe, LogIn, LogOut, Menu, X, Trees, Coffee, Info } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const { gameState } = useGame(); // Import GameContext
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const location = useLocation();

    // Sync Theme with Body Class (Only on Timer Page)
    React.useEffect(() => {
        // Timer page is root '/' or potentially '/timer' if configured
        const isTimerPage = location.pathname === '/' || location.pathname === '/timer';

        if (isTimerPage && gameState?.theme) {
            document.body.className = `theme-${gameState.theme}`;
        } else {
            // Revert to default/clean state on other pages
            document.body.className = '';
        }
    }, [gameState?.theme, location.pathname]);

    // Scroll To Top on Route Change (Except AI Chat which handles its own scroll)
    React.useEffect(() => {
        if (location.pathname !== '/ai') {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

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
    };

    return (
        <div className="app-container">
            {/* Fixed Global Header */}
            <header className="app-header">
                {/* App Logo */}
                <div className="app-logo">
                    <span style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center' }}>
                        {/* Only show Tree on Timer page with Wood theme */}
                        {(location.pathname === '/' || location.pathname === '/timer') && gameState?.theme === 'wood'
                            ? <Trees color="#d35400" size={28} />
                            : (location.pathname === '/' || location.pathname === '/timer') && gameState?.theme === 'cafe'
                                ? <Coffee color="#6d4c41" size={28} />
                                : '🌱'}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>
                        {t('app.title')}
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
                            onClick={() => {
                                navigate('/about');
                                setIsMenuOpen(false);
                            }}
                            title={t('nav.about')}
                        >
                            <Info size={20} />
                            <span>{t('nav.about')}</span>
                        </button>
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
