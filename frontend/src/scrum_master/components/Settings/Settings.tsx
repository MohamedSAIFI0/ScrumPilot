import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Mehdi Alaoui',
      email: 'mehdi.alaoui@dxc.com',
      role: 'Scrum Master',
      phone: '+212 6 12 34 56 78',
      bio: 'Scrum Master expérimenté avec 5 ans d\'expérience dans la gestion de projets Agile.'
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Ici vous pourriez envoyer les données à votre API
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

  const renderProfileTab = () => (
    <div className="space-y-6">
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
            Nom complet
          </label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => updateSetting('profile', 'name', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
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
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle
          </label>
          <select
            value={settings.profile.role}
            onChange={(e) => updateSetting('profile', 'role', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
          >
            <option value="Scrum Master">Scrum Master</option>
            <option value="Product Owner">Product Owner</option>
            <option value="Développeur">Développeur</option>
            <option value="Designer">Designer</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Biographie
        </label>
        <textarea
          value={settings.profile.bio}
          onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
          rows={4}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
        />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-2 dark:text-dark-text mb-4">
          Préférences de notification
        </h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-2 dark:text-dark-text">
                  {key === 'emailNotifications' && 'Notifications par email'}
                  {key === 'pushNotifications' && 'Notifications push'}
                  {key === 'sprintReminders' && 'Rappels de sprint'}
                  {key === 'taskAssignments' && 'Assignations de tâches'}
                  {key === 'meetingReminders' && 'Rappels de réunion'}
                  {key === 'weeklyReports' && 'Rapports hebdomadaires'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'emailNotifications' && 'Recevoir les notifications par email'}
                  {key === 'pushNotifications' && 'Recevoir les notifications push dans le navigateur'}
                  {key === 'sprintReminders' && 'Rappels avant la fin des sprints'}
                  {key === 'taskAssignments' && 'Notifications lors de nouvelles assignations'}
                  {key === 'meetingReminders' && 'Rappels 15 minutes avant les réunions'}
                  {key === 'weeklyReports' && 'Rapport de progression hebdomadaire'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-2 dark:text-dark-text mb-4">
          Sécurité du compte
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-secondary-2 dark:text-dark-text">
                Authentification à deux facteurs
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajouter une couche de sécurité supplémentaire à votre compte
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Délai d'expiration de session (minutes)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
              className="w-full md:w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
            </select>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-2 dark:text-dark-text">
                  Mot de passe
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dernière modification : {new Date(settings.security.passwordLastChanged).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button className="bg-button text-white px-4 py-2 rounded-lg hover:bg-button/90 transition-colors">
                Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'appearance': return renderAppearanceTab();
      case 'security': return renderSecurityTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-poppins text-secondary-2 dark:text-dark-text">Paramètres</h1>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Enregistrer</span>
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