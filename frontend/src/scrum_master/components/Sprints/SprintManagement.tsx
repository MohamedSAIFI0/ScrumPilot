import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Calendar, Target, Users, Clock } from 'lucide-react';

// Types
interface Project {
  id: number;
  name: string;
  description: string;
  code?: string;
}

interface Sprint {
  id?: string;
  name: string;
  goal: string;
  status: string;
  project: Project | number; // Accepter soit un objet Project soit un ID
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
  created_at?: string;
  created_by?: number;
  // Propriétés calculées
  progress_percentage?: number;
  total_stories?: number;
  completed_stories?: number;
  total_points?: number;
  completed_points?: number;
  remaining_points?: number;
  days_remaining?: number;
  capacity_utilization?: number;
}

interface SprintFormData {
  name: string;
  goal: string;
  status: string;
  project_id: number;
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
}

// Constantes
const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planifié', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: 'Actif', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-800' }
];

const DURATION_OPTIONS = [
  { value: 7, label: '1 semaine (7 jours)' },
  { value: 14, label: '2 semaines (14 jours)' },
  { value: 21, label: '3 semaines (21 jours)' },
  { value: 28, label: '4 semaines (28 jours)' }
];

// Composant principal
const SprintManagement: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [formData, setFormData] = useState<SprintFormData>({
    name: '',
    goal: '',
    status: 'planned',
    project_id: 0,
    start_date: '',
    end_date: '',
    duration: 14,
    capacity: 30,
    planning_ceremony: true,
    daily_ceremony: true,
    review_ceremony: true,
    retrospective_ceremony: true
  });

  // Configuration API
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Fonction pour obtenir les headers avec authentification
  const getAuthHeaders = () => {
    // const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      // 'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Fonctions helper pour gérer les projets
  const getProjectName = (project: Project | number) => {
    if (typeof project === 'object' && project !== null) {
      return project.name;
    }
    // Si c'est un ID, chercher dans la liste des projets
    const projectObj = projects.find(p => p.id === project);
    return projectObj?.name || 'Projet inconnu';
  };

  const getProjectCode = (project: Project | number) => {
    if (typeof project === 'object' && project !== null) {
      return project.code || 'N/A';
    }
    // Si c'est un ID, chercher dans la liste des projets
    const projectObj = projects.find(p => p.id === project);
    return projectObj?.code || 'N/A';
  };

  const getProjectId = (project: Project | number): number => {
    if (typeof project === 'object' && project !== null) {
      return project.id;
    }
    return project;
  };

  // Chargement initial
  useEffect(() => {
    loadProjects();
  }, []);

  // Charger les sprints quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      loadSprints();
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
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors du chargement des projets');
      }
      
      const data = await response.json();
      setProjects(data);
      
      // Sélectionner le premier projet par défaut
      if (data.length > 0) {
        setSelectedProject(data[0].id);
        setFormData(prev => ({ ...prev, project_id: data[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/sprints/?project=${selectedProject}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors du chargement des sprints');
      }
      
      const data = await response.json();
      setSprints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createSprint = async () => {
    try {
      console.log('Données envoyées:', formData);
      const response = await fetch(`${API_BASE_URL}/sprints/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.detail || 'Erreur lors de la création du sprint');
      }
      
      const newSprint = await response.json();
      setSprints([...sprints, newSprint]);
      setSuccess('Sprint créé avec succès!');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const updateSprint = async () => {
    if (!currentSprint?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/sprints/${currentSprint.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour du sprint');
      }
      
      const updatedSprint = await response.json();
      setSprints(sprints.map(sprint => sprint.id === currentSprint.id ? updatedSprint : sprint));
      setSuccess('Sprint mis à jour avec succès!');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const deleteSprint = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sprint?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/sprints/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors de la suppression du sprint');
      }
      
      setSprints(sprints.filter(sprint => sprint.id !== id));
      setSuccess('Sprint supprimé avec succès!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const openModal = (sprint?: Sprint) => {
    setCurrentSprint(sprint || null);
    setFormData({
      name: sprint?.name || '',
      goal: sprint?.goal || '',
      status: sprint?.status || 'planned',
      project_id: sprint ? getProjectId(sprint.project) : selectedProject || 0,
      start_date: sprint?.start_date || '',
      end_date: sprint?.end_date || '',
      duration: sprint?.duration || 14,
      capacity: sprint?.capacity || 30,
      planning_ceremony: sprint?.planning_ceremony ?? true,
      daily_ceremony: sprint?.daily_ceremony ?? true,
      review_ceremony: sprint?.review_ceremony ?? true,
      retrospective_ceremony: sprint?.retrospective_ceremony ?? true
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSprint(null);
    setFormData({
      name: '',
      goal: '',
      status: 'planned',
      project_id: selectedProject || 0,
      start_date: '',
      end_date: '',
      duration: 14,
      capacity: 30,
      planning_ceremony: true,
      daily_ceremony: true,
      review_ceremony: true,
      retrospective_ceremony: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Le nom du sprint est requis');
      return;
    }
    
    if (!formData.goal.trim()) {
      setError('L\'objectif du sprint est requis');
      return;
    }
    
    if (!formData.start_date || !formData.end_date) {
      setError('Les dates de début et fin sont requises');
      return;
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('La date de fin doit être postérieure à la date de début');
      return;
    }
    
    if (!formData.project_id) {
      setError('Veuillez sélectionner un projet');
      return;
    }
    
    if (currentSprint) {
      updateSprint();
    } else {
      createSprint();
    }
  };

  const handleProjectChange = (projectId: number) => {
    setSelectedProject(projectId);
    setFormData(prev => ({ ...prev, project_id: projectId }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const getDurationLabel = (duration: number) => {
    return DURATION_OPTIONS.find(option => option.value === duration)?.label || `${duration} jours`;
  };

  // Simulation d'authentification pour le développement
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authentification requise
          </h2>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à la gestion des sprints.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Gestion des Sprints</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedProject}
          >
            <Plus size={20} />
            Nouveau Sprint
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
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sélectionnez un projet
            </h3>
            <p className="text-gray-600">
              Veuillez sélectionner un projet pour voir et gérer ses sprints.
            </p>
          </div>
        ) : (
          <>
            {/* Sprint Grid */}
            {sprints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprints.map((sprint) => {
                  const statusInfo = getStatusInfo(sprint.status);
                  return (
                    <div
                      key={sprint.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 flex-1">
                          {sprint.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Target size={16} className="text-gray-500" />
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {sprint.goal}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>
                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>{getDurationLabel(sprint.duration)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={14} />
                          <span>Capacité: {sprint.capacity} points</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 mb-4">
                        Projet: {getProjectName(sprint.project)} ({getProjectCode(sprint.project)})
                      </div>

                      {/* Ceremonies */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {sprint.planning_ceremony && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Planning
                          </span>
                        )}
                        {sprint.daily_ceremony && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Daily
                          </span>
                        )}
                        {sprint.review_ceremony && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Review
                          </span>
                        )}
                        {sprint.retrospective_ceremony && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                            Retro
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {sprint.created_at ? formatDate(sprint.created_at) : ''}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(sprint)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => sprint.id && deleteSprint(sprint.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun Sprint trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier Sprint pour le projet "{getProjectName(selectedProject)}".
                </p>
                <button
                  onClick={() => openModal()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Créer un Sprint
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentSprint ? 'Modifier Sprint' : 'Nouveau Sprint'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Projet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.code && `(${project.code})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom et Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Sprint *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objectif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectif du Sprint *
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Décrivez l'objectif de ce sprint..."
                  required
                />
              </div>

              {/* Dates et Durée */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité (Story Points)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>

              {/* Cérémonies Scrum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cérémonies Scrum
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.planning_ceremony}
                      onChange={(e) => setFormData({ ...formData, planning_ceremony: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Sprint Planning</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.daily_ceremony}
                      onChange={(e) => setFormData({ ...formData, daily_ceremony: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Daily Scrum</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.review_ceremony}
                      onChange={(e) => setFormData({ ...formData, review_ceremony: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Sprint Review</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.retrospective_ceremony}
                      onChange={(e) => setFormData({ ...formData, retrospective_ceremony: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Rétrospective</span>
                  </label>
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
                  {currentSprint ? 'Mettre à jour' : 'Créer Sprint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintManagement;