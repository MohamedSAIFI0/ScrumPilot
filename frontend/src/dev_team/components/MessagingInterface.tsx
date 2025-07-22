import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Plus,
  X,
  Reply,
  Edit3,
  Trash2,
  Download,
  Eye,
  Users,
  Hash,
  AtSign
} from 'lucide-react';
import { Message, Conversation, User, MessageReaction } from '../types';
import { mockMessages, mockConversations, mockUser, mockUsers } from '../data/mockData';

interface MessagingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ isOpen, onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🚀', '💯', '🔥', '👌', '💪', '🙏', '✨'];

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getConversationMessages = (conversationId: string) => {
    return messages.filter(msg => msg.conversationId === conversationId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      author: mockUser,
      conversationId: selectedConversation.id,
      createdAt: new Date(),
      type: 'text',
      replyTo: replyingTo?.id,
      mentions: newMessage.match(/@\w+/g) || []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      )
    );
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          const userAlreadyReacted = existingReaction?.users.some(u => u.id === mockUser.id);

          if (existingReaction) {
            if (userAlreadyReacted) {
              // Remove user's reaction
              const updatedUsers = existingReaction.users.filter(u => u.id !== mockUser.id);
              const updatedReactions = updatedUsers.length > 0 
                ? msg.reactions?.map(r => 
                    r.emoji === emoji 
                      ? { ...r, users: updatedUsers, count: updatedUsers.length }
                      : r
                  )
                : msg.reactions?.filter(r => r.emoji !== emoji);
              
              return { ...msg, reactions: updatedReactions };
            } else {
              // Add user's reaction
              return {
                ...msg,
                reactions: msg.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { ...r, users: [...r.users, mockUser], count: r.count + 1 }
                    : r
                )
              };
            }
          } else {
            // Create new reaction
            const newReaction: MessageReaction = {
              id: Date.now().toString(),
              emoji,
              users: [mockUser],
              count: 1
            };
            return {
              ...msg,
              reactions: [...(msg.reactions || []), newReaction]
            };
          }
        }
        return msg;
      })
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: `Fichier partagé: ${file.name}`,
      author: mockUser,
      conversationId: selectedConversation.id,
      createdAt: new Date(),
      type: 'file',
      attachments: [{
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size
      }]
    };

    setMessages(prev => [...prev, message]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl">
        {/* Sidebar - Conversations List */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-poppins font-semibold text-secondary-2">
                Messages
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-primary bg-opacity-10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {conversation.type === 'direct' ? (
                      <>
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-12 h-12 rounded-full"
                        />
                        {conversation.isOnline && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor('online')}`} />
                        )}
                      </>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        {conversation.type === 'group' ? (
                          <Users className="w-6 h-6 text-white" />
                        ) : (
                          <Hash className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage.author.id === mockUser.id ? 'Vous: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {selectedConversation.type === 'direct' ? (
                        <>
                          <img
                            src={selectedConversation.avatar}
                            alt={selectedConversation.name}
                            className="w-10 h-10 rounded-full"
                          />
                          {selectedConversation.isOnline && (
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor('online')}`} />
                          )}
                        </>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          {selectedConversation.type === 'group' ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <Hash className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-poppins font-semibold text-gray-900">
                        {selectedConversation.name}
                      </h3>
                      {selectedConversation.type === 'direct' ? (
                        <p className="text-sm text-gray-500">
                          {selectedConversation.isOnline ? 'En ligne' : 'Hors ligne'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {selectedConversation.participants.length} membres
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {getConversationMessages(selectedConversation.id).map((message, index) => {
                  const prevMessage = index > 0 ? getConversationMessages(selectedConversation.id)[index - 1] : null;
                  const showDate = !prevMessage || 
                    formatDate(message.createdAt) !== formatDate(prevMessage.createdAt);
                  const showAvatar = !prevMessage || 
                    prevMessage.author.id !== message.author.id ||
                    message.createdAt.getTime() - prevMessage.createdAt.getTime() > 300000; // 5 minutes

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-500 shadow-sm">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${message.author.id === mockUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[70%] ${message.author.id === mockUser.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          {showAvatar && message.author.id !== mockUser.id && (
                            <img
                              src={message.author.avatar}
                              alt={message.author.name}
                              className="w-8 h-8 rounded-full mr-2 mt-1"
                            />
                          )}
                          
                          <div className={`${message.author.id === mockUser.id ? 'mr-2' : showAvatar ? '' : 'ml-10'}`}>
                            {showAvatar && message.author.id !== mockUser.id && (
                              <p className="text-sm font-medium text-gray-700 mb-1 ml-1">
                                {message.author.name}
                              </p>
                            )}
                            
                            {message.replyTo && (
                              <div className="bg-gray-200 p-2 rounded-lg mb-2 border-l-4 border-primary">
                                <p className="text-xs text-gray-600">
                                  Réponse à {messages.find(m => m.id === message.replyTo)?.author.name}
                                </p>
                                <p className="text-sm text-gray-800 truncate">
                                  {messages.find(m => m.id === message.replyTo)?.content}
                                </p>
                              </div>
                            )}
                            
                            <div
                              className={`relative group rounded-2xl px-4 py-2 ${
                                message.author.id === mockUser.id
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-gray-900 shadow-sm'
                              }`}
                            >
                              {message.type === 'file' && message.attachments?.[0] && (
                                <div className="mb-2">
                                  {message.attachments[0].type.startsWith('image/') ? (
                                    <img
                                      src={message.attachments[0].url}
                                      alt={message.attachments[0].name}
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : (
                                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                                      <Paperclip className="w-4 h-4" />
                                      <span className="text-sm">{message.attachments[0].name}</span>
                                      <button className="ml-auto">
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-sm">{message.content}</p>
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${
                                  message.author.id === mockUser.id ? 'text-purple-200' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.createdAt)}
                                  {message.isEdited && ' (modifié)'}
                                </span>
                              </div>
                              
                              {/* Message Actions */}
                              <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg border flex">
                                <button
                                  onClick={() => setReplyingTo(message)}
                                  className="p-1 hover:bg-gray-100 rounded-l-lg"
                                >
                                  <Reply className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <Smile className="w-4 h-4 text-gray-600" />
                                </button>
                                {message.author.id === mockUser.id && (
                                  <>
                                    <button
                                      onClick={() => setEditingMessage(message)}
                                      className="p-1 hover:bg-gray-100"
                                    >
                                      <Edit3 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded-r-lg">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {message.reactions.map((reaction) => (
                                  <button
                                    key={reaction.id}
                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                      reaction.users.some(u => u.id === mockUser.id)
                                        ? 'bg-primary bg-opacity-20 text-primary border border-primary'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span>{reaction.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">En train d'écrire...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Réponse à {replyingTo.author.name}: {replyingTo.content.substring(0, 50)}...
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent max-h-32"
                      rows={1}
                    />
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setNewMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-poppins font-semibold text-gray-700 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500">
                  Choisissez une conversation dans la liste pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default MessagingInterface;