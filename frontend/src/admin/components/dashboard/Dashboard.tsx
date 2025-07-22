import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock, TrendingUp, AlertTriangle, MessageSquare, UserCheck, RefreshCw } from 'lucide-react';
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

interface Activity {
  user: string;
  action: string;
  time: string;
  type: 'success' | 'info';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, recentActivities] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivities()
      ]);
      
      setStats(dashboardStats);
      setActivities(recentActivities);
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
            Activité récente
          </h3>
          <div className="space-y-4">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary'
                  }`}>
                    <span className={`text-sm font-medium ${
                      activity.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-white'
                    }`}>
                      {activity.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-open-sans">
                      <span className="font-medium text-secondary-2 dark:text-white">{activity.user}</span> 
                      <span className="text-gray-600 dark:text-gray-300"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                  {activity.type === 'success' && (
                    <UserCheck size={16} className="text-green-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune activité récente
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