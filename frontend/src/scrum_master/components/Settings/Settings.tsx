import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      role: '',
      createdAt: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      sprintReminders: true,
      taskAssignments: true,
      meetingReminders: true,
      weeklyReports: false
    },
    appearance: {
      theme: isDarkMode ? 'dark' : 'light',
      language: 'fr',
      timezone: 'Africa/Casablanca'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordLastChanged: '2024-12-15'
    }
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
      setSettings(prev => ({
        ...prev,
        profile: {
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          createdAt: userData.createdAt || ''
        }
      }));
      
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      // Ici vous pouvez envoyer les données mises à jour à votre API
      const response = await fetch('http://127.0.0.1:8000/api/current-user/', {
        method: 'PUT', // ou PATCH selon votre API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: settings.profile.name,
          email: settings.profile.email,
          role: settings.profile.role,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la sauvegarde: ${response.status}`);
      }

      console.log('Paramètres sauvegardés avec succès');
      // Vous pouvez ajouter une notification de succès ici
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const renderProfileTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader className="h-5 w-5 animate-spin text-primary" />
            <span className="text-gray-600 dark:text-gray-400">Chargement des données...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-400">Erreur: {error}</p>
              <button
                onClick={fetchUserData}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <button className="bg-button text-white px-4 py-2 rounded-lg hover:bg-button/90 transition-colors">
              Changer la photo
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              JPG, PNG ou GIF. Taille maximale 2MB.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => updateSetting('profile', 'name', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              placeholder="Entrez votre nom"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              placeholder="votre.email@exemple.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle
            </label>
            <input
              readOnly
              type="text"
              value={settings.profile.role}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Membre depuis
            </label>
            <input
              type="text"
              value={settings.profile.createdAt ? new Date(settings.profile.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
              readOnly
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-2 dark:text-dark-text mb-4">
          Apparence et langue
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  if (isDarkMode) toggleTheme();
                  updateSetting('appearance', 'theme', 'light');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  !isDarkMode 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Clair</span>
              </button>
              <button
                onClick={() => {
                  if (!isDarkMode) toggleTheme();
                  updateSetting('appearance', 'theme', 'dark');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
                <span>Sombre</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Langue
            </label>
            <select
              value={settings.appearance.language}
              onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
              className="w-full md:w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuseau horaire
            </label>
            <select
              value={settings.appearance.timezone}
              onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
              className="w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            >
              <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'appearance': return renderAppearanceTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Paramètres</h1>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;