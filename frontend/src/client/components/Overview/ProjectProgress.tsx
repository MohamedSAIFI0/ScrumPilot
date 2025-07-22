import React from 'react';
import { Calendar, Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Project } from '../../types';

interface ProjectProgressProps {
  project: Project;
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ project }) => {
  const { currentSprint } = project;
  
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(currentSprint.endDate);
  
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Main Progress Card */}
      <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-6 lg:mb-8">
          <div className="flex-1">
            <h3 className="font-poppins font-semibold text-lg lg:text-xl xl:text-2xl text-secondary-2 mb-2 lg:mb-3 flex items-center">
              <TrendingUp className="mr-2 lg:mr-3 text-primary" size={24} />
              Avancement du Projet
            </h3>
            <p className="text-gray-600 font-open-sans text-sm lg:text-base xl:text-lg">
              Progression globale et métriques clés
            </p>
          </div>
          <div className="mt-4 xl:mt-0 xl:ml-6">
            <div className="text-right">
              <span className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primary">{project.progress}%</span>
              <p className="text-sm lg:text-base text-gray-600 font-open-sans">Complété</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-between items-center mb-2 lg:mb-3">
            <span className="font-open-sans text-secondary-2 text-sm lg:text-base">Progression globale</span>
            <span className="font-semibold text-primary text-sm lg:text-base">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 lg:h-5 xl:h-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${project.progress}%` }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
          <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-2 lg:mb-3">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <span className="font-bold text-xl lg:text-2xl xl:text-3xl text-green-700">
                {project.completedTasks}
              </span>
            </div>
            <p className="text-green-600 font-open-sans text-xs lg:text-sm xl:text-base font-medium">Tâches complétées</p>
          </div>
          
          <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-2 lg:mb-3">
              <Target className="text-blue-500 mr-2" size={20} />
              <span className="font-bold text-xl lg:text-2xl xl:text-3xl text-blue-700">
                {project.totalTasks}
              </span>
            </div>
            <p className="text-blue-600 font-open-sans text-xs lg:text-sm xl:text-base font-medium">Total tâches</p>
          </div>

          <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-2 lg:mb-3">
              <Clock className="text-purple-500 mr-2" size={20} />
              <span className="font-bold text-xl lg:text-2xl xl:text-3xl text-purple-700">
                {project.totalTasks - project.completedTasks}
              </span>
            </div>
            <p className="text-purple-600 font-open-sans text-xs lg:text-sm xl:text-base font-medium">Tâches restantes</p>
          </div>

          <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center mb-2 lg:mb-3">
              <Calendar className="text-orange-500 mr-2" size={20} />
              <span className="font-bold text-xl lg:text-2xl xl:text-3xl text-orange-700">
                {Math.max(0, daysRemaining)}
              </span>
            </div>
            <p className="text-orange-600 font-open-sans text-xs lg:text-sm xl:text-base font-medium">
              {daysRemaining > 0 ? 'Jours restants' : 'Sprint terminé'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Sprint Card */}
      <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-poppins font-semibold text-lg lg:text-xl xl:text-2xl text-secondary-2 mb-4 lg:mb-6 flex items-center">
          <Calendar className="mr-2 lg:mr-3 text-primary" size={24} />
          Sprint Actuel
        </h3>
        
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h4 className="font-open-sans font-semibold text-secondary-2 text-lg lg:text-xl xl:text-2xl">
                {currentSprint.name}
              </h4>
              <div className="flex items-center space-x-2 lg:space-x-3 mt-1 lg:mt-2">
                <span className={`inline-block px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm rounded-full font-medium ${
                  currentSprint.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentSprint.status === 'active' ? '🟢 En cours' : currentSprint.status}
                </span>
                {daysRemaining > 0 && (
                  <span className="text-xs lg:text-sm text-gray-600 font-open-sans">
                    {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center text-sm lg:text-base text-gray-600">
                <Calendar size={16} className="mr-2 flex-shrink-0" />
                <span className="font-open-sans">
                  <strong>Début:</strong> {new Date(currentSprint.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center text-sm lg:text-base text-gray-600">
                <Calendar size={16} className="mr-2 flex-shrink-0" />
                <span className="font-open-sans">
                  <strong>Fin:</strong> {new Date(currentSprint.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 lg:p-5 xl:p-6 rounded-lg">
              <p className="text-sm lg:text-base text-gray-700 font-open-sans">
                <strong className="text-secondary-2">Objectif:</strong>
              </p>
              <p className="text-sm lg:text-base text-gray-600 font-open-sans mt-1 lg:mt-2">
                {currentSprint.goal}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};