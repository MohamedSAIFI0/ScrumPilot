import React from 'react';
import { 
  LayoutDashboard, 
  List, 
  Calendar, 
  BarChart3, 
  CheckCircle, 
  Target,
  Bell,
  MessageSquare,
  Users,
  FolderOpen
} from 'lucide-react';
import { useScrum } from '../../contexts/ScrumContext';

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'projects', label: 'Projets', icon: FolderOpen },
  { id: 'sprints', label: 'Sprints', icon: Calendar },
  { id: 'backlog', label: 'Backlog', icon: List },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'feedback', label: 'Feedbacks', icon: MessageSquare },
  { id: 'kanban', label: 'Suivi', icon: Target },
  { id: 'validation', label: 'Validation', icon: CheckCircle },
  { id: 'messages', label: 'Messages', icon: MessageSquare }
];

export default function Sidebar() {
  const { state, dispatch } = useScrum();

  return (
    <div className={`fixed left-0 top-0 w-64 h-screen z-50 ${
      state.darkMode ? 'bg-dark-card' : 'bg-secondary-2'
    } text-white font-poppins overflow-y-auto`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <img 
            src="logo.png" 
            alt="DXC Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold font-poppins">DXC scrum AI</h1>
            <p className="text-sm text-gray-300 font-open-sans">Product Owner</p>
          </div>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.activeView === item.id;
            const hasNotifications = (item.id === 'notifications' && state.unreadNotifications > 0) || 
                                   (item.id === 'messages' && state.unreadMessages > 0);
            
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-open-sans ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : state.darkMode
                      ? 'text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {hasNotifications && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.id === 'notifications' ? state.unreadNotifications : state.unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-button rounded-full flex items-center justify-center">
            <span className="text-sm font-bold font-poppins">MS</span>
          </div>
          <div>
            <p className="font-semibold font-poppins">Mohamed SAIFI</p>
            <p className="text-sm text-gray-300 font-open-sans">Product Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}