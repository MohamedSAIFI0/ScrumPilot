import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { logout } from '../../../services/apiLogin';

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    role: '',
    email: ''
  });
  const [loadingUser, setLoadingUser] = useState(true);

  // Récupérer les informations utilisateur depuis l'API
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization':`Bearer ${token}`,
      }

      try {
        setLoadingUser(true);
        const response = await fetch('http://127.0.0.1:8000/api/current-user/', { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserInfo({
              name: data.user.name || '',
              role: data.user.role || '',
              email: data.user.email || ''
            });
          }
        } else {
          console.error('Erreur lors de la récupération des informations utilisateur');
          // Valeurs par défaut en cas d'erreur
          setUserInfo({
            name: 'Admin',
            role: 'ADMIN',
            email: ''
          });
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        // Valeurs par défaut en cas d'erreur
        setUserInfo({
          name: 'Admin',
          role: 'ADMIN',
          email: ''
        });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fonction pour formater le rôle d'affichage
  const formatDisplayRole = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Administrateur';
      case 'PRODUCT_OWNER':
        return 'Product Owner';
      case 'SCRUM_MASTER':
        return 'Scrum Master';
      case 'DEVELOPER':
        return 'Développeur';
      case 'STAKEHOLDER':
        return 'Stakeholder';
      default:
        return role || 'Utilisateur';
    }
  };

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
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden md:block">
              {loadingUser ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <p className="font-open-sans font-medium text-secondary-2 dark:text-white">
                    {userInfo.name }
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {formatDisplayRole(userInfo.role)}
                  </p>
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Se déconnecter"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};