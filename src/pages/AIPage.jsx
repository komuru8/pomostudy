import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './AIPage.css';

const AIPage = () => {
    const [input, setInput] = useState('');
    const { t } = useLanguage();

    // Need to get initial welcome message from translation
    const [messages, setMessages] = useState([]);

    // Initialize with welcome message when component mounts or language changes
    useEffect(() => {
        // Only reset if empty to avoid wiping history on lang switch, 
        // OR just wipe it to update language. Let's append a new welcome for simplicity.
        setMessages([{ id: Date.now(), text: t('ai.responses.default'), sender: 'ai' }]);
    }, [t]);

    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        const newMsg = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI delay
        setTimeout(() => {
            let responseText = t('ai.responses.default');
            const lower = userText.toLowerCase();

            // Simple heuristic for mock responses
            if (lower.includes('tired') || lower.includes('break') || lower.includes('sleepy') || lower.includes('疲れた') || lower.includes('休み')) responseText = t('ai.responses.tired');
            else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('計画') || lower.includes('プラン')) responseText = t('ai.responses.plan');
            else if (lower.includes('hello') || lower.includes('hi') || lower.includes('こんにちは')) responseText = t('ai.responses.hello');

            setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="ai-page">
            <header className="ai-header">
                <div className="ai-avatar">
                    <Bot size={24} color="#fff" />
                </div>
                <div>
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
                />
                <button type="submit" className="send-btn" disabled={!input.trim()}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default AIPage;
