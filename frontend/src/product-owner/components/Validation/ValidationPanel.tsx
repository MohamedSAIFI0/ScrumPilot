import React from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import ValidationCard from './ValidationCard';

export default function ValidationPanel() {
  const { state } = useScrum();

  const completedStories = state.userStories.filter(story => story.status === 'Done');
  const validatedStories = completedStories.filter(story => 
    story.comments.some(comment => comment.text.includes('VALIDATED') || comment.text.includes('REJECTED'))
  );
  const pendingValidation = completedStories.filter(story => 
    !story.comments.some(comment => comment.text.includes('VALIDATED') || comment.text.includes('REJECTED'))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold font-poppins ${
          state.darkMode ? 'text-dark-text' : 'text-secondary-2'
        }`}>
          Validation des Tâches
        </h2>
        <p className={`font-open-sans ${
          state.darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Validez ou rejetez les tâches terminées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 shadow-sm border ${
          state.darkMode 
            ? 'bg-dark-card border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className={`font-semibold font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                En attente
              </h3>
              <p className={`text-sm font-open-sans ${
                state.darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {pendingValidation.length} tâche(s)
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-sm border ${
          state.darkMode 
            ? 'bg-dark-card border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className={`font-semibold font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                Validées
              </h3>
              <p className={`text-sm font-open-sans ${
                state.darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {validatedStories.filter(story => 
                  story.comments.some(comment => comment.text.includes('VALIDATED'))
                ).length} tâche(s)
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-sm border ${
          state.darkMode 
            ? 'bg-dark-card border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className={`font-semibold font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                Rejetées
              </h3>
              <p className={`text-sm font-open-sans ${
                state.darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {validatedStories.filter(story => 
                  story.comments.some(comment => comment.text.includes('REJECTED'))
                ).length} tâche(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tâches en attente de validation */}
      {pendingValidation.length > 0 && (
        <div>
          <h3 className={`text-lg font-medium mb-4 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Tâches à valider
          </h3>
          <div className="space-y-4">
            {pendingValidation.map(story => (
              <ValidationCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}

      {/* Tâches déjà validées */}
      {validatedStories.length > 0 && (
        <div>
          <h3 className={`text-lg font-medium mb-4 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Historique des validations
          </h3>
          <div className="space-y-4">
            {validatedStories.map(story => (
              <ValidationCard key={story.id} story={story} readonly />
            ))}
          </div>
        </div>
      )}

      {completedStories.length === 0 && (
        <div className={`text-center py-12 ${
          state.darkMode ? 'bg-dark-card' : 'bg-cards'
        } rounded-lg`}>
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
            state.darkMode ? 'text-gray-600' : 'text-gray-300'
          }`} />
          <h3 className={`text-lg font-medium mb-2 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Aucune tâche à valider
          </h3>
          <p className={`font-open-sans ${
            state.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Les tâches terminées apparaîtront ici pour validation
          </p>
        </div>
      )}
    </div>
  );
}