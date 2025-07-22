import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Impediment } from '../types';
import { mockUser } from '../data/mockData';

interface ImpedimentModalProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (impediment: Omit<Impediment, 'id'>) => void;
}

const ImpedimentModal: React.FC<ImpedimentModalProps> = ({ 
  taskId, 
  taskTitle, 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'critical'>('moderate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'pending',
        taskId,
        reportedBy: mockUser,
        reportedAt: new Date()
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setSeverity('moderate');
      onClose();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'moderate': return 'border-yellow-500 bg-yellow-50';
      case 'minor': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h2 className="text-xl font-poppins font-semibold text-secondary-2">
              Signaler un Blocage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Tâche concernée</h3>
            <p className="text-sm text-gray-600">{taskTitle}</p>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-2">
              Titre du blocage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Problème d'accès à l'API externe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez précisément le problème rencontré, les étapes pour le reproduire, et l'impact sur votre travail..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={5}
              required
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block font-medium mb-3">
              Gravité du blocage <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'minor', label: 'Mineur', desc: 'N\'empêche pas de continuer le travail' },
                { value: 'moderate', label: 'Modéré', desc: 'Ralentit significativement le travail' },
                { value: 'critical', label: 'Critique', desc: 'Bloque complètement le travail' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    value={option.value}
                    checked={severity === option.value}
                    onChange={(e) => setSeverity(e.target.value as 'minor' | 'moderate' | 'critical')}
                    className="mr-3"
                  />
                  <div className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    severity === option.value ? getSeverityColor(option.value) : 'border-gray-200'
                  }`}>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Signaler le Blocage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImpedimentModal;