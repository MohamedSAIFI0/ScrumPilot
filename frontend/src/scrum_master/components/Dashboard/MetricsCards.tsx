import React from 'react';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MetricsCards: React.FC = () => {
  const metrics = [
    {
      title: 'Projets Actifs',
      value: '12',
      change: '+2 ce mois',
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      title: 'Sprints en Cours',
      value: '8',
      change: '4 se terminent cette semaine',
      icon: Clock,
      color: 'text-button'
    },
    {
      title: 'Stories Terminées',
      value: '47',
      change: '+15 cette semaine',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Bloqueurs',
      value: '3',
      change: '-2 depuis hier',
      icon: AlertTriangle,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-cards dark:bg-dark-card p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-secondary-2 dark:text-dark-text mb-1">{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{metric.change}</p>
              </div>
              <Icon className={`h-8 w-8 ${metric.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;