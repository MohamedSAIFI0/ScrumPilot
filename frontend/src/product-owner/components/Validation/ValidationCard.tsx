import React, { useState } from 'react';
import { CheckCircle2, XCircle, MessageCircle, User } from 'lucide-react';
import { useScrum, UserStory, Comment } from '../../contexts/ScrumContext';

interface ValidationCardProps {
  story: UserStory;
  readonly?: boolean;
}

export default function ValidationCard({ story, readonly = false }: ValidationCardProps) {
  const { state, dispatch } = useScrum();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const isValidated = story.comments.some(comment => comment.text.includes('VALIDATED'));
  const isRejected = story.comments.some(comment => comment.text.includes('REJECTED'));

  const handleValidate = () => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text: 'VALIDATED - Tâche validée par le Product Owner',
      author: 'Marie Dubois (PO)',
      createdAt: new Date(),
      mentions: []
    };

    dispatch({ type: 'ADD_COMMENT', payload: { storyId: story.id, comment: newComment } });
  };

  const handleReject = () => {
    if (comment.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: `REJECTED - ${comment}`,
        author: 'Marie Dubois (PO)',
        createdAt: new Date(),
        mentions: []
      };

      dispatch({ type: 'ADD_COMMENT', payload: { storyId: story.id, comment: newComment } });

      // Remettre la tâche en "In Progress"
      const updatedStory = {
        ...story,
        status: 'In Progress' as const,
        updatedAt: new Date()
      };
      dispatch({ type: 'UPDATE_USER_STORY', payload: updatedStory });

      setComment('');
      setShowCommentForm(false);
    } else {
      setShowCommentForm(true);
    }
  };

  const getStatusInfo = () => {
    if (isValidated) {
      return {
        color: state.darkMode 
          ? 'border-green-600 bg-green-900/20' 
          : 'border-green-200 bg-green-50',
        badge: 'bg-green-100 text-green-800',
        text: 'Validée'
      };
    } else if (isRejected) {
      return {
        color: state.darkMode 
          ? 'border-red-600 bg-red-900/20' 
          : 'border-red-200 bg-red-50',
        badge: 'bg-red-100 text-red-800',
        text: 'Rejetée'
      };
    } else {
      return {
        color: state.darkMode 
          ? 'border-yellow-600 bg-yellow-900/20' 
          : 'border-yellow-200 bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-800',
        text: 'En attente'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${statusInfo.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className={`text-lg font-semibold font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              {story.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
              {statusInfo.text}
            </span>
          </div>
          
          <p className={`mb-4 font-open-sans ${
            state.darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {story.description}
          </p>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className={`flex items-center space-x-1 text-sm ${
              state.darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="font-medium">Points:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {story.points}
              </span>
            </div>
            
            <div className={`flex items-center space-x-1 text-sm ${
              state.darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                {story.tag}
              </span>
            </div>
            
            {story.assignee && (
              <div className={`flex items-center space-x-1 text-sm ${
                state.darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <User className="w-4 h-4" />
                <span>{story.assignee}</span>
              </div>
            )}
          </div>

          {/* Commentaires de validation */}
          {story.comments.filter(c => c.text.includes('VALIDATED') || c.text.includes('REJECTED')).length > 0 && (
            <div className={`mt-4 p-3 rounded-lg ${
              state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-medium mb-2 font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                Commentaires de validation
              </h4>
              {story.comments
                .filter(c => c.text.includes('VALIDATED') || c.text.includes('REJECTED'))
                .map(comment => (
                  <div key={comment.id} className={`text-sm font-open-sans ${
                    state.darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">{comment.author}:</span> {comment.text}
                    <span className={`text-xs ml-2 ${
                      state.darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {!readonly && !isValidated && !isRejected && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidate}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider</span>
            </button>
            <button
              onClick={handleReject}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
          </div>
        )}
      </div>

      {showCommentForm && (
        <div className={`mt-4 p-4 rounded-lg ${
          state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
        }`}>
          <h4 className={`text-sm font-medium mb-2 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Motif du rejet
          </h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Expliquez pourquoi cette tâche est rejetée..."
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
              state.darkMode 
                ? 'bg-dark-card border-gray-600 text-dark-text placeholder-gray-400' 
                : 'bg-white border-gray-300 text-secondary-2'
            }`}
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setShowCommentForm(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                state.darkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}