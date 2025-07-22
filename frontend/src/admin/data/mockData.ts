import { User, PlatformSettings, DashboardStats, Permission, RolePermission, Message, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@example.com',
    role: 'PO',
    status: 'active',
    team: 'Alpha',
    createdAt: '2024-01-15',
    lastLogin: '2024-03-15 14:30',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@example.com',
    role: 'Scrum Master',
    status: 'active',
    team: 'Beta',
    createdAt: '2024-01-20',
    lastLogin: '2024-03-15 16:45',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@example.com',
    role: 'Dev',
    status: 'active',
    team: 'Alpha',
    createdAt: '2024-02-01',
    lastLogin: '2024-03-15 09:15',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true
  },
  {
    id: '4',
    name: 'Pierre Moreau',
    email: 'pierre.moreau@example.com',
    role: 'Dev',
    status: 'inactive',
    team: 'Beta',
    createdAt: '2024-02-05',
    lastLogin: '2024-03-10 11:20',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false
  },
  {
    id: '5',
    name: 'Claire Rousseau',
    email: 'claire.rousseau@client.com',
    role: 'Client',
    status: 'active',
    team: 'External',
    createdAt: '2024-02-10',
    lastLogin: '2024-03-14 13:00',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true
  },
  {
    id: '6',
    name: 'Thomas Bernard',
    email: 'thomas.bernard@example.com',
    role: 'Dev',
    status: 'active',
    team: 'Alpha',
    createdAt: '2024-02-15',
    lastLogin: '2024-03-15 10:30',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true
  },
  {
    id: '7',
    name: 'Emma Leroy',
    email: 'emma.leroy@example.com',
    role: 'Scrum Master',
    status: 'active',
    team: 'Gamma',
    createdAt: '2024-02-20',
    lastLogin: '2024-03-15 11:15',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false
  },
  {
    id: '8',
    name: 'Lucas Petit',
    email: 'lucas.petit@example.com',
    role: 'Dev',
    status: 'active',
    team: 'Beta',
    createdAt: '2024-02-25',
    lastLogin: '2024-03-15 13:45',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true
  }
];

export const mockPlatformSettings: PlatformSettings = {
  projectName: 'Scrum Platform Pro',
  logo: '/logo.png',
  defaultLanguage: 'fr',
  timezone: 'Europe/Paris',
  enabledModules: {
    retrospectives: true,
    deliverableValidation: true,
    twoFactorAuth: false,
    emailNotifications: true,
    inAppNotifications: true
  },
  maintenanceMode: false
};

export const mockDashboardStats: DashboardStats = {
  totalUsers: 247,
  activeUsers: 189,
  totalProjects: 12,
  activeSprints: 8,
  completedTasks: 1456,
  pendingTasks: 234
};

export const mockPermissions: Permission[] = [
  { id: '1', name: 'user.create', description: 'Créer des utilisateurs', category: 'Utilisateurs' },
  { id: '2', name: 'user.read', description: 'Voir les utilisateurs', category: 'Utilisateurs' },
  { id: '3', name: 'user.update', description: 'Modifier les utilisateurs', category: 'Utilisateurs' },
  { id: '4', name: 'user.delete', description: 'Supprimer des utilisateurs', category: 'Utilisateurs' },
  { id: '5', name: 'task.create', description: 'Créer des tâches', category: 'Tâches' },
  { id: '6', name: 'task.read', description: 'Voir les tâches', category: 'Tâches' },
  { id: '7', name: 'task.update', description: 'Modifier les tâches', category: 'Tâches' },
  { id: '8', name: 'task.delete', description: 'Supprimer des tâches', category: 'Tâches' },
  { id: '9', name: 'sprint.create', description: 'Créer des sprints', category: 'Sprints' },
  { id: '10', name: 'sprint.read', description: 'Voir les sprints', category: 'Sprints' },
  { id: '11', name: 'sprint.update', description: 'Modifier les sprints', category: 'Sprints' },
  { id: '12', name: 'project.read', description: 'Voir les projets', category: 'Projets' },
  { id: '13', name: 'project.create', description: 'Créer des projets', category: 'Projets' },
];

export const mockRolePermissions: RolePermission[] = [
  {
    role: 'PO',
    permissions: ['1', '2', '3', '5', '6', '7', '9', '10', '11', '12', '13']
  },
  {
    role: 'Scrum Master',
    permissions: ['2', '6', '7', '9', '10', '11', '12']
  },
  {
    role: 'Dev',
    permissions: ['2', '6', '7', '10', '12']
  },
  {
    role: 'Client',
    permissions: ['2', '6', '10', '12']
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    senderName: 'Marie Dubois',
    senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    recipientId: 'admin',
    recipientName: 'Admin',
    subject: 'Mise à jour du sprint Alpha',
    content: 'Bonjour, je voulais vous informer que le sprint Alpha est maintenant terminé. Nous avons livré toutes les user stories prévues et les tests sont passés avec succès.',
    timestamp: '2024-03-15 14:30',
    isRead: false,
    isStarred: true
  },
  {
    id: '2',
    senderId: '2',
    senderName: 'Jean Martin',
    senderAvatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    recipientId: 'admin',
    recipientName: 'Admin',
    subject: 'Problème avec l\'équipe Beta',
    content: 'Il y a eu quelques difficultés avec l\'équipe Beta cette semaine. Pouvons-nous programmer une réunion pour en discuter ?',
    timestamp: '2024-03-15 10:15',
    isRead: true,
    isStarred: false
  },
  {
    id: '3',
    senderId: '3',
    senderName: 'Sophie Laurent',
    senderAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    recipientId: 'admin',
    recipientName: 'Admin',
    subject: 'Demande de congés',
    content: 'Je souhaiterais prendre quelques jours de congés la semaine prochaine. Pouvez-vous approuver ma demande ?',
    timestamp: '2024-03-14 16:45',
    isRead: true,
    isStarred: false
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouveau utilisateur inscrit',
    message: 'Lucas Petit s\'est inscrit sur la plateforme',
    type: 'info',
    timestamp: '2024-03-15 15:30',
    isRead: false,
    userId: '8'
  },
  {
    id: '2',
    title: 'Sprint terminé',
    message: 'Le sprint Alpha a été marqué comme terminé',
    type: 'success',
    timestamp: '2024-03-15 14:30',
    isRead: false
  },
  {
    id: '3',
    title: 'Problème détecté',
    message: 'Connexion échouée pour l\'utilisateur Pierre Moreau',
    type: 'warning',
    timestamp: '2024-03-15 12:15',
    isRead: true
  },
  {
    id: '4',
    title: 'Maintenance programmée',
    message: 'Maintenance système prévue demain à 2h00',
    type: 'info',
    timestamp: '2024-03-15 09:00',
    isRead: true
  }
];