import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/');
        } catch (err) {
            setError('Failed to authenticate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{isLogin ? t('auth.welcomeBack') : t('auth.joinVillage')}</h1>
                    <p>{isLogin ? t('auth.continueJourney') : t('auth.startJourney')}</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder={t('auth.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder={t('auth.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? '...' : (
                            <>
                                {isLogin ? t('auth.login') : t('auth.signup')}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>{t('auth.or')}</span>
                </div>

                <div className="social-login">
                    <button className="social-btn google" onClick={async () => {
                        setLoading(true);
                        try {
                            await loginWithGoogle();
                            navigate('/');
                        } catch (e) {
                            setError('Google login failed');
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        <span>G</span> {t('auth.google')}
                    </button>
                    <button className="social-btn apple">
                        <span></span> {t('auth.apple')}
                    </button>
                </div>

                <div className="auth-footer">
                    {isLogin ? t('auth.noAccount') + " " : t('auth.hasAccount') + " "}
                    <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? t('auth.signup') : t('auth.login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
