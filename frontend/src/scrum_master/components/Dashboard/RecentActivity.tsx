import React from 'react';
import { Clock, GitCommit, MessageSquare, CheckCircle } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      type: 'commit',
      user: 'Sarah Benali',
      action: 'a mis à jour la story',
      target: 'Authentification utilisateur',
      time: 'Il y a 2 heures',
      icon: GitCommit,
      color: 'text-green-600'
    },
    {
      type: 'comment',
      user: 'Ahmed Tazi',
      action: 'a commenté sur',
      target: 'Interface utilisateur dashboard',
      time: 'Il y a 3 heures',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      type: 'complete',
      user: 'Fatima Bennani',
      action: 'a terminé la tâche',
      target: 'Tests unitaires API',
      time: 'Il y a 4 heures',
      icon: CheckCircle,
      color: 'text-primary'
    },
    {
      type: 'commit',
      user: 'Youssef El Amrani',
      action: 'a créé une nouvelle story',
      target: 'Gestion des notifications',
      time: 'Il y a 5 heures',
      icon: GitCommit,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Activité Récente</h3>
        <Clock className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
              <Icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm text-secondary-2 dark:text-dark-text">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                  {' '}
                  <span className="font-medium text-primary">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;