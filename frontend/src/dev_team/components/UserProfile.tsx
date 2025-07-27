import React, { useState, useEffect } from 'react';
import { User, Calendar, Camera, Save, X, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Simuler le chargement des données utilisateur depuis l'API
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Remplacez par votre véritable appel API
      const response = await fetch('http://127.0.0.1:8000/api/current-user/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const data = await response.json();
      setUserData(data.user);
      setEditedData(data.user);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userData) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Ajouter les données modifiées
      Object.entries(editedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Ajouter l'avatar si modifié
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userData.id}/`, {
        method: 'PUT',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      const updatedUser = await response.json();
      setUserData(updatedUser.user || updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(userData || {});
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier doit faire moins de 2MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDefaultAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=200`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'DEVELOPER': 'Développeur',
      'SCRUM_MASTER': 'Scrum Master',
      'PRODUCT_OWNER': 'Product Owner',
      'SM': 'Scrum Master'
    };
    return roleMap[role.toUpperCase()] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Impossible de charger les données utilisateur
          </p>
          <button 
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const currentAvatar = avatarPreview || userData.avatar || getDefaultAvatar(userData.name);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profil
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Eye className="w-5 h-5 mr-3" />
                  Apparence
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {activeTab === 'profile' && (
                <div>
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <img
                        src={currentAvatar}
                        alt={userData.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 dark:border-purple-800"
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                        disabled={!isEditing}
                      >
                        Changer la photo
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG ou GIF. Taille maximale 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={isEditing ? (editedData.name || '') : userData.name}
                        onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={isEditing ? (editedData.email || '') : userData.email}
                        onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        value={formatRole(userData.role)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Membre depuis
                      </label>
                      <input
                        type="text"
                        value={formatDate(userData.createdAt)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Équipe
                      </label>
                      <input
                        type="text"
                        value={userData.team || 'Aucune équipe assignée'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Enregistrer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Paramètres d'apparence
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Les paramètres d'apparence seront disponibles prochainement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;