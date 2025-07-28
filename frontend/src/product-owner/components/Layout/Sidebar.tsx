import React, { useState, useEffect } from 'react';
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
  FolderOpen,
  Loader,
  User
} from 'lucide-react';
import { useScrum } from '../../contexts/ScrumContext';

interface ApiResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    team: string | null;
    avatar: string | null;
    createdAt: string;
    lastLogin: string | null;
  };
}

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    name: '',
    role: '',
    email: '',
    avatar: null as string | null
  });

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://127.0.0.1:8000/api/current-user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const apiResponse: ApiResponse = await response.json();
      const userData = apiResponse.user;
      
      // Mapper les données API vers notre état local
      setUser({
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        avatar: userData.avatar
      });
      
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchUserData();
  }, []);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'SCRUM_MASTER': 'Scrum Master',
      'PRODUCT_OWNER': 'Product Owner',
      'DEVELOPER': 'Développeur',
    };
    return roleMap[role] || role;
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderUserSection = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Loader className="w-4 h-4 animate-spin text-gray-500" />
          </div>
          <div>
            <p className="font-semibold font-poppins text-gray-300">Chargement...</p>
            <p className="text-sm text-gray-400 font-open-sans">...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-semibold font-poppins text-red-300">Erreur</p>
            <button 
              onClick={fetchUserData}
              className="text-xs text-blue-300 hover:underline font-open-sans"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'settings' })}
        className="flex items-center space-x-3 w-full hover:bg-gray-700 hover:bg-opacity-50 rounded-lg p-2 transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-button rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold font-poppins">
              {getUserInitials(user.name)}
            </span>
          )}
        </div>
        <div className="text-left">
          <p className="font-semibold font-poppins">
            {user.name || 'Utilisateur'}
          </p>
          <p className="text-sm text-gray-300 font-open-sans">
            {getRoleDisplayName(user.role)}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className={`fixed left-0 top-0 w-64 h-screen z-50 ${
      state.darkMode ? 'bg-dark-card' : 'bg-secondary-2'
    } text-white font-poppins flex flex-col`}>
      
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <img 
            src="logo.png" 
            alt="DXC Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold font-poppins">DXC scrum AI</h1>
            <p className="text-sm text-gray-300 font-open-sans">
              {loading ? 'Chargement...' : getRoleDisplayName(user.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="p-6">
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
      </div>

      {/* User Section - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 border-t border-gray-600 bg-inherit">
        {renderUserSection()}
      </div>
    </div>
  );
}