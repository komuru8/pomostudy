import React, { useState } from 'react';
import { useTimerContext } from '../context/TimerContext';
import { useGame } from '../context/GameContext';
import { useTasks } from '../context/TaskContext';
import { useLanguage } from '../context/LanguageContext';
import './HistoryPage.css';
import './HistoryPage_Scrollbar.css';

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

    // --- 0. Session History (Global for Component) ---
    const sessionHistory = gameState.sessionHistory || [];

    const [timeRange, setTimeRange] = React.useState('week'); // 'week', 'month', 'year'
    const [selectedCategory, setSelectedCategory] = useState('All');
    const chartScrollRef = React.useRef(null);

    // Auto-scroll to end (current date) when switching views
    React.useEffect(() => {
        if (chartScrollRef.current) {
            setTimeout(() => {
                if (chartScrollRef.current) {
                    chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
                }
            }, 0);
        }
    }, [timeRange]);

    // --- 2. Focus Time Stats (Dynamic Range) ---
    const generateChartData = () => {
        const labels = [];
        const today = new Date();
        const dataMap = {};

        if (timeRange === 'week') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                labels.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}` });
                dataMap[key] = { total: 0, breakdown: {} };
            }
        } else if (timeRange === 'month') {
            const y = today.getFullYear();
            const m = today.getMonth(); // 0-indexed
            const daysInMonth = new Date(y, m + 1, 0).getDate();

            // Generate weeks (1st to 5th)
            // 1-7, 8-14, 15-21, 22-28, 29+
            for (let w = 1; w <= 5; w++) {
                // Skip 5th week if month has 28 days
                if (w === 5 && daysInMonth <= 28) continue;

                const key = `${y}-${String(m + 1).padStart(2, '0')}-W${w}`;
                // User request: "1月" on top, "1週目" on bottom for every column
                const label = `${m + 1}月`;
                const subLabel = `${w}週目`;
                labels.push({ key, label, subLabel });
                dataMap[key] = { total: 0, breakdown: {} };
            }
        } else if (timeRange === 'year') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(today);
                d.setMonth(today.getMonth() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                labels.push({ key, label: `${d.getMonth() + 1}月` });
                dataMap[key] = { total: 0, breakdown: {} };
            }
        } else if (timeRange === 'years') {
            for (let i = 4; i >= 0; i--) {
                const y = today.getFullYear() - i;
                const key = String(y);
                labels.push({ key, label: `${y}年` });
                dataMap[key] = { total: 0, breakdown: {} };
            }
        }

        // Process History
        // sessionHistory is now available in scope
        sessionHistory.forEach(s => {
            const d = new Date(s.date);
            let key;
            if (timeRange === 'years') {
                key = String(d.getFullYear());
            } else if (timeRange === 'year') {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } else if (timeRange === 'month') {
                const now = new Date();
                if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
                    const day = d.getDate();
                    const w = Math.floor((day - 1) / 7) + 1;
                    // Cap at 5 for sanity, though logic shouldn't exceed
                    key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-W${w}`;
                }
            } else {
                // week (daily)
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }

            if (dataMap[key]) {
                let cat = s.category || 'General';
                if (cat.toLowerCase().includes('break')) return;
                let normCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                if (!CATEGORIES.includes(normCat)) normCat = 'General';

                dataMap[key].breakdown[normCat] = (dataMap[key].breakdown[normCat] || 0) + s.duration;
                dataMap[key].total += s.duration;
            }
        });

        // Add Live Session (If Today/Current Month matches)
        if (mode === 'FOCUS' && (totalTime - timeLeft) >= 60) {
            const now = new Date();
            let key;
            if (timeRange === 'year') {
                key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            } else if (timeRange === 'month') {
                const day = now.getDate();
                const w = Math.floor((day - 1) / 7) + 1;
                key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-W${w}`;
            } else {
                key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            }

            if (dataMap[key]) {
                const elapsedMins = Math.floor((totalTime - timeLeft) / 60);
                const activeCat = activeTask?.category || 'General';
                const activeNormCat = activeCat.charAt(0).toUpperCase() + activeCat.slice(1).toLowerCase();

                dataMap[key].breakdown[activeNormCat] = (dataMap[key].breakdown[activeNormCat] || 0) + elapsedMins;
                dataMap[key].total += elapsedMins;
            }
        }

        return labels.map(l => ({
            date: l.key,
            label: l.label,
            subLabel: l.subLabel,
            total: dataMap[l.key].total,
            breakdown: dataMap[l.key].breakdown
        }));
    };

    const chartData = generateChartData();
    const maxDailyTotal = Math.max(...chartData.map(d => d.total), 60);

    // Keep "todayStr" for the summary stats at top (independent of chart range)
    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

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



            {/* Daily Focus Trend (Stacked Bar) */}
            <div className="chart-card mb-24">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                    <h2 style={{ margin: 0 }}>{t('history.dailyFocus') || 'Focus Trend'}</h2>
                    {/* Time Range Switcher */}
                    <div className="time-range-switcher" style={{ display: 'inline-flex', background: '#f1f2f6', borderRadius: '8px', padding: '4px' }}>
                        {['week', 'month', 'year', 'years'].map(r => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                style={{
                                    border: 'none',
                                    background: timeRange === r ? '#fff' : 'transparent',
                                    color: timeRange === r ? 'var(--primary-color)' : '#95a5a6',
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: timeRange === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                {r === 'week' ? '日' : r === 'month' ? '週' : r === 'year' ? '月' : '年'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-with-axis">
                    {/* Y-Axis */}
                    <div className="y-axis">
                        {(() => {
                            const formatYAxis = (m) => {
                                if (m === 0) return '0';
                                const h = m / 60;
                                return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
                            };
                            return (
                                <>
                                    <div className="y-tick"><span>{formatYAxis(maxDailyTotal)}</span></div>
                                    <div className="y-tick"><span>{formatYAxis(maxDailyTotal * 0.75)}</span></div>
                                    <div className="y-tick"><span>{formatYAxis(maxDailyTotal * 0.5)}</span></div>
                                    <div className="y-tick"><span>{formatYAxis(maxDailyTotal * 0.25)}</span></div>
                                    <div className="y-tick"><span>0</span></div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Chart Area */}
                    <div ref={chartScrollRef} className="bar-chart stacked" style={{ width: '100%', overflow: 'hidden' }}>
                        {/* Horizontal Grid Lines */}
                        <div className="grid-lines">
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                            <div className="grid-line"></div>
                        </div>

                        {chartData.map(day => {
                            const heightPct = day.total > 0 ? (day.total / maxDailyTotal) * 100 : 0;
                            // Width tuning for mobile scroll comfort
                            // Week: Fit 7 days (100% / 7)
                            // Year: Fit 6 months (100% / 6)
                            // Month: Fit 4-5 weeks. 20% fits 5 perfectly.
                            let colWidth;
                            if (timeRange === 'week') colWidth = '14.28%'; // 1/7
                            else if (timeRange === 'year') colWidth = '8.33%'; // 1/12
                            else colWidth = '20%'; // Month: 5 weeks or Years: 5 years

                            return (
                                <div key={day.date} className="chart-column" style={{ width: colWidth }}>
                                    <div className="bar-container">
                                        <div
                                            className="stacked-bar-group"
                                            style={{ height: `${heightPct}%` }}
                                            title={`${day.label}${day.subLabel || ''}: ${Math.round(day.total)} mins`}
                                        >
                                            {CATEGORIES.map(cat => {
                                                const mins = day.breakdown[cat] || 0;
                                                if (mins === 0) return null;
                                                const segmentHeight = day.total > 0 ? (mins / day.total) * 100 : 0;
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
                                    <span className="x-label" style={{
                                        fontSize: '0.7rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        lineHeight: '1.2',
                                        whiteSpace: 'normal',
                                        bottom: timeRange === 'month' ? '-5px' : '0'
                                    }}>
                                        {day.label}
                                        {day.subLabel && <span style={{ fontSize: '0.65rem', color: '#555', marginTop: '0px', fontWeight: 'bold' }}>{day.subLabel}</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="chart-card">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                    <h2 style={{ margin: 0 }}>{t('history.categoryDist') || 'Category Distribution'}</h2>
                    <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: '500' }}>
                        ({t('history.allTime') || 'All Time'})
                    </span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            fontSize: '0.9rem',
                            color: '#555',
                            outline: 'none',
                            background: '#f8f9fa',
                            cursor: 'pointer',
                            minWidth: '200px',
                            textAlign: 'center',
                            textAlignLast: 'center'
                        }}
                    >
                        <option value="All">{t('tasks.filterAll') || 'Whole'}</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{t(`tasks.categories.${cat.toLowerCase()}`)}</option>
                        ))}
                    </select>
                </div>

                {(() => {
                    // Logic to toggle between Main Categories or Sub Categories
                    const isAll = selectedCategory === 'All';

                    const SUB_CATEGORY_MAP = {
                        Study: ['languages', 'certification', 'tech', 'reading', 'assignment', 'misc'],
                        Health: ['exercise', 'cooking', 'sleep', 'mental', 'beauty', 'misc'],
                        Hobby: ['creative', 'sports', 'game', 'entertainment', 'travel', 'misc'],
                        Work: ['planning', 'development', 'meeting', 'admin', 'analysis', 'misc'],
                        General: ['chores', 'shopping', 'finance', 'family', 'organize', 'misc']
                    };

                    const distChartData = {}; // key: minutes
                    const sessionHistory = gameState.sessionHistory || [];

                    sessionHistory.forEach(s => {
                        // Filter by Main Category first
                        let cat = s.category || 'General';
                        cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(); // Normalize

                        // If viewing specific category, ignore others.
                        if (!isAll && cat !== selectedCategory) return;

                        // Determine Key
                        let key;
                        if (isAll) {
                            key = cat;
                            if (!CATEGORIES.includes(key)) key = 'General';
                        } else {
                            key = (s.subCategory || 'misc').toLowerCase();
                        }

                        distChartData[key] = (distChartData[key] || 0) + (s.duration || 0);
                    });

                    // Add Live Session
                    if (mode === 'FOCUS' && (totalTime - timeLeft) >= 60) {
                        const elapsedMins = Math.floor((totalTime - timeLeft) / 60);
                        const activeCat = activeTask?.category || 'General';
                        const activeNormCat = activeCat.charAt(0).toUpperCase() + activeCat.slice(1).toLowerCase();

                        if (isAll || activeNormCat === selectedCategory) {
                            let key;
                            if (isAll) {
                                const idx = CATEGORIES.findIndex(c => c.toLowerCase() === activeCat.toLowerCase());
                                key = idx !== -1 ? CATEGORIES[idx] : 'General';
                            } else {
                                key = (activeTask?.subCategory || 'misc').toLowerCase();
                            }
                            distChartData[key] = (distChartData[key] || 0) + elapsedMins;
                        }
                    }

                    // Define Keys for X-Axis (Fixed Order)
                    let keys;
                    if (isAll) {
                        keys = CATEGORIES;
                    } else {
                        // Show ALL recognized sub-categories for this parent, even if 0
                        keys = SUB_CATEGORY_MAP[selectedCategory] || ['misc'];
                    }

                    const maxVal = Math.max(...Object.values(distChartData), 60);

                    // Helper for Axis Labels
                    const formatAxis = (m) => {
                        if (m === 0) return '0';
                        if (m >= 60) return `${(m / 60).toFixed(1)}h`;
                        return `${m}m`;
                    };

                    // Helper to Translate SubCat Key
                    const getLabel = (k) => {
                        if (isAll) return t(`tasks.categories.${k.toLowerCase()}`);
                        return t(`tasks.subCategories.${k}`) || k;
                    };

                    return (
                        <div className="chart-with-axis">
                            {/* Y-Axis */}
                            <div className="y-axis">
                                <div className="y-tick"><span>{formatAxis(maxVal)}</span></div>
                                <div className="y-tick"><span>{formatAxis(Math.round(maxVal * 0.75))}</span></div>
                                <div className="y-tick"><span>{formatAxis(Math.round(maxVal * 0.5))}</span></div>
                                <div className="y-tick"><span>{formatAxis(Math.round(maxVal * 0.25))}</span></div>
                                <div className="y-tick"><span>0</span></div>
                            </div>

                            <div className="bar-chart" style={{ width: '100%', overflow: 'hidden' }}>
                                <div className="grid-lines">
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                </div>

                                {keys.map(k => {
                                    const val = distChartData[k] || 0;
                                    const percentage = maxVal > 0 ? (val / maxVal) * 100 : 0;
                                    const barClass = isAll ? k.toLowerCase() : selectedCategory.toLowerCase();

                                    // Fix: Define colWidth
                                    const count = keys.length;
                                    const colWidth = `${100 / count}%`;

                                    return (
                                        <div key={k} className="chart-column" style={{ width: colWidth }}>
                                            <div className="bar-container">
                                                <div
                                                    className={`bar-fill ${barClass}`}
                                                    style={{ height: `${percentage}%` }}
                                                    title={`${val} minutes`}
                                                ></div>
                                            </div>
                                            <span className="x-label">{getLabel(k)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default HistoryPage;
