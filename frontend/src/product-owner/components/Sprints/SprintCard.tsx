import React from 'react';
import { Calendar, Target, Users, Edit, CheckCircle2, Clock } from 'lucide-react';
import { Sprint, UserStory } from '../../contexts/ScrumContext';
import { useScrum } from '../../contexts/ScrumContext';

interface SprintCardProps {
  sprint: Sprint;
  userStories: UserStory[];
  onEdit: () => void;
}

export default function SprintCard({ sprint, userStories, onEdit }: SprintCardProps) {
  const { state } = useScrum();
  const sprintStories = userStories.filter(story => story.sprintId === sprint.id);
  const completedStories = sprintStories.filter(story => story.status === 'Done');
  const totalPoints = sprintStories.reduce((sum, story) => sum + story.points, 0);
  const completedPoints = completedStories.reduce((sum, story) => sum + story.points, 0);
  
  const progress = sprintStories.length > 0 ? (completedStories.length / sprintStories.length) * 100 : 0;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'planned': return <Calendar className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border transition-all ${
      state.darkMode 
        ? 'bg-dark-card border-gray-700 hover:bg-gray-700' 
        : 'bg-white border-gray-100 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-lg font-semibold font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              {sprint.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(sprint.status)}`}>
              {getStatusIcon(sprint.status)}
              <span className="capitalize">{sprint.status === 'active' ? 'Actif' : sprint.status === 'planned' ? 'Planifié' : 'Terminé'}</span>
            </span>
          </div>
          <p className={`text-sm mb-3 font-open-sans ${
            state.darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {sprint.goal}
          </p>
        </div>
        
        <button
          onClick={onEdit}
          className={`p-2 transition-colors ${
            state.darkMode 
              ? 'text-gray-400 hover:text-blue-400' 
              : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center justify-between text-sm font-open-sans ${
          state.darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              {sprintStories.length}
            </div>
            <div className={`text-sm font-open-sans ${
              state.darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Stories
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              {totalPoints}
            </div>
            <div className={`text-sm font-open-sans ${
              state.darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Points
            </div>
          </div>
        </div>

        <div>
          <div className={`flex items-center justify-between text-sm mb-2 font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            state.darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="bg-button h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className={`flex items-center justify-between text-sm font-open-sans ${
          state.darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{completedStories.length} terminées</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-blue-600" />
            <span>{completedPoints}/{totalPoints} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}