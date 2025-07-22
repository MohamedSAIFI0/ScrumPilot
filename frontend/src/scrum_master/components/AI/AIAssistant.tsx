import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant Scrum IA. Comment puis-je vous aider aujourd'hui ?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: getAIResponse(message),
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('vélocité') || lowerMessage.includes('velocity')) {
      return "Votre vélocité moyenne actuelle est de 26 points par sprint. Je recommande de maintenir cette cadence et d'analyser les facteurs qui ont causé la baisse du Sprint 23.";
    } else if (lowerMessage.includes('backlog') || lowerMessage.includes('priorité')) {
      return "Pour optimiser votre backlog, je suggère de prioriser les stories avec le plus fort impact utilisateur. Les notifications push semblent être une priorité haute basée sur les feedbacks.";
    } else if (lowerMessage.includes('équipe') || lowerMessage.includes('team')) {
      return "Votre équipe de 5 membres actifs montre une bonne répartition des rôles. Considérez organiser une rétrospective pour améliorer la collaboration.";
    } else if (lowerMessage.includes('sprint') || lowerMessage.includes('planning')) {
      return "Le Sprint 23 se termine dans 5 jours avec 65% de progression. Je recommande de focus sur les stories critiques et reporter les moins prioritaires au prochain sprint.";
    } else {
      return "Je peux vous aider avec la gestion Scrum, l'analyse de vélocité, la priorisation du backlog, et les recommandations d'équipe. Que souhaitez-vous savoir ?";
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all z-50 ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-primary rounded-t-xl">
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">Assistant Scrum IA</h3>
                <p className="text-xs text-primary-100">En ligne</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-secondary-2 dark:text-dark-text'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;