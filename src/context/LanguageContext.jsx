import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
    ja: {
        nav: {
            timer: 'タイマー',
            tasks: 'タスク',
            village: '村',
            base: '拠点',
            history: '学習時間',
            ai: 'AIコーチ'
        },
        history: {
            todayFocusTime: '今日の集中時間',
            todayCompletedTasks: '今日の完了タスク',
            totalFocusTime: '合計の集中時間',
            totalCompletedTasks: '合計の完了タスク',
            tasksSuffix: 'タスク',
            totalFocus: '合計集中時間 (🍅)',
            tasksCompleted: '完了タスク',
            dailyFocus: '日別集中時間',
            categoryDist: 'カテゴリ別内訳',
            today: '今日',
            total: '累計',
            focusSessions: '集中回数',
            shortBreaks: '休憩回数',
            longBreaks: '長い休憩回数',
            companionMsg: '頑張って！村は順調に育っていますよ。'
        },
        timer: {
            focus: '集中',
            shortBreak: '休憩',
            longBreak: '長い休憩',
            currentFocus: '現在のタスク',
            start: '開始',
            pause: '一時停止',
            reset: 'リセット',
            pomodoros: 'ポモドーロ',
            switchConfirmTitle: 'タイマーを切り替えますか？',
            switchConfirmMsg: '進行中のタイマーはリセットされます。'
        },
        tasks: {
            title: 'タスク',
            add: '追加',
            placeholder: 'ここにタスクを入力してね',
            labels: {
                priority: '優先度',
                category: '大カテゴリー',
                subCategory: '小カテゴリー',
                target: '目標時間'
            },
            empty: 'タスクがありません。追加して始めましょう！',
            priority: { today: '今日やる', high: '高', medium: '中', low: '低' },
            categories: { work: '仕事', study: '勉強', health: '健康', hobby: '趣味', general: '一般' },
            targetPoms: 'ポモドーロ',
            save: '保存',
            cancel: 'キャンセル',
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
                meeting: '会議', development: '開発', planning: '計画', email: 'メール',
                math: '数学', english: '英語', programming: 'プログラミング', reading: '読書',
                exercise: '運動', meditation: '瞑想', meal: '食事',
                game: 'ゲーム', art: '創作', music: '音楽',
                chores: '家事', shopping: '買い物', misc: 'その他'
            }
        },
        village: {
            level: 'Lv.',
            water: '水ポイント',
            waterNote: '(学習時間がポイントになります)',
            harvest: '収穫する',
            harvestCollection: '収穫コレクション',
            emptyCollection: '野菜を収穫してコレクションを埋めましょう！',
            logout: 'ログアウト',
            wasteland: '始まりの荒野',
            field: '旅人の休息地',
            hut: '若草色のミニ農園',
            garden: 'こがねに揺れる豊穣の庭',
            farmhouse: '風が通る冒険者の邸宅',
            villageStart: '清流を臨む水辺の宿',
            nextLevel: '次のレベル',
            toNextLevel: '次のレベルまで',
            tips: 'ヒント',
            approxSessions: '集中セッションあと約{{count}}回 (25分)',
            studyTime: '学習時間',
            tasks: 'タスク完了',
            lockedArea: 'ロックされたエリア',
            unlockHint: '前のレベルの条件を達成して解放',
            harvestLocked: '収穫する（ロック中）',
            harvestLimit: '収穫済み',
            themes: 'タイマーの背景',
            themeNames: {
                default: 'デフォルト',
                wood: '木の温もり',
                cafe: 'リラックスカフェ'
            },
            defaultName: 'ゲスト',
            titleFormat: '{{name}}の村',
            vp: '野菜ポイント',
            tradeShop: '野菜直売所',
            shopDesc: '貯まったポイントで本物の野菜と交換！',
            comingSoon: '機能開発中...',
            sellConfirm: '1つ売却して {{price}} VPを獲得しますか？',
            sellMessage: '{{amount}}個の {{name}} を売却しますか？'
        },
        crops: {
            weed: '雑草',
            radish: 'ラディッシュ',
            potato: 'ジャガイモ'
        },
        field: {
            yourField: 'あなたの畑',
            locked: 'Lv.2で解放'
        },
        auth: {
            welcomeBack: 'おかえりなさい',
            joinVillage: 'Farmへようこそ',
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
            google: 'Googleでログイン',
            apple: 'Appleで続ける',
            loginRequired: 'ログインが必要です',
            loginRequiredMsg: 'この機能を利用するにはログインしてください。',
            goToLogin: 'ログイン画面へ',
        },
        ai: {
            title: 'AIコーチ',
            placeholder: '相談や計画作成を依頼...',
            status: 'オンライン',
            system: {
                apiKeyMissing: 'システム: APIキーが見つかりません。.envファイルの VITE_GEMINI_API_KEY を設定してください。',
                connectionError: '接続エラーです。APIキーまたはインターネット接続を確認してください。🌱',
                rateLimitError: 'システム: リクエストがいっぱいです。少し休憩してから話しかけてね⏳',
                modelNotFoundError: 'システム: 指定されたモデルが見つかりません。設定を確認してください。'
            },
            responses: {
                default: '集中のお手伝いをします！目標を教えてください。',
                tired: 'お疲れのようですね。5分間の小休憩はいかがですか？ストレッチもおすすめですよ！🧘',
                plan: '今日のおすすめプランです：\n1. 🍅 集中 (25分) - 最難関のタスク\n2. ☕ 休憩 (5分)\n3. 🍅 集中 (25分) - 継続\n4. 🥗 長休憩 (15分)\n頑張りましょう！',
                hello: 'こんにちは！今日も村を育てましょう🌱'
            },
            suggestions: {
                plan: '📅 毎日の計画を立てて',
                tips: '💡 勉強のコツを教えて',
                motivation: '🔥 やる気が出ない...',
                focus5: '⏱️ 5分だけ集中したい'
            }
        }
    },
    en: {
        nav: {
            timer: 'Timer',
            tasks: 'Tasks',
            village: 'Village',
            base: 'Base',
            history: 'Study Time',
            ai: 'AI Coach'
        },
        history: {
            todayFocusTime: 'Today Focus',
            todayCompletedTasks: 'Today Tasks',
            totalFocusTime: 'Total Focus',
            totalCompletedTasks: 'Total Tasks',
            tasksSuffix: ' tasks',
            totalFocus: 'Total Focus (🍅)',
            tasksCompleted: 'Tasks Completed',
            dailyFocus: 'Daily Focus Time',
            categoryDist: 'Category Distribution',
            today: 'Today',
            total: 'Total',
            focusSessions: 'Focus Sessions',
            shortBreaks: 'Short Breaks',
            longBreaks: 'Long Breaks',
            companionMsg: 'Keep going! Your village is growing nicely.'
        },
        timer: {
            focus: 'Focus',
            shortBreak: 'Short Break (5m)',
            longBreak: 'Long Break (15m)',
            currentFocus: 'Current Focus',
            start: 'Start',
            pause: 'Pause',
            reset: 'Reset',
            pomodoros: 'Pomodoros'
        },
        tasks: {
            title: 'Tasks',
            add: 'Add',
            placeholder: 'Enter task here...',
            labels: {
                priority: 'Priority',
                category: 'Category',
                subCategory: 'Subcategory',
                target: 'Target Time'
            },
            empty: 'No tasks yet. Add one to get started!',
            priority: { today: 'Today', high: 'High', medium: 'Medium', low: 'Low' },
            categories: { work: 'Work', study: 'Study', health: 'Health', hobby: 'Hobby', general: 'General' },
            targetPoms: 'Pomodoros',
            save: 'Add Task',
            cancel: 'Cancel',
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
            water: 'Water Points',
            waterNote: '(Learning time becomes points)',
            harvest: 'Harvest',
            harvestCollection: 'Harvest Collection',
            emptyCollection: 'Harvest crops to fill your collection!',
            logout: 'Logout',
            wasteland: 'The Beginning Wilds',
            field: "Traveler's Camp",
            garden: 'Sprouting Garden',
            farmhouse: 'Bountiful Farm',
            villageStart: 'Dawn of the Village',
            nextLevel: 'Next Level',
            toNextLevel: 'To Next Level',
            tips: 'Tip',
            approxSessions: 'Approx. {{count}} focus sessions (25m)',
            studyTime: 'Study Time',
            tasks: 'Tasks Completed',
            lockedArea: 'Locked Area',
            unlockHint: 'Complete requirements in previous level to unlock',
            harvestLocked: 'Harvest (Locked)',
            harvestLimit: 'Harvested',
            themes: 'Timer Background',
            themeNames: {
                default: 'Standard',
                wood: 'Wood Cabin',
                cafe: 'Relax Cafe'
            },
            defaultName: 'Guest',
            titleFormat: "{{name}}'s Village",
            vp: 'Vegetable Points',
            tradeShop: 'Farm Shop',
            shopDesc: 'Exchange VP for real vegetables!',
            comingSoon: 'Coming Soon...',
            sellConfirm: 'Sell 1 for {{price}} VP?',
            sellMessage: 'Sell {{amount}} {{name}}?'
        },
        crops: {
            weed: 'Weed',
            radish: 'Radish',
            potato: 'Potato'
        },
        field: {
            yourField: 'Your Field',
            locked: 'Unlocks at Lv.2'
        },
        auth: {
            welcomeBack: 'Welcome Back',
            joinVillage: 'Join the Village',
            continueJourney: 'Continue your focus journey',
            startJourney: 'Start building your habit today',
            email: 'Email Address',
            password: 'Password',
            sign_in: 'Sign In',
            login: 'Login',
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
            system: {
                apiKeyMissing: 'System: API Key not found. Please set VITE_GEMINI_API_KEY in your .env file.',
                connectionError: 'Connection error. Please check your API Key or internet connection. 🌱'
            },
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

    const t = (path, paramsOrDefaultValue) => {
        let defaultValue;
        let params = {};

        // Helper to determine arguments
        if (typeof paramsOrDefaultValue === 'string') {
            defaultValue = paramsOrDefaultValue;
        } else if (typeof paramsOrDefaultValue === 'object') {
            params = paramsOrDefaultValue;
        }

        const keys = path.split('.');
        let current = translations[language];

        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                // If not found, look for defaultValue in arguments (legacy support)
                // Note: The new signature basically deprecated passing defaultValue as 2nd arg if it's an object.
                // But for compatibility with t('path', 'default'), we checked type above.
                return defaultValue !== undefined ? defaultValue : path;
            }
            current = current[key];
        }

        let result = current;

        // Interpolation logic: Replaces {{key}} with params.key
        if (typeof result === 'string' && params) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                // Ensure value is a string or number, not an object
                const replacement = (typeof value === 'object') ? '' : String(value);
                result = result.replace(new RegExp(`{{${key}}}`, 'g'), replacement);
            });
        }

        return result;
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
