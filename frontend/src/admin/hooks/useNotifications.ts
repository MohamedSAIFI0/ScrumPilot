// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  receiver: number;
}

// Configuration de l'URL de base de l'API
// Vous pouvez modifier cette URL selon votre environnement
const API_BASE_URL = 'http://localhost:8000/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // Headers par défaut avec authentification
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Récupérer toutes les notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/notifications/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
      console.error('Erreur lors du fetch des notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Erreur lors du markAsRead:', err);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      // Exécuter toutes les requêtes en parallèle
      const promises = unreadNotifications.map(notification =>
        fetch(`${API_BASE_URL}/notifications/${notification.id}/read/`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ is_read: true }),
        })
      );

      const responses = await Promise.all(promises);
      
      // Vérifier si toutes les requêtes ont réussi
      const failedRequests = responses.filter(response => !response.ok);
      if (failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} notifications n'ont pas pu être marquées comme lues`);
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Erreur lors du markAllAsRead:', err);
    }
  }, [notifications]);

  // Supprimer une notification (nécessitera une vue supplémentaire côté backend)
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      // Note: Cette fonctionnalité nécessite une vue DELETE côté backend
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Erreur lors du deleteNotification:', err);
      
      // Si la suppression côté backend n'est pas implémentée, 
      // on peut simplement masquer la notification côté frontend
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    }
  }, []);

  // Charger les notifications au montage du hook
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};