import React from 'react';
import { Calendar, Users, AlertCircle, TrendingUp } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  team: string;
  members: number;
  startDate: string;
  endDate: string;
  priority: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Planification': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Tests': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Terminé': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Haute': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Moyenne': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default: return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-secondary-2 dark:text-dark-text text-lg">{project.name}</h3>
        <div className="flex items-center space-x-2">
          {getPriorityIcon(project.priority)}
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{project.team} • {project.members} membres</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{new Date(project.startDate).toLocaleDateString('fr-FR')} - {new Date(project.endDate).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</span>
          <span className="text-sm font-medium text-secondary-2 dark:text-dark-text">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button className="w-full bg-cards dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-gray-600 text-secondary-2 dark:text-dark-text py-2 rounded-lg transition-colors font-medium">
          Voir les détails
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;