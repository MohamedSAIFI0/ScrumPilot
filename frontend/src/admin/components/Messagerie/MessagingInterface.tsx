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
    const token = localStorage.getItem('access_token')
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

  // ✅ Fonction utilitaire pour nettoyer et valider les données utilisateur
  const sanitizeUser = (user: any): User | null => {
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Données utilisateur invalides:', user);
      return null;
    }

    // Vérification des champs obligatoires
    if (!user.id || typeof user.id !== 'number') {
      console.warn('⚠️ ID utilisateur manquant ou invalide:', user);
      return null;
    }

    if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
      console.warn('⚠️ Email utilisateur manquant ou invalide:', user);
      return null;
    }

    // Fonction pour extraire un nom valide
    const getName = (userData: any): string => {
      // Priorité 1: nom complet défini et non vide
      if (userData.name && typeof userData.name === 'string' && userData.name.trim() !== '' && userData.name !== 'undefined') {
        return userData.name.trim();
      }
      
      // Priorité 2: partie avant @ de l'email
      if (userData.email && typeof userData.email === 'string' && userData.email.includes('@')) {
        const emailName = userData.email.split('@')[0];
        if (emailName && emailName.trim() !== '') {
          return emailName.trim();
        }
      }
      
      // Priorité 3: email complet si pas de @
      if (userData.email && typeof userData.email === 'string' && userData.email.trim() !== '') {
        return userData.email.trim();
      }
      
      // Fallback final
      return `Utilisateur ${userData.id}`;
    };

    return {
      id: user.id,
      email: user.email.trim(),
      name: getName(user),
      role: user.role || 'USER',
      status: user.status === 'active' || user.status === 'inactive' ? user.status : 'inactive',
      team: user.team || undefined,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin || undefined
    };
  };

  // ✅ Fonction getConversationDisplayName CORRIGÉE
  const getConversationDisplayName = (conversation: Conversation): string => {
    if (conversation.name && conversation.name.trim() !== '') {
      return conversation.name;
    }
    
    const otherParticipants = conversation.participants.filter(p => p.id !== currentUser?.id);
    
    if (otherParticipants.length === 0) {
      return 'Conversation';
    }
    
    // ✅ Utiliser directement les données déjà enrichies
    const validNames = otherParticipants.map(participant => {
      if (participant.name && participant.name.trim() !== '' && participant.name !== 'undefined') {
        return participant.name.trim();
      }
      return `Utilisateur ${participant.id}`;
    });
    
    return validNames.join(', ');
  };

  // ✅ Fonction getOtherParticipants CORRIGÉE
  const getOtherParticipants = (conversation: Conversation): User[] => {
    return conversation.participants.filter(p => p.id !== currentUser?.id);
  };

  // ✅ Fonction loadConversations COMPLÈTEMENT CORRIGÉE (ne touche pas aux messages)
  const loadConversations = async (): Promise<Conversation[]> => {
    try {
      console.log('📥 Chargement des conversations... Users disponibles:', users.length);
      
      const conversationsData = await apiCall('/chat/conversations/');
      console.log('📦 Données conversations reçues:', conversationsData);
      
      let conversationsList: Conversation[] = [];
      
      if (Array.isArray(conversationsData)) {
        conversationsList = conversationsData;
      } else if (conversationsData && conversationsData.conversations && Array.isArray(conversationsData.conversations)) {
        conversationsList = conversationsData.conversations;
      } else {
        console.warn('Format de réponse conversations inattendu:', conversationsData);
        conversationsList = [];
      }
      
      // ✅ Vérifier que les utilisateurs sont disponibles
      if (!users || users.length === 0) {
        console.warn('⚠️ Aucun utilisateur disponible pour l\'enrichissement');
        return [];
      }

      // ✅ Enrichir toutes les conversations avec validation stricte
      const enrichedConversations: Conversation[] = [];
      
      for (const conv of conversationsList) {
        try {
          if (!conv || typeof conv !== 'object' || !conv.id) {
            console.warn('⚠️ Conversation invalide ignorée:', conv);
            continue;
          }

          // ✅ Traiter les participants avec validation stricte
          const validParticipants: User[] = [];
          
          if (Array.isArray(conv.participants)) {
            for (const participant of conv.participants) {
              // Chercher les données complètes de l'utilisateur
              const fullUserData = users.find(user => user.id === participant.id);
              
              if (fullUserData) {
                // Utiliser les données complètes de la liste users
                const sanitizedUser = sanitizeUser(fullUserData);
                if (sanitizedUser) {
                  validParticipants.push(sanitizedUser);
                } else {
                  console.warn('⚠️ Données utilisateur corrompues pour ID:', participant.id);
                }
              } else if (participant && participant.id) {
                // Utiliser les données partielles avec nettoyage
                const sanitizedUser = sanitizeUser(participant);
                if (sanitizedUser) {
                  validParticipants.push(sanitizedUser);
                } else {
                  console.warn('⚠️ Participant ignoré (données invalides):', participant);
                }
              } else {
                console.warn('⚠️ Participant ignoré (pas d\'ID):', participant);
              }
            }
          }

          // ✅ Ne conserver que les conversations avec au moins un participant valide
          if (validParticipants.length > 0) {
            const enrichedConversation: Conversation = {
              id: conv.id,
              name: conv.name || undefined,
              type: conv.type || 'DIRECT',
              participants: validParticipants,
              last_message: conv.last_message || undefined,
              updated_at: conv.updated_at || new Date().toISOString(),
              unread_count: conv.unread_count || 0
            };
            
            enrichedConversations.push(enrichedConversation);
          } else {
            console.warn('⚠️ Conversation ignorée (aucun participant valide):', conv.id);
          }
        } catch (error) {
          console.error('Erreur lors du traitement de la conversation:', conv.id, error);
        }
      }
      
      console.log('✅ Conversations enrichies finales:', enrichedConversations.length, enrichedConversations);
      
      // ✅ Mettre à jour l'état SANS affecter la conversation sélectionnée ni les messages
      setConversations(prev => {
        // ✅ CRUCIAL : Préserver la conversation sélectionnée ET ne PAS la remplacer
        if (selectedConversation) {
          const updatedSelectedConv = enrichedConversations.find(conv => 
            conv.id === selectedConversation.id
          );
          
          if (updatedSelectedConv) {
            // ✅ Mettre à jour UNIQUEMENT les métadonnées, PAS les messages
            console.log('✅ Mise à jour métadonnées conversation sélectionnée (messages préservés)');
            // NE PAS appeler setSelectedConversation ici pour éviter de recharger les messages
          }
        }
        
        return enrichedConversations;
      });
      
      return enrichedConversations;
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      // ✅ Ne pas vider les conversations en cas d'erreur
      return conversations;
    }
  };

  // ✅ Initialisation CORRIGÉE avec séquencement approprié
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Initialisation des données...');
        
        // ✅ Étape 1: Charger les utilisateurs
        const response = await apiCall('/users/');
        console.log('📦 Réponse utilisateurs brute:', response);
        
        if (response && response.users && Array.isArray(response.users)) {
          // ✅ Nettoyer et valider tous les utilisateurs
          const cleanUsers: User[] = [];
          
          for (const userData of response.users) {
            const sanitizedUser = sanitizeUser(userData);
            if (sanitizedUser) {
              cleanUsers.push(sanitizedUser);
            }
          }
          
          console.log('✅ Utilisateurs nettoyés:', cleanUsers.length, cleanUsers);
          setUsers(cleanUsers);
          
          // ✅ Définir l'utilisateur actuel
          if (cleanUsers.length > 0) {
            const adminUser = cleanUsers.find((u: User) => u.role === 'ADMIN');
            const currentUser = adminUser || cleanUsers[0];
            setCurrentUser(currentUser);
            console.log('✅ Utilisateur actuel défini:', currentUser);
            
            // ✅ Étape 2: Attendre que les états soient mis à jour
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // ✅ Étape 3: Charger les conversations
            console.log('📥 Chargement des conversations avec', cleanUsers.length, 'utilisateurs...');
            
            // Attendre encore un peu pour s'assurer que users est bien défini
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Charger avec le contexte users mis à jour
            const conversations = await loadConversations();
            console.log('✅ Initialisation terminée avec', conversations.length, 'conversations');
          } else {
            throw new Error('Aucun utilisateur valide trouvé');
          }
        } else {
          throw new Error('Format de réponse utilisateurs invalide');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement initial:', error);
        setError('Erreur lors du chargement des données. Vérifiez que l\'API est accessible.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Dépendances vides pour éviter les re-renders infinis

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Fonction loadMessages avec mise en cache et vérifications renforcées
  const loadMessages = async (conversationId: number) => {
    if (!conversationId || conversationId === undefined) {
      console.error('ID de conversation invalide:', conversationId);
      return;
    }
    
    try {
      console.log('📨 Chargement des messages pour la conversation:', conversationId);
      const messagesData = await apiCall(`/chat/conversations/${conversationId}/`);
      
      let messagesArray: Message[] = [];
      
      if (messagesData && Array.isArray(messagesData.messages)) {
        messagesArray = messagesData.messages;
      } else if (messagesData && messagesData.data && Array.isArray(messagesData.data.messages)) {
        messagesArray = messagesData.data.messages;
      } else {
        console.log('Aucun message trouvé pour cette conversation');
        messagesArray = [];
      }
      
      console.log('✅ Messages chargés:', messagesArray.length, messagesArray);
      setMessages(messagesArray);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      // ✅ En cas d'erreur, ne pas vider les messages existants
      console.log('⚠️ Préservation des messages existants suite à l\'erreur');
    }
  };

  // ✅ Fonction selectConversation CORRIGÉE (évite les rechargements inutiles)
  const selectConversation = (conversation: Conversation) => {
    if (!conversation || !conversation.id) {
      console.error('Conversation invalide:', conversation);
      return;
    }
    
    // ✅ Éviter de recharger si c'est la même conversation
    if (selectedConversation && selectedConversation.id === conversation.id) {
      console.log('⏭️ Conversation déjà sélectionnée, pas de rechargement');
      return;
    }
    
    console.log('🔄 Sélection de la conversation:', conversation.id, conversation);
    setSelectedConversation(conversation);
    
    // Charger les messages uniquement si l'ID est valide
    if (typeof conversation.id === 'number' && conversation.id > 0) {
      loadMessages(conversation.id);
      markAsRead(conversation.id);
    } else {
      // Pour les conversations temporaires, initialiser avec un tableau vide
      setMessages([]);
    }
  };

  // ✅ Fonction markAsRead avec vérifications
  const markAsRead = async (conversationId: number) => {
    if (!conversationId || conversationId === undefined) {
      console.error('ID de conversation invalide pour markAsRead:', conversationId);
      return;
    }
    
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

  // ✅ Fonction sendMessage avec vérifications
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    if (!selectedConversation.id || selectedConversation.id === undefined) {
      console.error('ID de conversation invalide pour l\'envoi de message:', selectedConversation);
      setError('Erreur: conversation invalide');
      return;
    }

    const messageData = {
      content: newMessage,
      message_type: 'TEXT'
    };

    try {
      console.log('Envoi du message à la conversation:', selectedConversation.id);
      const response = await apiCall(`/chat/conversations/${selectedConversation.id}/messages/`, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      // Ajouter le message à la liste locale
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
      setError('Erreur lors de l\'envoi du message');
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

  // ✅ Fonction createDirectConversation COMPLÈTEMENT CORRIGÉE
  const createDirectConversation = async (userId: number) => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      setError(null);
      
      console.log('🚀 Création conversation avec utilisateur ID:', userId);
      
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) {
        console.error('❌ Utilisateur non trouvé dans la liste:', userId);
        setError('Utilisateur non trouvé');
        return;
      }

      console.log('✅ Utilisateur cible trouvé:', targetUser);

      // Vérifier conversation existante avec recherche robuste
      const existingConversation = conversations.find(conv => 
        conv.type === 'DIRECT' && 
        conv.participants.length === 2 &&
        conv.participants.some(p => p.id === userId) &&
        conv.participants.some(p => p.id === currentUser?.id)
      );

      if (existingConversation) {
        console.log('✅ Conversation existante trouvée:', existingConversation);
        selectConversation(existingConversation);
        setShowUserSearch(false);
        return;
      }

      // Créer nouvelle conversation
      console.log('📤 Création nouvelle conversation avec:', targetUser.email);
      const response = await apiCall('/chat/conversations/direct/', {
        method: 'POST',
        body: JSON.stringify({ 
          recipient_email: targetUser.email 
        })
      });
      
      console.log('📦 Réponse création conversation:', response);
      
      // ✅ Créer la conversation temporaire avec TOUTES les données utilisateur validées
      const tempConversationId = response.id || response.conversation?.id || `temp_${Date.now()}`;
      
      const tempConversation: Conversation = {
        id: tempConversationId,
        type: 'DIRECT',
        participants: [
          // ✅ Utilisateur actuel avec toutes ses données
          { ...currentUser! },
          // ✅ Utilisateur cible avec toutes ses données
          { ...targetUser }
        ],
        updated_at: new Date().toISOString(),
        unread_count: 0
      };
      
      console.log('✅ Conversation temporaire créée:', tempConversation);
      
      // Ajouter à la liste et sélectionner
      setConversations(prev => [tempConversation, ...prev]);
      setSelectedConversation(tempConversation);
      setMessages([]);
      setShowUserSearch(false);
      
      // ✅ Recharger après un délai pour synchroniser avec l'API
      setTimeout(async () => {
        try {
          console.log('🔄 Rechargement des conversations pour synchronisation...');
          await loadConversations();
        } catch (error) {
          console.error('❌ Erreur lors du rechargement:', error);
        }
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      setError('Erreur lors de la création de la conversation. Veuillez réessayer.');
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  // ✅ Hook pour recharger les messages périodiquement (SEULEMENT pour la conversation active)
  useEffect(() => {
    if (!selectedConversation || !selectedConversation.id || typeof selectedConversation.id !== 'number') {
      return;
    }

    // Recharger les messages toutes les 10 secondes pour la conversation active
    const messageReloadInterval = setInterval(async () => {
      try {
        console.log('🔄 Rechargement des messages pour conversation active:', selectedConversation.id);
        await loadMessages(selectedConversation.id as number);
      } catch (error) {
        console.error('Erreur lors du rechargement des messages:', error);
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(messageReloadInterval);
  }, [selectedConversation?.id]); // Se déclenche uniquement quand la conversation change

  // ✅ Hook pour rafraîchir les conversations périodiquement (SANS affecter les messages)
  useEffect(() => {
    if (users.length === 0) return; // Ne pas démarrer l'intervalle sans utilisateurs
    
    const intervalId = setInterval(async () => {
      // Ne recharger que si aucune conversation n'est en cours de création ET qu'aucun message n'est affiché
      if (!isCreatingConversation && !showUserSearch && !selectedConversation) {
        try {
          console.log('🔄 Rafraîchissement automatique des conversations (pas de conversation active)');
          await loadConversations();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement:', error);
        }
      } else {
        console.log('⏸️ Rafraîchissement automatique suspendu (conversation active ou en cours de création)');
      }
    }, 60000); // Rafraîchir toutes les 60 secondes (réduit la fréquence)

    return () => clearInterval(intervalId);
  }, [users.length, isCreatingConversation, showUserSearch, selectedConversation?.id]); // Inclure selectedConversation.id

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
          p.name && 
          (p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query))
        );
      })
    : [];

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