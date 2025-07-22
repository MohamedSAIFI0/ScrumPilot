import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const sprintData = [
    { sprint: 'Sprint 19', planned: 25, completed: 23, velocity: 23 },
    { sprint: 'Sprint 20', planned: 30, completed: 28, velocity: 28 },
    { sprint: 'Sprint 21', planned: 28, completed: 25, velocity: 25 },
    { sprint: 'Sprint 22', planned: 35, completed: 32, velocity: 32 },
    { sprint: 'Sprint 23', planned: 34, completed: 22, velocity: 22 }
  ];

  const projectMetrics = [
    { name: 'E-Commerce Platform', progress: 75, stories: 47, bugs: 3, team: 8 },
    { name: 'Mobile App Redesign', progress: 45, stories: 23, bugs: 5, team: 6 },
    { name: 'Data Analytics Dashboard', progress: 90, stories: 34, bugs: 1, team: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Rapports et Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
          </select>
          <button className="bg-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-button/90 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-cards dark:bg-dark-card p-6 rounded-xl transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vélocité Moyenne</p>
              <p className="text-2xl font-bold text-primary">26 pts</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-cards dark:bg-dark-card p-6 rounded-xl transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de Réussite</p>
              <p className="text-2xl font-bold text-green-600">87%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-cards dark:bg-dark-card p-6 rounded-xl transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stories Livrées</p>
              <p className="text-2xl font-bold text-button">104</p>
            </div>
            <Calendar className="h-8 w-8 text-button" />
          </div>
        </div>
        
        <div className="bg-cards dark:bg-dark-card p-6 rounded-xl transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bugs Résolus</p>
              <p className="text-2xl font-bold text-orange-500">23</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-semibold text-secondary-2 dark:text-dark-text font-poppins mb-4">
            Vélocité par Sprint
          </h3>
          <div className="space-y-4">
            {sprintData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{data.sprint}</span>
                  <span className="text-secondary-2 dark:text-dark-text">{data.velocity} pts</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(data.completed / data.planned) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((data.completed / data.planned) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-semibold text-secondary-2 dark:text-dark-text font-poppins mb-4">
            Performance par Projet
          </h3>
          <div className="space-y-4">
            {projectMetrics.map((project, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-secondary-2 dark:text-dark-text">{project.name}</h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-secondary-2 dark:text-dark-text">{project.stories}</p>
                    <p className="text-gray-600 dark:text-gray-400">Stories</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">{project.bugs}</p>
                    <p className="text-gray-600 dark:text-gray-400">Bugs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600">{project.team}</p>
                    <p className="text-gray-600 dark:text-gray-400">Équipe</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
        <h3 className="text-lg font-semibold text-secondary-2 dark:text-dark-text font-poppins mb-4">
          Recommandations IA
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-secondary-2 dark:text-dark-text mb-1">Optimisation de la vélocité</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                L'équipe Team Alpha montre une baisse de vélocité de 15% ce sprint. 
                Recommandation: réduire la complexité des stories ou augmenter les ressources.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-secondary-2 dark:text-dark-text mb-1">Priorisation du backlog</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Basé sur les feedbacks clients, prioriser les fonctionnalités de notification 
                et reporter les features d'analytics avancées au prochain trimestre.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-secondary-2 dark:text-dark-text mb-1">Prédiction de livraison</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avec la vélocité actuelle, le projet E-Commerce Platform sera livré 
                avec 3 jours d'avance sur la deadline prévue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;