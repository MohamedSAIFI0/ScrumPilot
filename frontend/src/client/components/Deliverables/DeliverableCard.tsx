import React, { useState, useEffect } from 'react';
import { Calendar, Target, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  priority: string;
  team: string;
  members: number;
  start_date: string;
  end_date: string;
  budget: string;
  objectives: string[];
  technologies: string[];
  risks: string[];
  status: string;
  progress: number;
  created_at: string;
  created_by: string;
  client: number;
  product_owner: number | null;
  scrum_master: number;
}

interface Sprint {
  id: string;
  project: Project;
  name: string;
  goal: string;
  status: string;
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}

interface User {
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

interface ApiResponse {
  message: string;
  user: User;
}

export default function ClientSprintsComponent() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('access_token');
  const headers = {
    'Authorization':`Bearer ${token}`,
  }

  useEffect(() => {
    fetchUserAndSprints();
  }, []);

  const fetchUserAndSprints = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté
      const userResponse = await fetch('http://127.0.0.1:8000/api/current-user/',{headers});
      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
      const userData: ApiResponse = await userResponse.json();
      setUser(userData.user);

      // Récupérer les sprints
      const sprintsResponse = await fetch('http://127.0.0.1:8000/api/sprints/',{headers});
      if (!sprintsResponse.ok) {
        throw new Error('Erreur lors de la récupération des sprints');
      }
      const sprintsData: Sprint[] = await sprintsResponse.json();
      console.log(sprintsData);

      // Filtrer les sprints terminés liés au client connecté
      const clientSprints = sprintsData.filter(sprint => 
        sprint.project.client === userData.user.id && sprint.status === 'completed'
      );

      setSprints(clientSprints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '🔴 Élevée';
      case 'medium': return '🟡 Moyenne';
      case 'low': return '🟢 Faible';
      default: return '⚪ Non définie';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatBudget = (budget: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(budget));
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Chargement de vos sprints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchUserAndSprints}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun sprint terminé</h3>
          <p className="text-gray-500">
            {user ? `Bonjour ${user.name}, ` : ''}
            Vous n'avez pas encore de sprints terminés.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="text-green-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Mes Sprints Terminés</h1>
        </div>
        {user && (
          <p className="text-gray-600">
            Bonjour <span className="font-semibold">{user.name}</span>, voici vos sprints terminés ({sprints.length} sprint{sprints.length > 1 ? 's' : ''})
          </p>
        )}
      </div>

      {/* Grille des sprints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sprints.map((sprint) => (
          <div 
            key={sprint.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* En-tête de la carte */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-xl text-gray-900 truncate flex-1">
                  {sprint.name}
                </h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-3 flex-shrink-0">
                  ✅ Terminé
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Target size={16} />
                <span className="truncate">{sprint.goal}</span>
              </div>
              
              <div className="text-sm text-gray-500">
                Projet: <span className="font-medium text-gray-700">{sprint.project.name}</span>
              </div>
            </div>

            {/* Corps de la carte */}
            <div className="p-6 space-y-4">
              {/* Informations sur les dates */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">Période</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDate(sprint.start_date)}</div>
                  <div className="text-gray-500">au {formatDate(sprint.end_date)}</div>
                </div>
              </div>

              {/* Durée et capacité */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-600">Durée</span>
                </div>
                <span className="font-medium">{sprint.duration} jours</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-gray-400" />
                  <span className="text-gray-600">Capacité</span>
                </div>
                <span className="font-medium">{sprint.capacity} points</span>
              </div>

              {/* Informations sur le projet */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Priorité</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(sprint.project.priority)}`}>
                    {getPriorityText(sprint.project.priority)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">{formatBudget(sprint.project.budget)}</span>
                </div>
              </div>

              {/* Technologies */}
              {sprint.project.technologies.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Technologies</div>
                  <div className="flex flex-wrap gap-1">
                    {sprint.project.technologies.slice(0, 3).map((tech, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {sprint.project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{sprint.project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pied de carte */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Terminé le {formatDate(sprint.updated_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}