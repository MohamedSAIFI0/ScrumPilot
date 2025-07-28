import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock, TrendingUp, AlertTriangle, MessageSquare, UserCheck, RefreshCw, Bell } from 'lucide-react';
import { apiService, DashboardStats } from '../../../services/apiService';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  loading?: boolean;
}> = ({ title, value, icon: Icon, color, trend, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-300 font-open-sans text-sm">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-poppins font-bold text-secondary-2 dark:text-white mt-1">
            {value.toLocaleString()}
          </p>
        )}
        {trend && !loading && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center">
            <TrendingUp size={14} className="mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  is_read: boolean;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    activeSprints: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  

  // Fonction pour récupérer les notifications récentes
  const fetchRecentNotifications = async (): Promise<Notification[]> => {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Authorization': `Bearer ${token}`,
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notifications/',{headers});
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      const data = await response.json();
      
      // Trier par date de création (plus récent en premier) et prendre les 5 premiers
      const sortedNotifications = data
        .sort((a: Notification, b: Notification) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);
      
      return sortedNotifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  };

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, recentNotifications] = await Promise.all([
        apiService.getDashboardStats(),
        fetchRecentNotifications()
      ]);
      
      setStats(dashboardStats);
      setNotifications(recentNotifications);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      // Vous pouvez ajouter ici une notification d'erreur
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  // Fonction pour formater le temps relatif
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir les couleurs selon le type de notification
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-600 dark:text-green-400',
          icon: CheckCircle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          icon: AlertTriangle
        };
      case 'error':
        return {
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-600 dark:text-red-400',
          icon: AlertTriangle
        };
      default:
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-600 dark:text-blue-400',
          icon: Bell
        };
    }
  };

  const getSystemAlerts = () => {
    const alerts = [];
    
    // Alert si beaucoup d'utilisateurs inactifs
    if (stats.totalUsers > 0 && stats.activeUsers / stats.totalUsers < 0.5) {
      alerts.push({
        type: 'warning',
        title: 'Activité utilisateur faible',
        message: `${Math.round((1 - stats.activeUsers / stats.totalUsers) * 100)}% des utilisateurs sont inactifs`,
        icon: AlertTriangle,
        color: 'yellow'
      });
    }

    // Alert si beaucoup de tâches en attente
    if (stats.pendingTasks > stats.completedTasks) {
      alerts.push({
        type: 'info',
        title: 'Tâches en attente',
        message: `${stats.pendingTasks} tâches en attente de traitement`,
        icon: Clock,
        color: 'blue'
      });
    }

    // Alert positive si tout va bien
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: 'Système opérationnel',
        message: 'Toutes les métriques sont dans les normes',
        icon: CheckCircle,
        color: 'green'
      });
    }

    return alerts;
  };

  const alerts = getSystemAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
          Tableau de bord
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-open-sans">
            Dernière mise à jour : {lastUpdate.toLocaleDateString('fr-FR')} à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          color="bg-primary"
          loading={loading}
        />
        <StatCard
          title="Utilisateurs actifs"
          value={stats.activeUsers}
          icon={Activity}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          title="Projets actifs"
          value={stats.totalProjects}
          icon={CheckCircle}
          color="bg-button"
          loading={loading}
        />
        <StatCard
          title="Sprints en cours"
          value={stats.activeSprints}
          icon={Clock}
          color="bg-orange-500"
          loading={loading}
        />
        <StatCard
          title="Tâches terminées"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="bg-green-600"
          loading={loading}
        />
        <StatCard
          title="Tâches en attente"
          value={stats.pendingTasks}
          icon={MessageSquare}
          color="bg-purple-500"
          loading={loading}
        />
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-4">
            Notifications récentes
          </h3>
          <div className="space-y-4">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;
                const userName = notification.user 
                  ? `${notification.user.first_name} ${notification.user.last_name}`.trim() || notification.user.username
                  : 'Système';

                return (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.is_read ? 'border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bgColor}`}>
                      <IconComponent size={16} className={style.textColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-2 dark:text-white font-open-sans">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Aucune notification récente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-4">
            Alertes système
          </h3>
          <div className="space-y-3">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg bg-${alert.color}-50 dark:bg-${alert.color}-900/20 border border-${alert.color}-200 dark:border-${alert.color}-800`}>
                  <alert.icon size={16} className={`text-${alert.color}-600 dark:text-${alert.color}-400 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-medium text-${alert.color}-800 dark:text-${alert.color}-300`}>{alert.title}</p>
                    <p className={`text-xs text-${alert.color}-600 dark:text-${alert.color}-400`}>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};