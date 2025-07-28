import React from 'react';
import { Clock, MessageCircle, User, Users } from 'lucide-react';

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
  epic: Epic; // ✅ Objet complet
  sprint: Sprint | null; // ✅ Objet complet ou null
  assignee: number[];
  comments?: Comment[];
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

interface TaskCardProps {
  task: UserStory;
  onClick: () => void;
  currentUser: User | null;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, currentUser }) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Fonctions helper pour éviter les erreurs de rendu
  const getEpicName = () => {
    return task.epic && task.epic.name ? task.epic.name : 'Aucun epic';
  };

  const getEpicId = () => {
    return task.epic && task.epic.id ? task.epic.id : 'N/A';
  };

  const getEpicColor = () => {
    return task.epic && task.epic.color ? task.epic.color : '#6B7280';
  };

  const getSprintName = () => {
    return task.sprint && task.sprint.name ? task.sprint.name : 'Backlog';
  };

  const isAssignedToCurrentUser = currentUser ? task.assignee.includes(currentUser.id) : false;
  const isMultipleAssignees = task.assignee.length > 1;

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isAssignedToCurrentUser 
          ? 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-poppins font-medium text-secondary-2 dark:text-white text-sm leading-tight flex-1 pr-2">
          {task.title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} flex-shrink-0`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-open-sans">
        {task.description}
      </p>

      {/* Points d'histoire et Epic */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
          {task.points} pts
        </span>
        
        {/* Epic avec couleur et nom */}
        <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getEpicColor() }}
          ></div>
          <span>
            {getEpicName()} (#{getEpicId()})
          </span>
        </div>
      </div>

      {/* Assignation info */}
      {isAssignedToCurrentUser && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
              ✓ Assigné à vous
            </div>
            {isMultipleAssignees && (
              <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full font-medium">
                +{task.assignee.length - 1} autres
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
          {task.comments && (
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs">
              {getSprintName()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Affichage du nombre d'assignés */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {isMultipleAssignees ? (
              <Users className="w-4 h-4 mr-1" />
            ) : (
              <User className="w-4 h-4 mr-1" />
            )}
            <span>{task.assignee.length}</span>
          </div>
          
          {/* Date de dernière mise à jour */}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(task.updated_at)}
          </span>
        </div>
      </div>

      {/* Indicateur visuel si la tâche est assignée à l'utilisateur actuel */}
      {isAssignedToCurrentUser && (
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              👤 {currentUser?.name}
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              Équipe: {currentUser?.team}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;