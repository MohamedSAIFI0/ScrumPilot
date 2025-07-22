import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface UserFormProps {
  user?: User | null;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  // Initialisation avec des valeurs par défaut correspondant au modèle Django
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEV' as User['role'],
    status: 'active' as User['status'],
    team: '',
    avatar: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Mot de passe vide pour la modification (sécurité)
        role: user.role || 'DEV',
        status: user.status || 'active',
        team: user.team || '',
        avatar: user.avatar || ''
      });
    } else {
      // Réinitialiser complètement pour un nouveau utilisateur
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'DEV',
        status: 'active',
        team: '',
        avatar: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let response;
      let userData: User;

      if (user) {
        // Modification d'un utilisateur existant
        const updateData: any = {
          name: formData.name,
          role: formData.role,
          team: formData.team,
          status: formData.status,
          avatar: formData.avatar
        };

        // N'inclure le mot de passe que s'il est fourni
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        console.log('Mise à jour utilisateur:', updateData);

        // Utiliser l'email comme identifiant pour la mise à jour
        response = await axios.put(
          `http://127.0.0.1:8000/api/users/update/${encodeURIComponent(user.email)}/`,
          updateData
        );

        // Construire les données utilisateur mises à jour
        userData = {
          ...user,
          ...updateData,
          id: user.id,
          email: user.email, // L'email ne change pas lors de la modification
          created_at: user.created_at,
          last_login: user.last_login
        };

      } else {
        // Création d'un nouvel utilisateur
        const createData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          team: formData.team,
          status: formData.status,
          avatar: formData.avatar
        };

        console.log('Création utilisateur:', createData);

        // Utiliser l'endpoint create-user pour la création
        response = await axios.post(
          'http://127.0.0.1:8000/api/register/',
          createData
        );

        // Construire les données utilisateur créées
        userData = {
          ...response.data,
          id: response.data.id || Date.now(), // Fallback si pas d'ID
          created_at: response.data.created_at || new Date().toISOString(),
          last_login: response.data.last_login || null
        };
      }

      console.log('Réponse API:', response.data);
      
      // Appel de onSubmit après le succès de l'API
      onSubmit(userData);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Gestion d'erreur plus détaillée
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        console.error('Erreur backend:', errorData);
        
        // Extraire le message d'erreur approprié
        if (typeof errorData === 'string') {
          setSubmitError(errorData);
        } else if (errorData.message) {
          setSubmitError(errorData.message);
        } else if (errorData.error) {
          setSubmitError(errorData.error);
        } else if (errorData.detail) {
          setSubmitError(errorData.detail);
        } else if (errorData.email) {
          setSubmitError(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
        } else if (errorData.password) {
          setSubmitError(`Mot de passe: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
        } else if (errorData.name) {
          setSubmitError(`Nom: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`);
        } else {
          setSubmitError('Erreur lors de la soumission du formulaire. Veuillez réessayer.');
        }
      } else {
        setSubmitError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (submitError) {
      setSubmitError(null);
    }
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-semibold text-title text-secondary-2">
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
          <p className="text-gray-600 font-open-sans text-paragraph mt-1">
            {user ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouvel utilisateur'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-secondary-2 transition-colors"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Affichage des erreurs de soumission */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Jean Dupont"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting || !!user} // Désactiver la modification de l'email
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="jean.dupont@example.com"
              />
              {user && (
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié après la création
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe * {user && <span className="text-xs text-gray-500">(laisser vide pour ne pas changer)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user} // Requis seulement pour la création
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder={user ? "Nouveau mot de passe" : "Mot de passe"}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="DEV">Developer</option>
                <option value="PO">Product Owner</option>
                <option value="SM">Scrum Master</option>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipe
              </label>
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Alpha, Beta, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de profil (URL)
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          
          {formData.avatar && (
            <div className="flex items-center space-x-4">
              <img
                src={formData.avatar}
                alt="Aperçu"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=5b229b&color=fff`;
                }}
              />
              <span className="text-sm text-gray-600">Aperçu de la photo de profil</span>
            </div>
          )}
          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-secondary-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-button text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} className="mr-2" />
              {isSubmitting ? 'En cours...' : (user ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};