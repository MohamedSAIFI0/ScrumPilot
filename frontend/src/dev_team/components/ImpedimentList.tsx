import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Target, Edit2, Trash2, Save, X } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'critical';
    status: 'pending' | 'resolved';
  }>({
    title: '',
    description: '',
    severity: 'minor',
    status: 'pending'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleEdit = (impediment: Blocage) => {
    setEditingId(impediment.id);
    setEditForm({
      title: impediment.title,
      description: impediment.description,
      severity: impediment.severity,
      status: impediment.status
    });
  };

  const handleSaveEdit = async (impedimentId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/blocages/${impedimentId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedImpediment = await response.json();
        setImpediments(impediments.map(imp => 
          imp.id === impedimentId ? updatedImpediment : imp
        ));
        setEditingId(null);
        setEditForm({ title: '', description: '', severity: 'minor', status: 'pending' });
      } else {
        setError('Erreur lors de la modification du blocage');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setError('Erreur de connexion lors de la modification');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', severity: 'minor', status: 'pending' });
  };

  const handleDelete = async (impedimentId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/blocages/${impedimentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setImpediments(impediments.filter(imp => imp.id !== impedimentId));
        setDeleteConfirm(null);
      } else {
        setError('Erreur lors de la suppression du blocage');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur de connexion lors de la suppression');
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
  const getUserDisplayName = (reportedBy?: Blocage['reported_by']) => {
    if (reportedBy) {
      if (reportedBy.first_name && reportedBy.last_name) {
        return `${reportedBy.first_name} ${reportedBy.last_name}`;
      }
      return reportedBy.username;
    }
    
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
  const getReportedByDisplay = (reportedBy: any) => {
    return reportedBy?.name || 'Utilisateur inconnu';
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
          {editingId === impediment.id ? (
            // Mode édition
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sévérité
                  </label>
                  <select
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value as 'minor' | 'moderate' | 'critical' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="minor">Mineur</option>
                    <option value="moderate">Modéré</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'resolved' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">En attente</option>
                    <option value="resolved">Résolu</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(impediment.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            // Mode affichage
            <>
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

                {/* Boutons d'action */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(impediment)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  {deleteConfirm === impediment.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(impediment.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        title="Confirmer la suppression"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-600 bg-gray-200 hover:bg-gray-300"
                        title="Annuler"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(impediment.id)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {impediment.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {/* Utilisateur qui a rapporté */}
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>Rapporté par: {impediment.reported_by?.name}</span>
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
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImpedimentList;