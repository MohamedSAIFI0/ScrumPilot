import React from 'react';
import { User, MessageCircle, Clock, Tag } from 'lucide-react';
import { useScrum } from '../../contexts/ScrumContext';

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
  status: 'active' | 'completed' | 'planned' | 'cancelled';
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

interface TaskCardProps {
  story: UserStory;
}

export default function TaskCard({ story }: TaskCardProps) {
  const { state } = useScrum();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-purple-100 text-purple-800';
      case 'testing': return 'bg-orange-100 text-orange-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt';
      case 'in_progress': return 'En cours';
      case 'in_review': return 'En révision';
      case 'testing': return 'Test';
      case 'done': return 'Terminé';
      case 'blocked': return 'Bloqué';
      default: return status;
    }
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm border-l-4 ${getPriorityColor(story.priority)} transition-all cursor-grab active:cursor-grabbing ${
      state.darkMode 
        ? 'bg-dark-bg hover:bg-gray-700' 
        : 'bg-white hover:shadow-md'
    }`}>
      <div className="space-y-3">
        <div>
          <h4 className={`font-medium text-sm font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            {story.title}
          </h4>
          <p className={`text-xs mt-1 line-clamp-2 font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {story.description}
          </p>
        </div>

        {/* Epic info */}
        {story.epic && (
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3" style={{ color: story.epic.color }} />
            <span 
              className="text-xs font-medium"
              style={{ color: story.epic.color }}
            >
              {story.epic.name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Statut */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(story.status)}`}>
              {getStatusText(story.status)}
            </span>
            
            {/* Points */}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {story.points} pts
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Nombre d'assignés */}
            {story.assignee && story.assignee.length > 0 && (
              <div className={`flex items-center space-x-1 text-xs ${
                state.darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <User className="w-3 h-3" />
                <span>{story.assignee.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center justify-between text-xs ${
          state.darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <span className="capitalize font-medium">
            Priorité: {getPriorityText(story.priority)}
          </span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(story.updated_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}