import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Target,
  Calendar,
  Users,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Zap,
  Timer,
  MessageSquare,
  FileText
} from 'lucide-react';
import { DashboardStats, ActivityItem } from '../types';

// Types pour les données API
interface UserStory {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
  epic: number;
  sprint: number | null;
  assignee: number[];
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'completed' | 'planned';
  start_date: string;
  end_date: string;
  duration: number;
  capacity: number;
  planning_ceremony: boolean;
  daily_ceremony: boolean;
  review_ceremony: boolean;
  retrospective_ceremony: boolean;
  created_at: string;
  updated_at: string;
  project: number;
  created_by: number;
}

interface Blocage {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  // États pour les données
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [blocages, setBlocages] = useState<Blocage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour fetcher les données
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const Token = localStorage.getItem('access_token')
      const headers = {
        'Authorization':`Bearer ${Token}`,
      }

      // Fetch toutes les données en parallèle
      const [userStoriesRes, sprintsRes, blocagesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/userstories/'),
        fetch('http://127.0.0.1:8000/api/sprints/',{headers}),
        fetch('http://127.0.0.1:8000/api/blocages/')
      ]);

      // Vérifier les réponses
      if (!userStoriesRes.ok || !sprintsRes.ok || !blocagesRes.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      // Parser les données JSON
      const [userStoriesData, sprintsData, blocagesData] = await Promise.all([
        userStoriesRes.json(),
        sprintsRes.json(),
        blocagesRes.json()
      ]);

      setUserStories(userStoriesData);
      setSprints(sprintsData);
      setBlocages(blocagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du fetch des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch des données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  // Calculs des statistiques basés sur les vraies données
  const totalTasks = userStories.length;
  const completedTasks = userStories.filter(story => story.status === 'done').length;
  const inProgressTasks = userStories.filter(story => story.status === 'in_progress').length;
  const pendingTasks = userStories.filter(story => story.status === 'todo').length;
  const criticalBlocages = blocages.filter(blocage => blocage.severity === 'critical').length;
  const sprintProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Trouver le sprint actif
  const activeSprint = sprints.find(sprint => sprint.status === 'active');

  // Mock activity data (peut être remplacé par une vraie API plus tard)
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_update',
      title: 'Tâche terminée',
      description: 'Nouvelle user story terminée',
      user: { id: '1', name: 'Vous', email: '', avatar: '', role: 'developer' },
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      icon: 'CheckCircle2',
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'comment',
      title: 'Nouveau commentaire',
      description: 'Commentaire ajouté sur une user story',
      user: { id: '2', name: 'Jane Smith', email: '', avatar: '', role: 'scrum_master' },
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'MessageSquare',
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'impediment',
      title: 'Blocage signalé',
      description: `${criticalBlocages} blocage(s) critique(s) détecté(s)`,
      user: { id: '1', name: 'Vous', email: '', avatar: '', role: 'developer' },
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'AlertTriangle',
      color: 'text-red-600'
    },
    {
      id: '4',
      type: 'sprint_event',
      title: 'Sprint actif',
      description: activeSprint ? `${activeSprint.name} en cours` : 'Aucun sprint actif',
      user: { id: '2', name: 'Scrum Master', email: '', avatar: '', role: 'scrum_master' },
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      icon: 'Calendar',
      color: 'text-purple-600'
    }
  ];

  const getDaysRemaining = () => {
    if (!activeSprint) return 0;
    const today = new Date();
    const endDate = new Date(activeSprint.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      CheckCircle2,
      MessageSquare,
      AlertTriangle,
      Calendar
    };
    const IconComponent = icons[iconName] || Activity;
    return IconComponent;
  };

  // Affichage d'erreur
  if (error) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Erreur de chargement</span>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Affichage de chargement
  if (loading) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-title font-poppins font-semibold text-secondary-2 dark:text-white mb-2">
          Tableau de Bord
        </h1>
        <p className="text-base lg:text-paragraph font-open-sans text-gray-600 dark:text-gray-300">
          Vue d'ensemble de votre activité et progression
        </p>
        <button 
          onClick={fetchData}
          className="mt-2 text-sm text-primary hover:text-purple-700 font-medium"
          disabled={loading}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total User Stories
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {totalTasks}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">En temps réel</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Terminées
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {completedTasks}
              </p>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% du total
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                En Cours
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {inProgressTasks}
              </p>
              <div className="flex items-center mt-2">
                <Timer className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Active</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Critical Blocages */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Blocages Critiques
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {criticalBlocages}
              </p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {criticalBlocages > 0 ? 'Attention requise' : 'Aucun blocage'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Sprint Progress */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                Progression du Sprint
              </h3>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activeSprint ? `${getDaysRemaining()} jours restants` : 'Aucun sprint actif'}
                </span>
              </div>
            </div>

            {/* Sprint Info */}
            {activeSprint ? (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {activeSprint.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {activeSprint.goal}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progression
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completedTasks}/{totalTasks} user stories
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${sprintProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="font-medium">{sprintProgress.toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Sprint Dates */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>Début: {new Date(activeSprint.start_date).toLocaleDateString('fr-FR')}</span>
                  <span>Fin: {new Date(activeSprint.end_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucun sprint actif</p>
              </div>
            )}

            {/* Task Distribution */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{pendingTasks}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">À Faire</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{inProgressTasks}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">En Cours</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{completedTasks}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Terminé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
              Activité Récente
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = getIconComponent(activity.icon);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 text-sm text-primary hover:text-purple-700 font-medium">
            Voir toute l'activité
          </button>
        </div>
      </div>

      {/* Quick Actions & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
        {/* Quick Actions */}
        
        {/* Sprint Info Card */}
        {activeSprint && (
          <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-6">
              Informations Sprint
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Capacité:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {activeSprint.capacity} points
                </span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {activeSprint.duration} jours
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {activeSprint.planning_ceremony && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                    Planning
                  </span>
                )}
                {activeSprint.daily_ceremony && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                    Daily
                  </span>
                )}
                {activeSprint.review_ceremony && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                    Review
                  </span>
                )}
                {activeSprint.retrospective_ceremony && (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                    Retrospective
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;