import React, { useState, useEffect } from 'react';
import { Calendar, Target, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'planned' | 'completed';
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
  project: number;
  created_by: number;
}

const SprintInfo: React.FC = () => {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveSprint = async () => {
      try {
        setLoading(true);
        const Token = localStorage.getItem('access_token');
        const headers = {
          'Authorization':`Bearer ${Token}`,
        }
        const response = await fetch('http://127.0.0.1:8000/api/sprints/',{headers});
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des sprints');
        }
        
        const sprints: Sprint[] = await response.json();
        const activeSprint = sprints.find(s => s.status === 'active');
        
        if (activeSprint) {
          setSprint(activeSprint);
        } else {
          setError('Aucun sprint actif trouvé');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSprint();
  }, []);

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-yellow-700">Aucun sprint actif disponible</span>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(sprint.end_date);
  const totalDays = sprint.duration;
  const daysPassed = totalDays - daysRemaining;
  const progress = totalDays > 0 ? Math.max(0, Math.min(100, (daysPassed / totalDays) * 100)) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Sprint Actuel
        </h1>
        <p className="text-gray-600">
          Suivi et objectifs du sprint en cours
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {sprint.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Sprint terminé'}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Actif
          </span>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Objectif du Sprint
          </h3>
          <p className="text-gray-700">{sprint.goal}</p>
        </div>

        {/* Progress temporel */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Progression temporelle</span>
            <span className="text-sm text-gray-600">{daysPassed}/{totalDays} jours</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {progress.toFixed(1)}% du temps écoulé
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Durée</span>
              <span className="font-medium">{sprint.duration} jours</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Capacité</span>
              <span className="font-medium">{sprint.capacity}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Événements du Sprint */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium mb-4">Événements du Sprint</h3>
        <div className="space-y-3">
          {sprint.planning_ceremony && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium">Sprint Planning</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(sprint.start_date)}</span>
            </div>
          )}
          
          {sprint.daily_ceremony && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium">Daily Standup</span>
              </div>
              <span className="text-sm text-gray-600">Tous les jours à 9h00</span>
            </div>
          )}
          
          {sprint.review_ceremony && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">Sprint Review</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(sprint.end_date)}</span>
            </div>
          )}
          
          {sprint.retrospective_ceremony && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="font-medium">Sprint Retrospective</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(sprint.end_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintInfo;