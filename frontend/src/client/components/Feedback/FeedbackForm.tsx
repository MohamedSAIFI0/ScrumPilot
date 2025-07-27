import React, { useState, useEffect } from 'react';
import { Star, Send, FileText, AlertCircle, CheckCircle, ChevronDown, User, Calendar, FileCheck } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  client: string; // ID du client (ForeignKey vers Client)
}

interface Sprint {
  id: string;
  name: string;
  description?: string;
  project: string;
}

interface UserStory {
  id: string;
  title: string;
  description?: string;
  project: string;
  sprint?: string;
}

interface ClientInfo {
  id: string; // ID du user
  name: string;
  email: string;
  role: string;
}

interface Client {
  id: string; // ID du client (différent de l'ID user)
  name: string;
  user_id?: string; // Lien vers User si nécessaire
}

interface FeedbackFormProps {
  deliverableId?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ deliverableId }) => {
  // Form state
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [selectedUserStoryId, setSelectedUserStoryId] = useState<string>('');
  const [selectedSprintId, setSelectedSprintId] = useState<string>(deliverableId || '');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null); // Nouveau : données client séparées
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [filteredUserStories, setFilteredUserStories] = useState<UserStory[]>([]);

  const categories = [
    { value: 'general', label: 'Feedback général', icon: '💬' },
    { value: 'ui-ux', label: 'Interface utilisateur', icon: '🎨' },
    { value: 'functionality', label: 'Fonctionnalité', icon: '⚙️' },
    { value: 'performance', label: 'Performance', icon: '⚡' },
    { value: 'bug', label: 'Problème technique', icon: '🐛' },
    { value: 'suggestion', label: 'Suggestion d\'amélioration', icon: '💡' }
  ];

  const priorities = [
    { value: 'low', label: 'Faible', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'Élevée', color: 'text-red-600 bg-red-100' }
  ];

  // Load client info from localStorage or API
  useEffect(() => {
    const loadClientInfo = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError('Token d\'accès manquant. Veuillez vous reconnecter.');
          return;
        }

        // Récupérer les infos de l'utilisateur connecté (pas tous les utilisateurs!)
        const userResponse = await fetch('http://127.0.0.1:8000/api/current-user/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Impossible de récupérer les informations utilisateur: ${userResponse.status}`);
        }

        const response = await userResponse.json();
        console.log('Current user response:', response);
        
        const userData = response.user; // Récupérer les données de l'utilisateur depuis response.user
        
        if (!userData || !userData.id) {
          setError('ID de l\'utilisateur manquant dans la réponse API.');
          return;
        }

        console.log('Current user loaded:', userData);
        setClientInfo(userData);

        // Si l'utilisateur est un client, récupérer ses données client
        if (userData.role === 'CLIENT') {
          try {
            const clientResponse = await fetch('http://127.0.0.1:8000/api/clients/', {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (clientResponse.ok) {
              const clientsData = await clientResponse.json();
              console.log('Clients data loaded:', clientsData);
              
              // Trouver le client correspondant à cet utilisateur
              // Supposons que le modèle Client a un champ user_id ou similaire
              const matchingClient = clientsData.find((client: Client) => {
                // Vous devrez adapter cette logique selon votre structure de données
                // Option 1: Si Client hérite de User, l'ID sera le même
                return client.id === userData.id;
                // Option 2: Si vous avez un champ user_id dans Client
                // return client.user_id === userData.id;
              });

              if (matchingClient) {
                setClientData(matchingClient);
                console.log('Matching client found:', matchingClient);
              } else {
                console.warn('No matching client found for user:', userData.id);
                setError('Aucune donnée client trouvée pour cet utilisateur.');
              }
            }
          } catch (clientError) {
            console.error('Error loading client data:', clientError);
            // Ne pas arrêter le processus si les données client ne peuvent pas être chargées
          }
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        setError('Erreur lors de la récupération des informations utilisateur.');
      }
    };

    loadClientInfo();
  }, []);

  // Load data from APIs with correct user filtering
  useEffect(() => {
    const loadData = async () => {
      if (!clientInfo?.id) {
        console.log('No client ID available yet');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Loading data for user:', clientInfo);
        const accessToken = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
        };
        
        // Charger toutes les données
        const [projectsRes, sprintsRes, userStoriesRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/projects/`, { headers }),
          fetch(`http://127.0.0.1:8000/api/sprints/`, { headers }),
          fetch(`http://127.0.0.1:8000/api/userstories/`, { headers })
        ]);

        // Vérification des réponses
        if (!projectsRes.ok) {
          throw new Error(`Erreur lors du chargement des projets: ${projectsRes.status}`);
        }
        if (!sprintsRes.ok) {
          throw new Error(`Erreur lors du chargement des sprints: ${sprintsRes.status}`);
        }
        if (!userStoriesRes.ok) {
          throw new Error(`Erreur lors du chargement des user stories: ${userStoriesRes.status}`);
        }

        const [projectsData, sprintsData, userStoriesData] = await Promise.all([
          projectsRes.json(),
          sprintsRes.json(),
          userStoriesRes.json()
        ]);

        console.log('Projects loaded:', projectsData);
        console.log('Sprints loaded:', sprintsData);
        console.log('User Stories loaded:', userStoriesData);

        // Filtrage correct basé sur le rôle et l'ID client
        let clientProjects: Project[] = [];

        if (clientInfo.role === 'ADMIN') {
          clientProjects = projectsData;
          console.log('Admin user - showing all projects');
        } else if (clientInfo.role === 'CLIENT') {
          // Pour les clients, utiliser l'ID user car Client hérite de User (proxy=True)
          const clientId = clientInfo.id; // ID user = ID client quand Client hérite de User
          
          clientProjects = projectsData.filter((project: Project) => {
            // Convertir en string pour la comparaison car l'API peut retourner des types différents
            const matches = String(project.client) === String(clientId);
            console.log(`Project ${project.id} (${project.name}): client=${project.client}, current_client=${clientId}, matches=${matches}`);
            return matches;
          });
          
          console.log(`Client user (${clientId}) - filtered projects:`, clientProjects.length);
        } else {
          // Pour les autres rôles (PO, SM, DEV), filtrer selon leurs attributions
          clientProjects = projectsData.filter((project: Project) => {
            // Vous pouvez ajouter la logique pour PO, SM, DEV ici si nécessaire
            // Par exemple, filtrer par product_owner, scrum_master, ou équipe
            return true; // Temporaire - à adapter selon vos besoins
          });
        }

        // Créer un Set des IDs de projets du client pour une recherche efficace
        const clientProjectIds = new Set(clientProjects.map(p => p.id));
        
        // Filtrer les sprints liés aux projets du client
        const clientSprints = sprintsData.filter((sprint: Sprint) => {
          const belongs = clientProjectIds.has(sprint.project);
          console.log(`Sprint ${sprint.id} (${sprint.name}): project=${sprint.project}, belongs=${belongs}`);
          return belongs;
        });

        // Créer un Set des IDs de sprints du client pour une recherche efficace
        const clientSprintIds = new Set(clientSprints.map(s => s.id));

        // Filtrer les user stories liées aux sprints du client
        const clientUserStories = userStoriesData.filter((story: UserStory) => {
          // Les user stories sont liées aux sprints, pas directement aux projets
          const belongsToClientSprint = story.sprint && clientSprintIds.has(story.sprint);
          console.log(`Story ${story.id} (${story.title}): sprint=${story.sprint}, belongs=${belongsToClientSprint}`);
          return belongsToClientSprint;
        });

        console.log('Filtered data:', {
          projects: clientProjects.length,
          sprints: clientSprints.length,
          userStories: clientUserStories.length
        });

        setProjects(clientProjects);
        setSprints(clientSprints);
        setUserStories(clientUserStories);

        // Pre-select first sprint if available
        if (clientSprints.length > 0 && !selectedSprintId) {
          setSelectedSprintId(clientSprints[0].id);
        }

        // Pre-select first user story if available
        if (clientUserStories.length > 0) {
          setSelectedUserStoryId(clientUserStories[0].id);
        }

        // Vérifier si aucune donnée n'a été trouvée
        if (clientProjects.length === 0) {
          if (clientInfo.role === 'CLIENT') {
            setError(`Aucun projet trouvé pour le client ID: ${clientInfo.id}. Vérifiez que des projets sont bien assignés à ce client dans la base de données.`);
          } else if (clientInfo.role !== 'ADMIN') {
            setError('Aucun projet disponible pour votre rôle.');
          } else {
            setError('Aucun projet disponible dans le système.');
          }
        } else if (clientSprints.length === 0) {
          setError('Aucun sprint trouvé dans vos projets. Veuillez créer des sprints pour pouvoir soumettre un feedback.');
        } else if (clientUserStories.length === 0) {
          setError('Aucune user story trouvée dans vos sprints. Veuillez créer des user stories dans vos sprints pour pouvoir soumettre un feedback.');
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(`Erreur lors du chargement des données: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientInfo?.id, clientData?.id]);

  // Filter user stories based on selected sprint
  useEffect(() => {
    if (selectedSprintId) {
      const filtered = userStories.filter(story => story.sprint === selectedSprintId);
      setFilteredUserStories(filtered);
      console.log('Filtered user stories for sprint:', filtered);
      
      // Reset selected user story if it's not in the filtered list
      if (selectedUserStoryId && filtered.length > 0) {
        const isValidSelection = filtered.some(story => story.id === selectedUserStoryId);
        if (!isValidSelection) {
          setSelectedUserStoryId(filtered[0]?.id || '');
        }
      } else if (filtered.length > 0) {
        setSelectedUserStoryId(filtered[0].id);
      } else {
        setSelectedUserStoryId('');
      }
    } else {
      setFilteredUserStories([]);
      setSelectedUserStoryId('');
    }
  }, [selectedSprintId, userStories, selectedUserStoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError('Le contenu du feedback est requis.');
      return;
    }

    if (content.trim().length < 10) {
      setError('Le feedback doit contenir au moins 10 caractères.');
      return;
    }

    if (!clientInfo?.id) {
      setError('Informations du client manquantes.');
      return;
    }

    if (!selectedUserStoryId) {
      setError('Veuillez sélectionner une User Story.');
      return;
    }

    if (!selectedSprintId) {
      setError('Veuillez sélectionner un Sprint.');
      return;
    }

    setIsSubmitting(true);
    
    // Utiliser l'ID client correct pour le feedback
    const clientIdForFeedback = clientInfo.id; // ID user = ID client car Client hérite de User
    
    const feedbackData = {
      content: content.trim(),
      rating: rating,
      deliverable_id: selectedSprintId,
      category,
      priority,
      client: clientIdForFeedback, // Utiliser l'ID client correct
      userstory: selectedUserStoryId,
    };

    console.log('Submitting feedback:', feedbackData);

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        // Reset form
        setContent('');
        setRating(null);
        setCategory('general');
        setPriority('medium');
        // Keep the first sprint selected
        if (sprints.length > 0) {
          setSelectedSprintId(sprints[0].id);
        }
        // Keep the first user story selected
        if (userStories.length > 0) {
          setSelectedUserStoryId(userStories[0].id);
        }
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Erreur ${response.status}: ${response.statusText}`;
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setError('Erreur de connexion. Veuillez vérifier votre connexion réseau et réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === category);
  const selectedPriority = priorities.find(pri => pri.value === priority);
  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const selectedUserStory = userStories.find(us => us.id === selectedUserStoryId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Chargement des données...</span>
      </div>
    );
  }

  if (!clientInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
        <p className="text-red-800 font-open-sans">
          Impossible de charger les informations du client. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
          <p className="text-green-800 font-open-sans">
            Votre feedback a été envoyé avec succès ! Merci pour votre contribution.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-800 font-open-sans">{error}</p>
        </div>
      )}

      {/* Client Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
        <User className="text-blue-500 flex-shrink-0" size={20} />
        <div>
          <p className="text-blue-800 font-open-sans font-medium">
            Connecté en tant que: {clientInfo.name}
          </p>
          {clientInfo.email && (
            <p className="text-blue-600 font-open-sans text-sm">{clientInfo.email}</p>
          )}
          <p className="text-blue-600 font-open-sans text-xs">
            User ID: {clientInfo.id}
            • Rôle: {clientInfo.role}
            • {projects.length} projet(s) • {sprints.length} sprint(s) • {userStories.length} user story(s)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="text-primary" size={24} />
          <h3 className="font-poppins font-semibold text-lg text-secondary-2">
            Nouveau Feedback Détaillé
          </h3>
        </div>
        
        <div className="space-y-6">
          {/* Sprint Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              Concernant quel sprint ? *
            </label>
            
            <div className="relative">
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg font-open-sans focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                required
              >
                <option value="">Sélectionner un sprint</option>
                {sprints.map((sprint) => {
                  const parentProject = projects.find(p => p.id === sprint.project);
                  return (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} 
                      {parentProject ? ` (${parentProject.name})` : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>

            {selectedSprintId && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-open-sans">
                  <strong>Sprint sélectionné:</strong> {selectedSprint?.name}
                  <br />
                  <span className="text-green-600">
                    {filteredUserStories.length} user story(s) dans ce sprint
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* User Story Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              User Story associée * ({filteredUserStories.length} disponible(s))
            </label>
            <div className="relative">
              <select
                value={selectedUserStoryId}
                onChange={(e) => setSelectedUserStoryId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg font-open-sans focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                required
                disabled={!selectedSprintId}
              >
                <option value="">
                  {selectedSprintId ? 'Sélectionner une User Story' : 'Sélectionnez d\'abord un sprint'}
                </option>
                {filteredUserStories.map((story) => {
                  const parentSprint = story.sprint ? sprints.find(s => s.id === story.sprint) : null;
                  const parentProject = parentSprint ? projects.find(p => p.id === parentSprint.project) : null;
                  
                  return (
                    <option key={story.id} value={story.id}>
                      {story.title}
                      {parentProject && ` (Projet: ${parentProject.name})`}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>
            {selectedSprintId && filteredUserStories.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Aucune user story trouvée dans ce sprint.
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              Catégorie du feedback
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${category === cat.value 
                      ? 'border-primary bg-primary bg-opacity-10 text-primary' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-open-sans text-sm font-medium">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              Priorité
            </label>
            <div className="flex space-x-3">
              {priorities.map((pri) => (
                <button
                  key={pri.value}
                  type="button"
                  onClick={() => setPriority(pri.value)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${priority === pri.value 
                      ? pri.color + ' ring-2 ring-offset-2 ring-current' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  {pri.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              Évaluation globale (optionnelle)
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? null : star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-yellow-400 hover:text-yellow-500 transition-colors p-1"
                  >
                    <Star 
                      size={24} 
                      fill={star <= (hoveredRating || rating || 0) ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                {rating && (
                  <span className="text-sm text-gray-600 font-open-sans">
                    {rating}/5 étoiles
                  </span>
                )}
                {rating && (
                  <button
                    type="button"
                    onClick={() => setRating(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-open-sans mb-3">
              Votre feedback détaillé *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez en détail votre feedback, suggestions d'amélioration, problèmes rencontrés, ou tout autre commentaire pertinent..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 font-open-sans focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs font-open-sans ${content.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                Minimum 10 caractères requis
              </p>
              <p className="text-xs text-gray-500 font-open-sans">
                {content.length} caractères
              </p>
            </div>
          </div>

          {/* Summary */}
          {content.length > 10 && selectedUserStory && selectedSprint && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-open-sans font-medium text-secondary-2 mb-2 flex items-center">
                <AlertCircle size={16} className="mr-2 text-gray-500" />
                Résumé de votre feedback
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedCategory?.icon}</span>
                  <span className="font-open-sans text-gray-700">{selectedCategory?.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPriority?.color}`}>
                    Priorité {selectedPriority?.label}
                  </span>
                  {rating && (
                    <span className="text-gray-600 font-open-sans">
                      • Note: {rating}/5 ⭐
                    </span>
                  )}
                </div>
                <div className="text-gray-600 font-open-sans">
                  <strong>Sprint:</strong> {selectedSprint.name}
                </div>
                <div className="text-gray-600 font-open-sans">
                  <strong>User Story:</strong> {selectedUserStory.title}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() || content.length < 10 || isSubmitting || !selectedUserStoryId || !selectedSprintId}
              className="flex items-center space-x-2 px-6 py-3 bg-button text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-open-sans font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Envoyer le feedback</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};