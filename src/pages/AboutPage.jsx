import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Timer, CheckSquare, Flower2, Bot, ArrowLeft, LogIn, Sprout, Tent, BookOpen } from 'lucide-react';
import aboutHero from '../assets/about_hero.png';
import aboutGrow from '../assets/about_grow.jpg';
import aboutVillage from '../assets/about_village.jpg';
import aboutAI from '../assets/about_ai.jpg';

const AboutPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const features = [
        {
            key: 'timer',
            icon: <Timer size={32} className="text-orange-500" />,
            color: '#fff3e0'
        },
        {
            key: 'tasks',
            icon: <CheckSquare size={32} className="text-blue-500" />,
            color: '#e3f2fd'
        },
        {
            key: 'history',
            icon: <BookOpen size={32} className="text-cyan-600" />,
            color: '#e0f7fa'
        },
        {
            key: 'village',
            icon: <Tent size={32} className="text-green-500" />,
            color: '#e8f5e9'
        },
        {
            key: 'ai',
            icon: <Bot size={32} className="text-purple-500" />,
            color: '#f3e5f5'
        }
    ];

    return (
        <div className="unified-card" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
            <h1 style={{
                marginBottom: '1rem',
                fontSize: '2.2rem',
                color: 'var(--primary-dark)',
                fontWeight: '800'
            }}>
                {t('about.welcome')}
            </h1>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2.5rem'
            }}>
                <img src={aboutHero} alt="ManaVillage Hero" style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '24px',
                }} />
            </div>

            {/* Hero Catchphrase */}
            <h2 style={{
                fontSize: '1.6rem',
                color: 'var(--primary-dark)',
                marginBottom: '1.5rem',
                fontWeight: '800'
            }}>
                {t('about.hero.catchphrase')}
            </h2>

            <p style={{
                fontSize: '1.05rem',
                lineHeight: '2',
                color: 'var(--text-color)',
                marginBottom: '3rem',
                whiteSpace: 'pre-wrap',
                textAlign: 'left',
                margin: '0 auto 3rem',
                maxWidth: '90%'
            }}>
                {t('about.hero.intro')}
            </p>

            {/* Story Sections - Structured Layout */}
            <div style={{ marginBottom: '4rem', textAlign: 'left', margin: '0 0 4rem' }}>
                {['grow', 'village', 'ai'].map((key) => {
                    const config = {
                        grow: {
                            titleColor: '#2e7d32',
                            image: aboutGrow
                        },
                        village: {
                            titleColor: '#d35400',
                            image: aboutVillage
                        },
                        ai: {
                            titleColor: '#8e44ad',
                            image: aboutAI
                        }
                    };
                    const item = config[key];

                    return (
                        <div key={key} style={{
                            marginBottom: '2rem',
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.04)'
                        }}>
                            {/* Content Area */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    color: item.titleColor,
                                    marginTop: '0.2rem',
                                    marginBottom: '0.8rem',
                                    fontWeight: '800'
                                }}>
                                    {t(`about.story.${key}.title`)}
                                </h3>
                                <p style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.7',
                                    color: '#555',
                                    margin: 0
                                }}>
                                    {t(`about.story.${key}.content`)}
                                </p>
                                {item.image && (
                                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                        <img src={item.image} alt="Grow Vegetables" style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            borderRadius: '16px',
                                            maxHeight: '200px',
                                            objectFit: 'contain'
                                        }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Closing Message */}
            <div style={{
                margin: '0 auto 4rem',
                padding: '2rem',
                borderTop: '2px dashed #eee',
                borderBottom: '2px dashed #eee',
                maxWidth: '90%'
            }}>
                <p style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-dark)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8'
                }}>
                    {t('about.closing')}
                </p>
            </div>

            {/* Feature Summary Grid - Minimalist */}
            <h3 style={{
                textAlign: 'center',
                fontSize: '1.4rem',
                color: 'var(--primary-dark)',
                marginBottom: '2rem',
                fontWeight: '800'
            }}>
                {t('about.featuresTitle')}
            </h3>

            <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                marginBottom: '4rem'
            }}>
                {features.map((feature) => (
                    <div key={feature.key} style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        backgroundColor: '#fafafa',
                        border: '1px solid rgba(0,0,0,0.05)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            marginBottom: '1rem',
                            display: 'inline-flex',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            {feature.icon}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '700', color: '#444' }}>
                            {t(`about.features.${feature.key}.title`)}
                        </h3>
                        <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                            {t(`about.features.${feature.key}.desc`)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.8rem 2rem',
                        borderRadius: '99px',
                        border: '2px solid #ddd',
                        backgroundColor: 'white',
                        color: '#666',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#bbb';
                        e.currentTarget.style.color = '#333';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.color = '#666';
                    }}
                >
                    <ArrowLeft size={18} />
                    {t('about.backToTimer')}
                </button>

                <button
                    onClick={() => navigate('/auth')}
                    className="primary-btn"
                    style={{
                        fontSize: '1.1rem',
                        padding: '0.8rem 2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <LogIn size={20} />
                    {t('about.login')}
                </button>
            </div>
        </div>
    );
};

export default AboutPage;
