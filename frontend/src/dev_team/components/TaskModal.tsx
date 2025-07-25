import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  MessageCircle, 
  Send,
  History
} from 'lucide-react';
import CommentSection from './CommentSection';

// Types basés sur votre API
interface UserStory {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  status: 'todo' | 'in_progress' | 'testing' | 'done';
  created_at: string;
  updated_at: string;
  epic: number;
  sprint: number | null;
  assignee: number[];
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  mentions: string[];
}

interface TaskModalProps {
  task: UserStory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: number, updates: Partial<UserStory>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [status, setStatus] = useState(task.status);
  const [statusComment, setStatusComment] = useState('');

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as 'todo' | 'in_progress' | 'testing' | 'done');
    
    // Sauvegarder le changement de statut
    await onSave(task.id, {
      status: newStatus as 'todo' | 'in_progress' | 'testing' | 'done'
    });

    // Si un commentaire est ajouté, on peut l'enregistrer séparément
    if (statusComment.trim()) {
      // Ici vous pouvez ajouter la logique pour sauvegarder le commentaire
      // dans votre système de commentaires
      setStatusComment('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'À Faire';
      case 'in_progress': return 'En Cours';
      case 'testing': return 'En Test';
      case 'done': return 'Terminé';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-poppins font-semibold text-secondary-2 dark:text-white">
                  {task.title}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Sprint {task.sprint || 'Non assigné'}
                </span>
                <span>{task.points} points</span>
                <span>Epic #{task.epic}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-poppins font-medium mb-2 text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 font-open-sans">{task.description}</p>
          </div>

          {/* Informations de création/modification */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Créé le :</span>
                <p className="text-gray-600 dark:text-gray-300">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Modifié le :</span>
                <p className="text-gray-600 dark:text-gray-300">{formatDate(task.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-cards dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-poppins font-medium mb-3 text-gray-900 dark:text-white">Mise à jour du statut</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange('todo')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    status === 'todo' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  À Faire
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    status === 'in_progress' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  En Cours
                </button>
                <button
                  onClick={() => handleStatusChange('testing')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    status === 'testing' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  En Test
                </button>
                <button
                  onClick={() => handleStatusChange('done')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    status === 'done' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Terminé
                </button>
              </div>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Commentaire optionnel sur le changement de statut..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
              />
            </div>
          </div>

          {/* Statut actuel */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-poppins font-medium mb-2 text-gray-900 dark:text-white">Statut actuel</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'todo' ? 'bg-gray-500 text-white' :
                status === 'in_progress' ? 'bg-blue-500 text-white' :
                status === 'testing' ? 'bg-yellow-500 text-white' :
                'bg-green-500 text-white'
              }`}>
                {getStatusLabel(status)}
              </span>
            </div>
          </div>

          {/* Comments */}
          {task.comments && (
            <CommentSection 
              comments={task.comments}
              onAddComment={(content) => {
                const newComment: Comment = {
                  id: Date.now().toString(),
                  content,
                  author: {
                    id: 1, // À remplacer par l'ID de l'utilisateur connecté
                    name: 'Utilisateur actuel', // À remplacer par le nom de l'utilisateur connecté
                    avatar: '/default-avatar.png' // À remplacer par l'avatar de l'utilisateur connecté
                  },
                  createdAt: new Date(),
                  mentions: content.match(/@\w+/g) || []
                };
                
                const updatedComments = [...(task.comments || []), newComment];
                // Ici vous devriez sauvegarder les commentaires via votre API
                // Pour l'instant, on met à jour localement
                onSave(task.id, {
                  comments: updatedComments
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;