import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './VillagerRanking.css';

// Helpers for date keys
const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getPeriodId = (type) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    if (type === 'day') return `day_${year}-${month}-${day}`;
    if (type === 'week') {
        const week = String(getISOWeek(now)).padStart(2, '0');
        // Note: ISO year calculation might differ slightly around new year, but assuming same year for simplicity or consistent logic with context
        // Ideally should match exactly GameContext logic.
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const isoYear = d.getUTCFullYear();
        return `week_${isoYear}-W${week}`;
    }
    if (type === 'month') return `month_${year}-${month}`;
    if (type === 'year') return `year_${year}`;
    return '';
};

const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const VillagerRanking = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('day'); // day, week, month, year
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            try {
                const periodId = getPeriodId(activeTab);
                const q = query(
                    collection(db, 'leaderboards', periodId, 'users'),
                    orderBy('duration', 'desc'),
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRankingData(data);
            } catch (error) {
                console.error("Error fetching ranking:", error);
                setRankingData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [activeTab]);

    const tabs = ['day', 'week', 'month', 'year'];

    return (
        <div className="villager-ranking">
            <h3 className="ranking-title">🏆 {t('ranking.title')}</h3>

            <div className="ranking-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`ranking-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {t(`ranking.${tab}`)}
                    </button>
                ))}
            </div>

            <div className="ranking-list-container">
                {loading ? (
                    <div className="ranking-loading">Loading...</div>
                ) : rankingData.length === 0 ? (
                    <div className="ranking-empty">{t('ranking.noData')}</div>
                ) : (
                    <div className="ranking-list">
                        <div className="ranking-header">
                            <span className="col-rank">{t('ranking.rank')}</span>
                            <span className="col-name">{t('ranking.villager')}</span>
                            <span className="col-level">{t('nav.village')}</span>
                            <span className="col-time">{t('ranking.time')}</span>
                        </div>
                        {rankingData.map((player, index) => {
                            const isMe = user && player.id === user.uid;
                            const rank = index + 1;
                            let rankIcon = null;
                            if (rank === 1) rankIcon = '🥇';
                            else if (rank === 2) rankIcon = '🥈';
                            else if (rank === 3) rankIcon = '🥉';

                            return (
                                <div key={player.id} className={`ranking-item ${isMe ? 'is-me' : ''}`}>
                                    <div className="col-rank">
                                        {rankIcon ? <span className="rank-icon">{rankIcon}</span> : <span className="rank-num">{rank}</span>}
                                    </div>
                                    <div className="col-name">
                                        {player.username}
                                        {isMe && <span className="me-badge"> ({t('ranking.you')})</span>}
                                    </div>
                                    <div className="col-level">Lv.{player.level}</div>
                                    <div className="col-time">{formatTime(player.duration || 0)}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VillagerRanking;
