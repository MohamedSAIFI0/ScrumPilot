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
  sprint: number | null;
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

interface KanbanBoardProps {
  currentUserId: number; // ID de l'utilisateur connecté
  showAllTasks?: boolean; // Pour le debug
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ currentUserId, showAllTasks = false }) => {
  const [tasks, setTasks] = useState<UserStory[]>([]);
  const [allTasks, setAllTasks] = useState<UserStory[]>([]);
  const [selectedTask, setSelectedTask] = useState<UserStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapping des statuts de l'API vers les colonnes du Kanban
  const statusMapping: { [key: string]: string } = {
    'todo': 'todo',
    'in_progress': 'in_progress', 
    'testing': 'testing',
    'done': 'done'
  };

  const columns = [
    { id: 'todo', title: 'À Faire', status: 'todo' as const },
    { id: 'in_progress', title: 'En Cours', status: 'in_progress' as const },
    { id: 'testing', title: 'En Test', status: 'testing' as const },
    { id: 'done', title: 'Terminé', status: 'done' as const }
  ];

  // Charger les tâches depuis l'API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tasks for user:', currentUserId);
      
      const response = await fetch('http://127.0.0.1:8000/api/userstories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 All tasks received:', data);
      console.log('📊 Total tasks count:', data.length);
      
      // Afficher les détails de chaque tâche
      data.forEach((task: UserStory, index: number) => {
        console.log(`📋 Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          status: task.status,
          assignee: task.assignee,
          isAssignedToUser: task.assignee.includes(currentUserId)
        });
      });

      setAllTasks(data);
      
      if (showAllTasks) {
        console.log('🌐 Showing ALL tasks (debug mode)');
        setTasks(data);
      } else {
        // Filtrer seulement les tâches assignées à l'utilisateur connecté
        const userTasks = data.filter((task: UserStory) => {
          const isAssigned = task.assignee.includes(currentUserId);
          console.log(`🎯 Task "${task.title}" (ID: ${task.id}) - Assignees: [${task.assignee.join(', ')}] - Assigned to user ${currentUserId}: ${isAssigned ? '✅' : '❌'}`);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUserId, showAllTasks]);

  const getTasksByStatus = (status: string) => {
    const filteredTasks = tasks.filter(task => task.status === status);
    console.log(`🔍 Tasks with status "${status}":`, filteredTasks.length);
    return filteredTasks;
  };

  // Mettre à jour le statut d'une tâche
  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      console.log(`🔄 Updating task ${taskId} to status: ${newStatus}`);
      
      const response = await fetch(`http://127.0.0.1:8000/api/userstories/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      const updatedTask = await response.json();
      console.log('✅ Task updated successfully:', updatedTask);

      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as any, updated_at: new Date().toISOString() }
            : task
        )
      );

    } catch (err) {
      console.error('❌ Error updating task:', err);
      // Optionnel: afficher une notification d'erreur
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

  const handleTaskUpdate = async (taskId: number, updates: Partial<UserStory>) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/userstories/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
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
            onClick={fetchTasks}
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
            {showAllTasks ? 'Toutes les Tâches (Debug)' : 'Mes Tâches'}
          </h1>
          <p className="text-base lg:text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
            Gérez vos tâches assignées avec le drag & drop
          </p>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <div>Total des tâches affichées: {tasks.length}</div>
            <div>Total des tâches dans la DB: {allTasks.length}</div>
            <div>Utilisateur ID: {currentUserId}</div>
            <div>Mode debug: {showAllTasks ? 'Activé' : 'Désactivé'}</div>
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

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleTaskUpdate}
        />
      )}
    </>
  );
};

export default KanbanBoard;