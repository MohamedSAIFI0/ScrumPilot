import React, { useState } from 'react';
import { ExternalLink, Check, X, MessageCircle } from 'lucide-react';
import { Deliverable } from '../../types';

interface DeliverableCardProps {
  deliverable: Deliverable;
  onValidate: (id: string, status: 'validated' | 'rejected', comment?: string) => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({ 
  deliverable, 
  onValidate 
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'validated' | 'rejected'>('validated');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'validated': return '🟢 Validé';
      case 'rejected': return '🔴 Rejeté';
      default: return '🟡 En attente';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return '🎨';
      case 'doc': return '📄';
      case 'feature': return '⚡';
      default: return '📦';
    }
  };

  const handleAction = (type: 'validated' | 'rejected') => {
    if (type === 'rejected') {
      setActionType(type);
      setShowCommentModal(true);
    } else {
      onValidate(deliverable.id, type);
    }
  };

  const handleSubmitComment = () => {
    onValidate(deliverable.id, actionType, comment);
    setShowCommentModal(false);
    setComment('');
  };

  return (
    <>
      <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4 lg:mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
              <span className="text-xl lg:text-2xl">{getTypeIcon(deliverable.type)}</span>
              <h3 className="font-poppins font-semibold text-secondary-2 text-base lg:text-lg xl:text-xl truncate">
                {deliverable.name}
              </h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600 font-open-sans mb-2">
              {deliverable.sprint}
            </p>
            <p className="text-xs lg:text-sm text-gray-500">
              Uploadé le {new Date(deliverable.uploadDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <span className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium flex-shrink-0 ml-3 ${getStatusColor(deliverable.status)}`}>
            {getStatusText(deliverable.status)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
          <a
            href={deliverable.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-button hover:text-blue-700 font-open-sans text-sm lg:text-base transition-colors"
          >
            <ExternalLink size={16} />
            <span>Voir le livrable</span>
          </a>

          {deliverable.status === 'pending' && (
            <div className="flex space-x-2 lg:space-x-3">
              <button
                onClick={() => handleAction('validated')}
                className="flex items-center space-x-1 lg:space-x-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm lg:text-base"
              >
                <Check size={16} />
                <span>Valider</span>
              </button>
              <button
                onClick={() => handleAction('rejected')}
                className="flex items-center space-x-1 lg:space-x-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm lg:text-base"
              >
                <X size={16} />
                <span>Rejeter</span>
              </button>
            </div>
          )}
        </div>

        {deliverable.comments && (
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2 mb-1 lg:mb-2">
              <MessageCircle size={14} className="text-gray-500" />
              <span className="text-sm lg:text-base font-medium text-gray-700">Commentaire:</span>
            </div>
            <p className="text-sm lg:text-base text-gray-600">{deliverable.comments}</p>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 lg:p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="font-poppins font-semibold text-lg lg:text-xl mb-4 lg:mb-6">
              Ajouter un commentaire
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Expliquez pourquoi vous rejetez ce livrable..."
              className="w-full p-3 lg:p-4 border border-gray-300 rounded-md resize-none h-24 lg:h-32 font-open-sans text-sm lg:text-base"
            />
            <div className="flex justify-end space-x-3 lg:space-x-4 mt-4 lg:mt-6">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 lg:px-6 lg:py-3 text-gray-600 hover:text-gray-800 text-sm lg:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitComment}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm lg:text-base"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};