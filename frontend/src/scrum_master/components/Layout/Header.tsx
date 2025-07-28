import React from 'react';
import ThemeToggle from './ThemeToggle';
import {NotificationDropdown} from './NotificationDropDown';
import UserMenu from './UserMenu';
import {Bell, LogOut} from 'lucide-react';
import { useTheme } from '../../../admin/hooks/useTheme';
import { useNotifications } from '../../../admin/hooks/useNotifications';
import { logout } from '../../../services/apiLogin';

const Header: React.FC = () => {
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = React.useState(false);

    const handleLogout = () => {
        logout();
    };

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
                    
                    {/* Bouton logout */}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Se déconnecter"
                    >
                        <LogOut size={20} />
                    </button>
                    
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;