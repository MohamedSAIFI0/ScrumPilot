import React from 'react';
import { Clock, MessageCircle, User } from 'lucide-react';

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

interface TaskCardProps {
  task: UserStory;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-poppins font-medium text-secondary-2 dark:text-white text-sm leading-tight">
          {task.title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-open-sans">
        {task.description}
      </p>

      {/* Points d'histoire */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
          {task.points} pts
        </span>
        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
          Epic #{task.epic}
        </span>
      </div>

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
              {task.sprint ? `Sprint ${task.sprint}` : 'Backlog'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Affichage du nombre d'assignés */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <User className="w-4 h-4 mr-1" />
            <span>{task.assignee.length}</span>
          </div>
          
          {/* Date de dernière mise à jour */}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(task.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;