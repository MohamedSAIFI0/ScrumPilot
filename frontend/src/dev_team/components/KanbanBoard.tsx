import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

// Types basés sur votre API
interface UserStory {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  status: 'todo' | 'in_progress' | 'testing' | 'done';
  created_at: string;
  updated_at: string;
  epic: number;
  sprint: string | null;
  assignee: number[];
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  mentions: string[];
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team: string;
  avatar: string;
  createdAt: string;
  lastLogin: string | null;
}

interface KanbanBoardProps {
  showAllTasks?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ showAllTasks = false }) => {
  const [tasks, setTasks] = useState<UserStory[]>([]);
  const [allTasks, setAllTasks] = useState<UserStory[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<UserStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Mapping des statuts frontend vers backend
  const frontendToBackendStatus: { [key: string]: string } = {
    'todo': 'ready',
    'in_progress': 'in_progress',
    'testing': 'testing',
    'done': 'done'
  };

  // ✅ Mapping des statuts backend vers frontend
  const backendToFrontendStatus: { [key: string]: string } = {
    'ready': 'todo',
    'in_progress': 'in_progress',
    'testing': 'testing',
    'done': 'done',
    'in_review': 'testing', // Mapper in_review vers testing pour l'UI
    'blocked': 'todo' // Mapper blocked vers todo pour l'UI
  };

  const columns = [
    { id: 'todo', title: 'À Faire', status: 'todo' as const },
    { id: 'in_progress', title: 'En Cours', status: 'in_progress' as const },
    { id: 'testing', title: 'En Test', status: 'testing' as const },
    { id: 'done', title: 'Terminé', status: 'done' as const }
  ];

  const token = localStorage.getItem('access_token');

  // ✅ Fonction utilitaire pour gérer les réponses API
  const handleApiResponse = async (response: Response) => {
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('❌ API Error (JSON):', errorData);
        throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
      } else {
        // Si ce n'est pas du JSON, c'est probablement du HTML (page d'erreur)
        const htmlContent = await response.text();
        console.error('❌ API Error (HTML):', htmlContent.substring(0, 200) + '...');
        
        if (response.status === 401) {
          throw new Error('Token d\'authentification expiré ou invalide');
        } else if (response.status === 404) {
          throw new Error('Endpoint API introuvable');
        } else if (response.status >= 500) {
          throw new Error('Erreur serveur interne');
        } else {
          throw new Error(`Erreur HTTP ${response.status}: Le serveur a retourné du HTML au lieu de JSON`);
        }
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textContent = await response.text();
      console.error('❌ Réponse non-JSON:', textContent.substring(0, 200) + '...');
      throw new Error('Le serveur n\'a pas retourné de JSON valide');
    }

    return response.json();
  };

  // Récupérer l'utilisateur actuel
  const fetchCurrentUser = async () => {
    try {
      console.log('🔍 Fetching current user with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/current-user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const data = await handleApiResponse(response);
      console.log('✅ Current user data:', data);
      
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      console.error('❌ Error fetching current user:', err);
      throw err;
    }
  };

  // Charger les tâches depuis l'API
  const fetchTasks = async (userId: number) => {
    try {
      console.log('🔍 Fetching tasks for user:', userId);
      console.log('🔍 Using token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/userstories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const data = await handleApiResponse(response);
      console.log('📦 All tasks received:', data);
      console.log('📊 Total tasks count:', data.length);
      
      // ✅ Mapper les statuts backend vers frontend
      const mappedTasks = data.map((task: any) => ({
        ...task,
        status: backendToFrontendStatus[task.status] || task.status
      }));

      // Afficher les détails de chaque tâche
      mappedTasks.forEach((task: UserStory, index: number) => {
        console.log(`📋 Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          status: task.status,
          assignee: task.assignee,
          isAssignedToUser: task.assignee.includes(userId)
        });
      });

      setAllTasks(mappedTasks);
      
      if (showAllTasks) {
        console.log('🌐 Showing ALL tasks (debug mode)');
        setTasks(mappedTasks);
      } else {
        // Filtrer seulement les tâches assignées à l'utilisateur connecté
        const userTasks = mappedTasks.filter((task: UserStory) => {
          const isAssigned = task.assignee.includes(userId);
          console.log(`🎯 Task "${task.title}" (ID: ${task.id}) - Assignees: [${task.assignee.join(', ')}] - Assigned to user ${userId}: ${isAssigned ? '✅' : '❌'}`);
          return isAssigned;
        });

        console.log('👤 Filtered user tasks:', userTasks);
        console.log('📈 User tasks count:', userTasks.length);
        setTasks(userTasks);
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Initialiser les données
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const user = await fetchCurrentUser();
        if (user) {
          await fetchTasks(user.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [showAllTasks]);

  const getTasksByStatus = (status: string) => {
    const filteredTasks = tasks.filter(task => task.status === status);
    console.log(`🔍 Tasks with status "${status}":`, filteredTasks.length);
    return filteredTasks;
  };

  // ✅ Mettre à jour le statut d'une tâche avec token et mapping
  const updateTaskStatus = async (taskId: number, newFrontendStatus: string) => {
    try {
      console.log(`🔄 Updating task ${taskId} to frontend status: ${newFrontendStatus}`);
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // Mapper le statut frontend vers le statut backend
      const backendStatus = frontendToBackendStatus[newFrontendStatus];
      if (!backendStatus) {
        throw new Error(`Statut frontend inconnu: ${newFrontendStatus}`);
      }
      
      console.log(`📝 Mapped status: ${newFrontendStatus} -> ${backendStatus}`);
      console.log('🔍 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`http://127.0.0.1:8000/api/userstories/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          status: backendStatus, // ✅ Utiliser le statut backend
          updated_at: new Date().toISOString()
        })
      });

      const updatedTask = await handleApiResponse(response);
      console.log('✅ Task updated successfully:', updatedTask);

      // Mettre à jour l'état local avec le statut frontend
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newFrontendStatus as any, // Garder le statut frontend pour l'UI
                updated_at: new Date().toISOString() 
              }
            : task
        )
      );

      console.log(`✅ Tâche ${taskId} mise à jour vers "${newFrontendStatus}" (backend: "${backendStatus}")`);

    } catch (err) {
      console.error('❌ Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      
      // Recharger les tâches pour synchroniser l'état
      if (currentUser) {
        fetchTasks(currentUser.id);
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    updateTaskStatus(taskId, newStatus);
  };

  const handleTaskClick = (task: UserStory) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // ✅ Fonction handleTaskUpdate corrigée
  const handleTaskUpdate = async (taskId: number, updates: Partial<UserStory>) => {
    try {
      console.log('🔄 Updating task:', taskId, updates);
      console.log('🔍 Using token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // Préparer les données à envoyer
      const dataToSend = { ...updates };
      
      // Mapper le statut si nécessaire
      if (updates.status) {
        const backendStatus = frontendToBackendStatus[updates.status];
        if (backendStatus) {
          dataToSend.status = backendStatus;
          console.log(`📝 Status mapped: ${updates.status} -> ${backendStatus}`);
        }
      }

      const response = await fetch(`http://127.0.0.1:8000/api/userstories/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Token ajouté
        },
        body: JSON.stringify({
          ...dataToSend,
          updated_at: new Date().toISOString()
        })
      });

      const updatedTaskFromServer = await handleApiResponse(response);
      console.log('✅ Task updated successfully:', updatedTaskFromServer);

      // Mettre à jour l'état local (garder les statuts frontend pour l'UI)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                ...updates, // Utiliser les updates originaux (frontend) pour l'UI
                updated_at: new Date().toISOString() 
              }
            : task
        )
      );

      console.log(`✅ Tâche ${taskId} mise à jour avec succès`);
      handleCloseModal();
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement des tâches...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-red-600 mb-4">Erreur: {error}</div>
          <button 
            onClick={() => {
              if (currentUser) {
                setLoading(true);
                setError(null);
                fetchTasks(currentUser.id).finally(() => setLoading(false));
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-title font-poppins font-semibold text-secondary-2 dark:text-white mb-2">
            {showAllTasks ? 'Toutes les Tâches (Debug)' : `Mes Tâches - ${currentUser?.name || 'Utilisateur'}`}
          </h1>
          <p className="text-base lg:text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
            Gérez vos tâches assignées avec le drag & drop
          </p>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            {currentUser && (
              <>
                <div>Utilisateur: {currentUser.name}</div>
                <div>Équipe: {currentUser.team}</div>
                <div>Rôle: {currentUser.role}</div>
                <div>Token: {token ? '✅ Présent' : '❌ Manquant'}</div>
              </>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.status);
              return (
                <div key={column.id} className="bg-cards dark:bg-gray-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-poppins font-medium text-lg text-secondary-2 dark:text-white">
                      {column.title}
                    </h3>
                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] space-y-3 ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${
                                  snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                                }`}
                              >
                                <TaskCard 
                                  task={task} 
                                  onClick={() => handleTaskClick(task)}
                                  currentUser={currentUser}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && currentUser && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleTaskUpdate}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default KanbanBoard;