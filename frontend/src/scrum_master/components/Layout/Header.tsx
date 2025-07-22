import React from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropDown';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-title  font-poppins text-secondary-2 dark:text-dark-text">
            Plateforme de Gestion Agile
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationDropdown />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;