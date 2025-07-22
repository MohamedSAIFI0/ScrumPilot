import React, { useState, useEffect } from 'react';
import { Users, Search, Crown, Shield, Mail, RefreshCw, AlertCircle } from 'lucide-react';

const TeamDisplay = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Récupérer les équipes et les utilisateurs au chargement du composant
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Récupérer les équipes et les utilisateurs en parallèle
      const [teamsResponse, usersResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/teams/'),
        fetch('http://127.0.0.1:8000/api/users/')
      ]);

      if (teamsResponse.ok && usersResponse.ok) {
        const teamsData = await teamsResponse.json();
        const usersData = await usersResponse.json();
        
        setTeams(teamsData || []);
        setUsers(usersData.users || usersData || []);
      } else {
        setMessage('Erreur lors du chargement des données');
      }
    } catch (error) {
      setMessage('Erreur de connexion à l\'API');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les détails d'un utilisateur par son ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || {
      id: userId,
      name: `Utilisateur ${userId}`,
      email: 'Email non disponible',
      role: 'Role non disponible'
    };
  };

  // Fonction pour enrichir les équipes avec les détails des membres
  const getEnrichedTeams = () => {
    return teams.map(team => ({
      ...team,
      membersDetails: team.members ? team.members.map(memberId => getUserById(memberId)) : [],
      scrumMasterDetails: team.scrum_master ? getUserById(team.scrum_master) : null,
      productOwnerDetails: team.product_owner ? getUserById(team.product_owner) : null
    }));
  };

  // Filtrer les équipes selon le terme de recherche
  const filteredTeams = getEnrichedTeams().filter(team => {
    const teamName = team.name || '';
    const teamDescription = team.description || '';
    
    // Vérifier dans le nom et la description de l'équipe
    const matchesTeamInfo = teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teamDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Vérifier dans les noms des membres
    const matchesMembers = team.membersDetails?.some(member => {
      const memberName = member.name || '';
      const memberEmail = member.email || '';
      return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return matchesTeamInfo || matchesMembers;
  });

  const getRoleIcon = (member, team) => {
    if (team.scrum_master === member.id) {
      return <Crown className="w-4 h-4 text-yellow-600" title="Scrum Master" />;
    }
    if (team.product_owner === member.id) {
      return <Shield className="w-4 h-4 text-purple-600" title="Product Owner" />;
    }
    return null;
  };

  const getRoleBadge = (member, team) => {
    const badges = [];
    
    if (team.scrum_master === member.id) {
      badges.push(
        <span key="sm" className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          Scrum Master
        </span>
      );
    }
    
    if (team.product_owner === member.id) {
      badges.push(
        <span key="po" className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
          Product Owner
        </span>
      );
    }
    
    return badges;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Users className="mr-3 text-blue-600" />
              Équipes
            </h1>
            <p className="text-gray-600">Découvrez toutes les équipes et leurs membres</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des équipes ou des membres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredTeams.length} équipe(s) trouvée(s) pour "{searchTerm}"
          </p>
        )}
      </div>

      {/* Messages d'erreur */}
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-300 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des équipes...</span>
        </div>
      )}

      {/* Grille des équipes */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune équipe trouvée' : 'Aucune équipe disponible'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche'
                    : 'Les équipes apparaîtront ici une fois créées'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  {team.description && (
                    <p className="text-blue-100 text-sm">{team.description}</p>
                  )}
                  <div className="mt-3 flex items-center text-blue-100">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">{team.membersDetails?.length || 0} membre(s)</span>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-6">
                  {/* Rôles spéciaux */}
                  <div className="mb-4 space-y-2">
                    {team.scrumMasterDetails && (
                      <div className="flex items-center text-sm">
                        <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-gray-600">Scrum Master:</span>
                        <span className="ml-1 font-medium">
                          {team.scrumMasterDetails.name}
                        </span>
                      </div>
                    )}
                    {team.productOwnerDetails && (
                      <div className="flex items-center text-sm">
                        <Shield className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-gray-600">Product Owner:</span>
                        <span className="ml-1 font-medium">
                          {team.productOwnerDetails.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Liste des membres */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Membres de l'équipe
                    </h4>
                    {team.membersDetails && team.membersDetails.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {team.membersDetails.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-blue-600">
                                    {member.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {member.name}
                                  </p>
                                  {member.email && (
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {member.email}
                                    </p>
                                  )}
                                  {member.role && (
                                    <p className="text-xs text-gray-500">
                                      {member.role === 'ADMIN' ? 'Admin' :
                                       member.role === 'PO' ? 'Product Owner' :
                                       member.role === 'SM' ? 'Scrum Master' :
                                       member.role === 'DEV' ? 'Developer' :
                                       member.role === 'CLIENT' ? 'Client' :
                                       member.role}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member, team)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Aucun membre dans cette équipe
                      </p>
                    )}
                  </div>

                  {/* Badges des rôles pour mobile */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {team.membersDetails?.map((member) => (
                      <div key={`badges-${member.id}`}>
                        {getRoleBadge(member, team)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pied de carte avec informations supplémentaires */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Équipe #{team.id}</span>
                    {team.created_at && (
                      <span>
                        Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistiques en bas */}
      {!loading && filteredTeams.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTeams.length}
              </div>
              <div className="text-sm text-gray-600">
                Équipe{filteredTeams.length > 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTeams.reduce((total, team) => total + (team.membersDetails?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">
                Membres au total
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(filteredTeams.reduce((total, team) => total + (team.membersDetails?.length || 0), 0) / filteredTeams.length) || 0}
              </div>
              <div className="text-sm text-gray-600">
                Membres par équipe (moyenne)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDisplay;