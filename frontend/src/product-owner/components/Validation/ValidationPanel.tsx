import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, MessageCircle, User, Calendar, Tag } from 'lucide-react';

// Types pour les données de l'API
interface Epic {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  projet: number;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: string;
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
  created_at: string;
  updated_at: string;
  project: number;
  created_by: number;
}

interface UserStoryAPI {
  id: number;
  epic: Epic;
  sprint: Sprint;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'ready' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked';
  created_at: string;
  updated_at: string;
  assignee: number[];
}

interface ValidationCardProps {
  story: UserStoryAPI;
  readonly?: boolean;
  onValidate?: (storyId: number) => void;
  onReject?: (storyId: number, reason: string) => void;
}

// Composant ValidationCard
function ValidationCard({ story, readonly = false, onValidate, onReject }: ValidationCardProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [darkMode] = useState(false); // Vous pouvez connecter cela à votre contexte

  const handleValidate = () => {
    if (onValidate) {
      onValidate(story.id);
    }
  };

  const handleReject = () => {
    if (comment.trim() && onReject) {
      onReject(story.id, comment);
      setComment('');
      setShowCommentForm(false);
    } else {
      setShowCommentForm(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    return darkMode 
      ? 'border-yellow-600 bg-yellow-900/20' 
      : 'border-yellow-200 bg-yellow-50';
  };

  const statusBadge = 'bg-yellow-100 text-yellow-800';

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {story.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
              En attente
            </span>
          </div>
          
          <p className={`mb-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {story.description}
          </p>
          
          <div className="flex items-center space-x-4 mb-4 flex-wrap gap-2">
            <div className={`flex items-center space-x-1 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="font-medium">Points:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {story.points}
              </span>
            </div>
            
            <div className={`flex items-center space-x-1 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Tag className="w-4 h-4" />
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(story.priority)}`}>
                {story.priority === 'high' ? 'Haute' : story.priority === 'medium' ? 'Moyenne' : 'Faible'}
              </span>
            </div>
            
            <div className={`flex items-center space-x-1 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Calendar className="w-4 h-4" />
              <span>Epic: {story.epic.name}</span>
            </div>

            <div className={`flex items-center space-x-1 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Sprint: {story.sprint.name}</span>
            </div>
            
            {story.assignee.length > 0 && (
              <div className={`flex items-center space-x-1 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <User className="w-4 h-4" />
                <span>{story.assignee.length} assigné(s)</span>
              </div>
            )}
          </div>

          <div className={`text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Créé le: {new Date(story.created_at).toLocaleDateString('fr-FR')}
            {story.updated_at !== story.created_at && (
              <span className="ml-2">
                • Modifié le: {new Date(story.updated_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        {!readonly && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidate}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider</span>
            </button>
            <button
              onClick={handleReject}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
          </div>
        )}
      </div>

      {showCommentForm && (
        <div className={`mt-4 p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Motif du rejet
          </h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Expliquez pourquoi cette tâche est rejetée..."
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setShowCommentForm(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                darkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant principal ValidationPanel
export default function ValidationPanel() {
  const [userStories, setUserStories] = useState<UserStoryAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode] = useState(false); // Vous pouvez connecter cela à votre contexte

  // Fonction pour récupérer les user stories
  const fetchUserStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/userstories/');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setUserStories(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des user stories:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchUserStories();
  }, []);

  // Filtrer les stories avec le statut "done"
  const completedStories = userStories.filter(story => story.status === 'done');

  // Fonction de validation
  const handleValidate = async (storyId: number) => {
    try {
      // Ici vous pouvez ajouter l'appel API pour valider la story
      console.log('Validation de la story:', storyId);
      
      // Simuler une validation réussie
      // Dans un cas réel, vous feriez un appel API pour marquer comme validé
      alert(`Story ${storyId} validée avec succès!`);
      
      // Recharger les données
      await fetchUserStories();
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation');
    }
  };

  // Fonction de rejet
  const handleReject = async (storyId: number, reason: string) => {
    try {
      // Ici vous pouvez ajouter l'appel API pour rejeter la story
      console.log('Rejet de la story:', storyId, 'Raison:', reason);
      
      // Simuler un rejet réussi
      // Dans un cas réel, vous feriez un appel API pour marquer comme rejeté et changer le statut
      alert(`Story ${storyId} rejetée: ${reason}`);
      
      // Recharger les données
      await fetchUserStories();
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
      alert('Erreur lors du rejet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des user stories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Erreur: {error}</span>
        </div>
        <button 
          onClick={fetchUserStories}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Validation des Tâches
        </h2>
        <p className={`${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Validez ou rejetez les tâches terminées
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 shadow-sm border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                En attente
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {completedStories.length} tâche(s)
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-sm border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Validées
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                0 tâche(s)
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-sm border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Rejetées
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                0 tâche(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tâches terminées à valider */}
      {completedStories.length > 0 ? (
        <div>
          <h3 className={`text-lg font-medium mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Tâches à valider ({completedStories.length})
          </h3>
          <div className="space-y-4">
            {completedStories.map(story => (
              <ValidationCard 
                key={story.id} 
                story={story} 
                onValidate={handleValidate}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-12 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        } rounded-lg`}>
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-300'
          }`} />
          <h3 className={`text-lg font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Aucune tâche à valider
          </h3>
          <p className={`${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Les tâches terminées apparaîtront ici pour validation
          </p>
        </div>
      )}

      {/* Bouton de rafraîchissement */}
      <div className="flex justify-center">
        <button
          onClick={fetchUserStories}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>
    </div>
  );
}