import React, { useState, useEffect } from 'react';
import { Folder, Users, Calendar, Loader } from 'lucide-react';

interface Project {
  id?: number;
  name: string;
  team: string;
  members: number;
  deadline: string;
  progress: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const ActiveProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const Token = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${Token}`,
        };

        const response = await fetch('http://127.0.0.1:8000/api/projects/', { headers });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        setError('Impossible de charger les projets. Vérifiez que l\'API est accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en cours': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'planification': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'tests': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'terminé': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'suspendu': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  // Obtenir les 3 projets les plus récents
  const recentProjects = projects
    .sort((a, b) => {
      // Trier par created_at si disponible, sinon par id
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (a.id && b.id) {
        return b.id - a.id;
      }
      return 0;
    })
    .slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Projets Actifs</h3>
          <Folder className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Projets Actifs</h3>
          <Folder className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Erreur</div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Projets Actifs</h3>
          <Folder className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Aucun projet trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">
          Projets Actifs
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({recentProjects.length}/3)
          </span>
        </h3>
        <Folder className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {recentProjects.map((project, index) => (
          <div key={project.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
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

      {/* Bouton pour voir tous les projets si il y en a plus de 3 */}
      {projects.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-primary hover:text-purple-700 font-medium transition-colors">
            Voir tous les projets ({projects.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveProjects;