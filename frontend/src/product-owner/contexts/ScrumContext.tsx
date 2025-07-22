import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UserStory {
  id: string;
  title: string;
  description: string;
  priority: 'basse' | 'moyenne' | 'haute';
  points: number;
  tag: string;
  status: 'To Do' | 'In Progress' | 'Done';
  sprintId?: string;
  assignee?: string;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  status: 'planned' | 'active' | 'completed';
  userStories: string[];
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface ScrumState {
  userStories: UserStory[];
  sprints: Sprint[];
  notifications: Notification[];
  messages: Message[];
  activeView: string;
  selectedSprint: string | null;
  darkMode: boolean;
  unreadNotifications: number;
  unreadMessages: number;
}

type ScrumAction = 
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'ADD_USER_STORY'; payload: UserStory }
  | { type: 'UPDATE_USER_STORY'; payload: UserStory }
  | { type: 'DELETE_USER_STORY'; payload: string }
  | { type: 'ADD_SPRINT'; payload: Sprint }
  | { type: 'UPDATE_SPRINT'; payload: Sprint }
  | { type: 'SET_SELECTED_SPRINT'; payload: string | null }
  | { type: 'ADD_COMMENT'; payload: { storyId: string; comment: Comment } }
  | { type: 'REORDER_STORIES'; payload: UserStory[] }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'MARK_MESSAGE_READ'; payload: string };

const initialState: ScrumState = {
  userStories: [
    {
      id: '1',
      title: 'Connexion utilisateur',
      description: 'En tant qu\'utilisateur, je veux pouvoir me connecter pour accéder à mes projets',
      priority: 'haute',
      points: 8,
      tag: 'Authentification',
      status: 'Done',
      sprintId: 'sprint-1',
      assignee: 'Alice Martin',
      comments: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '2',
      title: 'Tableau de bord principal',
      description: 'En tant que PO, je veux voir un tableau de bord avec les métriques importantes',
      priority: 'haute',
      points: 13,
      tag: 'Dashboard',
      status: 'In Progress',
      sprintId: 'sprint-1',
      assignee: 'Bob Dupont',
      comments: [],
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-19')
    },
    {
      id: '3',
      title: 'Gestion des profils',
      description: 'En tant qu\'utilisateur, je veux modifier mon profil et mes préférences',
      priority: 'moyenne',
      points: 5,
      tag: 'Profil',
      status: 'To Do',
      sprintId: 'sprint-2',
      assignee: 'Claire Petit',
      comments: [],
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17')
    },
    {
      id: '4',
      title: 'Notifications en temps réel',
      description: 'En tant qu\'utilisateur, je veux recevoir des notifications pour les mises à jour importantes',
      priority: 'basse',
      points: 8,
      tag: 'Notifications',
      status: 'To Do',
      comments: [],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    }
  ],
  sprints: [
    {
      id: 'sprint-1',
      name: 'Sprint 1 - Fondations',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-29'),
      goal: 'Mettre en place les fonctionnalités de base et l\'authentification',
      status: 'active',
      userStories: ['1', '2'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'sprint-2',
      name: 'Sprint 2 - Fonctionnalités utilisateur',
      startDate: new Date('2024-01-30'),
      endDate: new Date('2024-02-12'),
      goal: 'Développer les fonctionnalités de gestion utilisateur',
      status: 'planned',
      userStories: ['3'],
      createdAt: new Date('2024-01-15')
    }
  ],
  notifications: [
    {
      id: '1',
      title: 'Nouvelle tâche assignée',
      message: 'Une nouvelle tâche vous a été assignée dans le Sprint 1',
      type: 'info',
      read: false,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Sprint terminé',
      message: 'Le Sprint 1 a été marqué comme terminé',
      type: 'success',
      read: false,
      createdAt: new Date()
    }
  ],
  messages: [
    {
      id: '1',
      sender: 'Alice Martin',
      recipient: 'Marie Dubois',
      content: 'Bonjour Marie, j\'ai terminé la tâche d\'authentification. Pouvez-vous la valider ?',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      sender: 'Bob Dupont',
      recipient: 'Marie Dubois',
      content: 'Le tableau de bord avance bien, j\'aurai besoin de vos retours sur le design.',
      timestamp: new Date(),
      read: false
    }
  ],
  activeView: 'dashboard',
  selectedSprint: 'sprint-1',
  darkMode: false,
  unreadNotifications: 2,
  unreadMessages: 2
};

function scrumReducer(state: ScrumState, action: ScrumAction): ScrumState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'ADD_USER_STORY':
      return { 
        ...state, 
        userStories: [...state.userStories, action.payload] 
      };
    case 'UPDATE_USER_STORY':
      return {
        ...state,
        userStories: state.userStories.map(story =>
          story.id === action.payload.id ? action.payload : story
        )
      };
    case 'DELETE_USER_STORY':
      return {
        ...state,
        userStories: state.userStories.filter(story => story.id !== action.payload)
      };
    case 'ADD_SPRINT':
      return {
        ...state,
        sprints: [...state.sprints, action.payload]
      };
    case 'UPDATE_SPRINT':
      return {
        ...state,
        sprints: state.sprints.map(sprint =>
          sprint.id === action.payload.id ? action.payload : sprint
        )
      };
    case 'SET_SELECTED_SPRINT':
      return { ...state, selectedSprint: action.payload };
    case 'ADD_COMMENT':
      return {
        ...state,
        userStories: state.userStories.map(story =>
          story.id === action.payload.storyId
            ? { ...story, comments: [...story.comments, action.payload.comment] }
            : story
        )
      };
    case 'REORDER_STORIES':
      return { ...state, userStories: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        unreadNotifications: state.unreadNotifications + 1
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1)
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        unreadMessages: state.unreadMessages + 1
      };
    case 'MARK_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload ? { ...msg, read: true } : msg
        ),
        unreadMessages: Math.max(0, state.unreadMessages - 1)
      };
    default:
      return state;
  }
}

const ScrumContext = createContext<{
  state: ScrumState;
  dispatch: React.Dispatch<ScrumAction>;
} | null>(null);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scrumReducer, initialState);

  return (
    <ScrumContext.Provider value={{ state, dispatch }}>
      {children}
    </ScrumContext.Provider>
  );
}

export function useScrum() {
  const context = useContext(ScrumContext);
  if (!context) {
    throw new Error('useScrum must be used within a ScrumProvider');
  }
  return context;
}