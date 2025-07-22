import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '../dev_team/contexts/ThemeContext';
import Header from '../dev_team/components/Header';
import Sidebar from '../dev_team/components/Sidebar';
import Dashboard from '../dev_team/components/Dashboard';
import KanbanBoard from '../dev_team/components/KanbanBoard';
import SprintInfo from '../dev_team/components/SprintInfo';
import ImpedimentList from '../dev_team/components/ImpedimentList';
import RetrospectiveModal from '../dev_team/components/RetrospectiveModal';
import MessagingInterface from '../dev_team/components/MessagingInterface';
import CreateImpedimentModal from '../dev_team/components/CreateImpedimentModal';
import { Task, Retrospective, Impediment } from '../dev_team/types';
import { mockTasks, mockSprint, mockImpediments } from '../dev_team/data/mockData';

function DevTeamPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [impediments, setImpediments] = useState<Impediment[]>(mockImpediments);
  const [showRetrospectiveModal, setShowRetrospectiveModal] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showCreateImpediment, setShowCreateImpediment] = useState(false);
  const [retrospective, setRetrospective] = useState<Retrospective | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  };

  const handleRetrospectiveSubmit = (retro: Omit<Retrospective, 'id'>) => {
    const newRetrospective: Retrospective = {
      ...retro,
      id: Date.now().toString()
    };
    setRetrospective(newRetrospective);
    setShowRetrospectiveModal(false);
  };

  // Callback pour gérer la création d'impediment
  const handleImpedimentSubmit = useCallback((success: boolean) => {
    if (success) {
      // Fermer la modal et potentiellement rafraîchir la liste
      setShowCreateImpediment(false);
      // Note: La liste se rafraîchira automatiquement via son propre useEffect
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />;
      case 'sprint':
        return <SprintInfo sprint={mockSprint} />;
      case 'impediments':
        return (
          <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-title font-poppins font-semibold text-secondary-2 dark:text-white mb-2">
                  Gestion des Blocages
                </h1>
                <p className="text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
                  Consultez et signalez les blocages de l'équipe
                </p>
              </div>
              <button
                onClick={() => setShowCreateImpediment(true)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Signaler un Blocage
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              <ImpedimentList />
            </div>
          </div>
        );
      case 'retrospective':
        return (
          <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="mb-6">
              <h1 className="text-title font-poppins font-semibold text-secondary-2 dark:text-white mb-2">
                Rétrospective
              </h1>
              <p className="text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
                Partagez votre feedback sur le sprint
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 transition-colors">
              {retrospective ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-2">
                    Rétrospective Soumise
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-open-sans mb-4">
                    Votre feedback a été enregistré pour le sprint "{mockSprint.name}".
                  </p>
                  <button
                    onClick={() => setShowRetrospectiveModal(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Voir ma Rétrospective
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-secondary-2 dark:text-white mb-2">
                    Participer à la Rétrospective
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-open-sans mb-6">
                    Partagez votre feedback sur le sprint "{mockSprint.name}" pour aider l'équipe à s'améliorer.
                  </p>
                  <button
                    onClick={() => setShowRetrospectiveModal(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Commencer ma Rétrospective
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="text-gray-900 dark:text-white">Section non trouvée</div>;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onOpenMessaging={() => setShowMessaging(true)}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header 
            onOpenMessaging={() => setShowMessaging(true)} 
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          
          <main className="flex-1 overflow-x-hidden pt-20 lg:pt-24">
            {renderContent()}
          </main>
        </div>

        <RetrospectiveModal
          sprintId={mockSprint.id}
          isOpen={showRetrospectiveModal}
          onClose={() => setShowRetrospectiveModal(false)}
          onSubmit={handleRetrospectiveSubmit}
          existingRetrospective={retrospective}
        />

        <MessagingInterface
          isOpen={showMessaging}
          onClose={() => setShowMessaging(false)}
        />

        <CreateImpedimentModal
          isOpen={showCreateImpediment}
          onClose={() => setShowCreateImpediment(false)}
          onSubmit={handleImpedimentSubmit}
        />
      </div>
    </ThemeProvider>
  );
}

export default DevTeamPage;