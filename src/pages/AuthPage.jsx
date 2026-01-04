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
                    <h1>{t('auth.joinVillage')}</h1>
                    <p>{t('auth.startJourney')}</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="social-login" style={{ flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
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
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>G</span>
                        <span style={{ marginLeft: '8px' }}>{t('auth.google')}</span>
                    </button>
                </div>



            </div>
        </div>
    );
};

export default AuthPage;
