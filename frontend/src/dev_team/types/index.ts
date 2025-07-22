export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'inprogress' | 'done';
    sprint: string;
    assignee: User;
    tags: string[];
    comments: Comment[];
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
    statusHistory: StatusChange[];
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'developer' | 'scrum_master' | 'product_owner';
    status?: 'online' | 'away' | 'busy' | 'offline';
    lastSeen?: Date;
  }
  
  export interface Comment {
    id: string;
    content: string;
    author: User;
    createdAt: Date;
    mentions: string[];
  }
  
  export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: User;
    uploadedAt: Date;
  }
  
  export interface StatusChange {
    id: string;
    fromStatus: string;
    toStatus: string;
    changedBy: User;
    changedAt: Date;
    comment?: string;
  }
  
  export interface Sprint {
    id: string;
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: 'planned' | 'active' | 'completed';
    tasks: Task[];
  }
  
  export interface Impediment {
    id: string;
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'critical';
    status: 'pending' | 'in_progress' | 'resolved';
    taskId: string;
    reportedBy: User;
    reportedAt: Date;
    resolvedAt?: Date;
  }
  
  export interface Retrospective {
    id: string;
    sprintId: string;
    whatWorked: string;
    whatDidntWork: string;
    improvements: string;
    submittedBy: User;
    submittedAt: Date;
    isLocked: boolean;
  }
  
  // New messaging interfaces
  export interface Message {
    id: string;
    content: string;
    author: User;
    conversationId: string;
    createdAt: Date;
    updatedAt?: Date;
    type: 'text' | 'file' | 'image' | 'voice' | 'system';
    attachments?: MessageAttachment[];
    reactions?: MessageReaction[];
    replyTo?: string;
    isEdited?: boolean;
    readBy?: MessageRead[];
    mentions?: string[];
  }
  
  export interface MessageAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    thumbnail?: string;
  }
  
  export interface MessageReaction {
    id: string;
    emoji: string;
    users: User[];
    count: number;
  }
  
  export interface MessageRead {
    userId: string;
    readAt: Date;
  }
  
  export interface Conversation {
    id: string;
    name?: string;
    type: 'direct' | 'group' | 'channel';
    participants: User[];
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
    isArchived?: boolean;
    isPinned?: boolean;
    unreadCount?: number;
    avatar?: string;
    description?: string;
    isOnline?: boolean;
  }
  
  export interface TypingIndicator {
    userId: string;
    conversationId: string;
    timestamp: Date;
  }
  
  // Dashboard interfaces
  export interface DashboardStats {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    criticalIssues: number;
    sprintProgress: number;
    velocity: number;
    burndownData: BurndownPoint[];
  }
  
  export interface BurndownPoint {
    date: Date;
    remaining: number;
    ideal: number;
  }
  
  export interface ActivityItem {
    id: string;
    type: 'task_update' | 'comment' | 'impediment' | 'sprint_event';
    title: string;
    description: string;
    user: User;
    timestamp: Date;
    icon: string;
    color: string;
  }
  
  // Theme interface
  export interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
  }