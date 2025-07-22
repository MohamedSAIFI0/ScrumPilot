import React from 'react';
import { Folder, Users, Calendar } from 'lucide-react';

const ActiveProjects: React.FC = () => {
  const projects = [
    {
      name: 'E-Commerce Platform',
      team: 'Team Alpha',
      members: 8,
      deadline: '2025-03-15',
      progress: 75,
      status: 'En cours'
    },
    {
      name: 'Mobile App Redesign',
      team: 'Team Beta',
      members: 6,
      deadline: '2025-02-28',
      progress: 45,
      status: 'Planification'
    },
    {
      name: 'Data Analytics Dashboard',
      team: 'Team Gamma',
      members: 5,
      deadline: '2025-04-10',
      progress: 90,
      status: 'Tests'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Planification': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Tests': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Projets Actifs</h3>
        <Folder className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-secondary-2 dark:text-dark-text">{project.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{project.team} • {project.members} membres</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Progression</span>
                <span className="text-xs font-medium text-secondary-2 dark:text-dark-text">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveProjects;