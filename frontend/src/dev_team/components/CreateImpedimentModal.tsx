import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Send, Target, Loader2, Edit2, Trash2, Save, User, Calendar, CheckCircle, Clock } from 'lucide-react';

interface UserStory {
  id: string;
  title: string;
}

interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface BlocageData {
  id?: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  status?: 'pending' | 'resolved';
  task?: string | UserStory | null;
  reported_by?: number | User | null;
  reported_at?: string;
}

interface CreateImpedimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  apiBaseUrl?: string;
  mode?: 'create' | 'edit' | 'view';
  blocageData?: BlocageData | null;
}

const CreateImpedimentModal: React.FC<CreateImpedimentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  apiBaseUrl = 'http://localhost:8000/api',
  mode = 'create',
  blocageData = null
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'critical'>('moderate');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Initialiser les données quand le modal s'ouvre ou quand les données changent
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      if (blocageData && (mode === 'edit' || mode === 'view')) {
        setTitle(blocageData.title || '');
        setDescription(blocageData.description || '');
        setSeverity(blocageData.severity || 'moderate');
        
        // Gérer les tâches selon le type (ID ou objet)
        if (blocageData.task) {
          if (typeof blocageData.task === 'string') {
            setSelectedTaskId(blocageData.task);
          } else if (typeof blocageData.task === 'object' && blocageData.task.id) {
            setSelectedTaskId(blocageData.task.id);
          }
        } else {
          setSelectedTaskId('');
        }
      } else {
        resetForm();
      }
      fetchUserStories();
      getCurrentUser();
    }
  }, [isOpen, mode, blocageData]);

  // Fonction pour récupérer l'utilisateur actuel depuis l'API
  const getCurrentUser = async () => {
    setIsLoadingUser(true);
    setError('');
    
    try {
      const accessToken = localStorage?.getItem('access_token');
      
      if (!accessToken) {
        console.error('Token d\'accès non trouvé');
        setError('Session expirée. Veuillez vous reconnecter.');
        setIsLoadingUser(false);
        return;
      }

      // Tentative 1: Récupérer l'utilisateur depuis l'endpoint auth/user
      try {
        const response = await fetch(`${apiBaseUrl}/auth/user/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Données utilisateur récupérées depuis /auth/user/:', userData);
          
          setCurrentUser({
            id: userData.id,
            username: userData.username,
            name: userData.first_name && userData.last_name 
              ? `${userData.first_name} ${userData.last_name}` 
              : userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name
          });
          setIsLoadingUser(false);
          return;
        }
      } catch (authError) {
        console.log('Endpoint /auth/user/ non disponible, tentative de fallback...');
      }

      // Tentative 2: Fallback avec décodage du token JWT
      const userId = getUserIdFromToken(accessToken);
      if (userId) {
        try {
          const userResponse = await fetch(`${apiBaseUrl}/users/${userId}/`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('Données utilisateur récupérées depuis /users/:', userData);
            
            setCurrentUser({
              id: userData.id,
              username: userData.username,
              name: userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : userData.username,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name
            });
            setIsLoadingUser(false);
            return;
          }
        } catch (userError) {
          console.log('Endpoint /users/ non disponible, utilisation des données du token...');
        }

        // Tentative 3: Utiliser les données du token uniquement
        setCurrentUser({
          id: userId,
          username: `user_${userId}`,
          name: `Utilisateur ${userId}`,
          email: '',
          first_name: '',
          last_name: ''
        });
        console.log('Utilisateur créé à partir du token:', { id: userId });
        setIsLoadingUser(false);
        return;
      }

      // Si tout échoue
      console.error('Impossible de récupérer ou décoder les informations utilisateur');
      setError('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      setError('Erreur de connexion lors de la récupération des données utilisateur');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const getUserIdFromToken = (token: string): number | null => {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.user_id || payload.sub || payload.id;
      return userId ? parseInt(userId.toString()) : null;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };

  const fetchUserStories = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage?.getItem('access_token');
      
      if (!accessToken) {
        console.error('Token d\'accès non trouvé pour récupérer les user stories');
        return;
      }

      const response = await fetch(`${apiBaseUrl}/userstories/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStories(data.results || data);
        console.log('User stories récupérées:', data.results || data);
      } else {
        console.error('Erreur lors de la récupération des user stories:', response.status);
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        }
      }
    } catch (error) {
      console.error('Erreur réseau lors de la récupération des user stories:', error);
    } finally {
      setIsLoading(false);
    }
  };


// Dans CreateImpedimentModal.tsx, modifiez la fonction handleCreate :

const handleCreate = async () => {
  if (!title.trim() || !description.trim()) {
    setError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (!currentUser) {
    setError('Utilisateur non identifié. Veuillez vous reconnecter.');
    return;
  }

  setIsSubmitting(true);
  setError('');

  try {
    const accessToken = localStorage?.getItem('access_token');
    
    if (!accessToken) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const newBlocageData = {
      title: title.trim(),
      description: description.trim(),
      severity,
      status: 'pending',
      task_id: selectedTaskId || null,  // Changé de 'task' à 'task_id'
      reported_by_id: currentUser.id,   // Changé de 'reported_by' à 'reported_by_id'
    };

    console.log('Données envoyées pour création:', newBlocageData);

    const response = await fetch(`${apiBaseUrl}/blocages/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBlocageData),
    });

    if (response.ok) {
      const createdBlocage = await response.json();
      console.log('Blocage créé avec succès:', createdBlocage);
      
      resetForm();
      onSubmit(true);
      onClose();
    } else {
      const errorData = await response.json();
      console.error('Erreur API lors de la création:', errorData);
      
      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (response.status === 400) {
        setError(errorData.detail || errorData.message || 'Données invalides. Vérifiez les champs.');
      } else {
        setError(errorData.detail || errorData.message || 'Erreur lors de la création du blocage');
      }
      onSubmit(false);
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    setError('Erreur de connexion. Veuillez réessayer.');
    onSubmit(false);
  } finally {
    setIsSubmitting(false);
  }
};

// Et modifiez également la fonction handleUpdate :

const handleUpdate = async () => {
  if (!title.trim() || !description.trim() || !blocageData?.id) {
    setError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (!currentUser) {
    setError('Utilisateur non identifié. Veuillez vous reconnecter.');
    return;
  }

  setIsSubmitting(true);
  setError('');

  try {
    const accessToken = localStorage?.getItem('access_token');
    
    if (!accessToken) {
      setError('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    // Préserver l'utilisateur qui a signalé le blocage originalement
    const reportedById = typeof blocageData.reported_by === 'object' && blocageData.reported_by !== null
      ? (blocageData.reported_by as User).id
      : (blocageData.reported_by as number) || currentUser.id;

    const updatedBlocageData = {
      title: title.trim(),
      description: description.trim(),
      severity,
      status: blocageData.status || 'pending',
      task_id: selectedTaskId || null,    // Changé de 'task' à 'task_id'
      reported_by_id: reportedById,       // Changé de 'reported_by' à 'reported_by_id'
    };

    console.log('Données envoyées pour modification:', updatedBlocageData);

    const response = await fetch(`${apiBaseUrl}/blocages/${blocageData.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedBlocageData),
    });

    if (response.ok) {
      const updatedBlocage = await response.json();
      console.log('Blocage modifié avec succès:', updatedBlocage);
      
      onSubmit(true);
      onClose();
    } else {
      const errorData = await response.json();
      console.error('Erreur API lors de la modification:', errorData);
      
      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (response.status === 400) {
        setError(errorData.detail || errorData.message || 'Données invalides. Vérifiez les champs.');
      } else {
        setError(errorData.detail || errorData.message || 'Erreur lors de la modification du blocage');
      }
      onSubmit(false);
    }
  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    setError('Erreur de connexion. Veuillez réessayer.');
    onSubmit(false);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmit = () => {
    if (currentMode === 'create') {
      handleCreate();
    } else if (currentMode === 'edit') {
      handleUpdate();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('moderate');
    setSelectedTaskId('');
    setError('');
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchToEditMode = () => {
    setCurrentMode('edit');
    setError('');
  };

  // Fonction pour obtenir les informations de l'utilisateur qui a signalé le blocage
  const getReportedByUser = (): User | null => {
    if (currentMode === 'create') {
      return currentUser;
    }
    
    if (blocageData?.reported_by) {
      if (typeof blocageData.reported_by === 'object' && blocageData.reported_by !== null) {
        return blocageData.reported_by as User;
      } else {
        // Si c'est juste un ID, on retourne l'utilisateur actuel par défaut
        return currentUser;
      }
    }
    
    return currentUser;
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour obtenir le nom de la user story sélectionnée
  const getSelectedUserStoryName = () => {
    if (!selectedTaskId) return null;
    
    if (currentMode !== 'create' && blocageData?.task && typeof blocageData.task === 'object') {
      return (blocageData.task as UserStory).title;
    }
    
    const selectedStory = userStories.find(story => story.id === selectedTaskId);
    return selectedStory?.title || null;
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'moderate': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'minor': return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'minor': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'moderate': return 'Modéré';
      case 'minor': return 'Mineur';
      default: return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Résolu';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case 'create': return 'Créer un Nouveau Blocage';
      case 'edit': return 'Modifier le Blocage';
      case 'view': return 'Détails du Blocage';
      default: return 'Gestion du Blocage';
    }
  };

  const isReadOnly = currentMode === 'view';
  const canEdit = currentMode !== 'create' && blocageData?.id;
  const canDelete = currentMode !== 'create' && blocageData?.id;
  const reportedByUser = getReportedByUser();
  const selectedUserStoryName = getSelectedUserStoryName();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-poppins font-semibold text-secondary-2 dark:text-white">
              {getModalTitle()}
            </h2>
            {blocageData?.status && currentMode !== 'create' && (
              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blocageData.status)}`}>
                {blocageData.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : <Clock className="w-3 h-3 mr-1 inline" />}
                {getStatusLabel(blocageData.status)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Boutons d'action dans l'en-tête */}
            {currentMode === 'view' && canEdit && (
              <button
                onClick={switchToEditMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                title="Modifier"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400"
                disabled={isDeleting}
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting || isDeleting}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>  
        </div>

        <div className="p-6 space-y-6">
          {/* Info utilisateur et métadonnées */}
          <div className="space-y-3">
            {/* Utilisateur */}
            {isLoadingUser ? (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement des informations utilisateur...
                </div>
              </div>
            ) : reportedByUser ? (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Signalé par:</span>
                    <strong className="ml-1 text-gray-900 dark:text-white">
                      {reportedByUser.name || reportedByUser.username}
                    </strong>
                    {reportedByUser.email && (
                      <span className="text-xs text-gray-500 ml-2">({reportedByUser.email})</span>
                    )}
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    ID: {reportedByUser.id}
                  </span>
                </div>
              </div>
            ) : !isLoadingUser && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Impossible de récupérer les informations utilisateur
                </div>
              </div>
            )}

            {/* Date de création */}
            {blocageData?.reported_at && currentMode !== 'create' && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Créé le:</span>
                  <strong className="ml-1 text-gray-900 dark:text-white">
                    {formatDate(blocageData.reported_at)}
                  </strong>
                </div>
              </div>
            )}

            {/* Gravité (en mode vue) */}
            {currentMode === 'view' && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gravité:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBadgeColor(severity)}`}>
                  {getSeverityLabel(severity)}
                </span>
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              Titre du blocage <span className="text-red-500">*</span>
            </label>
            {isReadOnly ? (
              <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                {title}
              </div>
            ) : (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Problème d'accès à l'API externe"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                required
                disabled={isSubmitting}
                maxLength={255}
              />
            )}
          </div>

          {/* Task Selection */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              User Story concernée (optionnel)
            </label>
            {isReadOnly ? (
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                  {selectedUserStoryName || 'Aucune user story sélectionnée'}
                </div>
              </div>
            ) : (
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isLoading}
                >
                  <option value="">Sélectionner une user story (optionnel)</option>
                  {userStories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            {isReadOnly ? (
              <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white min-h-[120px] whitespace-pre-wrap">
                {description}
              </div>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez précisément le problème rencontré, les étapes pour le reproduire, et l'impact sur votre travail..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                rows={5}
                required
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block font-medium mb-3 text-gray-900 dark:text-white">
              Gravité du blocage <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'minor', label: 'Mineur', desc: 'N\'empêche pas de continuer le travail' },
                { value: 'moderate', label: 'Modéré', desc: 'Ralentit significativement le travail' },
                { value: 'critical', label: 'Critique', desc: 'Bloque complètement le travail' }
              ].map((option) => (
                <label key={option.value} className={`flex items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    value={option.value}
                    checked={severity === option.value}
                    onChange={(e) => setSeverity(e.target.value as 'minor' | 'moderate' | 'critical')}
                    className="mr-3 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    disabled={isSubmitting || isReadOnly}
                  />
                  <div className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                    severity === option.value ? getSeverityColor(option.value) : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  } ${isReadOnly ? 'opacity-75' : ''}`}>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm opacity-75">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {/* Bouton de suppression à gauche */}
              {canDelete && currentMode !== 'view' && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                disabled={isSubmitting || isDeleting}
              >
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </button>
              
              {currentMode === 'view' && canEdit ? (
                <button
                  type="button"
                  onClick={switchToEditMode}
                  className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              ) : !isReadOnly && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !currentUser || isLoadingUser || !title.trim() || !description.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : currentMode === 'edit' ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting 
                    ? (currentMode === 'edit' ? 'Modification...' : 'Création...') 
                    : (currentMode === 'edit' ? 'Sauvegarder' : 'Créer le Blocage')
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmer la suppression
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer ce blocage ? Cette action est irréversible.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <div className="font-medium">Blocage: {title}</div>
                    <div className="text-xs mt-1">ID: {blocageData?.id}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateImpedimentModal;