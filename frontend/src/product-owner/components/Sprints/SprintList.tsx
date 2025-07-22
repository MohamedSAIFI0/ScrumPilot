import React, { useState } from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { Plus, Calendar, Target, Users } from 'lucide-react';
import SprintCard from './SprintCard';
import SprintModal from './SprintModal';

import { Sprint } from '../../contexts/ScrumContext';

export default function SprintList() {
  const { state } = useScrum();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const handleAddSprint = (): void => {
    setEditingSprint(null);
    setIsModalOpen(true);
  };

  const handleEditSprint = (sprint: Sprint): void => {
    setEditingSprint(sprint);
    setIsModalOpen(true);
  };

  const activeSprints = state.sprints.filter((s: Sprint) => s.status === 'active');
  const plannedSprints = state.sprints.filter((s: Sprint) => s.status === 'planned');
  const completedSprints = state.sprints.filter((s: Sprint) => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-semibold font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Gestion des Sprints
          </h2>
          <p className={`font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Planifiez et suivez vos sprints
          </p>
        </div>
        <button
          onClick={handleAddSprint}
          className="bg-button text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Sprint</span>
        </button>
      </div>

      {/* Sprints actifs */}
      {activeSprints.length > 0 && (
        <div>
          <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Sprints Actifs</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSprints.map((sprint: Sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                userStories={state.userStories}
                onEdit={() => handleEditSprint(sprint)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sprints planifiés */}
      {plannedSprints.length > 0 && (
        <div>
          <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Sprints Planifiés</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedSprints.map((sprint: Sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                userStories={state.userStories}
                onEdit={() => handleEditSprint(sprint)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sprints terminés */}
      {completedSprints.length > 0 && (
        <div>
          <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span>Sprints Terminés</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSprints.map((sprint: Sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                userStories={state.userStories}
                onEdit={() => handleEditSprint(sprint)}
              />
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <SprintModal
          sprint={editingSprint}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}