import React, { useState } from 'react';
import { UserForm } from '../../admin/components/users/UserForm';
import { register } from '../../services/api';
import { User } from '../../admin/types';

interface RegisterProps {
  onPageChange?: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onPageChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userData: Omit<User, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les données pour l'API d'enregistrement
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: 'defaultPassword123', // Mot de passe par défaut, l'utilisateur pourra le changer plus tard
        role: userData.role,
        team: userData.team,
        status: userData.status,
        avatar: userData.avatar
      };

      const result = await register(registerData);
      console.log('Utilisateur enregistré avec succès:', result);
      
      // Rediriger vers la page de connexion
      onPageChange && onPageChange('connexion');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onPageChange && onPageChange('connexion');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-700 to-secondary-2 font-poppins">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Enregistrement Utilisateur</h1>
            <p className="text-white/80">Créez un nouveau compte utilisateur</p>
            <div className="mt-4">
              <p className="text-white/70 text-sm">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => onPageChange && onPageChange('connexion')}
                  className="text-button hover:text-button/80 font-semibold transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
            <UserForm
              user={null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
            
            {loading && (
              <div className="mt-4 text-center text-gray-600">
                Enregistrement en cours...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 