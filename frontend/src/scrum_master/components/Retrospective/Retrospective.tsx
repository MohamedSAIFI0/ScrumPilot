import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Calendar, User, Clock, Filter, CheckCircle2, AlertCircle, Eye, TrendingUp } from 'lucide-react';

interface SubmittedBy {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team: string;
  avatar: string;
  createdAt: string;
  lastLogin: string | null;
}

interface Retrospective {
  id: string;
  sprint: string;
  sprint_name?: string;
  what_worked: string;
  what_didnt_work: string;
  improvements: string;
  submitted_by: SubmittedBy;
  submitted_at: string;
  is_locked: boolean;
}

interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000/api',
  endpoints: {
    retrospectives: 'http://127.0.0.1:8000/api/retrospectives/',
    sprints: 'http://127.0.0.1:8000/api/sprints/',
  }
};

const RetrospectivesDashboard: React.FC = () => {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [selectedRetrospective, setSelectedRetrospective] = useState<Retrospective | null>(null);

  const getAuthHeaders = () => {
    // Récupération du token depuis le localStorage/sessionStorage ou votre méthode d'auth
    let token = null;
    try {
      token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
    } catch (e) {
      // Fallback si localStorage n'est pas disponible
      console.warn('localStorage non disponible');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const fetchRetrospectives = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://127.0.0.1:8000/api/retrospectives/', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Données reçues:', data); // Pour débugger
      
      // Gestion des différents formats de réponse possible
      setRetrospectives(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des rétrospectives:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/sprints/', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des sprints: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Sprints reçus:', data); // Pour débugger
      
      // Gestion des différents formats de réponse possible
      setSprints(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des sprints:', err);
      // On continue même si les sprints ne se chargent pas
    }
  };

  useEffect(() => {
    fetchRetrospectives();
    fetchSprints();
  }, []);

  const getSprintName = (sprintId: string) => {
    if (!sprintId) return 'Sprint inconnu';
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.name : `Sprint ${sprintId}`;
  };

  const getSubmitterName = (submittedBy: SubmittedBy) => {
    return submittedBy?.name || submittedBy?.email || 'Utilisateur inconnu';
  };

  const filteredRetrospectives = retrospectives.filter(retro => {
    const searchLower = searchTerm.toLowerCase();
    const submitterName = getSubmitterName(retro.submitted_by);
    
    const matchesSearch = 
      submitterName.toLowerCase().includes(searchLower) ||
      (retro.what_worked || '').toLowerCase().includes(searchLower) ||
      (retro.what_didnt_work || '').toLowerCase().includes(searchLower) ||
      (retro.improvements || '').toLowerCase().includes(searchLower) ||
      getSprintName(retro.sprint || '').toLowerCase().includes(searchLower);
    
    const matchesSprint = selectedSprint === '' || retro.sprint === selectedSprint;
    
    return matchesSearch && matchesSprint;
  });

  const totalRetrospectives = retrospectives.length;
  const uniqueSprints = [...new Set(retrospectives.map(r => r.sprint).filter(Boolean))].length;
  const uniqueContributors = [...new Set(retrospectives.map(r => r.submitted_by?.id).filter(Boolean))].length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rétrospectives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
                Dashboard des Rétrospectives
              </h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble des retours d'équipe</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <div className="flex items-center text-purple-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="font-medium">{totalRetrospectives} rétrospectives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Rétrospectives</p>
                <p className="text-2xl font-bold text-gray-900">{totalRetrospectives}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sprints Couverts</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueSprints}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Contributeurs</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueContributors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par développeur, contenu, sprint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative min-w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Tous les sprints</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Retrospectives Grid */}
        {filteredRetrospectives.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedSprint ? 'Aucun résultat trouvé' : 'Aucune rétrospective disponible'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedSprint 
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Les rétrospectives apparaîtront ici une fois soumises par l\'équipe.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRetrospectives.map((retrospective) => (
              <div 
                key={retrospective.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getSubmitterName(retrospective.submitted_by)}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{getSprintName(retrospective.sprint)}</span>
                          {retrospective.submitted_by?.team && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {retrospective.submitted_by.team}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {retrospective.is_locked && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      <button
                        onClick={() => setSelectedRetrospective(retrospective)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    Soumis le {new Date(retrospective.submitted_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Preview Content */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center text-sm font-medium text-green-700 mb-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Points positifs
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {retrospective.what_worked || 'Aucun commentaire'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-sm font-medium text-red-700 mb-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Points à améliorer
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {retrospective.what_didnt_work || 'Aucun commentaire'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRetrospective && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rétrospective de {getSubmitterName(selectedRetrospective.submitted_by)}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-500 mt-1">
                    <span>{getSprintName(selectedRetrospective.sprint)}</span>
                    <span>•</span>
                    <span>Soumis le {new Date(selectedRetrospective.submitted_at).toLocaleDateString('fr-FR')}</span>
                    {selectedRetrospective.submitted_by?.team && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Équipe {selectedRetrospective.submitted_by.team}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRetrospective(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">✅</span>
                  Ce qui a bien fonctionné
                </h3>
                <p className="text-green-800 whitespace-pre-wrap">
                  {selectedRetrospective.what_worked || 'Aucun commentaire fourni'}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">❌</span>
                  Ce qui n'a pas bien fonctionné
                </h3>
                <p className="text-red-800 whitespace-pre-wrap">
                  {selectedRetrospective.what_didnt_work || 'Aucun commentaire fourni'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">💡</span>
                  Suggestions d'amélioration
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {selectedRetrospective.improvements || 'Aucune suggestion fournie'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrospectivesDashboard;