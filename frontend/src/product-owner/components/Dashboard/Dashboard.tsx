import React from 'react';
import { useScrum } from '../../contexts/ScrumContext';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#048ccc', '#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { state } = useScrum();

  // Calculs des métriques
  const totalStories = state.userStories.length;
  const completedStories = state.userStories.filter(s => s.status === 'Done').length;
  const inProgressStories = state.userStories.filter(s => s.status === 'In Progress').length;
  const todoStories = state.userStories.filter(s => s.status === 'To Do').length;
  
  const completionRate = Math.round((completedStories / totalStories) * 100);
  const activeSprints = state.sprints.filter(s => s.status === 'active').length;

  // Données pour les graphiques
  const burndownData = [
    { day: 'J1', remaining: 34, ideal: 34 },
    { day: 'J3', remaining: 28, ideal: 30 },
    { day: 'J5', remaining: 22, ideal: 26 },
    { day: 'J7', remaining: 18, ideal: 22 },
    { day: 'J9', remaining: 12, ideal: 18 },
    { day: 'J11', remaining: 8, ideal: 14 },
    { day: 'J13', remaining: 4, ideal: 10 },
    { day: 'J15', remaining: 0, ideal: 0 }
  ];

  const statusData = [
    { name: 'To Do', value: todoStories, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressStories, color: '#048ccc' },
    { name: 'Done', value: completedStories, color: '#10B981' }
  ];

  const velocityData = [
    { sprint: 'Sprint 1', points: 21 },
    { sprint: 'Sprint 2', points: 18 },
    { sprint: 'Sprint 3', points: 25 },
    { sprint: 'Sprint 4', points: 23 }
  ];

  const metrics = [
    {
      title: 'Stories Terminées',
      value: completedStories,
      total: totalStories,
      percentage: completionRate,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Sprints Actifs',
      value: activeSprints,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'En Cours',
      value: inProgressStories,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'En Attente',
      value: todoStories,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6 font-poppins">
      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className={`p-6 rounded-xl shadow-sm border ${
              state.darkMode 
                ? 'bg-dark-card border-gray-700' 
                : 'bg-cards border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium font-open-sans ${
                    state.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {metric.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold font-poppins ${
                      state.darkMode ? 'text-dark-text' : 'text-secondary-2'
                    }`}>
                      {metric.value}
                    </p>
                    {metric.total && (
                      <span className={`text-sm font-open-sans ${
                        state.darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        / {metric.total}
                      </span>
                    )}
                  </div>
                  {metric.percentage && (
                    <p className={`text-sm mt-1 font-open-sans ${
                      state.darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {metric.percentage}% complété
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <div className={`p-6 rounded-xl shadow-sm border ${
          state.darkMode 
            ? 'bg-dark-card border-gray-700' 
            : 'bg-cards border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Burndown Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="remaining" 
                stroke="#048ccc" 
                strokeWidth={3}
                name="Réel"
              />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Idéal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition des tâches */}
        <div className={`p-6 rounded-xl shadow-sm border ${
          state.darkMode 
            ? 'bg-dark-card border-gray-700' 
            : 'bg-cards border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 font-poppins ${
            state.darkMode ? 'text-dark-text' : 'text-secondary-2'
          }`}>
            Répartition des Tâches
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vélocité */}
      <div className={`p-6 rounded-xl shadow-sm border ${
        state.darkMode 
          ? 'bg-dark-card border-gray-700' 
          : 'bg-cards border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 font-poppins ${
          state.darkMode ? 'text-dark-text' : 'text-secondary-2'
        }`}>
          Vélocité de l'Équipe
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprint" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="points" fill="#048ccc" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activité récente */}
      <div className={`p-6 rounded-xl shadow-sm border ${
        state.darkMode 
          ? 'bg-dark-card border-gray-700' 
          : 'bg-cards border-gray-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 font-poppins ${
          state.darkMode ? 'text-dark-text' : 'text-secondary-2'
        }`}>
          Activité Récente
        </h3>
        <div className="space-y-4">
          <div className={`flex items-center space-x-4 p-3 rounded-lg ${
            state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
          }`}>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className={`text-sm font-medium font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                User Story "Connexion utilisateur" terminée
              </p>
              <p className={`text-xs font-open-sans ${
                state.darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Il y a 2 heures
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-4 p-3 rounded-lg ${
            state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
          }`}>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className={`text-sm font-medium font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                Sprint 2 planifié
              </p>
              <p className={`text-xs font-open-sans ${
                state.darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Il y a 1 jour
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-4 p-3 rounded-lg ${
            state.darkMode ? 'bg-dark-bg' : 'bg-gray-50'
          }`}>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className={`text-sm font-medium font-poppins ${
                state.darkMode ? 'text-dark-text' : 'text-secondary-2'
              }`}>
                Nouvelle tâche assignée à Bob Dupont
              </p>
              <p className={`text-xs font-open-sans ${
                state.darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Il y a 3 jours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}