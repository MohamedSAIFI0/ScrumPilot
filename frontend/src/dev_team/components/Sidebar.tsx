import React from 'react';
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

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  onOpenMessaging, 
  isOpen, 
  onClose 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'kanban', label: 'Mes Tâches', icon: KanbanSquare },
    { id: 'sprint', label: 'Sprint Actif', icon: Clock },
    { id: 'messaging', label: 'Messages', icon: Clock },
    { id: 'impediments', label: 'Blocages', icon: AlertTriangle },
    { id: 'retrospective', label: 'Rétrospective', icon: MessageSquare }
  ];

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
          
          {/* Messaging Button */}
          <button
            onClick={handleMessagingClick}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-open-sans text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white relative"
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            Messagerie
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </button>
        </nav>

        <div className="mt-auto pt-8">
          <div className="flex items-center p-4 bg-gray-700 dark:bg-gray-800 rounded-lg">
            <User className="w-8 h-8 mr-3 text-gray-300 dark:text-gray-400" />
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Développeur</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;