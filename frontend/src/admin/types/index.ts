export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'PO' | 'SM' | 'DEV' | 'CLIENT';
  status: 'active' | 'inactive';
  team?: string;
  avatar?: string;
  created_at: string | null;
  last_login?: string | null ;
  // Champs Django supplémentaires si nécessaire
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
}
  
  export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
  }
  
  export interface RolePermission {
    role: 'ADMIN' | 'PO' | 'SM' | 'DEV' | 'CLIENT';
    permissions: string[];
  }
  
  export interface PlatformSettings {
    projectName: string;
    logo: string;
    defaultLanguage: string;
    timezone: string;
    enabledModules: {
      retrospectives: boolean;
      deliverableValidation: boolean;
      twoFactorAuth: boolean;
      emailNotifications: boolean;
      inAppNotifications: boolean;
    };
    maintenanceMode: boolean;
  }
  
  export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeSprints: number;
    completedTasks: number;
    pendingTasks: number;
  }
  
  export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    recipientId: string;
    recipientName: string;
    subject: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    isStarred: boolean;
    attachments?: Attachment[];
  }
  
  export interface Attachment {
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
  }
  
  export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    userId?: string;
  }
  
  export interface Theme {
    mode: 'light' | 'dark';
  }