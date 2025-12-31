import { useGame } from '../context/GameContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import './HistoryPage.css';

const HistoryPage = () => {
    const { tasks } = useTasks();
    const { gameState } = useGame();
    const { t } = useLanguage();

    const CATEGORIES = ['General', 'Work', 'Study', 'Health', 'Hobby'];

    // --- 1. Category Count Stats (Existing) ---
    const stats = tasks.reduce((acc, task) => {
        const cat = task.category || 'General';
        const normalizedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        acc[normalizedCat] = (acc[normalizedCat] || 0) + (task.pomodorosSpent || 0);
        return acc;
    }, {});

    CATEGORIES.forEach(cat => { if (!stats[cat]) stats[cat] = 0; });
    const maxVal = Math.max(...Object.values(stats), 1);
    const totalPomodoros = Object.values(stats).reduce((a, b) => a + b, 0);


    // --- 2. Daily Focus Time Stats (New) ---
    // Generate last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    // Process session history
    const sessionHistory = gameState.sessionHistory || [];
    const dailyStats = last7Days.map(dateStr => {
        // Filter sessions for this date (in local time)
        // Stored dates are ISO (UTC). Need careful handling.
        // Simplified: Convert session date to YYYY-MM-DD local
        const daySessions = sessionHistory.filter(s => {
            const sDate = new Date(s.date).toLocaleDateString('sv'); // ISO-like local YYYY-MM-DD
            // Or simple conversion
            const d = new Date(s.date);
            const localYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return localYMD === dateStr;
        });

        // Sum minutes per category
        const breakdown = {};
        let totalMinutes = 0;

        daySessions.forEach(s => {
            const cat = s.category || 'General';
            // Normalize
            const normCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            breakdown[normCat] = (breakdown[normCat] || 0) + s.duration;
            totalMinutes += s.duration;
        });

        return { date: dateStr, total: totalMinutes, breakdown };
    });

    const maxDailyTotal = Math.max(...dailyStats.map(d => d.total), 60); // Min 60 mins scale

    const getDayLabel = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <div className="history-page">
            <header className="page-header">
                <h1>{t('nav.history') || 'History'}</h1>
            </header>

            <div className="stats-summary-card">
                <div className="stat-item">
                    <span className="stat-value">{totalPomodoros}</span>
                    <span className="stat-label">Total Focus (🍅)</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{tasks.filter(t => t.status === 'DONE').length}</span>
                    <span className="stat-label">Tasks Completed</span>
                </div>
            </div>

            {/* Daily Focus Trend (Stacked Bar) */}
            <div className="chart-card mb-24">
                <h2>Daily Focus Time</h2>
                <div className="bar-chart stacked">
                    {dailyStats.map(day => {
                        const heightPct = (day.total / maxDailyTotal) * 100;
                        return (
                            <div key={day.date} className="chart-column">
                                <div className="bar-container">
                                    <div className="stacked-bar-group" style={{ height: `${heightPct}%` }}>
                                        {/* Render segments */}
                                        {CATEGORIES.map(cat => {
                                            const mins = day.breakdown[cat] || 0;
                                            if (mins === 0) return null;
                                            const segmentHeight = (mins / day.total) * 100;
                                            return (
                                                <div
                                                    key={cat}
                                                    className={`bar-segment ${cat.toLowerCase()}`}
                                                    style={{ height: `${segmentHeight}%` }}
                                                    title={`${cat}: ${mins}m`}
                                                />
                                            );
                                        })}
                                        {day.total > 0 && (
                                            <span className="bar-value top">{Math.round(day.total)}m</span>
                                        )}
                                    </div>
                                </div>
                                <span className="x-label">{getDayLabel(day.date)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-card">
                <h2>Category Distribution</h2>
                <div className="bar-chart">
                    {CATEGORIES.map(cat => {
                        const val = stats[cat];
                        const percentage = (val / maxVal) * 100;
                        const displayHeight = Math.max(percentage, 5);

                        return (
                            <div key={cat} className="chart-column">
                                <div className="bar-container">
                                    <div
                                        className={`bar-fill ${cat.toLowerCase()}`}
                                        style={{ height: `${displayHeight}%` }}
                                        title={`${val} Pomodoros`}
                                    >
                                        {val > 0 && <span className="bar-value">{val}</span>}
                                    </div>
                                </div>
                                <span className="x-label">{t(`tasks.categories.${cat.toLowerCase()}`)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
