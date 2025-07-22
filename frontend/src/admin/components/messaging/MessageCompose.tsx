import React, { useState } from 'react';
import { User } from '../../types/index';
import { Send, X, Paperclip, Users } from 'lucide-react';

interface MessageComposeProps {
  users: User[];
  onSend: (message: { recipientId: string; subject: string; content: string }) => void;
  onCancel: () => void;
}

export const MessageCompose: React.FC<MessageComposeProps> = ({
  users,
  onSend,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.recipientId && formData.subject && formData.content) {
      onSend(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Nouveau message
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-open-sans text-paragraph mt-1">
            Composez un nouveau message
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-secondary-2 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users size={16} className="inline mr-2" />
              Destinataire *
            </label>
            <select
              name="recipientId"
              value={formData.recipientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sélectionnez un destinataire</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role}) - {user.team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sujet *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Objet du message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Tapez votre message ici..."
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Paperclip size={16} className="mr-2" />
              Joindre un fichier
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-secondary-2 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <Send size={16} className="mr-2" />
                Envoyer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};