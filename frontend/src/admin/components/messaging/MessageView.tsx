import React from 'react';
import { Message } from '../../types';
import { ArrowLeft, Star, Trash2, Reply, Forward, User, Clock } from 'lucide-react';

interface MessageViewProps {
  message: Message;
  onBack: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}

export const MessageView: React.FC<MessageViewProps> = ({
  message,
  onBack,
  onDelete,
  onToggleStar
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux messages
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleStar}
            className={`p-2 rounded-lg transition-colors ${
              message.isStarred
                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Star size={20} fill={message.isStarred ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Supprimer ce message ?')) {
                onDelete();
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Message Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {message.senderAvatar ? (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="font-poppins font-semibold text-xl text-secondary-2 dark:text-white mb-2">
                {message.subject}
              </h2>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{message.senderName}</span>
                <span>à Admin</span>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {formatDate(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-open-sans leading-relaxed">
              {message.content}
            </div>
          </div>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pièces jointes ({message.attachments.length})
              </h4>
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {attachment.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {attachment.size} • {attachment.type}
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary/80 font-medium">
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors">
              <Reply size={16} className="mr-2" />
              Répondre
            </button>
            <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Forward size={16} className="mr-2" />
              Transférer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};