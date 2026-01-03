import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGame } from '../context/GameContext';
import { useTasks } from '../context/TaskContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './AIPage.css';

const AIPage = () => {
    const { t } = useLanguage();
    const { gameState } = useGame();
    const { tasks } = useTasks();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ id: Date.now(), text: t('ai.responses.default'), sender: 'ai' }]);
        }
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const generateResponse = async (userText) => {
        let keyToUse = import.meta.env.VITE_GEMINI_API_KEY;
        if (keyToUse) keyToUse = keyToUse.trim();

        if (!keyToUse || keyToUse === 'YOUR_API_KEY_HERE') {
            return t('ai.system.apiKeyMissing');
        }

        try {
            const genAI = new GoogleGenerativeAI(keyToUse);
            // Updating model to available version based on diagnostic
            // "gemini-flash-latest" points to a stable version with Free Tier access
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // Construct Context
            const pendingTasks = tasks.filter(t => !t.completed).map(t => `- ${t.title} (${t.priority})`).join('\n');
            const context = `
Current User Stats:
- Level: ${gameState.level}
- Total Focus Time: ${gameState.totalWP} minutes
- Total XP: ${gameState.totalXP}
- Harvested Crops: ${gameState.harvested?.length || 0}
- Pending Tasks:\n${pendingTasks || "None"}
            `;

            const systemPrompt = `
You are supportive productivity coach "Pomodoro Farm". 
Goal: help user focus, plan day, balance work-life.
Concise, friendly, use emojis (🍅, 🌱, 🚜).
Context: ${context}
            `;

            const fullPrompt = `${systemPrompt}\n\nUser: ${userText}`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Gemini API Error:", error);
            if (error.message?.includes('429')) return t('ai.system.rateLimitError') || "System: Too many requests. Please wait a moment (Free Tier quota). ⏳";
            if (error.message?.includes('404')) return t('ai.system.modelNotFoundError') || "System: Model not found. Please check API key permissions.";
            return t('ai.system.connectionError');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        const newMsg = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // API Call
        const aiResponseText = await generateResponse(userText);

        setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: 'ai' }]);
        setIsTyping(false);
    };

    return (
        <div className="ai-page">
            <header className="ai-header">
                <div className="ai-avatar">
                    <Bot size={24} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <h1>{t('ai.title')}</h1>
                    <span className="status-indicator">{t('ai.status')}</span>
                </div>
            </header>

            <div className="chat-container">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
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
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

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
