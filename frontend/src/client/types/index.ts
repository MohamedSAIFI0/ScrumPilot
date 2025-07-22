export interface Project {
    id: string;
    name: string;
    description: string;
    progress: number;
    completedTasks: number;
    totalTasks: number;
    currentSprint: Sprint;
  }
  
  export interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'planned';
    goal: string;
    successRate?: number;
  }
  
  export interface Deliverable {
    id: string;
    name: string;
    sprint: string;
    type: 'design' | 'doc' | 'feature';
    link: string;
    status: 'pending' | 'validated' | 'rejected';
    comments?: string;
    uploadDate: string;
  }
  
  export interface Feedback {
    id: string;
    deliverableId?: string;
    content: string;
    author: string;
    timestamp: string;
    rating?: number;
    mentions?: string[];
    category?: string;
    priority?: string;
  }
  
  export interface Document {
    id: string;
    name: string;
    type: 'report' | 'doc' | 'image' | 'prototype';
    uploadDate: string;
    downloadUrl: string;
    sprint?: string;
    size: string;
  }
  
  export interface Release {
    id: string;
    name: string;
    version: string;
    releaseDate: string;
    changelog: string[];
    testUrl?: string;
    prodUrl?: string;
  }