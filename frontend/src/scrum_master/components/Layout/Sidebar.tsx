import React from 'react';
import { 
  Home, 
  FolderOpen, 
  Calendar, 
  List, 
  Users, 
  BarChart3, 
  Settings,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'sprints', label: 'Sprints', icon: Calendar },
    { id: 'epic', label: 'Epic', icon: List },
    { id: 'backlog', label: 'Backlog', icon: List },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'blocage', label: 'Blocage', icon: Users },
    { id: 'retrospective', label: 'Retrospectives', icon: Users },
    { id: 'feedback', label: 'Feedbacks', icon: MessageSquare },
    { id: 'messagerie', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-secondary-2 dark:bg-dark-surface text-white z-10 transition-colors duration-200 flex flex-col">
      {/* Header fixe */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700/30">
        <div className="flex items-center space-x-3">
          <img
            src="logo.png"
            alt=""
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-poppins font-semibold text-white dark:text-dark-text">DXC Scrum</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">Agile Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary/20 ${
                      activeTab === item.id ? 'bg-primary text-white' : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Footer fixe */}
      <div className="flex-shrink-0 p-6 border-t border-gray-700/30">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary/20 ${
            activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-dark-text'
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Paramètres</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;