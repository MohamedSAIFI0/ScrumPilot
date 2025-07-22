import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

// Types
interface Project {
  id: number;
  name: string;
  description: string;
}

interface Epic {
  id?: number;
  name: string;
  description: string;
  color: string;
  created_at?: string;
  projet: number; // ID du projet associé
}

interface EpicFormData {
  name: string;
  description: string;
  color: string;
  projet: number;
}

// Couleurs disponibles
const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
];

// Composant principal
const EpicManagement: React.FC = () => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEpic, setCurrentEpic] = useState<Epic | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [formData, setFormData] = useState<EpicFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    projet: 0
  });

  // Configuration API
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Chargement initial
  useEffect(() => {
    loadProjects();
  }, []);

  // Charger les epics quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadEpics();
    }
  }, [selectedProject]);

  // Auto-hide messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`);
      if (!response.ok) throw new Error('Erreur lors du chargement des projets');
      
      const data = await response.json();
      setProjects(data);
      
      // Sélectionner le premier projet par défaut
      if (data.length > 0) {
        setSelectedProject(data[0].id);
        setFormData(prev => ({ ...prev, projet: data[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const loadEpics = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError(null);
    try {
      // Charger les epics filtrés par projet
      const response = await fetch(`${API_BASE_URL}/epics/?projet=${selectedProject}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des epics');
      
      const data = await response.json();
      setEpics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createEpic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/epics/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création de l\'epic');
      }
      
      const newEpic = await response.json();
      setEpics([...epics, newEpic]);
      setSuccess('Epic créé avec succès!');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const updateEpic = async () => {
    if (!currentEpic?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/epics/${currentEpic.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour de l\'epic');
      }
      
      const updatedEpic = await response.json();
      setEpics(epics.map(epic => epic.id === currentEpic.id ? updatedEpic : epic));
      setSuccess('Epic mis à jour avec succès!');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const deleteEpic = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet epic?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/epics/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression de l\'epic');
      
      setEpics(epics.filter(epic => epic.id !== id));
      setSuccess('Epic supprimé avec succès!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const openModal = (epic?: Epic) => {
    setCurrentEpic(epic || null);
    setFormData({
      name: epic?.name || '',
      description: epic?.description || '',
      color: epic?.color || '#3B82F6',
      projet: epic?.projet || selectedProject || 0
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEpic(null);
    setFormData({ 
      name: '', 
      description: '', 
      color: '#3B82F6',
      projet: selectedProject || 0
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Le nom de l\'epic est requis');
      return;
    }
    
    if (!formData.projet) {
      setError('Veuillez sélectionner un projet');
      return;
    }
    
    if (currentEpic) {
      updateEpic();
    } else {
      createEpic();
    }
  };

  const handleProjectChange = (projectId: number) => {
    setSelectedProject(projectId);
    setFormData(prev => ({ ...prev, projet: projectId }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Projet inconnu';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Gestion des Epics</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedProject}
          >
            <Plus size={20} />
            Nouvel Epic
          </button>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projet sélectionné
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : !selectedProject ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sélectionnez un projet
            </h3>
            <p className="text-gray-600">
              Veuillez sélectionner un projet pour voir et gérer ses epics.
            </p>
          </div>
        ) : (
          <>
            {/* Epic Grid */}
            {epics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {epics.map((epic) => (
                  <div
                    key={epic.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: epic.color }}
                      />
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {epic.name}
                      </h3>
                    </div>
                    
                    {epic.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {epic.description}
                      </p>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      Projet: {getProjectName(epic.projet)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {epic.created_at ? formatDate(epic.created_at) : ''}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(epic)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => epic.id && deleteEpic(epic.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun Epic trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier Epic pour le projet "{getProjectName(selectedProject)}".
                </p>
                <button
                  onClick={() => openModal()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Créer un Epic
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentEpic ? 'Modifier Epic' : 'Nouvel Epic'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet *
                </label>
                <select
                  value={formData.projet}
                  onChange={(e) => setFormData({ ...formData, projet: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Epic *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Décrivez votre epic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {currentEpic ? 'Mettre à jour' : 'Créer Epic'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpicManagement;