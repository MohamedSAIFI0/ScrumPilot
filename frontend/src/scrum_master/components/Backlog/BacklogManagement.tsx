import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User, Calendar, Flag, Target } from 'lucide-react';

// Types
interface Epic {
  id: number;
  name: string;
  description: string;
  color: string;
  projet: number;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  priority: string;
  team: string;
  members: number;
  start_date: string;
  end_date: string;
  budget: string;
  objectives: string[];
  technologies: string[];
  risks: string[];
  status: string;
  progress: number;
  created_at: string;
  created_by: string;
  client: number;
  product_owner: number | null;
  scrum_master: number;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: string;
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  project: Project;
}

interface UserStory {
  id?: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'ready' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked';
  epic: Epic; // Maintenant c'est l'objet Epic complet
  sprint?: Sprint | null; // Maintenant c'est l'objet Sprint complet
  assignee: number[];
  created_at?: string;
  updated_at?: string;
}

interface UserStoryFormData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'ready' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked';
  epic: number;
  sprint: string | null; // UUID string
  assignee: number[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
}

// Constantes
const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Haute priorité', color: 'text-red-600' },
  { value: 'medium', label: 'Priorité moyenne', color: 'text-yellow-600' },
  { value: 'low', label: 'Faible priorité', color: 'text-green-600' }
];

const STATUS_OPTIONS = [
  { value: 'ready', label: 'Prêt', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_review', label: 'En révision', color: 'bg-purple-100 text-purple-800' },
  { value: 'testing', label: 'Test', color: 'bg-orange-100 text-orange-800' },
  { value: 'done', label: 'Terminé', color: 'bg-green-100 text-green-800' },
  { value: 'blocked', label: 'Bloqué', color: 'bg-red-100 text-red-800' }
];

const STORY_POINTS_OPTIONS = [1, 2, 3, 5, 8, 13, 21];

// Composant principal
const BacklogManagement: React.FC = () => {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [productOwners, setProductOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserStory, setCurrentUserStory] = useState<UserStory | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserStoryFormData>({
    title: '',
    description: '',
    priority: 'medium',
    points: 1,
    status: 'ready',
    epic: 0,
    sprint: null,
    assignee: []
  });

  // Configuration API
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Fonction pour obtenir les headers avec token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization':  `Bearer ${token}` ,
    };
  };

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  // Charger les user stories quand un epic est sélectionné
  useEffect(() => {
    if (selectedEpic) {
      loadUserStories();
    }
  }, [selectedEpic]);

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

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
  
      const [epicsResponse, sprintsResponse, usersResponse, productOwnersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/epics/`, { headers }),
        fetch(`${API_BASE_URL}/sprints/`, { headers }),
        fetch(`${API_BASE_URL}/users/`, { headers }),
        fetch(`${API_BASE_URL}/dev/`, { headers })
      ]);

      if (!epicsResponse.ok) throw new Error('Erreur lors du chargement des epics');
      if (!sprintsResponse.ok) throw new Error('Erreur lors du chargement des sprints');
      if (!usersResponse.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      if (!productOwnersResponse.ok) throw new Error('Erreur lors du chargement des product owners');

      const [epicsData, sprintsData, usersData, productOwnersData] = await Promise.all([
        epicsResponse.json(),
        sprintsResponse.json(),
        usersResponse.json(),
        productOwnersResponse.json()
      ]);

      console.log('Epics loaded:', epicsData);
      console.log('Sprints loaded:', sprintsData);

      // Vérification et initialisation des données avec des valeurs par défaut
      setEpics(Array.isArray(epicsData) ? epicsData : []);
      setSprints(Array.isArray(sprintsData) ? sprintsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setProductOwners(Array.isArray(productOwnersData) ? productOwnersData : []);

      // Sélectionner le premier epic par défaut
      if (Array.isArray(epicsData) && epicsData.length > 0) {
        const firstEpicId = epicsData[0].id;
        setSelectedEpic(firstEpicId);
        setFormData(prev => ({ ...prev, epic: firstEpicId }));
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Initialiser avec des tableaux vides en cas d'erreur
      setEpics([]);
      setSprints([]);
      setUsers([]);
      setProductOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStories = async () => {
    if (!selectedEpic) return;
    
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/userstories/?epic=${selectedEpic}`, { headers });
      if (!response.ok) throw new Error('Erreur lors du chargement des user stories');
      
      const data = await response.json();
      console.log('User stories loaded:', data);
      setUserStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading user stories:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setUserStories([]);
    } finally {
      setLoading(false);
    }
  };

  const createUserStory = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Validation côté client
      if (!formData.epic || formData.epic === 0) {
        setError('Veuillez sélectionner un epic valide');
        return;
      }

      // Adapter les données pour l'API backend
      const apiData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        points: formData.points,
        status: formData.status,
        epic_id: formData.epic, // Envoyer epic_id au lieu de epic
        sprint_id: formData.sprint, // Envoyer sprint_id au lieu de sprint
        assignee: formData.assignee
      };

      console.log('Creating user story with data:', apiData);
      
      const response = await fetch(`${API_BASE_URL}/userstories/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.detail || errorData?.message || `Erreur ${response.status}`);
      }
      
      const newUserStory = await response.json();
      console.log('User story created:', newUserStory);
      setUserStories([...userStories, newUserStory]);
      setSuccess('User Story créée avec succès!');
      closeModal();
    } catch (err) {
      console.error('Error creating user story:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const updateUserStory = async () => {
    if (!currentUserStory?.id) return;
    
    try {
      const headers = getAuthHeaders();
      
      // Validation côté client
      if (!formData.epic || formData.epic === 0) {
        setError('Veuillez sélectionner un epic valide');
        return;
      }

      // Adapter les données pour l'API backend
      const apiData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        points: formData.points,
        status: formData.status,
        epic_id: formData.epic, // Envoyer epic_id au lieu de epic
        sprint_id: formData.sprint, // Envoyer sprint_id au lieu de sprint
        assignee: formData.assignee
      };

      console.log('Updating user story with data:', apiData);
      
      const response = await fetch(`${API_BASE_URL}/userstories/${currentUserStory.id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.detail || errorData?.message || `Erreur ${response.status}`);
      }
      
      const updatedUserStory = await response.json();
      console.log('User story updated:', updatedUserStory);
      setUserStories(userStories.map(us => us.id === currentUserStory.id ? updatedUserStory : us));
      setSuccess('User Story mise à jour avec succès!');
      closeModal();
    } catch (err) {
      console.error('Error updating user story:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const deleteUserStory = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette user story?')) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/userstories/${id}/`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression de la user story');
      
      setUserStories(userStories.filter(us => us.id !== id));
      setSuccess('User Story supprimée avec succès!');
    } catch (err) {
      console.error('Error deleting user story:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const openModal = (userStory?: UserStory) => {
    const epicId = userStory?.epic?.id || selectedEpic || 0;
    
    setCurrentUserStory(userStory || null);
    setFormData({
      title: userStory?.title || '',
      description: userStory?.description || '',
      priority: userStory?.priority || 'medium',
      points: userStory?.points || 1,
      status: userStory?.status || 'ready',
      epic: epicId,
      sprint: userStory?.sprint?.id || null,
      assignee: userStory?.assignee || []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUserStory(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      points: 1,
      status: 'ready',
      epic: selectedEpic || 0,
      sprint: null,
      assignee: []
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setError('Le titre de la user story est requis');
      return;
    }
    
    if (!formData.epic || formData.epic === 0) {
      setError('Veuillez sélectionner un epic');
      return;
    }
    
    console.log('Submitting form data:', formData);
    
    if (currentUserStory) {
      updateUserStory();
    } else {
      createUserStory();
    }
  };

  const handleEpicChange = (epicId: number) => {
    setSelectedEpic(epicId);
    setFormData(prev => ({ ...prev, epic: epicId }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEpicName = (epic: Epic | number) => {
    if (typeof epic === 'object' && epic !== null) {
      return epic.name;
    }
    // Fallback pour les anciens formats
    const foundEpic = epics.find(e => e.id === epic);
    return foundEpic?.name || 'Epic inconnu';
  };

  const getSprintName = (sprint: Sprint | string | null) => {
    if (!sprint) return 'Aucun sprint';
    if (typeof sprint === 'object' && sprint !== null) {
      return sprint.name;
    }
    // Fallback pour les anciens formats
    const foundSprint = sprints.find(s => s.id === sprint);
    return foundSprint?.name || 'Sprint inconnu';
  };

  const getUserNames = (userIds: number[]) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return 'Aucun assigné';
    
    return userIds.map(id => {
      const user = productOwners.find(u => u.id === id) || users.find(u => u.id === id);
      return user ? user.name || user.email : 'Utilisateur inconnu';
    }).join(', ');
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Gestion du Backlog</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedEpic}
          >
            <Plus size={20} />
            Nouvelle User Story
          </button>
        </div>

        {/* Epic Selector */}
        {epics.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Epic sélectionné
            </label>
            <select
              value={selectedEpic || ''}
              onChange={(e) => handleEpicChange(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Sélectionner un epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
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
        ) : !selectedEpic ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sélectionnez un epic
            </h3>
            <p className="text-gray-600">
              Veuillez sélectionner un epic pour voir et gérer ses user stories.
            </p>
          </div>
        ) : (
          <>
            {/* User Stories Grid */}
            {userStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStories.map((userStory) => (
                  <div
                    key={userStory.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {userStory.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userStory.status)}`}>
                          {getStatusLabel(userStory.status)}
                        </span>
                      </div>
                    </div>
                    
                    {userStory.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                        {userStory.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Flag size={14} className={getPriorityColor(userStory.priority)} />
                        <span className={getPriorityColor(userStory.priority)}>
                          {PRIORITY_OPTIONS.find(p => p.value === userStory.priority)?.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target size={14} />
                        <span>{userStory.points} points</span>
                      </div>

                      {userStory.sprint && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{getSprintName(userStory.sprint)}</span>
                        </div>
                      )}

                      {userStory.assignee && userStory.assignee.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span>{getUserNames(userStory.assignee)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      Epic: {getEpicName(userStory.epic)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {userStory.created_at ? formatDate(userStory.created_at) : ''}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(userStory)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => userStory.id && deleteUserStory(userStory.id)}
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
                  Aucune User Story trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre première User Story pour l'epic "{getEpicName(selectedEpic)}".
                </p>
                <button
                  onClick={() => openModal()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Créer une User Story
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
                {currentUserStory ? 'Modifier User Story' : 'Nouvelle User Story'}
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
                  Epic *
                </label>
                <select
                  value={formData.epic || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      epic: value ? Number(value) : 0 
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Sélectionner un epic</option>
                  {epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
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
                  placeholder="Décrivez votre user story..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <select
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {STORY_POINTS_OPTIONS.map((points) => (
                      <option key={points} value={points}>
                        {points} point{points > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStory['status'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sprint 
                  </label>
                  <select
                    value={formData.sprint || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ 
                        ...formData, 
                        sprint: value || null
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Aucun sprint</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                        {sprint.project && ` (${sprint.project.name})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigné à 
                </label>
                <select
                  value={formData.assignee.length > 0 ? formData.assignee[0] : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    assignee: e.target.value ? [Number(e.target.value)] : []
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionner un assigné</option>
                  {productOwners.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} 
                    </option>
                  ))}
                </select>
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
                  disabled={!formData.title.trim() || !formData.epic}
                >
                  {currentUserStory ? 'Mettre à jour' : 'Créer User Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacklogManagement;