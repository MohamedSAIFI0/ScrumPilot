import React from 'react';
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
import { mockTasks, mockSprint, mockImpediments } from '../data/mockData';
import { DashboardStats, ActivityItem } from '../types';

const Dashboard: React.FC = () => {
  // Calculate dashboard statistics
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = mockTasks.filter(task => task.status === 'inprogress').length;
  const pendingTasks = mockTasks.filter(task => task.status === 'todo').length;
  const criticalTasks = mockTasks.filter(task => task.priority === 'critical').length;
  const sprintProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Mock activity data
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_update',
      title: 'Tâche terminée',
      description: 'Corriger le bug de validation des formulaires',
      user: { id: '1', name: 'Vous', email: '', avatar: '', role: 'developer' },
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      icon: 'CheckCircle2',
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'comment',
      title: 'Nouveau commentaire',
      description: 'Jane Smith a commenté votre tâche d\'authentification',
      user: { id: '2', name: 'Jane Smith', email: '', avatar: '', role: 'scrum_master' },
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'MessageSquare',
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'impediment',
      title: 'Blocage signalé',
      description: 'Problème d\'accès à l\'API externe',
      user: { id: '1', name: 'Vous', email: '', avatar: '', role: 'developer' },
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'AlertTriangle',
      color: 'text-red-600'
    },
    {
      id: '4',
      type: 'sprint_event',
      title: 'Sprint Planning',
      description: 'Planification du Sprint 4 programmée',
      user: { id: '2', name: 'Jane Smith', email: '', avatar: '', role: 'scrum_master' },
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      icon: 'Calendar',
      color: 'text-purple-600'
    }
  ];

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(mockSprint.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Tâches
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {totalTasks}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+12%</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">ce mois</span>
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
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+8%</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">cette semaine</span>
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

        {/* Critical Issues */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Critique
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {criticalTasks}
              </p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600 dark:text-red-400">Attention requise</span>
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
                  {getDaysRemaining()} jours restants
                </span>
              </div>
            </div>

            {/* Sprint Info */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {mockSprint.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {mockSprint.goal}
              </p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progression
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completedTasks}/{totalTasks} tâches
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
            </div>

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
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-6">
            Actions Rapides
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-br from-primary to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <Zap className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Nouvelle Tâche</span>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <MessageSquare className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Messagerie</span>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Planning</span>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Rapports</span>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-6">
            Métriques de Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Vélocité</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Points par sprint</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">24</p>
                <div className="flex items-center">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">+15%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Taux de Réussite</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tâches terminées</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">87%</p>
                <div className="flex items-center">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">+3%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Collaboration</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commentaires/jour</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">12</p>
                <div className="flex items-center">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">+8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;