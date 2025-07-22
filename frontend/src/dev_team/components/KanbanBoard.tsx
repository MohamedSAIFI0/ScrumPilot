import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task } from '../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { id: 'todo', title: 'À Faire', status: 'todo' as const },
    { id: 'inprogress', title: 'En Cours', status: 'inprogress' as const },
    { id: 'done', title: 'Terminé', status: 'done' as const }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as 'todo' | 'inprogress' | 'done';
    onTaskUpdate(draggableId, { 
      status: newStatus,
      updatedAt: new Date()
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSave = (taskId: string, updates: Partial<Task>) => {
    onTaskUpdate(taskId, updates);
    handleCloseModal();
  };

  return (
    <>
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-title font-poppins font-semibold text-secondary-2 dark:text-white mb-2">
            Tableau des Tâches
          </h1>
          <p className="text-base lg:text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
            Gérez vos tâches en cours avec le drag & drop
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {columns.map((column) => (
              <div key={column.id} className="bg-cards dark:bg-gray-800 rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-poppins font-medium text-lg text-secondary-2 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
                    {getTasksByStatus(column.status).length}
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
                      {getTasksByStatus(column.status).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
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
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleTaskSave}
        />
      )}
    </>
  );
};

export default KanbanBoard;