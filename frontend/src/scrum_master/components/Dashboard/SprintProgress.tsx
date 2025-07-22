import React from 'react';
import { Calendar, Target } from 'lucide-react';

const SprintProgress: React.FC = () => {
  const currentSprint = {
    name: 'Sprint 23 - Q1 2025',
    startDate: '2025-01-06',
    endDate: '2025-01-20',
    progress: 65,
    completedStories: 8,
    totalStories: 12,
    remainingDays: 5
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Sprint Actuel</h3>
        <Calendar className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-secondary-2 dark:text-dark-text mb-2">{currentSprint.name}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{currentSprint.startDate}</span>
            <span>→</span>
            <span>{currentSprint.endDate}</span>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">
              {currentSprint.remainingDays} jours restants
            </span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentSprint.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${currentSprint.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Stories complétées</span>
          </div>
          <span className="font-semibold text-secondary-2 dark:text-dark-text">
            {currentSprint.completedStories}/{currentSprint.totalStories}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SprintProgress;