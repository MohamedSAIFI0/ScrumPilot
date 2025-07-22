import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Target } from 'lucide-react';
import CreateImpedimentModal from './CreateImpedimentModal';

interface Blocage {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  status: 'pending' | 'resolved';
  reported_at: string;
  task?: {
    id: string;
    title: string;
  } | null;
  reported_by?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

interface ImpedimentListProps {
  apiBaseUrl?: string;
}

const ImpedimentList: React.FC<ImpedimentListProps> = ({ 
  apiBaseUrl = 'http://localhost:8000/api' 
}) => {
  const [impediments, setImpediments] = useState<Blocage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchImpediments();
  }, []);

  const fetchImpediments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/blocages/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data); // Debug log
        setImpediments(data.results || data);
      } else {
        setError('Erreur lors de la récupération des blocages');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction helper pour obtenir le nom d'affichage de l'utilisateur
  const getUserDisplayName = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.name || 'Utilisateur';
      } catch (error) {
        console.error('Erreur lors du parsing de user depuis localStorage', error);
        return 'Utilisateur';
      }
    }
    return 'Utilisateur';
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchImpediments}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!impediments || impediments.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun blocage</h3>
        <p className="text-gray-500">Aucun blocage n'a été signalé pour le moment.</p>
      </div>
    );
  }

  return (
    
    <div className="space-y-4">
      
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Blocages ({impediments.length})
      </h2>
      
      {impediments.map((impediment) => (
        <div key={impediment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {impediment.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(impediment.severity)}`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {impediment.severity === 'critical' ? 'Critique' : 
                   impediment.severity === 'moderate' ? 'Modéré' : 'Mineur'}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(impediment.status)}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {impediment.status === 'resolved' ? 'Résolu' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {impediment.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {/* Utilisateur qui a rapporté */}
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>Rapporté par: {getUserDisplayName(impediment.reported_by)}</span>
            </div>

            {/* Tâche associée (si elle existe) */}
            {impediment.task && (
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                <span>Tâche: {impediment.task.title}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {new Date(impediment.reported_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImpedimentList;