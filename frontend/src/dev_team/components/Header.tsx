import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  ChevronDown,
  MessageCircle,
  Calendar,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import CalendarModal from './CalendarModal';
import { NotificationDropdown } from '../../scrum_master/components/Layout/NotificationDropDown';
import { logout } from '../../services/apiLogin';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
}

interface HeaderProps {
  onOpenMessaging: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMessaging, onToggleSidebar, isSidebarOpen, onOpenProfile }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/current-user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ajoutez ici votre token d'authentification si nécessaire
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      setError('Impossible de charger les informations utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fonction pour obtenir l'avatar par défaut
  const getDefaultAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
  };

  // Fonction pour formater le rôle en français
  const formatRole = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Administrateur';
      case 'DEVELOPER':
        return 'Développeur';
      case 'SCRUM_MASTER':
        return 'Scrum Master';
      case 'PRODUCT_OWNER':
        return 'Product Owner';
      default:
        return role;
    }
  };

  const notifications = [
    {
      id: '1',
      title: 'Nouvelle tâche assignée',
      message: 'Vous avez été assigné à "Implémenter l\'API de paiement"',
      time: '5 min',
      unread: true
    },
    {
      id: '2',
      title: 'Sprint Review demain',
      message: 'N\'oubliez pas la présentation de vos tâches',
      time: '2h',
      unread: true
    },
    {
      id: '3',
      title: 'Commentaire sur votre tâche',
      message: 'Jane Smith a commenté votre travail',
      time: '1j',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // Avatar de l'utilisateur avec fallback
  const userAvatar = user?.avatar || getDefaultAvatar(user?.name || 'User');
  const userName = user?.name || 'Utilisateur';
  const userRole = user ? formatRole(user.role) : 'Rôle';

  return (
    <>
      <header className="fixed flex items-center justify-evenly top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        
          {/* Left Section - Mobile Menu + Search */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            {/* Logo on Mobile */}
            <div className="lg:hidden flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-8 h-8 mr-2"
              />
              <span className="font-poppins text-lg font-semibold text-gray-900 dark:text-white">
                DevScrum
              </span>
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-2 lg:space-x-4">

            {/* Quick Actions */}
            <button
              onClick={onOpenMessaging}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </button>

            <button
              onClick={() => setShowCalendar(true)}
              className="hidden sm:block p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Notifications avec dropdown */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown des notifications */}
              {showNotifications && (
                <NotificationDropdown onClose={handleCloseNotifications} />
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 lg:space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                ) : (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(userName);
                    }}
                  />
                )}
                <div className="hidden lg:block text-left">
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {userName}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {userRole}
                      </p>
                    </>
                  )}
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && !loading && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultAvatar(userName);
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {user.email}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                          {userRole}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile?.();
                      }}
                      className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mon Profil
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button 
                      onClick={logout} 
                      className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Se Déconnecter
                    </button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="absolute right-0 mt-2 w-56 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 z-50">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  <button 
                    onClick={fetchUserData}
                    className="mt-2 text-xs text-red-700 dark:text-red-300 hover:underline"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </>
  );
};

export default Header;