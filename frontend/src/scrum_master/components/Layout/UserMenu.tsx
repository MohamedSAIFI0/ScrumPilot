import React, { useState } from 'react';
import { User, Settings, LogOut, UserCircle, Bell, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/apiLogin';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Connexion'); // Redirection après déconnexion
  };

  const user = {
    name: 'Mehdi Alaoui',
    role: 'Scrum Master',
    email: 'mehdi.alaoui@dxc.com',
    avatar: null
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: 'Mon Profil',
      action: () => console.log('Profile clicked')
    },
    {
      icon: Settings,
      label: 'Paramètres',
      action: () => console.log('Settings clicked')
    },
    {
      icon: Bell,
      label: 'Préférences de notification',
      action: () => console.log('Notifications clicked')
    },
    {
      icon: Shield,
      label: 'Sécurité',
      action: () => console.log('Security clicked')
    },
    {
      icon: HelpCircle,
      label: 'Aide & Support',
      action: () => console.log('Help clicked')
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-2 dark:text-dark-text">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-secondary-2 dark:text-dark-text">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-secondary-2 dark:text-dark-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => {
              setIsOpen(false);
              handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Se déconnecter</span>
            </button>

          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;