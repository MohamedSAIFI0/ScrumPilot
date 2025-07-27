import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  KanbanSquare, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  User,
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onOpenMessaging: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  onOpenMessaging, 
  isOpen, 
  onClose 
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    role: '',
    email: ''
  });
  const [loadingUser, setLoadingUser] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'kanban', label: 'Mes Tâches', icon: KanbanSquare },
    { id: 'sprint', label: 'Sprint Actif', icon: Clock },
    { id: 'messaging', label: 'Messages', icon: Clock },
    { id: 'impediments', label: 'Blocages', icon: AlertTriangle },
    { id: 'retrospective', label: 'Rétrospective', icon: MessageSquare }
  ];

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
            name: 'John Doe',
            role: 'DEVELOPER',
            email: ''
          });
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        // Valeurs par défaut en cas d'erreur
        setUserInfo({
          name: 'John Doe',
          role: 'DEVELOPER',
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

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleMessagingClick = () => {
    onOpenMessaging();
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 w-64 bg-secondary-2 dark:bg-gray-900 text-white min-h-screen p-6 transition-all duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div style={{marginTop:"50px"}} className="flex items-center mb-8 pt-4">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 mr-3"
          />
          <div>
            <h1 className="font-poppins text-xl font-semibold">DevScrum</h1>
            <p className="text-sm text-gray-300 dark:text-gray-400">Interface Développeur</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-open-sans ${
                  activeSection === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <div className="flex items-center p-4 bg-gray-700 dark:bg-gray-800 rounded-lg">
            <User className="w-8 h-8 mr-3 text-gray-300 dark:text-gray-400" />
            <div>
              {loadingUser ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm">
                    {userInfo.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDisplayRole(userInfo.role)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;