import React from 'react';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {logout} from '../../../services/apiLogin'

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Administration
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={theme.mode === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <img
              src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop"
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden md:block">
              <p className="font-open-sans font-medium text-secondary-2 dark:text-white">Admin</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Administrateur</p>
            </div>
          </div>
          
          <button onClick={logout} className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};