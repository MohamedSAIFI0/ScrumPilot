import React, { useState } from 'react';
import { ThemeProvider } from '../scrum_master/contexts/ThemeContext';
import Sidebar from '../scrum_master/components/Layout/Sidebar';
import Header from '../scrum_master/components/Layout/Header';
import Dashboard from '../scrum_master/components/Dashboard/Dashboard';
import Projects from '../scrum_master/components/Projects/Projects';
import Team from '../scrum_master/components/Team/Team';
import ClientFeedback from '../scrum_master/components/Feedback/ClientFeedback';
import Reports from '../scrum_master/components/Reports/Reports';
import Settings from '../scrum_master/components/Settings/Settings';
import EpicManagement from '../scrum_master/components/Epic/EpicManagement';
import AIAssistant from '../scrum_master/components/AI/AIAssistant';
import SprintManagement from '../scrum_master/components/Sprints/SprintManagement';
import BacklogManagement from '../scrum_master/components/Backlog/BacklogManagement';
import BlocageList from '../scrum_master/components/Blocage/Blocage';
import RetrospectivesDashboard from '../scrum_master/components/Retrospective/Retrospective';
function ScrumMasterPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'sprints':
        return <SprintManagement />;
      case 'epic':
        return <EpicManagement/>
      case 'backlog':
        return <BacklogManagement />;
      case 'team':
        return <Team />;
      case 'blocage':
        return <BlocageList />;
      case 'retrospective':
        return <RetrospectivesDashboard/>
      case 'feedback':
        return <ClientFeedback />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg font-open-sans transition-colors duration-200">
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">
              {renderContent()}
            </main>
          </div>
        </div>
        <AIAssistant />
      </div>
    </ThemeProvider>
  );
}

export default ScrumMasterPage;