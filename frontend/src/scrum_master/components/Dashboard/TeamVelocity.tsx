import React from 'react';
import { BarChart3 } from 'lucide-react';

const TeamVelocity: React.FC = () => {
  const velocityData = [
    { sprint: 'Sprint 19', points: 23 },
    { sprint: 'Sprint 20', points: 28 },
    { sprint: 'Sprint 21', points: 25 },
    { sprint: 'Sprint 22', points: 32 },
    { sprint: 'Sprint 23', points: 19 } // En cours
  ];

  const maxPoints = Math.max(...velocityData.map(d => d.points));
  const avgVelocity = Math.round(velocityData.slice(0, -1).reduce((sum, d) => sum + d.points, 0) / 4);

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Vélocité de l'Équipe</h3>
        <BarChart3 className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Vélocité moyenne</span>
          <span className="font-semibold text-primary">{avgVelocity} points</span>
        </div>
        
        <div className="space-y-3">
          {velocityData.map((data, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                {data.sprint.replace('Sprint ', 'S')}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === velocityData.length - 1 ? 'bg-orange-500' : 'bg-button'
                  }`}
                  style={{ width: `${(data.points / maxPoints) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-secondary-2 dark:text-dark-text w-12">
                {data.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamVelocity;