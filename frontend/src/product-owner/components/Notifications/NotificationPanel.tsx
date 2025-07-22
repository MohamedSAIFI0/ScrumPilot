import React from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationPanel() {
  const { state, dispatch } = useScrum();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <X className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  return (
    <div className="space-y-6 font-poppins">
      <div>
        <h2 className={`text-title ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'} font-poppins`}>
          Notifications
        </h2>
        <p className={`text-paragraph font-open-sans ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Restez informé des dernières mises à jour
        </p>
      </div>

      <div className="space-y-3">
        {state.notifications.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${
            state.darkMode ? 'bg-dark-card' : 'bg-cards'
          }`}>
            <Bell className={`w-12 h-12 mx-auto mb-4 ${
              state.darkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-medium mb-2 font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              Aucune notification
            </h3>
            <p className={`font-open-sans ${
              state.darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Vous êtes à jour !
            </p>
          </div>
        ) : (
          state.notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                notification.read
                  ? state.darkMode 
                    ? 'bg-dark-card border-gray-700 hover:bg-gray-700' 
                    : 'bg-cards border-gray-200 hover:bg-gray-100'
                  : state.darkMode
                    ? 'bg-dark-card border-primary'
                    : 'bg-white border-primary shadow-sm'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold font-poppins ${
                      state.darkMode ? 'text-dark-text' : 'text-secondary-2'
                    }`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className={`text-sm mt-1 font-open-sans ${
                    state.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-2 font-open-sans ${
                    state.darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}