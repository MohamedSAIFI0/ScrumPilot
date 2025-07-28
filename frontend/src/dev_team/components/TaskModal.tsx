import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  MessageCircle, 
  Send,
  History,
  User,
  Users
} from 'lucide-react';
import CommentSection from './CommentSection';

// Interfaces corrigées basées sur votre API
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

interface UserStory {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  status: 'todo' | 'in_progress' | 'testing' | 'done';
  created_at: string;
  updated_at: string;
  epic: Epic; // Objet complet Epic
  sprint: Sprint | null; // Objet complet Sprint ou null
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

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team: string;
  avatar: string;
  createdAt: string;
  lastLogin: string | null;
}

interface TaskModalProps {
  task: UserStory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: number, updates: Partial<UserStory>) => void;
  currentUser: User;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, currentUser }) => {
  const [status, setStatus] = useState(task.status);
  const [statusComment, setStatusComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      setStatus(newStatus as 'todo' | 'in_progress' | 'testing' | 'done');
      
      console.log(`🔄 Changing status from ${task.status} to ${newStatus}`);
      
      // Sauvegarder le changement de statut
      await onSave(task.id, {
        status: newStatus as 'todo' | 'in_progress' | 'testing' | 'done'
      });

      // Si un commentaire est ajouté, on peut l'enregistrer séparément
      if (statusComment.trim()) {
        // TODO: Ajouter la logique pour sauvegarder le commentaire
        console.log('💬 Status comment:', statusComment);
        setStatusComment('');
      }
      
      console.log(`✅ Status changed successfully to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error changing status:', error);
      // Remettre l'ancien statut en cas d'erreur
      setStatus(task.status);
    } finally {
      setIsUpdating(false);
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

  // Fonctions helper pour éviter les erreurs de rendu
  const getSprintInfo = () => {
    if (!task.sprint) {
      return {
        name: 'Non assigné',
        displayInfo: null
      };
    }
    return {
      name: task.sprint.name,
      displayInfo: task.sprint
    };
  };

  const getEpicInfo = () => {
    if (!task.epic) {
      return {
        name: 'Non assigné',
        id: 'N/A',
        displayInfo: null
      };
    }
    return {
      name: task.epic.name,
      id: task.epic.id,
      displayInfo: task.epic
    };
  };

  const sprintInfo = getSprintInfo();
  const epicInfo = getEpicInfo();
  
  const isAssignedToCurrentUser = task.assignee.includes(currentUser.id);
  const isMultipleAssignees = task.assignee.length > 1;

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
                {isAssignedToCurrentUser && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Assigné à vous
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Sprint {sprintInfo.name}
                </span>
                <span>{task.points} points</span>
                <span>Epic #{epicInfo.name}</span>
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
          {/* Informations d'assignation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-poppins font-medium mb-3 text-gray-900 dark:text-white flex items-center">
              {isMultipleAssignees ? <Users className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
              Assignation ({task.assignee.length} {task.assignee.length > 1 ? 'développeurs' : 'développeur'})
            </h3>
            <div className="space-y-2">
              {isAssignedToCurrentUser && (
                <div className="flex items-center justify-between bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        {currentUser.name} (Vous)
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-300">
                        {currentUser.team} - {currentUser.role}
                      </div>
                    </div>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                    ✓ Assigné
                  </span>
                </div>
              )}
              {isMultipleAssignees && (
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                  <div className="text-orange-800 dark:text-orange-200 text-sm">
                    📝 Cette tâche est également assignée à {task.assignee.length - 1} autre{task.assignee.length > 2 ? 's' : ''} développeur{task.assignee.length > 2 ? 's' : ''}
                    <br />
                    <span className="text-xs text-orange-600 dark:text-orange-300">
                      IDs: {task.assignee.filter(id => id !== currentUser.id).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations Sprint et Epic détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sprint Info */}
            {sprintInfo.displayInfo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-poppins font-medium mb-2 text-gray-900 dark:text-white">Sprint</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nom:</span> {sprintInfo.displayInfo.name}</p>
                  <p><span className="font-medium">Objectif:</span> {sprintInfo.displayInfo.goal}</p>
                  <p><span className="font-medium">Statut:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      sprintInfo.displayInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sprintInfo.displayInfo.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Durée:</span> {sprintInfo.displayInfo.duration} jours</p>
                  <p><span className="font-medium">Du:</span> {new Date(sprintInfo.displayInfo.start_date).toLocaleDateString('fr-FR')} 
                     <span className="font-medium"> au:</span> {new Date(sprintInfo.displayInfo.end_date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )}

            {/* Epic Info */}
            {epicInfo.displayInfo && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-poppins font-medium mb-2 text-gray-900 dark:text-white">Epic</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nom:</span> {epicInfo.displayInfo.name}</p>
                  <p><span className="font-medium">Description:</span> {epicInfo.displayInfo.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Couleur:</span>
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: epicInfo.displayInfo.color }}
                    ></div>
                    <span className="text-xs text-gray-600">{epicInfo.displayInfo.color}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Créé le {formatDate(epicInfo.displayInfo.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Si pas de Sprint ou Epic */}
          {(!sprintInfo.displayInfo || !epicInfo.displayInfo) && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-poppins font-medium mb-2 text-gray-900 dark:text-white">Informations manquantes</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {!sprintInfo.displayInfo && <p>• Cette tâche n'est assignée à aucun sprint</p>}
                {!epicInfo.displayInfo && <p>• Cette tâche n'est liée à aucun epic</p>}
              </div>
            </div>
          )}

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

          {/* Status Update - Seulement si assigné à l'utilisateur */}
          {isAssignedToCurrentUser && (
            <div className="bg-cards dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-poppins font-medium mb-3 text-gray-900 dark:text-white">
                Mise à jour du statut
                {isUpdating && <span className="ml-2 text-sm text-blue-600">⏳ Mise à jour...</span>}
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange('todo')}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      status === 'todo' 
                        ? 'bg-gray-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    À Faire
                  </button>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      status === 'in_progress' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    En Cours
                  </button>
                  <button
                    onClick={() => handleStatusChange('testing')}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      status === 'testing' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    En Test
                  </button>
                  <button
                    onClick={() => handleStatusChange('done')}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  disabled={isUpdating}
                />
              </div>
            </div>
          )}

          {/* Message si non assigné */}
          {!isAssignedToCurrentUser && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium">Tâche non assignée à vous</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Vous pouvez consulter cette tâche mais vous ne pouvez pas modifier son statut car elle n'est pas assignée à votre compte.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {isAssignedToCurrentUser && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  (Vous pouvez modifier ce statut)
                </span>
              )}
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
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar || '/default-avatar.png'
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