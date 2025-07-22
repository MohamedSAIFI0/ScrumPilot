import { Project, Sprint, Deliverable, Feedback, Document, Release } from '../types';

export const mockProject: Project = {
  id: '1',
  name: 'Plateforme E-commerce Mobile',
  description: 'Développement d\'une application mobile de commerce électronique',
  progress: 68,
  completedTasks: 34,
  totalTasks: 50,
  currentSprint: {
    id: 'sprint-5',
    name: 'Sprint 5 - Paiement & Sécurité',
    startDate: '2025-01-15',
    endDate: '2025-01-29',
    status: 'active',
    goal: 'Intégrer les systèmes de paiement sécurisés et finaliser l\'authentification'
  }
};

export const mockSprints: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1 - Setup & Architecture',
    startDate: '2024-11-01',
    endDate: '2024-11-15',
    status: 'completed',
    goal: 'Mise en place de l\'architecture et des outils de développement',
    successRate: 95
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2 - Interface Utilisateur',
    startDate: '2024-11-16',
    endDate: '2024-11-30',
    status: 'completed',
    goal: 'Développement des écrans principaux de l\'application',
    successRate: 88
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3 - Catalogue Produits',
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    status: 'completed',
    goal: 'Implémentation du système de catalogue et recherche',
    successRate: 92
  },
  {
    id: 'sprint-4',
    name: 'Sprint 4 - Panier & Commandes',
    startDate: '2024-12-16',
    endDate: '2025-01-14',
    status: 'completed',
    goal: 'Développement du système de panier et gestion des commandes',
    successRate: 85
  },
  mockProject.currentSprint
];

export const mockDeliverables: Deliverable[] = [
  {
    id: '1',
    name: 'Maquettes UI/UX - Écrans principaux',
    sprint: 'Sprint 2',
    type: 'design',
    link: 'https://figma.com/design/app-mobile',
    status: 'validated',
    uploadDate: '2024-11-25'
  },
  {
    id: '2',
    name: 'Documentation API - Catalogue',
    sprint: 'Sprint 3',
    type: 'doc',
    link: 'https://docs.api.com/catalogue',
    status: 'validated',
    uploadDate: '2024-12-10'
  },
  {
    id: '3',
    name: 'Feature - Système de panier',
    sprint: 'Sprint 4',
    type: 'feature',
    link: 'https://demo.app.com/cart',
    status: 'pending',
    uploadDate: '2025-01-10'
  },
  {
    id: '4',
    name: 'Intégration paiement Stripe',
    sprint: 'Sprint 5',
    type: 'feature',
    link: 'https://demo.app.com/payment',
    status: 'pending',
    uploadDate: '2025-01-20'
  }
];

export const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    deliverableId: '1',
    content: 'Les maquettes sont excellentes ! J\'aime particulièrement le design épuré et l\'expérience utilisateur intuitive.',
    author: 'Marie Dubois',
    timestamp: '2024-11-26T10:30:00Z',
    rating: 5
  },
  {
    id: '2',
    content: 'Le projet avance bien dans l\'ensemble. Quelques ajustements à prévoir sur l\'interface mobile.',
    author: 'Jean Martin',
    timestamp: '2025-01-15T14:20:00Z',
    rating: 4
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Rapport d\'avancement Sprint 4',
    type: 'report',
    uploadDate: '2025-01-14',
    downloadUrl: '/documents/rapport-sprint-4.pdf',
    sprint: 'Sprint 4',
    size: '2.3 MB'
  },
  {
    id: '2',
    name: 'Spécifications techniques',
    type: 'doc',
    uploadDate: '2024-11-05',
    downloadUrl: '/documents/specs-techniques.pdf',
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Prototype interactif',
    type: 'prototype',
    uploadDate: '2024-12-20',
    downloadUrl: 'https://prototype.app.com',
    sprint: 'Sprint 3',
    size: 'Lien externe'
  }
];

export const mockReleases: Release[] = [
  {
    id: '1',
    name: 'Version Alpha',
    version: 'v0.1.0',
    releaseDate: '2024-12-01',
    changelog: [
      'Interface utilisateur de base',
      'Système d\'authentification',
      'Navigation principale'
    ],
    testUrl: 'https://alpha.app.com'
  },
  {
    id: '2',
    name: 'Version Beta',
    version: 'v0.2.0',
    releaseDate: '2025-01-15',
    changelog: [
      'Catalogue de produits complet',
      'Système de recherche avancée',
      'Panier d\'achat fonctionnel',
      'Gestion des commandes'
    ],
    testUrl: 'https://beta.app.com'
  }
];

export const burndownData = [
  { day: 1, remaining: 50, ideal: 50 },
  { day: 2, remaining: 48, ideal: 46.4 },
  { day: 3, remaining: 45, ideal: 42.8 },
  { day: 4, remaining: 42, ideal: 39.2 },
  { day: 5, remaining: 38, ideal: 35.6 },
  { day: 6, remaining: 35, ideal: 32 },
  { day: 7, remaining: 32, ideal: 28.4 },
  { day: 8, remaining: 28, ideal: 24.8 },
  { day: 9, remaining: 25, ideal: 21.2 },
  { day: 10, remaining: 22, ideal: 17.6 },
  { day: 11, remaining: 18, ideal: 14 },
  { day: 12, remaining: 15, ideal: 10.4 },
  { day: 13, remaining: 12, ideal: 6.8 },
  { day: 14, remaining: 8, ideal: 3.2 },
  { day: 15, remaining: 5, ideal: 0 }
];