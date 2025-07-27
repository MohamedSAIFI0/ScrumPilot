import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Calendar, Users, Target, AlertCircle } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  clients?: Array<{id: number, name: string}>;
  users?: Array<{id: number, username: string, first_name: string, last_name: string}>;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  clients = [],
  users = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    team: '',
    members: 1,
    start_date: '',
    end_date: '',
    budget: '',
    objectives: [''],
    technologies: '', 
    risks: [''],
    client: '',
    product_owner: '',
    scrum_master: '',
  });
  const [scrumMasters, setScrumMasters] = useState([]);
  const [productOwners, setProductOwners] = useState([]);
  const [clientss, setClients] = useState([]);
  const [teams, setTeams] = useState([]); // Ajouté pour les équipes dynamiques
  const [currentUser, setCurrentUser] = useState(null); // Ajouté pour l'utilisateur connecté

  useEffect(() => {
    axios.get('http://localhost:8000/api/scrum-masters/')
      .then(response => setScrumMasters(response.data))
      .catch(error => console.error('Erreur lors du fetch des Scrum Masters', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/product-owners/')
      .then(response => setProductOwners(response.data))
      .catch(error => console.error('Erreur lors du fetch des product owners', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/clients/')
      .then(response => setClients(response.data))
      .catch(error => console.error('Erreur lors du fetch des clients', error));
  }, []);

  // Nouveau useEffect pour récupérer les équipes
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/teams/')
      .then(response => setTeams(response.data))
      .catch(error => console.error('Erreur lors du fetch des équipes', error));
  }, []);

  // Nouveau useEffect pour récupérer l'utilisateur connecté
  useEffect(() => {
    axios.get('http://localhost:8000/api/users/')
      .then(response => setCurrentUser(response.data))
      .catch(error => {
        console.error('Erreur lors du fetch de l\'utilisateur connecté', error);
        // Fallback si l'API n'est pas disponible
        setCurrentUser({ username: 'Utilisateur inconnu' });
      });
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const priorities = [
    { value: 'high', label: 'Haute priorité', color: 'text-red-600' },
    { value: 'medium', label: 'Priorité moyenne', color: 'text-yellow-600' },
    { value: 'low', label: 'Faible priorité', color: 'text-green-600' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du projet est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.team) {
      newErrors.team = 'Veuillez sélectionner une équipe';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est obligatoire';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La date de fin est obligatoire';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
    }

    if (!formData.client) {
      newErrors.client = 'Veuillez sélectionner un client';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }

    if (formData.objectives.every(obj => !obj.trim())) {
      newErrors.objectives = 'Au moins un objectif est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Traitement des technologies : conversion de string en array
    const technologiesArray = formData.technologies
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0);

    const payload = {
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      team: formData.team,
      members: formData.members,
      start_date: formData.start_date,
      end_date: formData.end_date,
      budget: parseFloat(formData.budget),
      objectives: formData.objectives.filter(obj => obj.trim()),
      technologies: technologiesArray, // Utilisation du tableau traité
      risks: formData.risks.filter(risk => risk.trim()),
      status: 'Planification',
      progress: 0,
      created_by: currentUser?.username || 'Utilisateur inconnu', // Utilisation de l'utilisateur connecté
      client: parseInt(formData.client),
      product_owner: formData.product_owner ? parseInt(formData.product_owner) : null,
      scrum_master: formData.scrum_master ? parseInt(formData.scrum_master) : null,
    };

    try {
      const response = await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter le token CSRF si nécessaire
          // 'X-CSRFToken': getCookie('csrftoken'),
          // Ajouter le token d'authentification si nécessaire
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        // Gérer les erreurs de validation du backend
        if (response.status === 400 && errorData) {
          const backendErrors: Record<string, string> = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              backendErrors[key] = errorData[key][0];
            } else {
              backendErrors[key] = errorData[key];
            }
          });
          setErrors(backendErrors);
        }
      } else {
        const createdProject = await response.json();
        onSave(createdProject);
        handleClose();
      }
    } catch (error) {
      console.error('Erreur requête:', error);
      setErrors({ general: 'Une erreur est survenue lors de la création du projet' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      team: '',
      members: 1,
      start_date: '',
      end_date: '',
      budget: '',
      objectives: [''],
      technologies: '', // Réinitialisé en string vide
      risks: [''],
      client: '',
      product_owner: '',
      scrum_master: '',
    });
    setErrors({});
    onClose();
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  const addRisk = () => {
    setFormData(prev => ({
      ...prev,
      risks: [...prev.risks, '']
    }));
  };

  const updateRisk = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.map((risk, i) => i === index ? value : risk)
    }));
  };

  const removeRisk = (index: number) => {
    if (formData.risks.length > 1) {
      setFormData(prev => ({
        ...prev,
        risks: prev.risks.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-secondary-2 dark:text-dark-text font-poppins">
            Créer un nouveau projet
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erreur générale */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nom du projet */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du projet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: Plateforme E-Commerce Nouvelle Génération"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Décrivez les objectifs et la portée du projet..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client
              </label>
              <select
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              >
                <option value="">Sélectionner un client</option>
                {clientss.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Équipe - Modifié pour utiliser l'API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Équipe assignée *
              </label>
              <select
                value={formData.team}
                onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text ${
                  errors.team ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Sélectionner une équipe</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {errors.team && (
                <p className="text-red-500 text-sm mt-1">{errors.team}</p>
              )}
            </div>

            {/* Nombre de membres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de membres
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.members}
                onChange={(e) => setFormData(prev => ({ ...prev, members: parseInt(e.target.value) || 1 }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget estimé (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text ${
                  errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: 500000"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Product Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Owner
              </label>
              <select
                value={formData.product_owner}
                onChange={(e) => setFormData(prev => ({ ...prev, product_owner: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              >
                <option value="">Sélectionner un Product Owner</option>
                {productOwners.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} 
                  </option>
                ))}
              </select>
            </div>

            {/* Scrum Master */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scrum Master
              </label>
              <select
                value={formData.scrum_master}
                onChange={(e) => setFormData(prev => ({ ...prev, scrum_master: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              >
                <option value="">Sélectionner un Scrum Master</option>
                {scrumMasters.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Technologies - Modifié en textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technologies utilisées
            </label>
            <textarea
              value={formData.technologies}
              onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              placeholder="Saisissez les technologies séparées par des virgules (ex: React, TypeScript, Node.js, MongoDB)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Séparez les technologies par des virgules
            </p>
          </div>

          {/* Objectifs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Objectifs du projet *
              </label>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un objectif</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
                      placeholder={`Objectif ${index + 1}`}
                    />
                  </div>
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.objectives && (
              <p className="text-red-500 text-sm mt-1">{errors.objectives}</p>
            )}
          </div>

          {/* Risques */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Risques identifiés
              </label>
              <button
                type="button"
                onClick={addRisk}
                className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un risque</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.risks.map((risk, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={risk}
                      onChange={(e) => updateRisk(index, e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
                      placeholder={`Risque ${index + 1}`}
                    />
                  </div>
                  {formData.risks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRisk(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Créer le projet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;