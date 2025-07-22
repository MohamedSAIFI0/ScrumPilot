import React, { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageCompose } from './MessageCompose';
import { MessageView } from './MessageView';
import { mockMessages, mockUsers } from '../../data/mockData';
import { Message, User } from '../../types';
import { Plus, Inbox, Send, Star, Archive } from 'lucide-react';

export const Messaging: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'archived'>('inbox');

  const handleSendMessage = (messageData: {
    recipientId: string;
    subject: string;
    content: string;
  }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'admin',
      senderName: 'Admin',
      recipientId: messageData.recipientId,
      recipientName: mockUsers.find(u => u.id === messageData.recipientId)?.name || '',
      subject: messageData.subject,
      content: messageData.content,
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      isRead: true,
      isStarred: false
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setShowCompose(false);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const handleToggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (activeFolder) {
      case 'sent':
        return message.senderId === 'admin';
      case 'starred':
        return message.isStarred;
      case 'archived':
        return false; // Implement archived logic
      default:
        return message.recipientId === 'admin';
    }
  });

  const folders = [
    { id: 'inbox', label: 'Boîte de réception', icon: Inbox, count: messages.filter(m => m.recipientId === 'admin' && !m.isRead).length },
    { id: 'sent', label: 'Envoyés', icon: Send, count: messages.filter(m => m.senderId === 'admin').length },
    { id: 'starred', label: 'Favoris', icon: Star, count: messages.filter(m => m.isStarred).length },
    { id: 'archived', label: 'Archivés', icon: Archive, count: 0 }
  ];

  if (showCompose) {
    return (
      <MessageCompose
        users={mockUsers}
        onSend={handleSendMessage}
        onCancel={() => setShowCompose(false)}
      />
    );
  }

  if (selectedMessage) {
    return (
      <MessageView
        message={selectedMessage}
        onBack={() => setSelectedMessage(null)}
        onDelete={() => handleDeleteMessage(selectedMessage.id)}
        onToggleStar={() => handleToggleStar(selectedMessage.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Messagerie
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-open-sans text-paragraph mt-1">
            Gérez vos communications avec l'équipe
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nouveau message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-4">
            Dossiers
          </h3>
          <div className="space-y-2">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeFolder === folder.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon size={16} className="mr-2" />
                    <span className="font-open-sans text-sm">{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeFolder === folder.id
                        ? 'bg-white text-primary'
                        : 'bg-primary text-white'
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-3">
          <MessageList
            messages={filteredMessages}
            onSelectMessage={setSelectedMessage}
            onMarkAsRead={handleMarkAsRead}
            onToggleStar={handleToggleStar}
            onDelete={handleDeleteMessage}
          />
        </div>
      </div>
    </div>
  );
};