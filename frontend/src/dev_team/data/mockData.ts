import { Task, User, Sprint, Comment, Attachment, StatusChange, Impediment, Message, Conversation, MessageReaction } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@company.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  role: 'developer',
  status: 'online',
  lastSeen: new Date()
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    role: 'scrum_master',
    status: 'online',
    lastSeen: new Date()
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    role: 'developer',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    role: 'product_owner',
    status: 'busy',
    lastSeen: new Date()
  },
  {
    id: '5',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    role: 'developer',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Cette tâche nécessite une revue de code approfondie.',
    author: mockUsers[1],
    createdAt: new Date('2024-01-15T10:30:00'),
    mentions: []
  },
  {
    id: '2',
    content: '@jane.smith Pouvez-vous valider l\'approche technique ?',
    author: mockUser,
    createdAt: new Date('2024-01-15T14:20:00'),
    mentions: ['jane.smith']
  }
];

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: 'wireframes.pdf',
    url: '#',
    type: 'application/pdf',
    size: 2048000,
    uploadedBy: mockUser,
    uploadedAt: new Date('2024-01-14T09:15:00')
  },
  {
    id: '2',
    name: 'screenshot.png',
    url: '#',
    type: 'image/png',
    size: 512000,
    uploadedBy: mockUsers[2],
    uploadedAt: new Date('2024-01-15T16:45:00')
  }
];

const mockStatusHistory: StatusChange[] = [
  {
    id: '1',
    fromStatus: 'todo',
    toStatus: 'inprogress',
    changedBy: mockUser,
    changedAt: new Date('2024-01-15T09:00:00'),
    comment: 'Début du développement'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implémenter l\'authentification utilisateur',
    description: 'Créer le système de connexion avec JWT et validation des formulaires',
    priority: 'high',
    status: 'todo',
    sprint: 'Sprint 3',
    assignee: mockUser,
    tags: ['backend', 'auth', 'security'],
    comments: mockComments,
    attachments: mockAttachments,
    createdAt: new Date('2024-01-10T08:00:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    statusHistory: mockStatusHistory
  },
  {
    id: '2',
    title: 'Optimiser les requêtes de base de données',
    description: 'Améliorer les performances des requêtes SQL et ajouter des index',
    priority: 'medium',
    status: 'inprogress',
    sprint: 'Sprint 3',
    assignee: mockUsers[2],
    tags: ['database', 'performance'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-01-12T10:30:00'),
    updatedAt: new Date('2024-01-15T11:15:00'),
    statusHistory: []
  },
  {
    id: '3',
    title: 'Créer les tests unitaires pour l\'API',
    description: 'Écrire des tests complets pour tous les endpoints de l\'API REST',
    priority: 'high',
    status: 'inprogress',
    sprint: 'Sprint 3',
    assignee: mockUser,
    tags: ['testing', 'api', 'quality'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-01-11T14:00:00'),
    updatedAt: new Date('2024-01-14T16:30:00'),
    statusHistory: []
  },
  {
    id: '4',
    title: 'Corriger le bug de validation des formulaires',
    description: 'Résoudre le problème de validation côté client pour les champs obligatoires',
    priority: 'critical',
    status: 'done',
    sprint: 'Sprint 3',
    assignee: mockUsers[2],
    tags: ['frontend', 'bugfix', 'forms'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-01-08T09:45:00'),
    updatedAt: new Date('2024-01-13T17:20:00'),
    statusHistory: []
  },
  {
    id: '5',
    title: 'Intégrer le système de paiement',
    description: 'Connecter l\'API Stripe pour les transactions en ligne',
    priority: 'high',
    status: 'todo',
    sprint: 'Sprint 3',
    assignee: mockUser,
    tags: ['payment', 'integration', 'stripe'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-01-13T11:20:00'),
    updatedAt: new Date('2024-01-13T11:20:00'),
    statusHistory: []
  },
  {
    id: '6',
    title: 'Mettre à jour la documentation technique',
    description: 'Réviser et compléter la documentation de l\'architecture système',
    priority: 'low',
    status: 'done',
    sprint: 'Sprint 3',
    assignee: mockUsers[2],
    tags: ['documentation', 'architecture'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-01-09T15:10:00'),
    updatedAt: new Date('2024-01-12T18:45:00'),
    statusHistory: []
  }
];

export const mockSprint: Sprint = {
  id: 'sprint-3',
  name: 'Sprint 3 - Authentification & Paiements',
  goal: 'Implémenter un système d\'authentification sécurisé et intégrer les paiements en ligne',
  startDate: new Date('2024-01-08T09:00:00'),
  endDate: new Date('2024-01-22T18:00:00'),
  status: 'active',
  tasks: mockTasks
};

export const mockImpediments: Impediment[] = [
  {
    id: '1',
    title: 'Problème d\'accès à l\'API externe',
    description: 'L\'API de paiement retourne des erreurs 500 intermittentes',
    severity: 'critical',
    status: 'pending',
    taskId: '5',
    reportedBy: mockUser,
    reportedAt: new Date('2024-01-15T13:30:00')
  }
];

// Mock messaging data
export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Salut ! Comment avance le développement de l\'authentification ?',
    author: mockUsers[1],
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 3600000),
    type: 'text',
    reactions: [
      {
        id: 'r1',
        emoji: '👍',
        users: [mockUser],
        count: 1
      }
    ],
    readBy: [
      { userId: mockUser.id, readAt: new Date(Date.now() - 3500000) }
    ]
  },
  {
    id: '2',
    content: 'Ça avance bien ! J\'ai terminé la partie JWT, je passe aux tests maintenant 🚀',
    author: mockUser,
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 3500000),
    type: 'text',
    reactions: [
      {
        id: 'r2',
        emoji: '🎉',
        users: [mockUsers[1], mockUsers[2]],
        count: 2
      }
    ],
    readBy: [
      { userId: mockUsers[1].id, readAt: new Date(Date.now() - 3400000) }
    ]
  },
  {
    id: '3',
    content: 'Parfait ! N\'hésite pas si tu as besoin d\'aide pour les tests d\'intégration',
    author: mockUsers[1],
    conversationId: 'conv-1',
    createdAt: new Date(Date.now() - 3400000),
    type: 'text',
    readBy: [
      { userId: mockUser.id, readAt: new Date(Date.now() - 3300000) }
    ]
  },
  {
    id: '4',
    content: 'Voici le mockup de la nouvelle interface',
    author: mockUsers[3],
    conversationId: 'conv-2',
    createdAt: new Date(Date.now() - 1800000),
    type: 'file',
    attachments: [
      {
        id: 'att1',
        name: 'interface-mockup.png',
        url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
        type: 'image/png',
        size: 1024000,
        thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
      }
    ],
    readBy: [
      { userId: mockUser.id, readAt: new Date(Date.now() - 1700000) }
    ]
  },
  {
    id: '5',
    content: 'Excellent design ! 👌 Les couleurs sont parfaites',
    author: mockUser,
    conversationId: 'conv-2',
    createdAt: new Date(Date.now() - 1700000),
    type: 'text',
    replyTo: '4',
    reactions: [
      {
        id: 'r3',
        emoji: '💯',
        users: [mockUsers[3]],
        count: 1
      }
    ]
  },
  {
    id: '6',
    content: 'Réunion daily standup dans 10 minutes ! 📅',
    author: mockUsers[1],
    conversationId: 'conv-3',
    createdAt: new Date(Date.now() - 600000),
    type: 'text',
    mentions: ['@everyone']
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Jane Smith',
    type: 'direct',
    participants: [mockUser, mockUsers[1]],
    lastMessage: mockMessages[2],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3400000),
    unreadCount: 0,
    avatar: mockUsers[1].avatar,
    isOnline: true
  },
  {
    id: 'conv-2',
    name: 'Sarah Wilson',
    type: 'direct',
    participants: [mockUser, mockUsers[3]],
    lastMessage: mockMessages[4],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 1700000),
    unreadCount: 0,
    avatar: mockUsers[3].avatar,
    isOnline: false
  },
  {
    id: 'conv-3',
    name: 'Équipe Sprint 3',
    type: 'group',
    participants: [mockUser, mockUsers[1], mockUsers[2], mockUsers[3]],
    lastMessage: mockMessages[5],
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 600000),
    unreadCount: 1,
    avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    description: 'Discussion de l\'équipe pour le Sprint 3'
  },
  {
    id: 'conv-4',
    name: 'Mike Johnson',
    type: 'direct',
    participants: [mockUser, mockUsers[2]],
    lastMessage: {
      id: '7',
      content: 'Merci pour ton aide sur le bug de performance !',
      author: mockUsers[2],
      conversationId: 'conv-4',
      createdAt: new Date(Date.now() - 7200000),
      type: 'text'
    },
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 7200000),
    unreadCount: 0,
    avatar: mockUsers[2].avatar,
    isOnline: false
  },
  {
    id: 'conv-5',
    name: '🚀 Développement',
    type: 'channel',
    participants: mockUsers,
    lastMessage: {
      id: '8',
      content: 'Nouvelle version déployée en staging ! 🎉',
      author: mockUsers[1],
      conversationId: 'conv-5',
      createdAt: new Date(Date.now() - 10800000),
      type: 'text'
    },
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 10800000),
    unreadCount: 3,
    avatar: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    description: 'Canal général pour les discussions de développement'
  }
];