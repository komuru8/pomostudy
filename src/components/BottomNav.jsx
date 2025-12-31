import React from 'react';
import { NavLink } from 'react-router-dom';
import { Timer, CheckSquare, Tent, Bot, BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
    const { t } = useLanguage();

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Timer size={24} />
                <span>{t('nav.timer')}</span>
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CheckSquare size={24} />
                <span>{t('nav.tasks')}</span>
            </NavLink>
            <NavLink to="/village" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Tent size={24} />
                <span>{t('nav.base') || 'Base'}</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BarChart2 size={24} />
                <span>{t('nav.history')}</span>
            </NavLink>
            <NavLink to="/ai" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Bot size={24} />
                <span>{t('nav.ai')}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
