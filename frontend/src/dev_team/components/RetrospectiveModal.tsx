import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Save, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { Retrospective } from '../types';

interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface RetrospectiveModalProps {
  sprintId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (retrospective: Omit<Retrospective, 'id'>) => void;
  existingRetrospective?: Retrospective;
}

// Configuration de l'API - Version sécurisée
const API_CONFIG = {
  baseUrl: 'http://localhost:8000/api',
  endpoints: {
    sprints: 'http://localhost:8000/api/sprints/',
    retrospectives: 'http://localhost:8000/api/retrospectives/',
  }
};

const RetrospectiveModal: React.FC<RetrospectiveModalProps> = ({ 
  sprintId: initialSprintId, 
  isOpen, 
  onClose, 
  onSubmit,
  existingRetrospective 
}) => {
  // États pour le formulaire
  const [selectedSprintId, setSelectedSprintId] = useState(initialSprintId || existingRetrospective?.sprintId || '');
  const [whatWorked, setWhatWorked] = useState(existingRetrospective?.whatWorked || '');
  const [whatDidntWork, setWhatDidntWork] = useState(existingRetrospective?.whatDidntWork || '');
  const [improvements, setImprovements] = useState(existingRetrospective?.improvements || '');
  
  // États pour la gestion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const isReadOnly = existingRetrospective?.isLocked || false;
  const hasExisting = !!existingRetrospective;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Charger la liste des sprints
  const fetchSprints = async () => {
    try {
      setIsLoadingSprints(true);
      setError(null);

      const response = await fetch(API_CONFIG.endpoints.sprints, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des sprints: ${response.status}`);
      }

      const data = await response.json();
      setSprints(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des sprints:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sprints');
    } finally {
      setIsLoadingSprints(false);
    }
  };

  // Charger les sprints à l'ouverture de la modal
  useEffect(() => {
    if (isOpen && !hasExisting) {
      fetchSprints();
    }
  }, [isOpen, hasExisting]);

  const submitToBackend = async (retrospectiveData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        sprint: selectedSprintId,
        what_worked: retrospectiveData.whatWorked,
        what_didnt_work: retrospectiveData.whatDidntWork,
        improvements: retrospectiveData.improvements,
        is_locked: true
      };

      console.log('Envoi des données:', payload);

      const response = await fetch(API_CONFIG.endpoints.retrospectives, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      console.log('Réponse du serveur:', response.status);

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const savedRetrospective = await response.json();
      console.log('Rétrospective sauvegardée:', savedRetrospective);
      
      // Transformer la réponse du backend vers le format frontend
      const frontendRetrospective = {
        id: savedRetrospective.id,
        sprintId: savedRetrospective.sprint,
        whatWorked: savedRetrospective.what_worked,
        whatDidntWork: savedRetrospective.what_didnt_work,
        improvements: savedRetrospective.improvements,
        submittedBy: savedRetrospective.submitted_by,
        submittedAt: new Date(savedRetrospective.submitted_at),
        isLocked: savedRetrospective.is_locked
      };

      // Appeler la fonction onSubmit du parent avec les données formatées
      onSubmit(frontendRetrospective);
      
      return savedRetrospective;
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInBackend = async (retrospectiveData: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        what_worked: retrospectiveData.whatWorked,
        what_didnt_work: retrospectiveData.whatDidntWork,
        improvements: retrospectiveData.improvements,
      };

      console.log('Mise à jour des données:', payload);

      const response = await fetch(`${API_CONFIG.baseUrl}/retrospectives/${existingRetrospective?.id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedRetrospective = await response.json();
      console.log('Rétrospective mise à jour:', updatedRetrospective);
      
      // Transformer la réponse du backend vers le format frontend
      const frontendRetrospective = {
        id: updatedRetrospective.id,
        sprintId: updatedRetrospective.sprint,
        whatWorked: updatedRetrospective.what_worked,
        whatDidntWork: updatedRetrospective.what_didnt_work,
        improvements: updatedRetrospective.improvements,
        submittedBy: updatedRetrospective.submitted_by,
        submittedAt: new Date(updatedRetrospective.submitted_at),
        isLocked: updatedRetrospective.is_locked
      };

      onSubmit(frontendRetrospective);
      
      return updatedRetrospective;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReadOnly || isSubmitting) return;
    
    // Validation des champs
    if (!selectedSprintId) {
      setError('Veuillez sélectionner un sprint');
      return;
    }
    
    if (!whatWorked.trim() || !whatDidntWork.trim() || !improvements.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    const retrospectiveData = {
      sprintId: selectedSprintId,
      whatWorked: whatWorked.trim(),
      whatDidntWork: whatDidntWork.trim(),
      improvements: improvements.trim(),
      submittedAt: new Date(),
      isLocked: true
    };

    try {
      if (hasExisting && !existingRetrospective?.isLocked) {
        await updateInBackend(retrospectiveData);
      } else if (!hasExisting) {
        await submitToBackend(retrospectiveData);
      }
      onClose();
    } catch (err) {
      // L'erreur est déjà gérée dans les fonctions appelées
    }
  };

  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId);

  // Early return AFTER all hooks have been called
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-primary mr-3" />
              <div>
                <h2 className="text-xl font-poppins font-semibold text-secondary-2">
                  {hasExisting ? 'Ma Rétrospective' : 'Participer à la Rétrospective'}
                </h2>
                {isReadOnly && (
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Soumise le {existingRetrospective?.submittedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Instructions */}
          {!hasExisting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
              <p className="text-sm text-blue-800">
                Sélectionnez un sprint et partagez votre feedback. Vos réponses seront compilées avec celles de l'équipe 
                pour améliorer nos processus. Une fois soumis, vous ne pourrez plus modifier vos réponses.
              </p>
            </div>
          )}

          {/* Sélection du Sprint */}
          {!hasExisting && (
            <div>
              <label className="block font-poppins font-medium mb-3 flex items-center">
                <span className="text-purple-600 text-xl mr-2">🏃‍♂️</span>
                Sélectionner un Sprint
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className={`w-full p-4 border border-gray-300 rounded-lg font-open-sans appearance-none bg-white ${
                    isSubmitting || isLoadingSprints
                      ? 'bg-gray-50 cursor-not-allowed' 
                      : 'focus:ring-2 focus:ring-primary focus:border-transparent'
                  }`}
                  required
                  disabled={isSubmitting || isLoadingSprints}
                >
                  <option value="">
                    {isLoadingSprints ? 'Chargement des sprints...' : 'Sélectionnez un sprint'}
                  </option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} - {new Date(sprint.start_date).toLocaleDateString()} à {new Date(sprint.end_date).toLocaleDateString()}
                      {sprint.status && ` (${sprint.status})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {selectedSprint && (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Sprint sélectionné :</strong> {selectedSprint.name}
                    <br />
                    <strong>Période :</strong> Du {new Date(selectedSprint.start_date).toLocaleDateString()} 
                    au {new Date(selectedSprint.end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What Worked */}
          <div>
            <label className="block font-poppins font-medium mb-3 flex items-center">
              <span className="text-green-600 text-xl mr-2">✅</span>
              Ce qui a bien fonctionné
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="Décrivez les aspects positifs du sprint : processus efficaces, bonnes pratiques, collaboration réussie, outils utiles..."
              className={`w-full p-4 border border-gray-300 rounded-lg resize-none font-open-sans ${
                isReadOnly || isSubmitting
                  ? 'bg-gray-50 cursor-not-allowed' 
                  : 'focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              rows={4}
              required={!isReadOnly}
              readOnly={isReadOnly}
              disabled={isSubmitting}
            />
          </div>

          {/* What Didn't Work */}
          <div>
            <label className="block font-poppins font-medium mb-3 flex items-center">
              <span className="text-red-600 text-xl mr-2">❌</span>
              Ce qui n'a pas bien fonctionné
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              placeholder="Identifiez les problèmes rencontrés : blocages récurrents, processus inefficaces, défis techniques, problèmes de communication..."
              className={`w-full p-4 border border-gray-300 rounded-lg resize-none font-open-sans ${
                isReadOnly || isSubmitting
                  ? 'bg-gray-50 cursor-not-allowed' 
                  : 'focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              rows={4}
              required={!isReadOnly}
              readOnly={isReadOnly}
              disabled={isSubmitting}
            />
          </div>

          {/* Improvements */}
          <div>
            <label className="block font-poppins font-medium mb-3 flex items-center">
              <span className="text-blue-600 text-xl mr-2">💡</span>
              Suggestions d'amélioration
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Proposez des solutions concrètes : nouveaux processus, outils à adopter, formations nécessaires, changements organisationnels..."
              className={`w-full p-4 border border-gray-300 rounded-lg resize-none font-open-sans ${
                isReadOnly || isSubmitting
                  ? 'bg-gray-50 cursor-not-allowed' 
                  : 'focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              rows={4}
              required={!isReadOnly}
              readOnly={isReadOnly}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting || (!selectedSprintId && !hasExisting)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasExisting ? 'Mettre à jour' : 'Soumettre ma Rétrospective'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {isReadOnly && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Statut :</strong> Votre rétrospective a été soumise et est maintenant en lecture seule. 
                Le Scrum Master compilera les retours de l'équipe pour la session de rétrospective.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetrospectiveModal;