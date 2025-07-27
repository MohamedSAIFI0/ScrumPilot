import { useEffect, useState } from 'react';
import { ScrumProvider, useScrum } from '../product-owner/contexts/ScrumContext';
import Sidebar from '../product-owner/components/Layout/Sidebar';
import Header from '../product-owner/components/Layout/Header';
import KanbanBoard from '../product-owner/components/Kanban/KanbanBoard';
import ValidationPanel from '../product-owner/components/Validation/ValidationPanel';
import AIAssistant from '../scrum_master/components/AI/AIAssistant';
import ClientFeedback from '../scrum_master/components/Feedback/ClientFeedback';
import Projects from '../scrum_master/components/Projects/Projects';
import Team from '../scrum_master/components/Team/Team';
import SprintManagement from '../scrum_master/components/Sprints/SprintManagement';
import BacklogManagement from '../scrum_master/components/Backlog/BacklogManagement';
import Dashboard from '../scrum_master/components/Dashboard/Dashboard';
import MessagingInterface from '../admin/components/Messagerie/MessagingInterface';

function AppContent() {
  const { state, dispatch } = useScrum();
  const [showMessaging, setShowMessaging] = useState(false);
  
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Composant Settings intégré
  const Settings = () => {
    const [userSettings, setUserSettings] = useState({
      notifications: true,
      emailUpdates: false,
      language: 'fr',
      timezone: 'Europe/Paris',
      autoSave: true,
      soundEnabled: true
    });

    const [userInfo, setUserInfo] = useState({
      email: '',
      name: '',
      role: '',
      createdAt: ''
    });

    const [loading, setLoading] = useState(true);

    const handleSettingChange = (key: string, value: any) => {
      setUserSettings(prev => ({
        ...prev,
        [key]: value
      }));
      // Sauvegarder dans localStorage si nécessaire
      localStorage.setItem('userSettings', JSON.stringify({
        ...userSettings,
        [key]: value
      }));
    };

    // Charger les paramètres depuis localStorage
    useEffect(() => {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        try {
          setUserSettings(JSON.parse(saved));
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
    }, []);

    // Charger les informations utilisateur depuis l'API
    const token = localStorage.getItem('access_token');
    const headers = {
      'Authorization':`Bearer ${token}`,
    }
    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://127.0.0.1:8000/api/current-user/',{headers});
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUserInfo({
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

    const ToggleButton = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    );

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Paramètres</h2>
        
        <div className="grid gap-6">
          {/* Informations utilisateur */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
              Informations du compte
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                  <input 
                    type="email"
                    value={userInfo.email}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Nom</label>
                  <input 
                    type="text"
                    value={userInfo.name}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Rôle</label>
                  <input 
                    type="text"
                    value={userInfo.role}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Compte créé le</label>
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
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Apparence */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Apparence
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Mode sombre</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Activer le thème sombre pour l'interface</p>
                </div>
                <ToggleButton 
                  enabled={state.darkMode} 
                  onChange={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} 
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Notifications
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Notifications push</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir des notifications en temps réel</p>
                </div>
                <ToggleButton 
                  enabled={userSettings.notifications} 
                  onChange={() => handleSettingChange('notifications', !userSettings.notifications)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Emails de mise à jour</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir un résumé quotidien par email</p>
                </div>
                <ToggleButton 
                  enabled={userSettings.emailUpdates} 
                  onChange={() => handleSettingChange('emailUpdates', !userSettings.emailUpdates)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Sons</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Activer les sons de notification</p>
                </div>
                <ToggleButton 
                  enabled={userSettings.soundEnabled} 
                  onChange={() => handleSettingChange('soundEnabled', !userSettings.soundEnabled)} 
                />
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Préférences
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Sauvegarde automatique</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sauvegarder automatiquement les modifications</p>
                </div>
                <ToggleButton 
                  enabled={userSettings.autoSave} 
                  onChange={() => handleSettingChange('autoSave', !userSettings.autoSave)} 
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Langue</label>
                <select 
                  value={userSettings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Fuseau horaire</label>
                <select 
                  value={userSettings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Actions
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  const confirmed = window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?');
                  if (confirmed) {
                    setUserSettings({
                      notifications: true,
                      emailUpdates: false,
                      language: 'fr',
                      timezone: 'Europe/Paris',
                      autoSave: true,
                      soundEnabled: true
                    });
                    localStorage.removeItem('userSettings');
                  }
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
              >
                Réinitialiser les paramètres
              </button>
              
              <button 
                onClick={() => {
                  const dataStr = JSON.stringify(userSettings, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'settings-backup.json';
                  link.click();
                }}
                className="ml-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
              >
                Exporter les paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (state.activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'sprints':
        return <SprintManagement />;
      case 'backlog':
        return <BacklogManagement />;
      case 'kanban':
        return <KanbanBoard />;
      case 'validation':
        return <ValidationPanel />;
      case 'statistics':
        return <Dashboard />;
      case 'team':
        return <Team />;
      case 'feedback':
        return <ClientFeedback />;
      case 'messages':
        return <MessagingInterface
                  isOpen={showMessaging}
                  onClose={() => setShowMessaging(false)}
                />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (state.activeView) {
      case 'dashboard': return 'Tableau de bord';
      case 'projects': return 'Gestion des Projets';
      case 'sprints': return 'Gestion des Sprints';
      case 'backlog': return 'Product Backlog';
      case 'kanban': return 'Suivi Kanban';
      case 'validation': return 'Validation des Tâches';
      case 'team': return 'Équipe';
      case 'feedback': return 'Feedbacks Clients';
      case 'statistics': return 'Statistiques';
      case 'notifications': return 'Notifications';
      case 'messages': return 'Messages';
      case 'settings': return 'Paramètres';
      default: return 'Tableau de bord';
    }
  };

  return (
    <div className={`min-h-screen ${
      state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
    }`}>
      <Sidebar />
      <div className="ml-64">
        <Header 
          title={getPageTitle()}
          showAddButton={state.activeView === 'backlog' || state.activeView === 'sprints'}
        />
        <main className="pt-32 p-6">
          {renderContent()}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}

function ProductOwnerPage() {
  return (
    <ScrumProvider>
      <AppContent />
    </ScrumProvider>
  );
}

export default ProductOwnerPage;