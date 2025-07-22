import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import { fetchList, createItem } from '../../../services/api';

const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchList('projects');
        setProjects(data);
      } catch (err: any) {
        setError('Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleNewProject = async (newProject: any) => {
    try {
      const created = await createItem('projects', newProject);
      setProjects(prev => [created, ...prev]);
    } catch (err) {
      alert('Erreur lors de la création du projet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Gestion des Projets</h1>
        <button 
          onClick={() => setIsNewProjectModalOpen(true)}
          className="bg-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-button/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Projet</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
          >
            <option value="all">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="Planification">Planification</option>
            <option value="Tests">Tests</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center text-gray-500">Chargement des projets...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleNewProject}
      />
    </div>
  );
};

export default Projects;