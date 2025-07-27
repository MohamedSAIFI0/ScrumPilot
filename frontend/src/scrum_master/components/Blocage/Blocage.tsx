import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  SortAsc,
  SortDesc,
  Settings,
  Loader2
} from 'lucide-react';

interface Blocage {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  status: 'pending' | 'resolved';
  task?: {
    id: string;
    title: string;
  } | number | null;
  reported_by?: {
    id: string;
    username: string;
    name?: string;
  } | number | null;
  reported_at: string;
  updated_at?: string;
}

interface BlocagesListProps {
  apiBaseUrl?: string;
  onEdit?: (blocage: Blocage) => void;
  onDelete?: (id: string) => void;
  onView?: (blocage: Blocage) => void;
  userRole?: 'scrum_master' | 'developer' | 'product_owner';
}

const BlocagesList: React.FC<BlocagesListProps> = ({
  apiBaseUrl = 'http://localhost:8000/api',
  onEdit,
  onDelete,
  onView,
  userRole = 'scrum_master'
}) => {
  const [blocages, setBlocages] = useState<Blocage[]>([]);
  const [filteredBlocages, setFilteredBlocages] = useState<Blocage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Cache pour les utilisateurs et tâches
  const [usersCache, setUsersCache] = useState<Map<number, any>>(new Map());
  const [tasksCache, setTasksCache] = useState<Map<number, any>>(new Map());
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchBlocages();
  }, []);

  useEffect(() => {
    filterAndSortBlocages();
  }, [blocages, searchTerm, selectedSeverity, selectedStatus, sortBy, sortOrder]);

  // Fonction pour récupérer les détails d'un utilisateur
  const fetchUserDetails = async (userId: number) => {
    if (usersCache.has(userId)) {
      return usersCache.get(userId);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/users/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsersCache(prev => new Map(prev).set(userId, userData));
        return userData;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
    
    return null;
  };

  // Fonction pour récupérer les détails d'une tâche
  const fetchTaskDetails = async (taskId: number) => {
    if (tasksCache.has(taskId)) {
      return tasksCache.get(taskId);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/tasks/${taskId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const taskData = await response.json();
        setTasksCache(prev => new Map(prev).set(taskId, taskData));
        return taskData;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
    }
    
    return null;
  };

  // Fonction pour enrichir les blocages avec les détails des utilisateurs et tâches
  const enrichBlocagesData = async (blocagesData: any[]) => {
    const enrichedBlocages = await Promise.all(
      blocagesData.map(async (blocage) => {
        const enrichedBlocage = { ...blocage };
        
        // Enrichir les données utilisateur
        if (typeof blocage.reported_by === 'number') {
          const userDetails = await fetchUserDetails(blocage.reported_by);
          if (userDetails) {
            enrichedBlocage.reported_by = {
              id: userDetails.id,
              username: userDetails.username,
              name: userDetails.first_name && userDetails.last_name 
                ? `${userDetails.first_name} ${userDetails.last_name}`
                : userDetails.username
            };
          }
        }
        
        // Enrichir les données de tâche
        if (typeof blocage.task === 'number') {
          const taskDetails = await fetchTaskDetails(blocage.task);
          if (taskDetails) {
            enrichedBlocage.task = {
              id: taskDetails.id,
              title: taskDetails.title || taskDetails.name || `Tâche #${taskDetails.id}`
            };
          }
        }

        // Normaliser les noms de champs (reported_at -> created_at pour la compatibilité)
        enrichedBlocage.created_at = blocage.reported_at || blocage.created_at || new Date().toISOString();
        
        return enrichedBlocage;
      })
    );
    
    return enrichedBlocages;
  };

  const fetchBlocages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${apiBaseUrl}/blocages/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Données brutes reçues:', data);
        
        const blocagesData = data.results || data || [];
        
        // Enrichir les données avec les détails des utilisateurs et tâches
        const enrichedBlocages = await enrichBlocagesData(blocagesData);
        
        console.log('Données enrichies:', enrichedBlocages);
        setBlocages(enrichedBlocages);
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

  const updateBlocageStatus = async (blocageId: string, newStatus: 'pending' | 'resolved') => {
    try {
      setUpdatingStatus(blocageId);
      
      const response = await fetch(`${apiBaseUrl}/blocages/${blocageId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Mettre à jour localement le blocage
        setBlocages(prevBlocages => 
          prevBlocages.map(blocage => 
            blocage.id === blocageId 
              ? { ...blocage, status: newStatus, updated_at: new Date().toISOString() }
              : blocage
          )
        );
        setActiveDropdown(null);
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la mise à jour:', errorData);
        setError('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setError('Erreur de connexion lors de la mise à jour');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filterAndSortBlocages = () => {
    let filtered = [...blocages];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(blocage =>
        blocage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blocage.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blocage.reported_by && typeof blocage.reported_by === 'object' && 
         (blocage.reported_by.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blocage.reported_by.name && blocage.reported_by.name.toLowerCase().includes(searchTerm.toLowerCase()))))
      );
    }

    // Filtrage par gravité
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(blocage => blocage.severity === selectedSeverity);
    }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(blocage => blocage.status === selectedStatus);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) comparison = 0;
          else if (isNaN(dateA.getTime())) comparison = 1;
          else if (isNaN(dateB.getTime())) comparison = -1;
          else comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 3, moderate: 2, minor: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBlocages(filtered);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          label: 'Critique'
        };
      case 'moderate':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          label: 'Modéré'
        };
      case 'minor':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          label: 'Mineur'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          label: 'Inconnu'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'resolved':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          label: 'Résolu'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'En attente'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          label: 'Inconnu'
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non disponible';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Date invalide reçue:', dateString);
      return 'Date invalide';
    }
    
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Erreur de format';
    }
  };

  const getReportedByDisplay = (reportedBy: any) => {
    return reportedBy?.name || 'Utilisateur inconnu';
  };

  const getTaskDisplay = (task: any) => {
    return task?.title || 'Tâche inconnue';
  };
  

  const getStats = () => {
    const total = blocages.length;
    const pending = blocages.filter(b => b.status === 'pending').length;
    const resolved = blocages.filter(b => b.status === 'resolved').length;
    const critical = blocages.filter(b => b.severity === 'critical').length;
    
    return { total, pending, resolved, critical };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des blocages...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Blocages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivi et résolution des problèmes rencontrés
            </p>
          </div>
          <button
            onClick={fetchBlocages}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">En attente</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Résolus</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Critiques</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un blocage ou un utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Filtre par gravité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gravité
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Toutes</option>
                <option value="critical">Critique</option>
                <option value="moderate">Modéré</option>
                <option value="minor">Mineur</option>
              </select>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="resolved">Résolu</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'severity' | 'title')}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="date">Date</option>
                  <option value="severity">Gravité</option>
                  <option value="title">Titre</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Liste des blocages */}
      {filteredBlocages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun blocage trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {blocages.length === 0 
              ? "Aucun blocage n'a été signalé pour le moment."
              : "Aucun blocage ne correspond aux critères de recherche."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBlocages.map((blocage) => {
            const severityConfig = getSeverityConfig(blocage.severity);
            const statusConfig = getStatusConfig(blocage.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={blocage.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${severityConfig.border} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="p-6">
                  {/* En-tête de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {blocage.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig.bg} ${severityConfig.color}`}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {severityConfig.label}
                        </span>
                        <div className="relative">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all ${statusConfig.bg} ${statusConfig.color} ${
                              userRole === 'scrum_master' ? 'hover:opacity-80' : ''
                            }`}
                            title={userRole === 'scrum_master' ? 'Cliquez pour changer le statut' : ''}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </span>
                          {updatingStatus === blocage.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-75 rounded-full">
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu d'actions */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === blocage.id ? null : blocage.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={updatingStatus === blocage.id}
                      >
                        {updatingStatus === blocage.id ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {activeDropdown === blocage.id && (
                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                          {/* Actions de changement de statut pour Scrum Master */}
                          {userRole === 'scrum_master' && (
                            <>
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
                                Changer le statut
                              </div>
                              {blocage.status === 'pending' ? (
                                <button
                                  onClick={() => updateBlocageStatus(blocage.id, 'resolved')}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center"
                                  disabled={updatingStatus === blocage.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Marquer comme résolu
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateBlocageStatus(blocage.id, 'pending')}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center"
                                  disabled={updatingStatus === blocage.id}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Marquer en attente
                                </button>
                              )}
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            </>
                          )}
                          
                          {/* Actions standard */}
                          {onView && (
                            <button
                              onClick={() => {
                                onView(blocage);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => {
                                onEdit(blocage);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </button>
                          )}
                          {onDelete && userRole === 'scrum_master' && (
                            <button
                              onClick={() => {
                                onDelete(blocage.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {blocage.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blocage.created_at)}
                    </div>
                    
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {getReportedByDisplay(blocage.reported_by)}
                    </div>
                    
                    {blocage.task && (
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {getTaskDisplay(blocage.task)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Résultats de pagination (si nécessaire) */}
      {filteredBlocages.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Affichage de {filteredBlocages.length} blocage(s) sur {blocages.length} total
        </div>
      )}
    </div>
  );
};

export default BlocagesList;