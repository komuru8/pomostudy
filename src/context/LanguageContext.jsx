import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
    ja: {
        nav: {
            timer: 'タイマー',
            tasks: 'タスク',

            village: '村',
            history: '履歴',
            ai: 'AIコーチ'
        },
        timer: {
            focus: '集中',
            shortBreak: '小休憩',
            longBreak: '長休憩',
            currentFocus: '現在のタスク',
            start: '開始',
            pause: '一時停止',

            reset: 'リセット',
            pomodoros: 'ポモドーロ'
        },
        tasks: {
            title: 'タスク',
            add: '追加',
            placeholder: '何に取り組みますか？',
            empty: 'タスクがありません。追加して始めましょう！',
            priority: { today: '今日やる', high: '高', medium: '中', low: '低' },
            categories: { work: '仕事', study: '勉強', health: '健康', hobby: '趣味', general: '一般' },
            save: '保存',
            confirmDelete: '削除してもよろしいですか？',

            confirmFocus: '現在のタスクとして設定しますか？',
            yes: 'はい',
            no: 'いいえ',
            searchPlaceholder: 'タスクを検索...',
            filterAll: '全カテゴリー',
            sortBy: '並び替え',
            sort: { priority: '優先度順', newest: '新しい順', oldest: '古い順' },
            newTask: '新規タスク',
            subCategories: {
                // Work
                meeting: '会議', development: '開発', planning: '計画', email: 'メール',
                // Study
                math: '数学', english: '英語', programming: 'プログラミング', reading: '読書',
                // Health
                exercise: '運動', meditation: '瞑想', meal: '食事',
                // Hobby
                game: 'ゲーム', art: '創作', music: '音楽',
                // General
                chores: '家事', shopping: '買い物', misc: 'その他'
            }
        },
        village: {
            level: 'Lv.',
            water: '水',
            harvest: '収穫する',
            harvestCollection: '収穫コレクション',
            emptyCollection: '野菜を収穫してコレクションを埋めましょう！',
            logout: 'ログアウト',
            wasteland: '荒れ地',
            field: '耕された畑',
            garden: '小さな芽',
            farmhouse: '実り',
            villageStart: '村の始まり',
            nextLevel: '次のレベル',
            toNextLevel: '次のレベルまで',
            tips: 'ヒント',
            approxSessions: '集中セッションあと約{{count}}回 (25分)'
        },
        auth: {
            welcomeBack: 'おかえりなさい',
            joinVillage: '村へようこそ',
            continueJourney: '集中への旅を続けましょう',
            startJourney: '今日から習慣を育てましょう',
            email: 'メールアドレス',
            password: 'パスワード',
            login: 'ログイン',
            logout: 'ログアウト',
            signup: '登録',
            or: 'または',
            noAccount: 'アカウントをお持ちでないですか？',
            hasAccount: 'すでにアカウントをお持ちですか？',
            google: 'Googleで続ける',
            apple: 'Appleで続ける',
            loginRequired: 'ログインが必要です',
            loginRequiredMsg: 'この機能を利用するにはログインしてください。',
            goToLogin: 'ログイン画面へ',
        },
        ai: {
            title: 'AIコーチ',
            placeholder: '相談や計画作成を依頼...',
            status: 'オンライン',
            responses: {
                default: '集中のお手伝いをします！目標を教えてください。',
                tired: 'お疲れのようですね。5分間の小休憩はいかがですか？ストレッチもおすすめですよ！🧘',
                plan: '今日のおすすめプランです：\n1. 🍅 集中 (25分) - 最難関のタスク\n2. ☕ 休憩 (5分)\n3. 🍅 集中 (25分) - 継続\n4. 🥗 長休憩 (15分)\n頑張りましょう！',
                hello: 'こんにちは！今日も村を育てましょう🌱'
            }
        }
    },
    en: {
        nav: {
            timer: 'Timer',
            tasks: 'Tasks',

            village: 'Village',
            history: 'History',
            ai: 'AI Coach'
        },
        timer: {
            focus: 'Focus',
            shortBreak: 'Short Break',
            longBreak: 'Long Break',
            currentFocus: 'Current Focus',
            start: 'Start',
            pause: 'Pause',
            reset: 'Reset',
            pomodoros: 'Pomodoros'
        },
        tasks: {
            title: 'Tasks',
            add: 'Add',
            placeholder: 'What needs to be done?',
            empty: 'No tasks yet. Add one to get started!',
            priority: { today: 'Today', high: 'High', medium: 'Medium', low: 'Low' },
            categories: { work: 'Work', study: 'Study', health: 'Health', hobby: 'Hobby', general: 'General' },
            save: 'Add Task',
            confirmDelete: 'Are you sure you want to delete?',

            confirmFocus: 'Set as current task?',
            yes: 'Yes',
            no: 'No',
            searchPlaceholder: 'Search tasks...',
            filterAll: 'All Categories',
            sortBy: 'Sort By',
            sort: { priority: 'Priority', newest: 'Newest', oldest: 'Oldest' },
            newTask: 'New Task',
            subCategories: {
                meeting: 'Meeting', development: 'Development', planning: 'Planning', email: 'Email',
                math: 'Math', english: 'English', programming: 'Programming', reading: 'Reading',
                exercise: 'Exercise', meditation: 'Meditation', meal: 'Meal',
                game: 'Game', art: 'Art', music: 'Music',
                chores: 'Chores', shopping: 'Shopping', misc: 'Misc'
            }
        },
        village: {
            level: 'Lv.',
            water: 'Water',
            harvest: 'Harvest',
            harvestCollection: 'Harvest Collection',
            emptyCollection: 'Harvest crops to fill your collection!',
            logout: 'Logout',
            wasteland: 'Wasteland',
            field: 'Field',
            garden: 'Garden',
            farmhouse: 'Farmhouse',
            villageStart: 'Village',
            nextLevel: 'Next Level',
            toNextLevel: 'To Next Level',
            tips: 'Tip',
            approxSessions: 'Approx. {{count}} focus sessions (25m)'
        },
        auth: {
            welcomeBack: 'Welcome Back',
            joinVillage: 'Join the Village',
            continueJourney: 'Continue your focus journey',
            startJourney: 'Start building your habit today',
            email: 'Email Address',
            password: 'Password',
            login: 'Sign In',
            logout: 'Logout',
            signup: 'Create Account',
            or: 'OR',
            noAccount: "Don't have an account?",
            hasAccount: "Already have an account?",
            google: 'Continue with Google',
            apple: 'Continue with Apple',
            loginRequired: 'Login Required',
            loginRequiredMsg: 'Please log in to access this feature.',
            goToLogin: 'Go to Login',
        },
        ai: {
            title: 'AI Coach',
            placeholder: 'Ask for a plan, say you\'re tired...',
            status: 'Online',
            responses: {
                default: "I'm here to help you focus! Tell me about your goals.",
                tired: "It sounds like you need a break. Why not try a 5-minute Short Break? Stretching helps too! 🧘",
                plan: "Here's a suggested plan for today:\n1. 🍅 Focus (25m) - Tackle the hardest task\n2. ☕ Break (5m)\n3. 🍅 Focus (25m) - Continue\n4. 🥗 Long Break (15m)\nYou got this!",
                hello: "Hi there! Ready to grow your village today? 🌱"
            }
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('pomodoro_lang') || 'ja';
    });

    useEffect(() => {
        localStorage.setItem('pomodoro_lang', language);
    }, [language]);

    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'ja' ? 'en' : 'ja');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
