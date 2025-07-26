import React, { useEffect } from 'react';
import { X, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../../admin/hooks/useNotifications'

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  // Auto-refresh des notifications toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-in">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white">
            Notifications
            {loading && (
              <RefreshCw size={14} className="inline ml-2 animate-spin text-primary" />
            )}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshNotifications}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
              title="Actualiser"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                title="Tout marquer comme lu"
                disabled={loading}
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
            <AlertTriangle size={14} className="inline mr-1" />
            {error}
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-50" />
            <p>Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Info size={24} className="mx-auto mb-2 opacity-50" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative ${
                  !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Indicateur de notification non lue */}
                {!notification.is_read && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                )}
                
                <div className="flex items-start space-x-3 ml-2">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.is_read 
                            ? 'text-secondary-2 dark:text-white font-semibold' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} className="mr-1" />
                          {getTimeAgo(notification.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                            title="Marquer comme lu"
                            disabled={loading}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                          disabled={loading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            onClick={() => {
              // Ici vous pouvez naviguer vers une page complète des notifications
              console.log('Naviguer vers toutes les notifications');
            }}
          >
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};