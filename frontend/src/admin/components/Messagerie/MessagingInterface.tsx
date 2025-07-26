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

interface Participant {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
    chat_status: string | null;
  };
  is_admin: boolean;
  notifications_enabled: boolean;
  joinedAt: string;
  lastReadAt: string | null;
}

interface APIConversation {
  id: number;
  name: string | null;
  type: 'DIRECT' | 'GROUP' | 'TEAM';
  participants: Participant[];
  last_message?: {
    id: number;
    content: string;
    message_type: string;
    sender: User;
    createdAt: string;
    is_edited: boolean;
    is_deleted: boolean;
  } | null;
  unread_count: number;
  createdAt: string;
  updatedAt: string;
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

// Hook pour les appels API avec meilleure gestion des erreurs
const useApi = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token récupéré:', token ? 'Présent' : 'Absent');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      console.log(`🌐 API Call: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Token invalide ou expiré');
          // Optionnel : rediriger vers la page de connexion
          // window.location.href = '/login';
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response pour ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API call failed pour ${endpoint}:`, error);
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
  
  // États pour contrôler l'initialisation
  const [isInitialized, setIsInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Refs pour les intervalles
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { apiCall } = useApi();

  // Gestion du responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Fonction utilitaire pour convertir les participants de l'API
  const convertParticipantToUser = (participant: Participant): User | null => {
    if (!participant || !participant.user) {
      console.warn('⚠️ Participant invalide:', participant);
      return null;
    }

    const user = participant.user;
    
    if (!user.id || typeof user.id !== 'number') {
      console.warn('⚠️ ID utilisateur manquant ou invalide:', user);
      return null;
    }

    if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
      console.warn('⚠️ Email utilisateur manquant ou invalide:', user);
      return null;
    }

    const getName = (userData: any): string => {
      if (userData.name && typeof userData.name === 'string' && userData.name.trim() !== '' && userData.name !== 'undefined') {
        return userData.name.trim();
      }
      
      if (userData.email && typeof userData.email === 'string' && userData.email.includes('@')) {
        const emailName = userData.email.split('@')[0];
        if (emailName && emailName.trim() !== '') {
          return emailName.trim();
        }
      }
      
      return `Utilisateur ${userData.id}`;
    };

    return {
      id: user.id,
      email: user.email.trim(),
      name: getName(user),
      role: user.role || 'USER',
      status: 'active', // Par défaut active, vous pouvez ajuster selon votre logique
      team: undefined, // Pas présent dans l'API actuelle
      avatar: user.avatar || undefined,
      createdAt: new Date().toISOString(), // Pas présent dans cette structure
      lastLogin: undefined
    };
  };

  // ✅ Fonction utilitaire pour convertir les messages de l'API
  const convertAPIMessageToMessage = (apiMessage: any): Message | null => {
    if (!apiMessage || !apiMessage.sender) {
      console.warn('⚠️ Message API invalide:', apiMessage);
      return null;
    }

    // Convertir le sender en User
    const sender: User = {
      id: apiMessage.sender.id,
      email: apiMessage.sender.email,
      name: apiMessage.sender.name || `Utilisateur ${apiMessage.sender.id}`,
      role: apiMessage.sender.role || 'USER',
      status: apiMessage.sender.status === 'active' ? 'active' : 'inactive',
      team: apiMessage.sender.team || undefined,
      avatar: apiMessage.sender.avatar || undefined,
      createdAt: apiMessage.sender.createdAt || new Date().toISOString(),
      lastLogin: apiMessage.sender.lastLogin || undefined
    };

    return {
      id: apiMessage.id,
      sender: sender,
      content: apiMessage.content,
      message_type: apiMessage.message_type || 'TEXT',
      created_at: apiMessage.createdAt,
      is_edited: apiMessage.is_edited || false,
      is_deleted: apiMessage.is_deleted || false
    };
  };

  // ✅ Fonction utilitaire pour convertir une conversation API en Conversation
  const convertAPIConversationToConversation = (apiConv: APIConversation): Conversation | null => {
    if (!apiConv || !apiConv.id) {
      console.warn('⚠️ Conversation API invalide:', apiConv);
      return null;
    }

    // Convertir les participants
    const participants: User[] = [];
    if (Array.isArray(apiConv.participants)) {
      for (const participant of apiConv.participants) {
        const user = convertParticipantToUser(participant);
        if (user) {
          participants.push(user);
        }
      }
    }

    if (participants.length === 0) {
      console.warn('⚠️ Aucun participant valide pour la conversation:', apiConv.id);
      return null;
    }

    // Convertir le dernier message si présent
    let lastMessage: Message | undefined = undefined;
    if (apiConv.last_message) {
      const convertedMessage = convertAPIMessageToMessage(apiConv.last_message);
      if (convertedMessage) {
        lastMessage = convertedMessage;
      }
    }

    return {
      id: apiConv.id,
      name: apiConv.name || undefined,
      type: apiConv.type,
      participants: participants,
      last_message: lastMessage,
      updated_at: apiConv.updatedAt,
      unread_count: apiConv.unread_count || 0
    };
  };

  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.name && conversation.name.trim() !== '') {
      return conversation.name;
    }
    
    const otherParticipants = conversation.participants.filter(p => p.id !== currentUser?.id);
    
    if (otherParticipants.length === 0) {
      return 'Conversation';
    }
    
    const validNames = otherParticipants.map(participant => {
      if (participant.name && participant.name.trim() !== '' && participant.name !== 'undefined') {
        return participant.name.trim();
      }
      return `Utilisateur ${participant.id}`;
    });
    
    return validNames.join(', ');
  };

  const getOtherParticipants = (conversation: Conversation): User[] => {
    return conversation.participants.filter(p => p.id !== currentUser?.id);
  };

  // ✅ NOUVELLE FONCTION : Chargement des utilisateurs depuis l'API
  const loadUsers = async (): Promise<User[]> => {
    try {
      console.log('👥 Chargement des utilisateurs...');
      const response = await apiCall('/users/');
      
      if (!response || !response.users || !Array.isArray(response.users)) {
        throw new Error('Format de réponse utilisateurs invalide');
      }

      const cleanUsers: User[] = [];
      
      for (const userData of response.users) {
        if (userData && userData.id && userData.email) {
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email.split('@')[0] || `Utilisateur ${userData.id}`,
            role: userData.role || 'USER',
            status: userData.status === 'active' ? 'active' : 'inactive',
            team: userData.team || undefined,
            avatar: userData.avatar || undefined,
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: userData.lastLogin || undefined
          };
          cleanUsers.push(user);
        }
      }
      
      console.log('✅ Utilisateurs chargés et nettoyés:', cleanUsers.length);
      
      if (cleanUsers.length === 0) {
        throw new Error('Aucun utilisateur valide trouvé');
      }
      
      return cleanUsers;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      throw error;
    }
  };

  // ✅ FONCTION CORRIGÉE : Chargement des conversations depuis l'API
  const loadConversationsFromAPI = async (): Promise<Conversation[]> => {
    try {
      console.log('📥 Chargement des conversations depuis l\'API...');
      
      const response = await apiCall('/chat/conversations/');
      console.log('🔍 Réponse brute API conversations:', response);
      
      let conversationsList: APIConversation[] = [];
      
      // Gérer les différents formats de réponse
      if (Array.isArray(response)) {
        conversationsList = response;
      } else if (response && response.conversations && Array.isArray(response.conversations)) {
        conversationsList = response.conversations;
      } else if (response && response.data && Array.isArray(response.data)) {
        conversationsList = response.data;
      } else {
        console.warn('⚠️ Format de réponse conversations inattendu:', response);
        return [];
      }

      console.log('📊 Nombre de conversations API récupérées:', conversationsList.length);

      const convertedConversations: Conversation[] = [];
      
      for (const apiConv of conversationsList) {
        const conversation = convertAPIConversationToConversation(apiConv);
        if (conversation) {
          convertedConversations.push(conversation);
        }
      }
      
      console.log('✅ Conversations converties avec succès:', convertedConversations.length);
      return convertedConversations;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations depuis l\'API:', error);
      throw error;
    }
  };

  // ✅ NOUVELLE FONCTION : Fonction de rechargement complète des données
  const reloadData = async (force: boolean = false) => {
    if (loading && !force) {
      console.log('🔄 Rechargement déjà en cours, ignoré');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Rechargement complet des données...');

      // Vérifier le token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
      }

      // Charger les utilisateurs
      const loadedUsers = await loadUsers();
      setUsers(loadedUsers);

      // Définir l'utilisateur actuel (priorité à ADMIN)
      const adminUser = loadedUsers.find((u: User) => u.role === 'ADMIN');
      const currentUserData = adminUser || loadedUsers[0];
      setCurrentUser(currentUserData);
      console.log('✅ Utilisateur actuel défini:', currentUserData);

      // Charger les conversations
      const loadedConversations = await loadConversationsFromAPI();
      setConversations(loadedConversations);
      console.log('✅ Conversations chargées:', loadedConversations.length);

      setDataLoaded(true);
      console.log('✅ Rechargement terminé avec succès');

    } catch (error) {
      console.error('❌ Erreur lors du rechargement:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du rechargement des données');
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION MAJEURE : Initialisation améliorée avec gestion du rechargement
  useEffect(() => {
    const initializeData = async () => {
      // Éviter la double initialisation
      if (isInitialized) {
        console.log('⚠️ Initialisation déjà effectuée');
        return;
      }

      console.log('🚀 Initialisation de l\'interface de messagerie...');
      setIsInitialized(true);
      
      // Si les données sont déjà chargées (par exemple après un refresh), recharger
      if (conversations.length === 0 || users.length === 0 || !currentUser) {
        await reloadData(true);
      } else {
        console.log('✅ Données déjà présentes, pas de rechargement nécessaire');
        setDataLoaded(true);
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Dépendances vides pour ne s'exécuter qu'au montage

  // ✅ Détection du refresh de page et rechargement automatique
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // Si la page est rechargée depuis le cache du navigateur
      if (event.persisted || (performance.getEntriesByType('navigation')[0] as any)?.type === 'reload') {
        console.log('🔄 Page rechargée détectée, rechargement des données...');
        setTimeout(() => {
          if (conversations.length === 0 || users.length === 0) {
            reloadData(true);
          }
        }, 100);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [conversations.length, users.length]);

  // ✅ Auto-refresh des conversations uniquement après initialisation
  useEffect(() => {
    if (!dataLoaded || !users.length || selectedConversation) return;

    const refreshConversations = async () => {
      try {
        console.log('🔄 Refresh automatique des conversations');
        const refreshedConversations = await loadConversationsFromAPI();
        setConversations(refreshedConversations);
      } catch (error) {
        console.error('❌ Erreur lors du refresh automatique:', error);
      }
    };

    // Refresh périodique seulement si pas de conversation sélectionnée
    conversationIntervalRef.current = setInterval(refreshConversations, 60000);

    return () => {
      if (conversationIntervalRef.current) {
        clearInterval(conversationIntervalRef.current);
        conversationIntervalRef.current = null;
      }
    };
  }, [dataLoaded, users.length, selectedConversation]);

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (conversationId: number) => {
    if (!conversationId || conversationId === undefined) {
      console.error('ID de conversation invalide:', conversationId);
      return;
    }
    
    try {
      console.log('📨 Chargement des messages pour la conversation:', conversationId);
      const messagesData = await apiCall(`/chat/conversations/${conversationId}/`);
      
      let messagesArray: any[] = [];
      
      if (messagesData && Array.isArray(messagesData.messages)) {
        messagesArray = messagesData.messages;
      } else if (messagesData && messagesData.data && Array.isArray(messagesData.data.messages)) {
        messagesArray = messagesData.data.messages;
      } else {
        messagesArray = [];
      }
      
      // Convertir les messages API en format Message
      const convertedMessages: Message[] = [];
      for (const msgData of messagesArray) {
        const convertedMessage = convertAPIMessageToMessage(msgData);
        if (convertedMessage) {
          convertedMessages.push(convertedMessage);
        }
      }
      
      console.log('✅ Messages chargés et convertis:', convertedMessages.length);
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  // ✅ CORRECTION : selectConversation simplifiée
  const selectConversation = (conversation: Conversation) => {
    if (!conversation || !conversation.id) {
      console.error('Conversation invalide:', conversation);
      return;
    }
    
    if (selectedConversation && selectedConversation.id === conversation.id) {
      console.log('⏭️ Conversation déjà sélectionnée');
      return;
    }
    
    console.log('🔄 Sélection de la conversation:', conversation.id);
    
    // Arrêter l'intervalle des conversations
    if (conversationIntervalRef.current) {
      clearInterval(conversationIntervalRef.current);
      conversationIntervalRef.current = null;
    }
    
    setSelectedConversation(conversation);
    
    if (typeof conversation.id === 'number' && conversation.id > 0) {
      loadMessages(conversation.id);
      markAsRead(conversation.id);
      
      // Démarrer l'intervalle de rechargement des messages
      messageIntervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 Rechargement messages conversation active');
          await loadMessages(conversation.id as number);
        } catch (error) {
          console.error('Erreur rechargement messages:', error);
        }
      }, 30000);
      
    } else {
      setMessages([]);
    }
  };

  // ✅ Fonction pour revenir à la liste des conversations
  const deselectConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    
    // Arrêter l'intervalle des messages
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    
    // Redémarrer l'intervalle des conversations
    if (dataLoaded && users.length > 0) {
      const refreshConversations = async () => {
        try {
          const refreshedConversations = await loadConversationsFromAPI();
          setConversations(refreshedConversations);
        } catch (error) {
          console.error('❌ Erreur lors du refresh:', error);
        }
      };

      conversationIntervalRef.current = setInterval(refreshConversations, 60000);
    }
  };

  const markAsRead = async (conversationId: number) => {
    if (!conversationId) return;
    
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    if (!selectedConversation.id) {
      console.error('ID de conversation invalide');
      setError('Erreur: conversation invalide');
      return;
    }

    const messageData = {
      content: newMessage,
      message_type: 'TEXT'
    };

    try {
      const response = await apiCall(`/chat/conversations/${selectedConversation.id}/messages/`, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      const newMsg: Message = {
        id: response.data?.id || response.id || Date.now(),
        sender: currentUser,
        content: newMessage,
        message_type: 'TEXT',
        created_at: response.data?.createdAt || response.created_at || new Date().toISOString(),
        is_edited: false,
        is_deleted: false
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, last_message: newMsg, updated_at: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const createDirectConversation = async (userId: number) => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      setError(null);
      
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) {
        setError('Utilisateur non trouvé');
        return;
      }

      const existingConversation = conversations.find(conv => 
        conv.type === 'DIRECT' && 
        conv.participants.length === 2 &&
        conv.participants.some(p => p.id === userId) &&
        conv.participants.some(p => p.id === currentUser?.id)
      );

      if (existingConversation) {
        selectConversation(existingConversation);
        setShowUserSearch(false);
        return;
      }

      const response = await apiCall('/chat/conversations/direct/', {
        method: 'POST',
        body: JSON.stringify({ 
          recipient_email: targetUser.email 
        })
      });
      
      const tempConversationId = response.id || response.conversation?.id || `temp_${Date.now()}`;
      
      const tempConversation: Conversation = {
        id: tempConversationId,
        type: 'DIRECT',
        participants: [{ ...currentUser! }, { ...targetUser }],
        updated_at: new Date().toISOString(),
        unread_count: 0
      };
      
      setConversations(prev => [tempConversation, ...prev]);
      selectConversation(tempConversation);
      setShowUserSearch(false);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      setError('Erreur lors de la création de la conversation');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // ✅ Cleanup lors du démontage
  useEffect(() => {
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
      if (conversationIntervalRef.current) {
        clearInterval(conversationIntervalRef.current);
      }
    };
  }, []);

  const startConversationWithUser = async (userId: number) => {
    await createDirectConversation(userId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = Array.isArray(conversations) 
    ? conversations.filter(conv => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        if (conv.name) {
          return conv.name.toLowerCase().includes(query);
        }
        
        return conv.participants.some(p => 
          p.id !== currentUser?.id && 
          p.name && 
          (p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query))
        );
      })
    : [];

  const filteredUsersForSearch = users
    .filter(user => 
      user.id !== currentUser?.id &&
      (user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
    );

  const UserStatus: React.FC<{ status: User['status'] }> = ({ status }) => {
    const statusColors = {
      active: 'bg-green-500',
      inactive: 'bg-gray-400'
    };

    return (
      <div className={`w-3 h-3 rounded-full ${statusColors[status]} border-2 border-white`} />
    );
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ✅ Messages d'état améliorés
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Chargement des données...</div>
          <div className="text-sm text-gray-500 mt-2">
            {isInitialized ? 'Rechargement en cours...' : 'Initialisation...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2 text-6xl">⚠️</div>
          <div className="text-red-600 font-semibold mb-2">Erreur de connexion</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="space-y-2">
            <button 
              onClick={() => reloadData(true)} 
              className="block mx-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Recharger les données'}
            </button>
            <div className="text-xs text-gray-500">
              Vérifiez que l'API est accessible et que vous êtes connecté
            </div>
          </div>
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
            {/* ✅ Indicateur de statut de connexion amélioré */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${dataLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <button
                onClick={() => reloadData()}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                title="Actualiser"
                disabled={loading}
              >
                <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                  ↻
                </div>
              </button>
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Démarrer une conversation</h3>
                    {loading && (
                      <div className="text-xs text-gray-500">Chargement...</div>
                    )}
                  </div>
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
                    onClick={deselectConversation}
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