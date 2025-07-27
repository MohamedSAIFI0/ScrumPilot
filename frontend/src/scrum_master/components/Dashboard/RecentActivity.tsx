import React, { useState, useEffect } from 'react';
import { Clock, GitCommit, MessageSquare, CheckCircle, AlertTriangle, Calendar, Activity, Loader2 } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user: number;
}

const RecentActivity: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour fetcher les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const Token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${Token}`,
      };

      const response = await fetch('http://127.0.0.1:8000/api/notifications/', { headers });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du fetch des notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch des données au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task_update':
      case 'user_story':
      case 'complete':
        return CheckCircle;
      case 'comment':
      case 'message':
        return MessageSquare;
      case 'impediment':
      case 'blocage':
      case 'warning':
        return AlertTriangle;
      case 'sprint_event':
      case 'sprint':
        return Calendar;
      case 'commit':
      case 'git':
        return GitCommit;
      case 'info':
      default:
        return Activity;
    }
  };

  // Fonction pour obtenir la couleur selon le type de notification
  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task_update':
      case 'user_story':
      case 'complete':
        return 'text-green-600';
      case 'comment':
      case 'message':
        return 'text-blue-600';
      case 'impediment':
      case 'blocage':
      case 'warning':
        return 'text-red-600';
      case 'sprint_event':
      case 'sprint':
        return 'text-purple-600';
      case 'commit':
      case 'git':
        return 'text-green-600';
      case 'info':
      default:
        return 'text-primary';
    }
  };

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  // Obtenir les 5 notifications les plus récentes
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Affichage d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Activité Récente</h3>
          <Clock className="h-5 w-5 text-primary" />
        </div>
        
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Erreur de chargement</span>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">Activité Récente</h3>
        <div className="flex items-center space-x-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          <Clock className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          // Affichage de chargement
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 animate-pulse">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded mt-0.5"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentNotifications.length > 0 ? (
          // Affichage des notifications
          recentNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
            
            return (
              <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-secondary-2 dark:text-dark-text">
                      <span className="font-medium">{notification.title}</span>
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          // Affichage quand il n'y a pas de notifications
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune activité récente</p>
          </div>
        )}
      </div>

      {/* Bouton pour actualiser */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={fetchNotifications}
          disabled={loading}
          className="w-full text-sm text-primary hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Actualisation...' : 'Actualiser l\'activité'}
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;