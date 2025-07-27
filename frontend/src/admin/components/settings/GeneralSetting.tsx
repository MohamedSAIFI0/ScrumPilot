import React, { useState, useEffect } from 'react';
import { Settings, User, Globe, AlertTriangle } from 'lucide-react';

interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export const GeneralSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    email: '',
    name: '',
    role: '',
    createdAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('fr');

  // Récupérer les informations utilisateur depuis l'API
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization':`Bearer ${token}`,
      }
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/current-user/',{headers});
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserInfo({
              id: data.user.id || 0,
              email: data.user.email || '',
              name: data.user.name || '',
              role: data.user.role || '',
              createdAt: data.user.createdAt || ''
            });
          }
        } else {
          console.error('Erreur lors de la récupération des informations utilisateur');
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSave = () => {
    // Save settings logic
    alert('Paramètres sauvegardés avec succès !');
  };

  // Fonction pour formater le rôle d'affichage
  const formatDisplayRole = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Administrateur';
      case 'PRODUCT_OWNER':
        return 'Product Owner';
      case 'SCRUM_MASTER':
        return 'Scrum Master';
      case 'DEVELOPER':
        return 'Développeur';
      case 'STAKEHOLDER':
        return 'Stakeholder';
      default:
        return role || 'Utilisateur';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2 dark:text-white">
            Paramètres généraux
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-open-sans text-paragraph mt-1">
            Configurez les paramètres de votre plateforme
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <User size={20} className="mr-2" />
            Informations utilisateur
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Role and Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <Settings size={20} className="mr-2" />
            Informations du compte
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={formatDisplayRole(userInfo.role)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compte créé le
                </label>
                <input
                  type="text"
                  value={userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Localization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <Globe size={20} className="mr-2" />
            Langue
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue par défaut
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-6 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Maintenance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-open-sans font-medium text-secondary-2 dark:text-white">
                  Mode maintenance
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Active le mode maintenance pour tous les utilisateurs
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {maintenanceMode && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                    Mode maintenance activé
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Les utilisateurs ne peuvent pas accéder à la plateforme.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};