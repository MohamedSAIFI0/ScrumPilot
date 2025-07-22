import React from 'react';
import { 
  Users, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'users', label: 'Gestion utilisateurs', icon: Users },
  { id: 'team', label: 'Creation equipes', icon: Users },
  { id: 'teams', label: 'Gestion equipes', icon: Users },
  { id: 'messaging', label: 'Messagerie', icon: MessageSquare },
  { id: 'contact', label: 'Contact ', icon: MessageSquare },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
    <div className={`bg-secondary-2 dark:bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col border-r border-gray-700 dark:border-gray-800`}>
      <div className="p-4 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="font-poppins font-semibold text-lg">Admin </h1>
          )}
          <img src="logo.png" style={{width:"70px", height:"50px"}} alt="" />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
      
      <nav className="flex-1 mt-8">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-open-sans font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};