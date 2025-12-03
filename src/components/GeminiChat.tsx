'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './GeminiChat.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export default function GeminiChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || 'Error al obtener respuesta');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        '¿Cuánto gasté este mes?',
        '¿Cuál es mi categoría de gasto más alta?',
        'Dame recomendaciones para ahorrar',
        '¿Cómo está mi situación financiera?'
    ];

    return (
        <div className={styles.chatContainer}>
            <header className={styles.header}>
                <h1>🤖 Asistente Financiero IA</h1>
                <p className={styles.subtitle}>Pregúntame sobre tus finanzas</p>
            </header>

            {messages.length === 0 && (
                <div className={styles.welcome}>
                    <div className={styles.welcomeIcon}>💬</div>
                    <h2>¡Hola! Soy tu asistente financiero</h2>
                    <p>Puedo ayudarte a analizar tus gastos, ingresos y darte recomendaciones personalizadas.</p>

                    <div className={styles.suggestions}>
                        <p className={styles.suggestionsTitle}>Preguntas sugeridas:</p>
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                className={styles.suggestionButton}
                                onClick={() => setInput(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage
                            }`}
                    >
                        <div className={styles.messageIcon}>
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className={styles.messageContent}>
                            <div className={styles.messageText}>{message.content}</div>
                            <div className={styles.messageTime}>
                                {new Date(message.timestamp).toLocaleTimeString('es-PY', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                        <div className={styles.messageIcon}>🤖</div>
                        <div className={styles.messageContent}>
                            <div className={styles.typing}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputForm} onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={loading || !input.trim()}
                >
                    {loading ? '⏳' : '📤'}
                </button>
            </form>
        </div>
    );
}
