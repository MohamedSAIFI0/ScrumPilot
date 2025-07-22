import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useScrum, Sprint } from '../../contexts/ScrumContext';

interface SprintModalProps {
  sprint?: Sprint | null;
  onClose: () => void;
}

export default function SprintModal({ sprint, onClose }: SprintModalProps) {
  const { dispatch } = useScrum();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
    status: 'planned' as 'planned' | 'active' | 'completed'
  });

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        startDate: new Date(sprint.startDate).toISOString().split('T')[0],
        endDate: new Date(sprint.endDate).toISOString().split('T')[0],
        goal: sprint.goal,
        status: sprint.status
      });
    }
  }, [sprint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSprint: Sprint = {
      id: sprint?.id || Date.now().toString(),
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      goal: formData.goal,
      status: formData.status,
      userStories: sprint?.userStories || [],
      createdAt: sprint?.createdAt || new Date()
    };

    if (sprint) {
      dispatch({ type: 'UPDATE_SPRINT', payload: newSprint });
    } else {
      dispatch({ type: 'ADD_SPRINT', payload: newSprint });
    }

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {sprint ? 'Modifier le Sprint' : 'Créer un nouveau Sprint'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Sprint *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Sprint 1 - Fondations"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif du Sprint *
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez l'objectif principal de ce sprint..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned">Planifié</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {sprint ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}