import React, { useState, useEffect } from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

interface Epic {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  projet: number;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'completed' | 'planned' | 'cancelled';
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
  project: number;
  created_by: number;
}

interface UserStory {
  id: number;
  epic: Epic;
  sprint: Sprint;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'ready' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked';
  created_at: string;
  updated_at: string;
  assignee: number[];
}

export default function KanbanBoard() {
  const { state, dispatch } = useScrum();
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  // Mapping des statuts de l'API vers les colonnes du Kanban
  const columns = [
    { 
      id: 'ready', 
      title: 'À faire', 
      color: 'bg-gray-100',
      apiStatuses: ['ready'] 
    },
    { 
      id: 'in_progress', 
      title: 'En cours', 
      color: 'bg-blue-100',
      apiStatuses: ['in_progress', 'in_review'] 
    },
    { 
      id: 'done', 
      title: 'Terminé', 
      color: 'bg-green-100',
      apiStatuses: ['testing', 'done'] 
    }
  ];

  // Fonction pour récupérer le token d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Récupération des user stories depuis l'API
  const fetchUserStories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/userstories/', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Valider et normaliser les données des user stories
      const validatedStories = Array.isArray(data) ? data : [];
      
      setUserStories(validatedStories);
      
      // Sélectionner automatiquement le premier sprint actif trouvé
      if (validatedStories.length > 0 && !selectedSprintId) {
        const activeSprint = validatedStories.find(story => 
          story.sprint && story.sprint.status === 'active'
        );
        if (activeSprint) {
          setSelectedSprintId(activeSprint.sprint.id);
        }
      }
      
      return validatedStories;
    } catch (err) {
      console.error('Erreur lors de la récupération des user stories:', err);
      throw err;
    }
  };

  // Récupération initiale des données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchUserStories();
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Mise à jour du statut d'une user story
  const updateUserStoryStatus = async (storyId: string, newStatus: string) => {
    try {
      // Mapper le statut de la colonne vers le statut de l'API
      let apiStatus = newStatus;
      if (newStatus === 'ready') {
        apiStatus = 'ready';
      } else if (newStatus === 'in_progress') {
        apiStatus = 'in_progress';
      } else if (newStatus === 'done') {
        apiStatus = 'done';
      }

      const response = await fetch(`http://127.0.0.1:8000/api/userstories/${storyId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: apiStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      const updatedStory = await response.json();

      // Mettre à jour l'état local des user stories
      setUserStories(prevStories => 
        prevStories.map(story => 
          story.id.toString() === storyId 
            ? { ...story, status: updatedStory.status, updated_at: updatedStory.updated_at }
            : story
        )
      );

    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Erreur lors de la mise à jour de la tâche');
      
      // Optionnel: Recharger les données en cas d'erreur
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Si la tâche a changé de colonne
    if (source.droppableId !== destination.droppableId) {
      updateUserStoryStatus(draggableId, destination.droppableId);
    }
  };

  // Récupérer les stories par statut pour le sprint sélectionné
  const getStoriesByStatus = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return [];
    
    return userStories.filter(story => 
      story.sprint && 
      story.sprint.id === selectedSprintId && 
      column.apiStatuses.includes(story.status)
    );
  };

  // Récupérer tous les sprints uniques
  const getAllSprints = () => {
    const sprintsMap = new Map();
    userStories.forEach(story => {
      if (story.sprint && !sprintsMap.has(story.sprint.id)) {
        sprintsMap.set(story.sprint.id, story.sprint);
      }
    });
    return Array.from(sprintsMap.values());
  };

  // Filtrer les sprints par statut
  const getSprintsByStatus = (status: string) => {
    return getAllSprints().filter(sprint => sprint.status === status);
  };

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchUserStories();
      setError(null);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les informations du sprint sélectionné
  const selectedSprint = getAllSprints().find(s => s.id === selectedSprintId);
  const activeSprints = getSprintsByStatus('active');
  const completedSprints = getSprintsByStatus('completed');
  const plannedSprints = getSprintsByStatus('planned');

  // Compter les user stories du sprint sélectionné
  const selectedSprintStoriesCount = selectedSprint 
    ? userStories.filter(story => story.sprint && story.sprint.id === selectedSprintId).length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className={`ml-2 font-open-sans ${
          state.darkMode ? 'text-dark-text' : 'text-secondary-2'
        }`}>
          Chargement des user stories...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg border ${
        state.darkMode 
          ? 'bg-red-900 border-red-700 text-red-200' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <p className="font-medium">Erreur de chargement</p>
        <p className="text-sm mt-1">{error}</p>
        <div className="flex space-x-2 mt-2">
          <button 
            onClick={refreshData} 
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
          <button 
            onClick={() => setError(null)} 
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Ignorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Tableau Kanban
          </h2>
          <p className={`font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {selectedSprint ? `Sprint: ${selectedSprint.name} (${selectedSprint.status})` : 'Aucun sprint sélectionné'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bouton de rafraîchissement */}
          <button
            onClick={refreshData}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              state.darkMode 
                ? 'bg-dark-card border-gray-600 text-dark-text hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-secondary-2 hover:bg-gray-50'
            }`}
            disabled={loading}
          >
            🔄 Actualiser
          </button>

          {/* Sélecteur de sprint */}
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
              state.darkMode 
                ? 'bg-dark-card border-gray-600 text-dark-text' 
                : 'bg-white border-gray-300 text-secondary-2'
            }`}
          >
            <option value="">Sélectionner un sprint</option>
            
            {activeSprints.length > 0 && (
              <optgroup label="Sprints Actifs">
                {activeSprints.map(sprint => {
                  const storiesCount = userStories.filter(story => 
                    story.sprint && story.sprint.id === sprint.id
                  ).length;
                  return (
                    <option key={sprint.id} value={sprint.id}>
                      🟢 {sprint.name} ({storiesCount} stories)
                    </option>
                  );
                })}
              </optgroup>
            )}
            
            {plannedSprints.length > 0 && (
              <optgroup label="Sprints Planifiés">
                {plannedSprints.map(sprint => {
                  const storiesCount = userStories.filter(story => 
                    story.sprint && story.sprint.id === sprint.id
                  ).length;
                  return (
                    <option key={sprint.id} value={sprint.id}>
                      🔵 {sprint.name} ({storiesCount} stories)
                    </option>
                  );
                })}
              </optgroup>
            )}
            
            {completedSprints.length > 0 && (
              <optgroup label="Sprints Terminés">
                {completedSprints.map(sprint => {
                  const storiesCount = userStories.filter(story => 
                    story.sprint && story.sprint.id === sprint.id
                  ).length;
                  return (
                    <option key={sprint.id} value={sprint.id}>
                      ✅ {sprint.name} ({storiesCount} stories)
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>

          {/* Indicateur du statut du sprint */}
          {selectedSprint && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedSprint.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedSprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              selectedSprint.status === 'planned' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedSprint.status === 'active' ? 'Actif' :
               selectedSprint.status === 'completed' ? 'Terminé' :
               selectedSprint.status === 'planned' ? 'Planifié' :
               'Annulé'}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des sprints */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg ${
          state.darkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-2xl font-bold text-green-600">{activeSprints.length}</p>
          <p className={`text-xs font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Sprints Actifs</p>
        </div>
        
        <div className={`p-3 rounded-lg ${
          state.darkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-2xl font-bold text-blue-600">{plannedSprints.length}</p>
          <p className={`text-xs font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Sprints Planifiés</p>
        </div>
        
        <div className={`p-3 rounded-lg ${
          state.darkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-2xl font-bold text-gray-600">{completedSprints.length}</p>
          <p className={`text-xs font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Sprints Terminés</p>
        </div>
        
        <div className={`p-3 rounded-lg ${
          state.darkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'
        }`}>
          <p className="text-2xl font-bold text-primary">{selectedSprintStoriesCount}</p>
          <p className={`text-xs font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>User Stories</p>
        </div>
      </div>

      {/* Tableau Kanban */}
      {selectedSprint ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
              const stories = getStoriesByStatus(column.id);

              return (
                <div key={column.id} className={`rounded-xl p-4 shadow-sm border ${
                  state.darkMode 
                    ? 'bg-dark-card border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className={`${column.color} rounded-lg p-3 mb-4`}>
                    <h3 className={`font-semibold font-poppins ${
                      state.darkMode ? 'text-secondary-2' : 'text-secondary-2'
                    }`}>
                      {column.title}
                    </h3>
                    <p className={`text-sm font-open-sans ${
                      state.darkMode ? 'text-gray-700' : 'text-gray-600'
                    }`}>
                      {stories.length} tâche(s)
                    </p>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver 
                            ? state.darkMode 
                              ? 'bg-blue-900/20' 
                              : 'bg-blue-50' 
                            : ''
                        }`}
                      >
                        {stories.length === 0 ? (
                          <div className={`text-center py-8 text-sm ${
                            state.darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            Aucune tâche
                          </div>
                        ) : (
                          stories.map((story, index) => (
                            <Draggable 
                              key={story.id.toString()} 
                              draggableId={story.id.toString()} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-transform ${
                                    snapshot.isDragging 
                                      ? 'rotate-1 shadow-lg scale-105' 
                                      : 'hover:shadow-md'
                                  }`}
                                >
                                  <TaskCard story={story} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className={`text-center py-12 ${
          state.darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="space-y-2">
            <p className="font-open-sans text-lg">Veuillez sélectionner un sprint pour afficher le tableau Kanban</p>
            <p className="font-open-sans text-sm">
              {getAllSprints().length === 0 
                ? "Aucun sprint disponible. Créez d'abord un sprint avec des user stories."
                : `${getAllSprints().length} sprint(s) disponible(s)`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}