import React from 'react';
import { Message } from '../../types';
import { Star, Trash2, Mail, MailOpen, Clock, User } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onMarkAsRead: (messageId: string) => void;
  onToggleStar: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectMessage,
  onMarkAsRead,
  onToggleStar,
  onDelete
}) => {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  const handleMessageClick = (message: Message) => {
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
    onSelectMessage(message);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {messages.length === 0 ? (
        <div className="p-8 text-center">
          <Mail size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-open-sans">
            Aucun message dans ce dossier
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                !message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {message.senderAvatar ? (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium ${
                        !message.isRead 
                          ? 'text-secondary-2 dark:text-white font-semibold' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {message.senderName}
                      </p>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {getTimeAgo(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-1 ${
                    !message.isRead 
                      ? 'text-secondary-2 dark:text-white font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {message.subject}
                  </p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(message.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      message.isStarred
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star size={16} fill={message.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Supprimer ce message ?')) {
                        onDelete(message.id);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="text-gray-400">
                    {message.isRead ? <MailOpen size={16} /> : <Mail size={16} />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};