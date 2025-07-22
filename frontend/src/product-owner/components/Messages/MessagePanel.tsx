import React, { useState } from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { MessageSquare, Send, User } from 'lucide-react';

export default function MessagePanel() {
  const { state, dispatch } = useScrum();
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');

  const teamMembers = ['Alice Martin', 'Bob Dupont', 'Claire Petit', 'David Moreau'];

  const sendMessage = () => {
    if (newMessage.trim() && selectedRecipient) {
      const message = {
        id: Date.now().toString(),
        sender: 'Marie Dubois',
        recipient: selectedRecipient,
        content: newMessage,
        timestamp: new Date(),
        read: false
      };
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      setNewMessage('');
    }
  };

  const markAsRead = (messageId: string) => {
    dispatch({ type: 'MARK_MESSAGE_READ', payload: messageId });
  };

  return (
    <div className="space-y-6 font-poppins">
      <div>
        <h2 className={`text-title ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'} font-poppins`}>
          Messages
        </h2>
        <p className={`text-paragraph font-open-sans ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Communiquez avec votre équipe
        </p>
      </div>

      {/* Nouveau message */}
      <div className={`p-4 rounded-lg ${state.darkMode ? 'bg-dark-card' : 'bg-cards'}`}>
        <h3 className={`font-semibold mb-3 font-poppins ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'}`}>
          Nouveau message
        </h3>
        <div className="space-y-3">
          <select
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
              state.darkMode 
                ? 'bg-dark-bg border-gray-600 text-dark-text' 
                : 'bg-white border-gray-300 text-secondary-2'
            }`}
          >
            <option value="">Sélectionner un destinataire</option>
            {teamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
                state.darkMode 
                  ? 'bg-dark-bg border-gray-600 text-dark-text placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-secondary-2'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !selectedRecipient}
              className="bg-button text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages reçus */}
      <div className="space-y-4">
        <h3 className={`font-semibold font-poppins ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'}`}>
          Messages reçus
        </h3>
        {state.messages.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${state.darkMode ? 'bg-dark-card' : 'bg-cards'}`}>
            <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${state.darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-medium mb-2 font-poppins ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'}`}>
              Aucun message
            </h3>
            <p className={`font-open-sans ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Vos messages apparaîtront ici
            </p>
          </div>
        ) : (
          state.messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                message.read
                  ? state.darkMode 
                    ? 'bg-dark-card border-gray-700 hover:bg-gray-700' 
                    : 'bg-cards border-gray-200 hover:bg-gray-100'
                  : state.darkMode
                    ? 'bg-dark-card border-primary'
                    : 'bg-white border-primary shadow-sm'
              }`}
              onClick={() => !message.read && markAsRead(message.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-button rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold font-poppins ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'}`}>
                      {message.sender}
                    </h4>
                    {!message.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className={`text-sm mt-1 font-open-sans ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 font-open-sans ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}