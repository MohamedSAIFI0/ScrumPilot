import React, { useState } from 'react';
import { Navbar } from '../client/components/Layout/Navbar';
import { PageHeader } from '../client/components/Layout/PageHeader';
import { ProjectProgress } from '../client/components/Overview/ProjectProgress';
import { BurndownChart } from '../client/components/Charts/BurndownChart';
import { FeedbackForm } from '../client/components/Feedback/FeedbackForm';
import { DocumentCard } from '../client/components/Documents/DocumentCard';
import Historique from '../client/components/History/Historique';
import ClientSprintsComponent from '../client/components/Deliverables/DeliverableCard';

import { 
  mockProject, 
  mockDeliverables, 
  mockFeedbacks, 
  mockDocuments, 
  mockSprints, 
  mockReleases, 
  burndownData 
} from '../client/data/mockData';
import { Deliverable, Feedback, Document as ProjectDocument } from '../client/types';

function ClientPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [deliverables, setDeliverables] = useState<Deliverable[]>(mockDeliverables);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);

  const handleDeliverableValidation = (id: string, status: 'validated' | 'rejected', comment?: string) => {
    setDeliverables(prev => 
      prev.map(deliverable => 
        deliverable.id === id 
          ? { ...deliverable, status, comments: comment }
          : deliverable
      )
    );
  };

  const handleFeedbackSubmit = (content: string, rating?: number, deliverableId?: string, category?: string, priority?: string) => {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      content,
      author: 'Marie Dubois',
      timestamp: new Date().toISOString(),
      rating,
      deliverableId,
      category,
      priority
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  const getPageInfo = () => {
    switch (activeSection) {
      case 'overview':
        return {
          title: 'Dashboard',
          subtitle: 'Vue d\'ensemble du projet et métriques clés'
        };
      case 'deliverables':
        return {
          title: 'Livrables du Projet',
          subtitle: 'Validation et suivi des livrables'
        };
      case 'feedback':
        return {
          title: 'Feedback Client',
          subtitle: 'Commentaires et évaluations'
        };
      case 'documents':
        return {
          title: 'Documents du Projet',
          subtitle: 'Rapports, spécifications et ressources'
        };
      case 'history':
        return {
          title: 'Historique du Feedbacks',
          subtitle: 'Commentaires et évaluations'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Vue d\'ensemble du projet'
        };
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="2xl:col-span-2">
                <ProjectProgress project={mockProject} />
              </div>
              <div className="2xl:col-span-1">
                <BurndownChart data={burndownData} />
              </div>
            </div>
          </div>
        );
      
      case 'deliverables':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 gap-6 lg:gap-10">

                <ClientSprintsComponent/>

            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="2xl:col-span-4">
                <FeedbackForm onSubmit={handleFeedbackSubmit} />
              </div>

            </div>
          </div>
        );
      
      case 'documents':
        return (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
              {mockDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="space-y-8 lg:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-8 lg:gap-10 ">
              <div>
                <Historique />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 font-open-sans">
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <PageHeader 
        title={pageInfo.title} 
        subtitle={pageInfo.subtitle}
      >
        {activeSection === 'deliverables' && (
          <div className="flex flex-wrap gap-2 lg:gap-3 text-sm">
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full font-open-sans font-medium">
              {deliverables.filter(d => d.status === 'pending').length} En attente
            </span>
            <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-open-sans font-medium">
              {deliverables.filter(d => d.status === 'validated').length} Validés
            </span>
            <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full font-open-sans font-medium">
              {deliverables.filter(d => d.status === 'rejected').length} Rejetés
            </span>
          </div>
        )}
        {activeSection === 'documents' && (
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-open-sans focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[160px]">
              <option value="">Tous les types</option>
              <option value="report">Rapports</option>
              <option value="doc">Documents</option>
              <option value="prototype">Prototypes</option>
            </select>
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-open-sans focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[160px]">
              <option value="">Tous les sprints</option>
              <option value="Sprint 3">Sprint 3</option>
              <option value="Sprint 4">Sprint 4</option>
            </select>
          </div>
        )}
      </PageHeader>
      
      <main className="p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 max-w-full">
        <div className="max-w-none mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default ClientPage;