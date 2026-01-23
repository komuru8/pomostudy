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
            history: '集中時間',
            ai: 'AIコーチ',
            about: 'アプリ紹介'
        },
        app: {
            title: 'ポモトピア'
        },
        history: {
            todayFocusTime: '今日の集中時間',
            todayCompletedTasks: '今日の完了タスク',
            totalFocusTime: '合計の集中時間',
            totalCompletedTasks: '合計の完了タスク',
            tasksSuffix: 'タスク',
            totalFocus: '合計集中時間 (🍅)',
            tasksCompleted: '完了タスク',
            dailyFocus: '集中時間',
            categoryDist: 'カテゴリ別内訳',
            today: '今日',
            total: '累計',
            focusSessions: '集中回数',
            shortBreaks: '休憩回数',
            longBreaks: '長い休憩回数',
            companionMsg: '頑張って！村は順調に育っていますよ。',
            allTime: '全期間',
            consecutiveDays: '連続集中',
            daysUnit: '日',
            cheerMessages: [
                '素晴らしい継続力です！',
                'その調子で頑張りましょう！',
                '毎日の積み重ねが力になります。',
                '今日も一歩前進！',
                '努力は裏切りません。',
                'この調子でいきましょう！'
            ]
        },
        timer: {
            focus: '集中',
            shortBreak: '休憩',
            longBreak: '長い休憩',
            currentFocus: '現在のタスク',
            start: '開始',
            pause: '一時停止',
            reset: '完了',
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
            selectPlaceholder: '選択してください',
            filterAll: '全カテゴリー',
            sortBy: '並び替え',
            sort: { priority: '優先度順', newest: '新しい順', oldest: '古い順' },
            newTask: '新規タスク',
            subCategories: {
                meeting: '会議', development: '開発・制作', planning: '企画・構想', email: 'メール',
                math: '数学', english: '英語', programming: 'プログラミング', reading: '読書・教養',
                exercise: '筋トレ・運動', mental: 'メンタルケア', meal: '食事・料理',
                game: 'ゲーム', art: '創作・アート', music: '音楽',
                chores: '家事・掃除', shopping: '買い物', misc: 'その他',
                languages: '語学', certification: '資格・試験', tech: 'IT・技術', assignment: '課題・演習',
                cooking: '食事・料理', sleep: '睡眠・休息', beauty: '美容・ケア',
                creative: '創作・アート', sports: 'スポーツ', entertainment: 'エンタメ鑑賞', travel: '旅行・お出かけ',
                admin: '事務・メール', analysis: '調査・分析',
                finance: 'お金・資産運用', family: '家族・交際', organize: '手続き・整理'
            },
            validation: {
                titleRequired: 'タスク名を入力してください',
                subCategoryRequired: '小カテゴリーを選択してください'
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
            studyTime: '集中時間',
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
            potato: 'ジャガイモ',
            turnip: 'カブ',
            carrot: 'ニンジン',
            corn: 'トウモロコシ',
            pumpkin: 'カボチャ',
            grapes: 'ブドウ',
            melon: 'メロン',
            tomato: 'トマト',
            strawberry: 'イチゴ',
            diamond: 'ダイヤモンド'
        },
        field: {
            yourField: 'あなたの畑',
            locked: 'Lv.2で解放'
        },
        auth: {
            welcomeBack: 'おかえりなさい',
            joinVillage: 'ポモトピア\nへようこそ',
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
        },
        about: {
            title: 'ポモトピアについて',
            description: 'ポモトピアは、ポモドーロ・テクニックと育成ゲームを組み合わせた新しい学習・作業支援アプリです。',
            features: {
                timer: { title: '集中タイマー', desc: '25分の集中と5分の休憩を繰り返すポモドーロ・タイマーで、効率的に作業を進めましょう。' },
                tasks: { title: 'タスク管理', desc: 'やるべきことを整理し、優先順位をつけて一つずつ着実に完了させましょう。' },
                history: { title: '学習時間管理', desc: '日々の集中時間を自動で記録。グラフで努力の積み重ねを可視化し、モチベーションを高めます。' },
                village: { title: '村の育成', desc: '集中した時間が、あなたの村を育てます。作物を収穫し、村を豊かにしましょう。' },
                ai: { title: 'AIコーチ', desc: 'AIがあなたの学習計画やモチベーション維持をサポートします。' }
            },
            login: 'ログイン / 登録',
            backToTimer: 'タイマーに戻る',
            welcome: 'ようこそ！\nポモトピアへ',
            hero: {
                catchphrase: '今日の集中時間は未来への種まき',
                intro: '勉強は、植物を育てるのと似ています。 芽が出るまでの時間は長く、孤独なもの。 でも、その土の下では、才能の根が確実に育っています。\n\n『ポモトピア』は、そんなあなたの「見えない努力」を可視化する育成型学習アプリです。 「勉強の成果が見えない…」そんな悩みは、今日で終わり、学びの開拓者となって、あなただけの村を作り始めましょう。'
            },
            story: {
                grow: {
                    title: '25分集中するたび、野菜が育つ',
                    content: '使い方は簡単。ポモドーロタイマーをセットして勉強するだけ。 集中した時間はそのまま栄養となり、ラディッシュ、トマト、かぼちゃ、そして幻の黄金野菜へと姿を変えます。「あと少しでトマトが収穫できるから頑張ろう」——そんなワクワクが、あなたの背中を押し続けます。'
                },
                village: {
                    title: '荒野から、叡智のユートピアへ',
                    content: '最初は小さなテントと荒れ地だけのスタートです。 しかし、日々のタスクをこなし、収穫を重ねることで、村は少しずつ発展していきます。家が建ち、農園ができ、公民館が作られ…… 1年後、あなたの継続した努力は、誰も見たことのない理想郷（ユートピア）として画面の中だけでなく現実世界にも広がっているはずです。'
                },
                ai: {
                    title: 'AIパートナーがあなたをコーチング',
                    content: '学習につまずいた時は、頼れる村の仲間たちが優しくサポート。 あなた専用の学習プランの提案や、サボり気味な時の励ましなど、村の仲間として伴走します。'
                }
            },
            closing: 'さあ、時間を植える旅に出かけましょう。 村の成長は、あなたの成長そのもの。 いつか辿り着く「理想郷」で、最高の景色と実りがあなたを待っています。',
            stats: {
                totalUsers: '村の人口',
                totalHours: '村人の総学習時間',
                unitUsers: '人',
                unitHours: '時間'
            },
            featuresTitle: '主な機能'
        },
        ranking: {
            title: '村人ランキング',
            day: '今日',
            week: '今週',
            month: '今月',
            year: '今年',
            rank: '順位',
            villager: '名前',
            time: '集中',
            noData: 'ランキングデータが集計中です...',
            you: 'あなた'
        }
    },
    en: {
        nav: {
            timer: 'Timer',
            tasks: 'Tasks',
            village: 'Village',
            base: 'Base',
            history: 'Study Time',
            ai: 'AI Coach',
            about: 'About'
        },
        app: {
            title: 'Pomotopia'
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
            companionMsg: 'Keep going! Your village is growing nicely.',
            allTime: 'All Time',
            consecutiveDays: 'Streak',
            daysUnit: ' days',
            cheerMessages: [
                'Great consistency!',
                'Keep up the good work!',
                'Every day counts.',
                'One step closer to your goal!',
                'Effort pays off.',
                'Keep this momentum going!'
            ]
        },
        ranking: {
            title: 'Villager Ranking',
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year',
            rank: 'Rank',
            villager: 'Villager',
            time: 'Focus Time',
            noData: 'Ranking data is being calculated...',
            you: 'You'
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
            selectPlaceholder: 'Select...',
            filterAll: 'All Categories',
            sortBy: 'Sort By',
            sort: { priority: 'Priority', newest: 'Newest', oldest: 'Oldest' },
            newTask: 'New Task',
            subCategories: {
                meeting: 'Meeting', development: 'Development', planning: 'Planning', email: 'Email',
                math: 'Math', english: 'English', programming: 'Programming', reading: 'Reading',
                exercise: 'Exercise', mental: 'Mental Care', meal: 'Meal',
                game: 'Game', art: 'Art', music: 'Music',
                chores: 'Chores', shopping: 'Shopping', misc: 'Misc',
                languages: 'Languages', certification: 'Certification', tech: 'IT/Tech', assignment: 'Assignment',
                cooking: 'Cooking/Meal', sleep: 'Sleep/Rest', beauty: 'Beauty/Care', mental: 'Mental Care',
                creative: 'Creative/Art', sports: 'Sports', entertainment: 'Entertainment', travel: 'Travel',
                admin: 'Admin/Email', analysis: 'Analysis',
                finance: 'Finance', family: 'Family', organize: 'Organize'
            },
            validation: {
                titleRequired: 'Please enter a task title',
                subCategoryRequired: 'Please select a subcategory'
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
            potato: 'Potato',
            turnip: 'Turnip',
            carrot: 'Carrot',
            corn: 'Corn',
            pumpkin: 'Pumpkin',
            grapes: 'Grapes',
            melon: 'Melon',
            tomato: 'Tomato',
            strawberry: 'Strawberry',
            diamond: 'Diamond'
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
        },
        about: {
            title: 'About Pomotopia',
            description: 'Pomotopia is a new productivity app that combines the Pomodoro Technique with village building elements.',
            features: {
                timer: { title: 'Focus Timer', desc: 'Boost efficiency with the Pomodoro Timer: 25 minutes of focus followed by a 5-minute break.' },
                tasks: { title: 'Task Management', desc: 'Organize your to-dos, set priorities, and complete them one by one.' },
                history: { title: 'Time Tracking', desc: 'Automatically track your focus time. Visualize your progress with graphs and stay motivated.' },
                village: { title: 'Village Building', desc: 'Your focus time grows your village. Harvest crops and make your village prosper.' },
                ai: { title: 'AI Coach', desc: 'Your personal AI coach helps with study plans and keeping you motivated.' }
            },
            login: 'Login / Sign Up',
            backToTimer: 'Back to Timer',
            welcome: 'Welcome to Pomotopia',
            hero: {
                catchphrase: 'Today\'s focus is planting seeds for the future.',
                intro: '"I can\'t see the results of my studying..." End that worry today. Turn every 25 minutes at your desk into visible "fruit" and "village growth".\n\n"Pomotopia" is a breeding-type learning app that turns focus time using the Pomodoro technique into "water to grow the village".'
            },
            story: {
                grow: {
                    title: 'Grow vegetables every 25 minutes',
                    content: 'Easy to use. Just set the Pomodoro timer and study. Concentrated time becomes nutrition, transforming into radishes, tomatoes, pumpkins, and even phantom golden vegetables. "Let\'s do my best because I can harvest tomatoes soon" - such excitement will keep pushing you forward.'
                },
                village: {
                    title: 'From wilderness to utopia of wisdom',
                    content: 'Start with just a small tent and wasteland. However, by completing daily tasks and repeating harvests, the village will develop little by little. Houses are built, farms are built, public halls are built... One year later, your continued efforts should spread not only on the screen but also in the real world as a utopia that no one has ever seen.'
                },
                ai: {
                    title: 'AI partner coaches you',
                    content: 'When you stumble in learning, reliable village friends will gently support you. We will accompany you as a friend of the village, such as proposing your own learning plan and encouraging you when you tend to skip.'
                }
            },
            closing: 'Turn invisible efforts into certain harvests.\nNow, let\'s become a pioneer of learning and start building your own village.',
            stats: {
                totalUsers: 'Village Population',
                totalHours: 'Villagers\' Total Focus Time',
                unitUsers: 'Villagers',
                unitHours: 'Hours'
            },
            featuresTitle: 'Main Features'
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
