import React, { useState } from 'react';
import { Bell, Search, Plus, Sun, Moon, MessageSquare } from 'lucide-react';
import { useScrum } from '../../contexts/ScrumContext';
// Import de votre composant NotificationDropdown
import { NotificationDropdown } from '../../../scrum_master/components/Layout/NotificationDropDown';

interface HeaderProps {
  title: string;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export default function Header({ title, onAddClick, showAddButton = false }: HeaderProps) {
  const { state, dispatch } = useScrum();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <header className={`fixed top-0 right-0 left-64 z-40 ${
      state.darkMode ? 'bg-dark-card border-gray-700' : 'bg-secondary-1 border-gray-200'
    } border-b px-6 py-4 font-poppins`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-title ${state.darkMode ? 'text-dark-text' : 'text-secondary-2'} font-poppins`}>
            {title}
          </h1>
          <p className={`text-paragraph mt-1 font-open-sans ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gérez vos projets avec efficacité
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${state.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Rechercher..."
              className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-open-sans ${
                state.darkMode 
                  ? 'bg-dark-bg border-gray-600 text-dark-text placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-secondary-2'
              }`}
            />
          </div>

          {showAddButton && (
            <button
              onClick={onAddClick}
              className="bg-button text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2 font-open-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              state.darkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {state.darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'messages' })}
            className={`relative p-2 rounded-lg transition-colors ${
              state.darkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            {state.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Bouton notifications avec dropdown */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className={`relative p-2 rounded-lg transition-colors ${
                state.darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-6 h-6" />
              {state.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {state.unreadNotifications > 9 ? '9+' : state.unreadNotifications}
                </span>
              )}
            </button>
            
            {/* Dropdown des notifications */}
            {showNotifications && (
              <NotificationDropdown onClose={handleCloseNotifications} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}