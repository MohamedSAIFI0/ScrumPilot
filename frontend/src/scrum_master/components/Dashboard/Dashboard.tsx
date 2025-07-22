import React from 'react';
import MetricsCards from './MetricsCards';
import RecentActivity from './RecentActivity';
import ActiveProjects from './ActiveProjects';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
      
      <MetricsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <ActiveProjects />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;