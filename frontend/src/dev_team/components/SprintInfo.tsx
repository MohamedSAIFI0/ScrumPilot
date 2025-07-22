import React from 'react';
import { Sprint } from '../types';
import { Calendar, Target, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface SprintInfoProps {
  sprint: Sprint;
}

const SprintInfo: React.FC<SprintInfoProps> = ({ sprint }) => {
  const totalTasks = sprint.tasks.length;
  const completedTasks = sprint.tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = sprint.tasks.filter(task => task.status === 'inprogress').length;
  const todoTasks = sprint.tasks.filter(task => task.status === 'todo').length;
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(sprint.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-title font-poppins font-semibold text-secondary-2 mb-2">
          Sprint Actuel
        </h1>
        <p className="text-paragraph font-open-sans text-gray-600">
          Suivi et objectifs du sprint en cours
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-poppins font-semibold text-secondary-2 mb-2">
              {sprint.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Sprint terminé'}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sprint.status === 'active' ? 'bg-green-100 text-green-800' :
            sprint.status === 'planned' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {sprint.status === 'active' ? 'Actif' : 
             sprint.status === 'planned' ? 'Planifié' : 'Terminé'}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="font-poppins font-medium mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Objectif du Sprint
          </h3>
          <p className="text-gray-700 font-open-sans">{sprint.goal}</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Progression</span>
            <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} tâches</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {progress.toFixed(1)}% complété
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-cards p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">À Faire</p>
              <p className="text-2xl font-bold text-gray-700">{todoTasks}</p>
            </div>
            <Circle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-cards p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Cours</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgressTasks}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-cards p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Terminé</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-poppins font-medium mb-4">Événements du Sprint</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="font-medium">Daily Standup</span>
            </div>
            <span className="text-sm text-gray-600">Tous les jours à 9h00</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium">Sprint Review</span>
            </div>
            <span className="text-sm text-gray-600">{new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="font-medium">Sprint Retrospective</span>
            </div>
            <span className="text-sm text-gray-600">{new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintInfo;