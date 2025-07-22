import React, { useState } from 'react';
import { useScrum, UserStory } from '../../contexts/ScrumContext';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import UserStoryCard from './UserStoryCard';
import UserStoryModal from './UserStoryModal';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export default function Backlog() {
  const { state, dispatch } = useScrum();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);

  const handleAddStory = (): void => {
    setEditingStory(null);
    setIsModalOpen(true);
  };

  const handleEditStory = (story: UserStory): void => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleDeleteStory = (storyId: string): void => {
    dispatch({ type: 'DELETE_USER_STORY', payload: storyId });
  };

  const handleDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const items = Array.from(state.userStories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    dispatch({ type: 'REORDER_STORIES', payload: items });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-semibold font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Product Backlog
          </h2>
          <p className={`font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Gérez vos User Stories par ordre de priorité
          </p>
        </div>
        <button
          onClick={handleAddStory}
          className="bg-button text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle User Story</span>
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="backlog">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {state.userStories.map((story: UserStory, index: number) => (
                <Draggable key={story.id} draggableId={story.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                      }`}
                    >
                      <UserStoryCard
                        story={story}
                        onEdit={() => handleEditStory(story)}
                        onDelete={() => handleDeleteStory(story.id)}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isModalOpen && (
        <UserStoryModal
          story={editingStory}
          onClose={() => setIsModalOpen(false)}
          sprints={state.sprints}
        />
      )}
    </div>
  );
}