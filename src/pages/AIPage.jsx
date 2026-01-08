import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGame } from '../context/GameContext';
import { useTasks } from '../context/TaskContext';
import { COACHES, getCoachById } from '../constants/coaches';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './AIPage.css';

const AIPage = () => {
    const { t } = useLanguage();
    const { gameState, addChatMessage, setActiveCoach } = useGame();
    const { tasks } = useTasks();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesEndRef = useRef(null);
    const hasInitialScrolled = useRef(false);

    // Use chatHistory from context.
    const messages = gameState.chatHistory || [];

    // Scroll to bottom ONLY ONCE when messages are loaded
    useEffect(() => {
        if (messages.length > 0 && !hasInitialScrolled.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // Instant or smooth? "Transition" implies smooth, but initial load usually wants instant. Auto is safer for "on load".
            hasInitialScrolled.current = true;
        }
    }, [messages]);

    // Initialize with welcome message if absolutely empty
    useEffect(() => {
        if (messages.length === 0) {
            const timer = setTimeout(() => {
                if ((gameState.chatHistory || []).length === 0) {
                    addChatMessage({ id: Date.now(), text: t('ai.responses.default'), sender: 'ai' });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [t, gameState.chatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollButton(!isBottom);
    };

    const suggestions = [
        t('ai.suggestions.plan', '📅 毎日の計画を立てて'),
        t('ai.suggestions.tips', '💡 勉強のコツを教えて'),
        t('ai.suggestions.motivation', '🔥 やる気が出ない...'),
        t('ai.suggestions.focus5', '⏱️ 5分だけ集中したい'),
    ];

    const generateResponse = async (userText) => {
        let keyToUse = import.meta.env.VITE_GEMINI_API_KEY;
        if (keyToUse) keyToUse = keyToUse.trim();

        if (!keyToUse || keyToUse === 'YOUR_API_KEY_HERE') {
            return t('ai.system.apiKeyMissing');
        }

        try {
            const genAI = new GoogleGenerativeAI(keyToUse);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const pendingTasks = tasks.filter(t => !t.completed).map(t => `- ${t.title} (${t.priority})`).join('\n');

            const activeCoach = getCoachById(gameState.activeCoachId || 'neko');

            const systemPrompt = `
${activeCoach.systemPrompt}

[Context Info]
User Name: ${gameState.username || 'User'}
Current Level: ${gameState.level}
Total Focus Time: ${gameState.totalWP} minutes
Total XP: ${gameState.totalXP}
Harvested Crops: ${gameState.harvested?.length || 0}
Pending Tasks:
${pendingTasks || "None"}

Please strictly adhere to the persona defined above.
`;


            const fullPrompt = `${systemPrompt} \n\nUser: ${userText} `;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Gemini API Error:", error);
            if (error.message?.includes('403') || error.message?.includes('leaked')) {
                return t('ai.system.apiKeyInvalid') || "System: API Key is invalid or has been revoked. Please check your settings.";
            }
            if (error.message?.includes('429')) return t('ai.system.rateLimitError') || "System: Too many requests. Please wait a moment (Free Tier quota). ⏳";
            if (error.message?.includes('404')) return t('ai.system.modelNotFoundError') || "System: Model not found. Please check API key permissions.";
            return t('ai.system.connectionError') || "System: Connection error.";
        }
    };

    const handleSend = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        const newMsg = { id: Date.now(), text: userText, sender: 'user' };

        addChatMessage(newMsg);
        setInput('');
        setIsTyping(true);

        const aiResponseText = await generateResponse(userText);
        addChatMessage({ id: Date.now() + 1, text: aiResponseText, sender: 'ai' });
        setIsTyping(false);
    };

    const handleSuggestionClick = async (text) => {
        if (isTyping) return;

        const newMsg = { id: Date.now(), text: text, sender: 'user' };
        addChatMessage(newMsg);
        setIsTyping(true);

        const aiResponseText = await generateResponse(text);
        addChatMessage({ id: Date.now() + 1, text: aiResponseText, sender: 'ai' });
        setIsTyping(false);
    };

    return (
        <div className="ai-page">
            <header className="ai-header">
                <div className="coach-display-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                        border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        background: 'white'
                    }}>
                        <img
                            src={getCoachById(gameState.activeCoachId).iconPath}
                            alt="Coach"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <select
                                value={gameState.activeCoachId || 'neko'}
                                onChange={(e) => setActiveCoach && setActiveCoach(e.target.value)}
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: 'var(--primary-dark)',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    width: '100%',
                                    zIndex: 2,
                                    textAlign: 'left'
                                }}
                            >
                                {Object.values(COACHES).map(coach => {
                                    const isLocked = gameState.level < coach.unlockLevel;
                                    return (
                                        <option key={coach.id} value={coach.id} disabled={isLocked}>
                                            {isLocked ? `??? (Locked)` : coach.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <div style={{ position: 'absolute', right: 0, zIndex: 1, pointerEvents: 'none', color: '#666', display: 'flex' }}>
                                <span style={{ fontSize: '0.8rem' }}>▼</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                            {getCoachById(gameState.activeCoachId).shortDescription}
                        </span>
                    </div>
                </div>
            </header>

            <div className="chat-container" onScroll={handleScroll}>
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender} `}>
                        <div className="message-bubble">
                            {msg.text.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < msg.text.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message ai">
                        <div className="message-bubble typing">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                <div className="suggestion-chips">
                    {suggestions.map((s, i) => (
                        <button key={i} className="suggestion-chip" onClick={() => handleSuggestionClick(s)} disabled={isTyping}>
                            {s}
                        </button>
                    ))}
                </div>

                <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
                <button className="scroll-bottom-btn" onClick={scrollToBottom}>
                    <ArrowDown size={24} />
                </button>
            )}

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder={t('ai.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isTyping}
                />
                <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default AIPage;
