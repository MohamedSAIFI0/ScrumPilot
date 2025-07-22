import React, { useState, useEffect } from 'react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { User } from '../../types';
import { Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // États pour la confirmation de suppression
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users/');
      console.log('Réponse API utilisateurs :', response.data);

      // Adapter la réponse selon le format Django
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Format pagination Django
        setUsers(response.data.results);
      } else if (response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error("Format inattendu de la réponse API :", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur de chargement des utilisateurs :', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Fonction pour initier la suppression avec confirmation
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Suppression de l\'utilisateur:', userToDelete.email);
      
      // Utiliser l'email pour la suppression (comme dans les URLs Django)
      await axios.delete(`http://127.0.0.1:8000/api/users/delete/${encodeURIComponent(userToDelete.email)}/`);
      
      console.log('Utilisateur supprimé avec succès');
      
      // Mettre à jour la liste des utilisateurs
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      
      // Fermer la modal de confirmation
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      // Afficher l'erreur à l'utilisateur
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Erreur inconnue';
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        alert(`Erreur lors de la suppression: ${errorMessage}`);
      } else {
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Fonction pour annuler la suppression
  const cancelDeleteUser = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  // Composant Modal de confirmation
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirmation || !userToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirmer la suppression
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </p>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm font-medium text-gray-900">{userToDelete.name}</p>
              <p className="text-sm text-gray-500">{userToDelete.email}</p>
              <p className="text-sm text-gray-500">Rôle: {userToDelete.role}</p>
              {userToDelete.team && (
                <p className="text-sm text-gray-500">Équipe: {userToDelete.team}</p>
              )}
            </div>
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Cette action est irréversible et supprimera définitivement l'utilisateur.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDeleteUser}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={confirmDeleteUser}
              disabled={isDeleting}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {showForm ? (
        <UserForm
          user={editingUser}
          onCancel={() => {
            setEditingUser(null);
            setShowForm(false);
          }}
          onSubmit={async (userData) => {
            try {
              console.log("Données reçues du formulaire :", userData);

              if (editingUser) {
                // Modification d'un utilisateur existant
                console.log('Modification de l\'utilisateur existant');
                handleUpdateUser(userData);
              } else {
                // Création d'un nouvel utilisateur
                console.log('Création d\'un nouvel utilisateur');
                handleCreateUser(userData);
              }

              setEditingUser(null);
              setShowForm(false);
              
              // Recharger la liste après modification/création
              await fetchUsers();
              
            } catch (error) {
              console.error('Erreur lors de la gestion des données utilisateur :', error);
              // L'erreur est déjà gérée dans UserForm
            }
          }}
        />
      ) : (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition-colors"
            >
              Ajouter un utilisateur
            </button>
          </div>
          <UserList
            users={Array.isArray(users) ? users : []}
            loading={loading}
            onEdit={(user) => {
              setEditingUser(user);
              setShowForm(true);
            }}
            onDelete={handleDeleteUser}
          />
        </div>
      )}

      {/* Afficher la modal de confirmation */}
      <DeleteConfirmationModal />
    </div>
  );
};