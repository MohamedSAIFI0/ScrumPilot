import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  MessageSquare, 
  FileText, 
  History,
  Bell,
  User,
  X
} from 'lucide-react';
import { NotificationDropdown } from '../../../scrum_master/components/Layout/NotificationDropDown'; // Import du composant dropdown

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'deliverables', label: 'Livrables', icon: Package },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'history', label: 'Historique', icon: History }
];

const mockNotifications: Notification[] = [
  
];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    role: '',
    email: ''
  });
  const [loadingUser, setLoadingUser] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Récupérer les informations utilisateur depuis l'API
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      }
      try {
        setLoadingUser(true);
        const response = await fetch('http://127.0.0.1:8000/api/current-user/',{headers});
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
            name: 'Utilisateur',
            role: 'USER',
            email: ''
          });
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        // Valeurs par défaut en cas d'erreur
        setUserInfo({
          name: 'Utilisateur',
          role: 'USER',
          email: ''
        });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // Fonction pour formater le nom d'affichage
  const formatDisplayName = (name: string) => {
    if (!name) return 'Utilisateur';
    // Convertir en majuscules et ajouter "M." ou "Mme" selon le contexte
    return `${name.toUpperCase()}`;
  };

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
    <>
      <nav className="bg-secondary-2 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo et Titre */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="logo.png" 
                  alt="DXC Technology" 
                  className="h-8 w-auto lg:h-10"
                  style={{ width: '80px', height: '60px' }}
                />
                <div>
                  <span className="font-poppins font-semibold text-lg lg:text-xl">DXC Scrum AI</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                      font-open-sans text-sm xl:text-base
                      ${activeSection === item.id 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions à droite */}
            <div className="flex items-center space-x-3 lg:space-x-4">

              {/* Notifications avec dropdown externalisé */}
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown des notifications */}
                {showNotifications && (
                  <NotificationDropdown onClose={handleCloseNotifications} />
                )}
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-600">
                <div className="text-right hidden sm:block">
                  {loadingUser ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="font-open-sans font-medium text-white text-sm">
                        {formatDisplayName(userInfo.name)}
                      </p>
                      <p className="text-xs text-gray-300">
                        {formatDisplayRole(userInfo.role)}
                      </p>
                    </>
                  )}
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  {loadingUser ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu - Mobile */}
          <div className="lg:hidden border-t border-gray-600">
            <div className="flex overflow-x-auto py-2 space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200
                      font-open-sans text-xs whitespace-nowrap flex-shrink-0
                      ${activeSection === item.id 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={handleCloseNotifications}
        />
      )}
    </>
  );
};