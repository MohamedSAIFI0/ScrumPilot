import React, { useState } from 'react';
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
import { mockUser } from '../data/mockData';
import CalendarModal from './CalendarModal';

interface HeaderProps {
  onOpenMessaging: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenMessaging, onToggleSidebar, isSidebarOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

  return (
    <>
      <header className="fixed flex items-center justify-evenly  top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
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

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-poppins font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {notification.time}
                          </span>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-primary hover:text-purple-700 text-sm font-medium">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
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
              >
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden lg:block text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {mockUser.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {mockUser.role === 'developer' ? 'Développeur' : mockUser.role}
                  </p>
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <img
                        src={mockUser.avatar}
                        alt={mockUser.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {mockUser.name}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {mockUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <User className="w-4 h-4 mr-3" />
                      Mon Profil
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Settings className="w-4 h-4 mr-3" />
                      Paramètres
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Aide & Support
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4 mr-3" />
                      Se Déconnecter
                    </button>
                  </div>
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