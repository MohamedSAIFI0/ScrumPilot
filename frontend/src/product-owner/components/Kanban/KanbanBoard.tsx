import React from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

export default function KanbanBoard() {
  const { state, dispatch } = useScrum();

  const columns = [
    { id: 'To Do', title: 'À faire', color: 'bg-gray-100' },
    { id: 'In Progress', title: 'En cours', color: 'bg-blue-100' },
    { id: 'Done', title: 'Terminé', color: 'bg-green-100' }
  ];

  const getStoriesByStatus = (status: string) => {
    return state.userStories.filter(story => story.status === status);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const story = state.userStories.find(s => s.id === draggableId);
      if (story) {
        const updatedStory = {
          ...story,
          status: destination.droppableId as 'To Do' | 'In Progress' | 'Done',
          updatedAt: new Date()
        };
        dispatch({ type: 'UPDATE_USER_STORY', payload: updatedStory });
      }
    }
  };

  const selectedSprint = state.sprints.find(s => s.id === state.selectedSprint);
  const sprintStories = state.userStories.filter(story => story.sprintId === state.selectedSprint);

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
            {selectedSprint ? `Sprint: ${selectedSprint.name}` : 'Aucun sprint sélectionné'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={state.selectedSprint || ''}
            onChange={(e) => dispatch({ type: 'SET_SELECTED_SPRINT', payload: e.target.value || null })}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
              state.darkMode 
                ? 'bg-dark-card border-gray-600 text-dark-text' 
                : 'bg-white border-gray-300 text-secondary-2'
            }`}
          >
            <option value="">Tous les sprints</option>
            {state.sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => {
            const stories = state.selectedSprint 
              ? sprintStories.filter(story => story.status === column.id)
              : getStoriesByStatus(column.id);

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
                      className={`space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                      }`}
                    >
                      {stories.map((story, index) => (
                        <Draggable key={story.id} draggableId={story.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'rotate-1 shadow-lg' : ''
                              }`}
                            >
                              <TaskCard story={story} />
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
  );
}