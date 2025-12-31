import { useTimerContext } from '../context/TimerContext';
import { useGame } from '../context/GameContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import './HistoryPage.css';

const HistoryPage = () => {
    const { tasks, activeTask } = useTasks();
    const { gameState } = useGame();
    const { t } = useLanguage();
    const { timeLeft, totalTime, mode } = useTimerContext();

    const CATEGORIES = ['General', 'Work', 'Study', 'Health', 'Hobby'];

    // --- 1. Category Count Stats (Existing) ---
    const stats = tasks.reduce((acc, task) => {
        const cat = task.category || 'General';
        const normalizedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        acc[normalizedCat] = (acc[normalizedCat] || 0) + (task.pomodorosSpent || 0);
        return acc;
    }, {});

    CATEGORIES.forEach(cat => { if (!stats[cat]) stats[cat] = 0; });

    // Inject live progress into Total Stats
    let totalPomodoros = Object.values(stats).reduce((a, b) => a + b, 0);
    if (mode === 'FOCUS' && (totalTime - timeLeft) >= 60) {
        // We only add to "Total Focus" (pomodoros count) roughly?
        // Actually, User requirements: "reflect in history 5 min... graph".
        // Total Focus (🍅) usually counts completed pomodoros (25m units).
        // If we want to reflect "5 mins" in the graph, we did that in dailyStats.
        // For "Total Focus" which is usually a count, maybe we shouldn't add incomplete ones?
        // But the graph is "Focus Time (minutes)".
        // The stats chart is "Category Distribution" (Pomodoros count).
        // Let's accept partial poms (e.g. 0.2) in distribution for better real-time feel?
        // Or just keep the distribution int-based?
        // User asked: "reflect in history ... graph". The graph uses dailyStats (minutes).
        // The Category Distribution uses `stats` (Pomodoros).
        // Let's stick to updating the graph mainly, but for consistency let's enable partial in category dist.
        const activeCat = activeTask?.category || 'General';
        const normActive = activeCat.charAt(0).toUpperCase() + activeCat.slice(1).toLowerCase();
        const partialPom = (totalTime - timeLeft) / 60 / 25; // Fraction of a pomodoro
        // To avoid confusing "2.1 pomodoros", maybe just keep this strictly integer completed?
        // User asked "5 minutes... reflect in graph". Graph is Minutes.
        // I'll leave the Category Count (Pie/Bar) as COMPLETED pomodoros to avoid confusion,
        // unless user specifically asked for that too. "reflect in history... graph".
        // I will add it to the 'stats' object for consistency if the chart handles floats.
        // Let's add it visually to the stats object for the chart render.
        stats[normActive] = (stats[normActive] || 0) + partialPom;
        totalPomodoros += partialPom;
    }

    const maxVal = Math.max(...Object.values(stats), 1);


    // --- 2. Daily Focus Time Stats (New) ---
    // Generate last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const todayStr = last7Days[6]; // Last element is today

    // Process session history
    const sessionHistory = gameState.sessionHistory || [];
    const dailyStats = last7Days.map(dateStr => {
        // Filter sessions for this date (in local time)
        const daySessions = sessionHistory.filter(s => {
            const d = new Date(s.date);
            const localYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return localYMD === dateStr;
        });

        // Sum minutes per category
        const breakdown = {};
        let totalMinutes = 0;

        daySessions.forEach(s => {
            const cat = s.category || 'General';
            const normCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            breakdown[normCat] = (breakdown[normCat] || 0) + s.duration;
            totalMinutes += s.duration;
        });

        // --- INJECT LIVE SESSION ---
        // If today, check if timer is running/paused and has progress > 1 min
        if (dateStr === todayStr && mode === 'FOCUS') {
            const elapsedSeconds = totalTime - timeLeft;
            if (elapsedSeconds >= 60) {
                const activeCat = activeTask?.category || 'General';
                const activeNormCat = activeCat.charAt(0).toUpperCase() + activeCat.slice(1).toLowerCase();
                const sessionMins = Math.floor(elapsedSeconds / 60);

                breakdown[activeNormCat] = (breakdown[activeNormCat] || 0) + sessionMins;
                totalMinutes += sessionMins;
            }
        }

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

            {/* Top Summary Stats Grid */}
            <div className="detailed-stats-grid mb-24" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {(() => {
                    // Helper to format minutes to "XH Ym" or "Ym"
                    // Requirement: "〇〇時間〇〇分"
                    const formatTime = (totalMins) => {
                        const h = Math.floor(totalMins / 60);
                        const m = Math.floor(totalMins % 60);
                        if (h > 0) return `${h}時間${m || 0}分`;
                        return `${m}分`;
                    };

                    // ---- Today's Stats ----
                    // 1. Focus Time
                    const todayFocusMins = dailyStats[6]?.breakdown?.['Focus'] || 0; // dailyStats[6] is today
                    // Need to check if 'Focus' key matches normalization.
                    // breakdown keys are capitalized 'Focus', 'Short break'? No, 'Focus', 'Short break' keys come from categories?
                    // Wait, dailyStats logic uses categories.
                    // Session History has 'type' now.
                    // Let's re-calculate cleanly using sessionHistory to be safe for "Focus Time" specifically (excluding breaks if user meant Focus Time).
                    // "今日の集中時間" -> usually means actual Focus Time.

                    let todayFocus = 0;
                    let totalFocus = 0;
                    let todayTasks = 0;
                    let totalTasks = 0;

                    // Calculate Time
                    sessionHistory.forEach(s => {
                        let isFocus = s.type === 'FOCUS' || (!s.type && s.category !== 'Break');
                        if (!isFocus) return;

                        totalFocus += s.duration;

                        // Check Today
                        const d = new Date(s.date);
                        const localYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        if (localYMD === todayStr) {
                            todayFocus += s.duration;
                        }
                    });

                    // Add Live Progress to Focus Time
                    if (mode === 'FOCUS' && (totalTime - timeLeft) >= 60) {
                        const elapsed = Math.floor((totalTime - timeLeft) / 60);
                        todayFocus += elapsed;
                        totalFocus += elapsed;
                    }

                    // Calculate Tasks
                    // tasks: array from TaskContext
                    totalTasks = tasks.filter(t => t.status === 'DONE').length;
                    todayTasks = tasks.filter(t => {
                        if (t.status !== 'DONE' || !t.completedAt) return false;
                        const d = new Date(t.completedAt);
                        const localYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        return localYMD === todayStr;
                    }).length;

                    return (
                        <>
                            <div className="stat-item">
                                <span className="stat-label-sm">{t('history.todayFocusTime')}</span>
                                <span className="stat-value-md">{formatTime(todayFocus)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label-sm">{t('history.todayCompletedTasks')}</span>
                                <span className="stat-value-md">{todayTasks}{t('history.tasksSuffix')}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label-sm">{t('history.totalFocusTime')}</span>
                                <span className="stat-value-md">{formatTime(totalFocus)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label-sm">{t('history.totalCompletedTasks')}</span>
                                <span className="stat-value-md">{totalTasks}{t('history.tasksSuffix')}</span>
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Detailed Session Counts Grid */}
            <div className="detailed-stats-grid">
                {/* Headers */}
                <div className="grid-header"></div>
                <div className="grid-header">{t('history.focusSessions')}</div>
                <div className="grid-header">{t('history.shortBreaks')}</div>
                <div className="grid-header">{t('history.longBreaks')}</div>

                {/* Calculation Logic Inline */}
                {(() => {
                    const counts = {
                        today: { focus: 0, short: 0, long: 0 },
                        total: { focus: 0, short: 0, long: 0 }
                    };

                    // Process History
                    sessionHistory.forEach(s => {
                        // Determine Type
                        let type = s.type;
                        if (!type) {
                            if (s.category === 'Break') type = 'SHORT_BREAK'; // Retroactive guess, usually distinct
                            else type = 'FOCUS';
                        }

                        // Increment Total
                        if (type === 'FOCUS') counts.total.focus++;
                        else if (type === 'SHORT_BREAK') counts.total.short++;
                        else if (type === 'LONG_BREAK') counts.total.long++;

                        // Check Today
                        const d = new Date(s.date);
                        const localYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        if (localYMD === todayStr) {
                            if (type === 'FOCUS') counts.today.focus++;
                            else if (type === 'SHORT_BREAK') counts.today.short++;
                            else if (type === 'LONG_BREAK') counts.today.long++;
                        }
                    });

                    // Inject Live Session
                    if ((totalTime - timeLeft) >= 60) {
                        if (mode === 'FOCUS') {
                            counts.today.focus++;
                            counts.total.focus++;
                        } else if (mode === 'SHORT_BREAK') {
                            counts.today.short++;
                            counts.total.short++;
                        } else if (mode === 'LONG_BREAK') {
                            counts.today.long++;
                            counts.total.long++;
                        }
                    }

                    return (
                        <>
                            {/* Today Row */}
                            <div className="grid-row-label">{t('history.today')}</div>
                            <div className="grid-cell">{counts.today.focus}</div>
                            <div className="grid-cell break">{counts.today.short}</div>
                            <div className="grid-cell long">{counts.today.long}</div>

                            {/* Total Row */}
                            <div className="grid-row-label">{t('history.total')}</div>
                            <div className="grid-cell">{counts.total.focus}</div>
                            <div className="grid-cell break">{counts.total.short}</div>
                            <div className="grid-cell long">{counts.total.long}</div>
                        </>
                    );
                })()}
            </div>

            {/* 3. Tomato Character (Unlocked at Lv.2) */}
            {gameState.level >= 2 && (
                <div className="tomato-companion-card mb-24">
                    <div className="companion-avatar">🍅</div>
                    <div className="companion-speech">
                        <p>{t('history.companionMsg') || 'Keep going! Your village is growing nicely.'}</p>
                    </div>
                </div>
            )}

            {/* Daily Focus Trend (Stacked Bar) */}
            <div className="chart-card mb-24">
                <h2>{t('history.dailyFocus') || 'Daily Focus Time'}</h2>
                <div className="chart-with-axis">
                    {/* Y-Axis */}
                    <div className="y-axis">
                        <div className="y-tick"><span>{maxDailyTotal}m</span></div>
                        <div className="y-tick"><span>{Math.round(maxDailyTotal * 0.75)}m</span></div>
                        <div className="y-tick"><span>{Math.round(maxDailyTotal * 0.5)}m</span></div>
                        <div className="y-tick"><span>{Math.round(maxDailyTotal * 0.25)}m</span></div>
                        <div className="y-tick"><span>0m</span></div>
                    </div>

                    {/* Chart Area */}
                    <div className="bar-chart stacked">
                        {/* Horizontal Grid Lines */}
                        <div className="grid-lines">
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                        </div>

                        {dailyStats.map(day => {
                            const heightPct = (day.total / maxDailyTotal) * 100;
                            return (
                                <div key={day.date} className="chart-column">
                                    <div className="bar-container">
                                        <div
                                            className="stacked-bar-group"
                                            style={{ height: `${heightPct}%` }}
                                            title={`${Math.round(day.total)} minutes`}
                                        >
                                            {CATEGORIES.map(cat => {
                                                const mins = day.breakdown[cat] || 0;
                                                if (mins === 0) return null;
                                                const segmentHeight = (mins / day.total) * 100;
                                                return (
                                                    <div
                                                        key={cat}
                                                        className={`bar-segment ${cat.toLowerCase()}`}
                                                        style={{ height: `${segmentHeight}%` }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <span className="x-label">{getDayLabel(day.date)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="chart-card">
                <h2>{t('history.categoryDist') || 'Category Distribution'}</h2>
                <div className="chart-with-axis">
                    {/* Y-Axis */}
                    <div className="y-axis">
                        <div className="y-tick"><span>{Math.ceil(maxVal)}</span></div>
                        <div className="y-tick"><span>{Math.ceil(maxVal * 0.75)}</span></div>
                        <div className="y-tick"><span>{Math.ceil(maxVal * 0.5)}</span></div>
                        <div className="y-tick"><span>{Math.ceil(maxVal * 0.25)}</span></div>
                        <div className="y-tick"><span>0</span></div>
                    </div>

                    <div className="bar-chart">
                        {/* Horizontal Grid Lines */}
                        <div className="grid-lines">
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                        </div>

                        {CATEGORIES.map(cat => {
                            const val = stats[cat];
                            const percentage = (val / maxVal) * 100;
                            // Ensure at least a sliver if 0 but we usually don't show negative
                            const displayHeight = percentage;

                            return (
                                <div key={cat} className="chart-column">
                                    <div className="bar-container">
                                        <div
                                            className={`bar-fill ${cat.toLowerCase()}`}
                                            style={{ height: `${displayHeight}%` }}
                                            title={`${Math.floor(val)} Pomodoros`}
                                        >
                                            {/* Removed internal value */}
                                        </div>
                                    </div>
                                    <span className="x-label">{t(`tasks.categories.${cat.toLowerCase()}`)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
