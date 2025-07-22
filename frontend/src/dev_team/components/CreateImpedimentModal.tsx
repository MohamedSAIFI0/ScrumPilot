import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Send, Target, Loader2 } from 'lucide-react';

interface UserStory {
  id: string;
  title: string;
}

interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
}

interface BlocageData {
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  status?: 'pending' | 'resolved';
  task?: string | null;
  reported_by?: string | null;
}

interface CreateImpedimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  apiBaseUrl?: string;
}

const CreateImpedimentModal: React.FC<CreateImpedimentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  apiBaseUrl = 'http://localhost:8000/api'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'critical'>('moderate');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Récupération des données au montage du composant
  useEffect(() => {
    if (isOpen) {
      fetchUserStories();
      getCurrentUser();
    }
  }, [isOpen]);

  // Fonction pour récupérer l'utilisateur actuel depuis le localStorage
  const getCurrentUser = () => {
    try {
      // Récupérer les données utilisateur depuis localStorage
      const userDataStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser({
          id: userData.id?.toString() || getUserIdFromToken(accessToken) || '2',
          username: userData.email || userData.name || 'bouchra',
          name: userData.name,
          email: userData.email
        });
        console.log('Utilisateur récupéré depuis localStorage:', userData);
        return;
      }

      // Si pas de données utilisateur, essayer de décoder le token
      if (accessToken) {
        const userId = getUserIdFromToken(accessToken);
        if (userId) {
          setCurrentUser({
            id: userId,
            username: 'bouchra',
            name: 'bouchra',
            email: 'bouchra@dxc.com'
          });
          console.log('Utilisateur récupéré depuis token JWT, ID:', userId);
          return;
        }
      }

      // Fallback: utilisateur par défaut
      setCurrentUser({
        id: '2',
        username: 'bouchra',
        name: 'bouchra',
        email: 'bouchra@dxc.com'
      });
      console.log('Utilisation des données utilisateur par défaut');
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      // Fallback en cas d'erreur
      setCurrentUser({
        id: '2',
        username: 'bouchra',
        name: 'bouchra',
        email: 'bouchra@dxc.com'
      });
    }
  };

  // Fonction utilitaire pour extraire l'ID utilisateur du token JWT
  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.user_id?.toString() || null;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };

  const fetchUserStories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/userstories/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStories(data.results || data);
      } else {
        console.error('Erreur lors de la récupération des user stories');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const blocageData: BlocageData = {
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'pending',
        task: selectedTaskId || null,
        reported_by: currentUser?.id || '2',
      };

      console.log('Données à envoyer:', blocageData);

      const response = await fetch(`${apiBaseUrl}/blocages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blocageData),
      });

      if (response.ok) {
        const createdBlocage = await response.json();
        console.log('Blocage créé:', createdBlocage);
        
        // Reset form
        resetForm();
        onSubmit(true);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        setError(errorData.detail || 'Erreur lors de la création du blocage');
        onSubmit(false);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
      onSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('moderate');
    setSelectedTaskId('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'moderate': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'minor': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-poppins font-semibold text-secondary-2 dark:text-white">
              Créer un Nouveau Blocage
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info utilisateur */}
          {currentUser && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Signalé par: <strong className="ml-1">{currentUser.name || currentUser.username}</strong>
                <span className="text-xs text-gray-500 ml-2">(ID: {currentUser.id})</span>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              Titre du blocage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Problème d'accès à l'API externe"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              required
              disabled={isSubmitting}
              maxLength={255}
            />
          </div>

          {/* Task Selection */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              User Story concernée (optionnel)
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2 text-gray-900 dark:text-white">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez précisément le problème rencontré, les étapes pour le reproduire, et l'impact sur votre travail..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              rows={5}
              required
              disabled={isSubmitting}
            />
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
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={severity === option.value}
                    onChange={(e) => setSeverity(e.target.value as 'minor' | 'moderate' | 'critical')}
                    className="mr-3 text-primary focus:ring-primary"
                    disabled={isSubmitting}
                  />
                  <div className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                    severity === option.value ? getSeverityColor(option.value) : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Création...' : 'Créer le Blocage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateImpedimentModal;