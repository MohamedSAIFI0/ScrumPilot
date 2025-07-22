import React, { useState } from 'react';
import { Layout } from '../admin/components/layout/Layout';
import { Dashboard } from '../admin/components/dashboard/Dashboard';
import { UserManagement } from '../admin/components/users/UserManagement';
import { PermissionManagement } from '../admin/components/permissions/PermissionManagement';
import { Messaging } from '../admin/components/messaging/Messaging';
import { GeneralSettings } from '../admin/components/settings/GeneralSetting';
import { useTheme } from '../admin/hooks/useTheme';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'messaging':
        return <Messaging />;
      case 'settings':
        return <GeneralSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={theme.mode}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;