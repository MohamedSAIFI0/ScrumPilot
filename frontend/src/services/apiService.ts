// services/api.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  name?: string;
  email: string;
  role?: string;
  team?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;  // Changed from last_login
  createdAt?: string;  // Changed from created_at
  avatar?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;  // Changed from created_at
  updatedAt?: string;  // Changed from updated_at
}

export interface Sprint {
  id: number;
  name: string;
  project?: number;
  status?: string;
  startDate?: string;  // Changed from start_date
  endDate?: string;    // Changed from end_date
  createdAt?: string;  // Changed from created_at
}

export interface UserStory {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  sprint?: number;
  assignee?: number;
  createdAt?: string;  // Changed from created_at
  updatedAt?: string;  // Changed from updated_at
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeSprints: number;
  completedTasks: number;
  pendingTasks: number;
}

// Helper function to ensure we always get an array
const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  // Handle your specific API response format
  if (data && typeof data === 'object') {
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.projects)) return data.projects;
    if (Array.isArray(data.sprints)) return data.sprints;
    if (Array.isArray(data.userStories)) return data.userStories;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.data)) return data.data;
  }
  console.warn('Expected array but got:', data);
  return [];
};

const accessToken = localStorage.getItem('access_token'); 

class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`API Response for ${url}:`, data); // Debug log
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // Récupérer tous les utilisateurs
  async getUsers(): Promise<User[]> {
    const data = await this.fetchWithErrorHandling<any>('/users/');
    return ensureArray<User>(data);
  }

  // Récupérer tous les projets
  async getProjects(): Promise<Project[]> {
    const data = await this.fetchWithErrorHandling<any>('/projects/');
    return ensureArray<Project>(data);
  }

  // Récupérer tous les sprints
  async getSprints(): Promise<Sprint[]> {
    const data = await this.fetchWithErrorHandling<any>('/sprints/');
    return ensureArray<Sprint>(data);
  }

  // Récupérer toutes les tâches (user stories)
  async getUserStories(): Promise<UserStory[]> {
    const data = await this.fetchWithErrorHandling<any>('/userstories/');
    return ensureArray<UserStory>(data);
  }

  // Calculer les statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [users, projects, sprints, userStories] = await Promise.all([
        this.getUsers(),
        this.getProjects(),
        this.getSprints(),
        this.getUserStories()
      ]);

      console.log('Dashboard data:', { users, projects, sprints, userStories }); // Debug log

      // Ensure all data are arrays
      const userArray = ensureArray<User>(users);
      const projectArray = ensureArray<Project>(projects);
      const sprintArray = ensureArray<Sprint>(sprints);
      const userStoryArray = ensureArray<UserStory>(userStories);

      // Calculer les utilisateurs actifs (connectés dans les 30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = userArray.filter(user => {
        return user.status === 'active';
      }).length;

      // Calculer les sprints actifs
      const activeSprints = sprintArray.filter(sprint => {
        return sprint.status === 'active' || sprint.status === 'in_progress';
      }).length;

      // Calculer les tâches terminées
      const completedTasks = userStoryArray.filter(story => {
        return story.status === 'done' || story.status === 'completed';
      }).length;

      // Calculer les tâches en attente
      const pendingTasks = userStoryArray.filter(story => {
        return story.status === 'todo' || story.status === 'pending' || story.status === 'new';
      }).length;

      return {
        totalUsers: userArray.length,
        activeUsers,
        totalProjects: projectArray.length,
        activeSprints,
        completedTasks,
        pendingTasks
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        activeSprints: 0,
        completedTasks: 0,
        pendingTasks: 0
      };
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Récupérer les activités récentes (basées sur les dernières modifications)
  async getRecentActivities() {
    try {
      const [users, projects, sprints, userStories] = await Promise.all([
        this.getUsers(),
        this.getProjects(),
        this.getSprints(),
        this.getUserStories()
      ]);

      // Ensure all data are arrays
      const userArray = ensureArray<User>(users);
      const projectArray = ensureArray<Project>(projects);
      const sprintArray = ensureArray<Sprint>(sprints);
      const userStoryArray = ensureArray<UserStory>(userStories);

      const activities = [];

      // Ajouter les connexions récentes
      const recentLogins = userArray
        .filter(user => user.lastLogin)
        .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
        .slice(0, 3)
        .map(user => ({
          user: user.name || user.email,
          action: 's\'est connecté',
          time: this.getRelativeTime(user.lastLogin!),
          type: 'info' as const
        }));

      // Ajouter les projets récents
      const recentProjects = projectArray
        .filter(project => project.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 2)
        .map(project => ({
          user: 'Système',
          action: `a créé le projet "${project.name}"`,
          time: this.getRelativeTime(project.createdAt!),
          type: 'success' as const
        }));

      // Ajouter les sprints récents
      const recentSprints = sprintArray
        .filter(sprint => sprint.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 2)
        .map(sprint => ({
          user: 'Système',
          action: `a créé le sprint "${sprint.name}"`,
          time: this.getRelativeTime(sprint.createdAt!),
          type: 'success' as const
        }));

      // Combiner et trier toutes les activités
      activities.push(...recentLogins, ...recentProjects, ...recentSprints);
      
      return activities
        .sort((a, b) => {
          // Trier par temps (plus récent en premier)
          const timeA = this.parseRelativeTime(a.time);
          const timeB = this.parseRelativeTime(b.time);
          return timeA - timeB;
        })
        .slice(0, 4);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Fonction utilitaire pour convertir une date en temps relatif
  private getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Il y a moins d\'1h';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
    }
  }

  // Fonction utilitaire pour parser le temps relatif (pour le tri)
  private parseRelativeTime(timeString: string): number {
    const match = timeString.match(/Il y a (\d+)(h|jour|semaine)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value;
      case 'jour': return value * 24;
      case 'semaine': return value * 24 * 7;
      default: return 0;
    }
  }
}

export const apiService = new ApiService();