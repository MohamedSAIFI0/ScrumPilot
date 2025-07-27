import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, UserCircle, Bell, Shield, HelpCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/apiLogin';

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

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    name: '',
    role: '',
    email: '',
    avatar: null
  });

  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/Connexion'); // Redirection après déconnexion
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'USER': 'Utilisateur',
      'SCRUM_MASTER': 'Scrum Master',
      'PRODUCT_OWNER': 'Product Owner',
      'DEVELOPER': 'Développeur',
      'DESIGNER': 'Designer'
    };
    return roleMap[role] || role;
  };

  const menuItems: any[] = [];

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Loader className="h-4 w-4 animate-spin text-gray-500" />
        <div className="text-right">
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <div className="text-right">
          <p className="text-sm text-red-500">Erreur</p>
          <button 
            onClick={fetchUserData}
            className="text-xs text-blue-500 hover:underline"
          >
            Réessayer
          </button>
        </div>
        <div className="h-8 w-8 bg-red-300 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-2 dark:text-dark-text">
            {user.name || 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getRoleDisplayName(user.role)}
          </p>
        </div>
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
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
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-secondary-2 dark:text-dark-text">
                    {user.name || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
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