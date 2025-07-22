import React, { useState, useEffect } from 'react';
import { Users, Plus, Check, X, Search } from 'lucide-react';

const TeamManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [scrumMaster, setScrumMaster] = useState('');
  const [productOwner, setProductOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer les utilisateurs au chargement du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      if (response.ok) {
        const data = await response.json();
        // Les utilisateurs sont dans la propriété 'users' de la réponse
        setUsers(data.users || []);
      } else {
        setMessage('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      setMessage('Erreur de connexion à l\'API');
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      // Si l'utilisateur est désélectionné, le retirer aussi des rôles spéciaux
      if (!newSelection.includes(userId)) {
        if (scrumMaster === userId.toString()) setScrumMaster('');
        if (productOwner === userId.toString()) setProductOwner('');
      }
      
      return newSelection;
    });
  };

  const createTeam = async () => {
    if (!teamName.trim()) {
      setMessage('Le nom de l\'équipe est requis');
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    setCreating(true);
    try {
      const teamData = {
        name: teamName,
        description: teamDescription,
        members: selectedUsers
      };

      // Ajouter le Scrum Master s'il est sélectionné
      if (scrumMaster) {
        teamData.scrum_master = parseInt(scrumMaster);
      }

      // Ajouter le Product Owner s'il est sélectionné
      if (productOwner) {
        teamData.product_owner = parseInt(productOwner);
      }

      const response = await fetch('http://127.0.0.1:8000/api/teams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        setMessage('Équipe créée avec succès!');
        // Réinitialiser le formulaire
        setTeamName('');
        setTeamDescription('');
        setSelectedUsers([]);
        setScrumMaster('');
        setProductOwner('');
      } else {
        const errorData = await response.json();
        setMessage('Erreur lors de la création de l\'équipe: ' + (errorData.message || 'Erreur inconnue'));
      }
    } catch (error) {
      setMessage('Erreur de connexion lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Users className="mr-3 text-blue-600" />
          Gestionnaire d'Équipes
        </h1>
        <p className="text-gray-600">Créez des équipes en sélectionnant des utilisateurs</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section des utilisateurs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Utilisateurs disponibles</h2>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border rounded-lg max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserToggle(user.id)}
                    className={`p-3 m-1 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          {user.role} • {user.team || 'Aucune équipe'}
                        </div>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </div>
          )}
        </div>

        {/* Section de création d'équipe */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Créer une équipe</h2>
          
          <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'équipe *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Entrez le nom de l'équipe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Description de l'équipe..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Sélection des rôles spéciaux */}
            {selectedUsers.length > 0 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scrum Master (optionnel)
                  </label>
                  <select
                    value={scrumMaster}
                    onChange={(e) => setScrumMaster(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un Scrum Master</option>
                    {selectedUsers.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <option key={userId} value={userId}>
                          {user?.name} ({user?.role})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Owner (optionnel)
                  </label>
                  <select
                    value={productOwner}
                    onChange={(e) => setProductOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un Product Owner</option>
                    {selectedUsers.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <option key={userId} value={userId}>
                          {user?.name} ({user?.role})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membres sélectionnés ({selectedUsers.length})
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    const isSM = scrumMaster === userId.toString();
                    const isPO = productOwner === userId.toString();
                    return (
                      <div key={userId} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {user?.name || 'Utilisateur inconnu'}
                          </span>
                          {(isSM || isPO) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {isSM && isPO ? 'SM & PO' : isSM ? 'Scrum Master' : 'Product Owner'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleUserToggle(userId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={createTeam}
              disabled={creating || !teamName.trim() || selectedUsers.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {creating ? 'Création en cours...' : 'Créer l\'équipe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManager;