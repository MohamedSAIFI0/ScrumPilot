import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MetricsCards: React.FC = () => {
  const [metrics, setMetrics] = useState({
    projetsActifs: 0,
    sprintsEnCours: 0,
    storiesTerminees: 0,
    bloqueurs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const Token = localStorage.getItem("access_token")
  const headers = {
    'Authorization':`Bearer ${Token}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Appels parallèles aux 4 APIs
        const [projectsRes, sprintsRes, userStoriesRes, blocagesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/projects/',{headers}),
          fetch('http://127.0.0.1:8000/api/sprints/',{headers}),
          fetch('http://127.0.0.1:8000/api/userstories/',{headers}),
          fetch('http://127.0.0.1:8000/api/blocages/',{headers})
        ]);

        // Vérification des réponses
        if (!projectsRes.ok || !sprintsRes.ok || !userStoriesRes.ok || !blocagesRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        // Parsing des données JSON
        const [projects, sprints, userStories, blocages] = await Promise.all([
          projectsRes.json(),
          sprintsRes.json(),
          userStoriesRes.json(),
          blocagesRes.json()
        ]);

        // Calcul des métriques
        const projetsActifs = Array.isArray(projects) ? projects.length : projects.count || 0;
        
        // Sprints en cours (supposant un champ 'status' ou 'active')
        const sprintsEnCours = Array.isArray(sprints) 
          ? sprints.filter(sprint => sprint.status === 'active' || sprint.status === 'en_cours' || sprint.active).length
          : sprints.count || 0;

        // Stories terminées (supposant un champ 'status' = 'done' ou 'terminee')
        const storiesTerminees = Array.isArray(userStories)
          ? userStories.filter(story => story.status === 'done' || story.status === 'terminee' || story.completed).length
          : userStories.completed_count || 0;

        // Nombre de blocages actifs
        const bloqueursActifs = Array.isArray(blocages)
          ? blocages.filter(blocage => blocage.status === 'active' || blocage.status === 'ouvert' || !blocage.resolved).length
          : blocages.count || 0;

        setMetrics({
          projetsActifs,
          sprintsEnCours,
          storiesTerminees,
          bloqueurs: bloqueursActifs
        });

      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Configuration des cartes métriques
  const metricsConfig = [
    {
      title: 'Projets Actifs',
      value: metrics.projetsActifs,
      change: `Total: ${metrics.projetsActifs} projets`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Sprints en Cours',
      value: metrics.sprintsEnCours,
      change: `${metrics.sprintsEnCours} actifs`,
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Stories Terminées',
      value: metrics.storiesTerminees,
      change: `${metrics.storiesTerminees} complétées`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Bloqueurs',
      value: metrics.bloqueurs,
      change: `${metrics.bloqueurs} actifs`,
      icon: AlertTriangle,
      color: 'text-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">
              Erreur de chargement: {error}
            </p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsConfig.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {metric.change}
                </p>
              </div>
              <Icon className={`h-8 w-8 ${metric.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;