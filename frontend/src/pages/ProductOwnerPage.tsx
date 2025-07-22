import { useEffect, useState } from 'react';
import { ScrumProvider, useScrum } from '../product-owner/contexts/ScrumContext';
import Sidebar from '../product-owner/components/Layout/Sidebar';
import Header from '../product-owner/components/Layout/Header';
import Dashboard from '../product-owner/components/Dashboard/Dashboard';
import KanbanBoard from '../product-owner/components/Kanban/KanbanBoard';
import ValidationPanel from '../product-owner/components/Validation/ValidationPanel';
import NotificationPanel from '../product-owner/components/Notifications/NotificationPanel';

import AIAssistant from '../scrum_master/components/AI/AIAssistant';
import ClientFeedback from '../scrum_master/components/Feedback/ClientFeedback';
import Projects from '../scrum_master/components/Projects/Projects';
import Team from '../scrum_master/components/Team/Team';
import SprintManagement from '../scrum_master/components/Sprints/SprintManagement';
import BacklogManagement from '../scrum_master/components/Backlog/BacklogManagement';

import MessagingInterface from '../dev_team/components/MessagingInterface';

function AppContent() {
  const { state } = useScrum();
  const [showMessaging, setShowMessaging] = useState(false);
  

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

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
        return <Dashboard />; // Réutilise le dashboard pour les stats
      case 'notifications':
        return <NotificationPanel />;
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
        return (
          <div className="text-center py-12">
            <h2 className={`text-2xl font-semibold mb-4 font-poppins ${
              state.darkMode ? 'text-dark-text' : 'text-secondary-2'
            }`}>
              Paramètres
            </h2>
            <p className={`font-open-sans ${
              state.darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Page en cours de développement
            </p>
          </div>
        );
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
      case 'Team': return 'Équipe';
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