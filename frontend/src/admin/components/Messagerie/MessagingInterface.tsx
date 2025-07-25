import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Info, Smile, Paperclip, ArrowLeft, Plus, X } from 'lucide-react';

// Types TypeScript adaptés à votre API
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  team?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Message {
  id: number;
  sender: User;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
}

interface Conversation {
  id: number;
  name?: string;
  type: 'DIRECT' | 'GROUP' | 'TEAM';
  participants: User[];
  last_message?: Message;
  updated_at: string;
  unread_count: number;
}

// Configuration API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Hook pour les appels API
const useApi = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token'); 
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return { apiCall };
};

// Composant principal
const MessagingInterface: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { apiCall } = useApi();

  // Gestion du responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les utilisateurs depuis l'API
        const response = await apiCall('/users/');
        
        if (response && response.users && Array.isArray(response.users)) {
          setUsers(response.users);
          
          // Définir l'utilisateur connecté (chercher l'admin ou prendre le premier)
          if (response.users.length > 0) {
            const adminUser = response.users.find(u => u.role === 'ADMIN');
            const currentUser = adminUser || response.users[0];
            setCurrentUser(currentUser);
          }
        } else {
          throw new Error('Format de réponse utilisateurs invalide');
        }
        
        // Charger les conversations
        await loadConversations();
        
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        setError('Erreur lors du chargement des données. Vérifiez que l\'API est accessible.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Charger les conversations depuis l'API
  const loadConversations = async () => {
    try {
      const conversationsData = await apiCall('/chat/conversations/');
      
      if (Array.isArray(conversationsData)) {
        setConversations(conversationsData);
      } else if (conversationsData && conversationsData.conversations && Array.isArray(conversationsData.conversations)) {
        setConversations(conversationsData.conversations);
      } else {
        console.warn('Aucune conversation trouvée');
        setConversations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      setConversations([]);
    }
  };

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: number) => {
    try {
      const messagesData = await apiCall(`/chat/conversations/${conversationId}/`);
      
      if (messagesData && Array.isArray(messagesData.messages)) {
        setMessages(messagesData.messages);
      } else if (messagesData && messagesData.data && Array.isArray(messagesData.data.messages)) {
        setMessages(messagesData.data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    }
  };

  // Sélectionner une conversation
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    markAsRead(conversation.id);
  };

  // Marquer une conversation comme lue
  const markAsRead = async (conversationId: number) => {
    try {
      await apiCall(`/chat/conversations/${conversationId}/read/`, {
        method: 'POST'
      });
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const messageData = {
      content: newMessage,
      message_type: 'TEXT'
    };

    try {
      const response = await apiCall(`/chat/conversations/${selectedConversation.id}/messages/`, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      // Ajouter le message à la liste locale
      const newMsg: Message = {
        id: response.id || Date.now(),
        sender: currentUser,
        content: newMessage,
        message_type: 'TEXT',
        created_at: response.created_at || new Date().toISOString(),
        is_edited: false,
        is_deleted: false
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Mettre à jour la conversation
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, last_message: newMsg, updated_at: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  // Rechercher des utilisateurs
  const searchUsers = async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      const searchResults = await apiCall(`/chat/users/search/?q=${encodeURIComponent(query)}`);
      
      if (Array.isArray(searchResults)) {
        return searchResults;
      } else if (searchResults && searchResults.users && Array.isArray(searchResults.users)) {
        return searchResults.users;
      } else {
        // Fallback sur recherche locale
        return users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return users.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  // Créer une conversation directe et l'ouvrir immédiatement
  const createDirectConversation = async (userId: number) => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      
      // Trouver l'utilisateur par son ID pour récupérer son email
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) {
        console.error('Utilisateur non trouvé');
        return;
      }

      // Vérifier s'il existe déjà une conversation directe avec cet utilisateur
      const existingConversation = conversations.find(conv => 
        conv.type === 'DIRECT' && 
        conv.participants.some(p => p.id === userId) &&
        conv.participants.length === 2 // Conversation directe = 2 participants
      );

      if (existingConversation) {
        // Ouvrir la conversation existante
        selectConversation(existingConversation);
        setShowUserSearch(false);
        return;
      }

      // Créer une nouvelle conversation directe
      const response = await apiCall('/chat/conversations/direct/', {
        method: 'POST',
        body: JSON.stringify({ 
          recipient_email: targetUser.email 
        })
      });
      
      console.log('Réponse de création de conversation:', response);
      
      // Recharger les conversations
      await loadConversations();
      
      // Attendre un peu pour que les conversations soient chargées
      setTimeout(() => {
        // Trouver la nouvelle conversation dans la liste mise à jour
        const newConversation = conversations.find(conv => 
          conv.id === response.id || 
          (conv.type === 'DIRECT' && conv.participants.some(p => p.id === userId))
        );
        
        if (newConversation) {
          console.log('Sélection de la nouvelle conversation:', newConversation);
          selectConversation(newConversation);
        } else {
          // Si on ne trouve pas dans la liste existante, créer un objet temporaire
          const tempConversation: Conversation = {
            id: response.id,
            type: 'DIRECT',
            participants: [currentUser!, targetUser],
            updated_at: new Date().toISOString(),
            unread_count: 0
          };
          
          console.log('Création d\'une conversation temporaire:', tempConversation);
          setConversations(prev => [tempConversation, ...prev]);
          selectConversation(tempConversation);
        }
        
        setShowUserSearch(false);
      }, 500);
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Démarrer une conversation avec un utilisateur depuis la liste vide
  const startConversationWithUser = async (userId: number) => {
    await createDirectConversation(userId);
  };

  // Gérer l'envoi avec Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtrer les conversations
  const filteredConversations = Array.isArray(conversations) 
    ? conversations.filter(conv => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        if (conv.name) {
          return conv.name.toLowerCase().includes(query);
        }
        
        return conv.participants.some(p => 
          p.id !== currentUser?.id && 
          (p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query))
        );
      })
    : [];

  // Obtenir le nom d'affichage d'une conversation
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    
    const otherParticipants = conversation.participants.filter(p => p.id !== currentUser?.id);
    return otherParticipants.map(p => p.name).join(', ');
  };

  // Obtenir les autres participants (excluant l'utilisateur connecté)
  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants.filter(p => p.id !== currentUser?.id);
  };

  // Filtrer les utilisateurs pour la recherche
  const filteredUsersForSearch = users
    .filter(user => 
      user.id !== currentUser?.id &&
      (user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
    );

  // Composant de statut utilisateur
  const UserStatus: React.FC<{ status: User['status'] }> = ({ status }) => {
    const statusColors = {
      active: 'bg-green-500',
      inactive: 'bg-gray-400'
    };

    return (
      <div className={`w-3 h-3 rounded-full ${statusColors[status]} border-2 border-white`} />
    );
  };

  // Formater la date
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Erreur</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-gray-100">
      {/* Liste des conversations */}
      <div className={`${isMobile && selectedConversation ? 'hidden' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-200`}>
        {/* En-tête */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4">
              <div className="text-center text-gray-500 mb-4">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </div>
              
              {!searchQuery && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Démarrer une conversation</h3>
                  {users
                    .filter(user => user.id !== currentUser?.id)
                    .map(user => (
                      <div
                        key={user.id}
                        onClick={() => startConversationWithUser(user.id)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-100"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            <UserStatus status={user.status} />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{user.role}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className={`text-xs ${
                              user.status === 'active' ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {user.status === 'active' ? 'En ligne' : 'Hors ligne'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{user.email}</div>
                          {user.team && (
                            <div className="text-xs text-blue-600 mt-1">Équipe: {user.team}</div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          <Send className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                
                  {users.filter(user => user.id !== currentUser?.id).length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      Aucun utilisateur disponible
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipants = getOtherParticipants(conversation);
              const displayName = getConversationDisplayName(conversation);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-150 ${
                    selectedConversation?.id === conversation.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar(s) */}
                    <div className="relative flex-shrink-0">
                      {otherParticipants.length === 1 ? (
                        <div className="relative">
                          <img
                            src={otherParticipants[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipants[0].name)}&background=6366f1&color=fff`}
                            alt={otherParticipants[0].name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            <UserStatus status={otherParticipants[0].status} />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {otherParticipants.length}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informations de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {displayName}
                        </h3>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(conversation.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      
                      {/* Participants pour les groupes */}
                      {conversation.type !== 'DIRECT' && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {otherParticipants.slice(0, 3).map((participant, index) => (
                            <span
                              key={participant.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                            >
                              <UserStatus status={participant.status} />
                              <span className="ml-1">{participant.name}</span>
                              <span className="ml-1 text-gray-400">({participant.role})</span>
                            </span>
                          ))}
                          {otherParticipants.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{otherParticipants.length - 3} autres
                            </span>
                          )}
                        </div>
                      )}

                      {/* Pour les conversations directes, afficher le rôle */}
                      {conversation.type === 'DIRECT' && otherParticipants.length === 1 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-gray-500">{otherParticipants[0].role}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className={`text-xs ${
                            otherParticipants[0].status === 'active' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {otherParticipants[0].status === 'active' ? 'En ligne' : 'Hors ligne'}
                          </span>
                          {otherParticipants[0].team && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-blue-600">{otherParticipants[0].team}</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {conversation.last_message && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message.sender.id === currentUser?.id ? 'Vous: ' : ''}
                            {conversation.last_message.content}
                          </p>
                        )}
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de recherche d'utilisateurs */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouvelle conversation</h3>
              <button
                onClick={() => setShowUserSearch(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredUsersForSearch.map(user => (
                <div
                  key={user.id}
                  onClick={() => createDirectConversation(user.id)}
                  className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer ${
                    isCreatingConversation ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.role} • {user.email}</div>
                    {user.team && (
                      <div className="text-xs text-blue-600">Équipe: {user.team}</div>
                    )}
                  </div>
                  <UserStatus status={user.status} />
                </div>
              ))}
              
              {filteredUsersForSearch.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  {userSearchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                </div>
              )}
            </div>
            
            {isCreatingConversation && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Création de la conversation...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone de chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* En-tête du chat */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                
                <div className="flex items-center space-x-3">
                  {getOtherParticipants(selectedConversation).length === 1 ? (
                    <div className="relative">
                      <img
                        src={getOtherParticipants(selectedConversation)[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParticipants(selectedConversation)[0].name)}&background=6366f1&color=fff`}
                        alt={getOtherParticipants(selectedConversation)[0].name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        <UserStatus status={getOtherParticipants(selectedConversation)[0].status} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getOtherParticipants(selectedConversation).length}
                    </div>
                  )}
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getConversationDisplayName(selectedConversation)}
                    </h2>
                    {selectedConversation.type === 'DIRECT' && getOtherParticipants(selectedConversation).length === 1 && (
                      <p className="text-sm text-gray-500">
                        {getOtherParticipants(selectedConversation)[0].role} • {
                          getOtherParticipants(selectedConversation)[0].status === 'active' ? 'En ligne' : 'Hors ligne'
                        }
                        {getOtherParticipants(selectedConversation)[0].team && ` • ${getOtherParticipants(selectedConversation)[0].team}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Démarrez votre conversation
                  </h3>
                  <p className="text-gray-500">
                    Envoyez votre premier message à {getConversationDisplayName(selectedConversation)}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender.id === currentUser?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isOwnMessage && (
                        <img
                          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}&background=6366f1&color=fff`}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      
                      <div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : ''}`}>
                          {!isOwnMessage && (
                            <span>{message.sender.name}</span>
                          )}
                          <span>•</span>
                          <span>{formatMessageTime(message.created_at)}</span>
                          {message.is_edited && (
                            <>
                              <span>•</span>
                              <span>modifié</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Écrire à ${getConversationDisplayName(selectedConversation)}...`}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez une conversation
            </h3>
            <p className="text-gray-500 mb-4">
              Choisissez une conversation dans la liste ou créez-en une nouvelle
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Nouvelle conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInterface;