import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  MessageSquare,
  X,
  Tag,
  Loader2
} from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone?: string;
  subject: string;
  message: string;
  service_type: string;
  created_at: string;
  status: 'nouveau' | 'en_cours' | 'traite' | 'ferme';
}

const ContactCardsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [serviceFilter, setServiceFilter] = useState<string>('tous');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fonction pour récupérer les contacts depuis l'API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/api/contact/');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Vérifier la structure des données
      const contactsArray = Array.isArray(data) ? data : (data.data || data.results || []);
      
      setContacts(contactsArray);
      setFilteredContacts(contactsArray);
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  // Charger les contacts au montage du composant
  useEffect(() => {
    fetchContacts();
  }, []);

  // Filtrage des contacts
  useEffect(() => {
    let filtered = contacts;

    // Filtrage par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (statusFilter !== 'tous') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Filtrage par type de service
    if (serviceFilter !== 'tous') {
      filtered = filtered.filter(contact => contact.service_type === serviceFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, serviceFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'traite': return 'bg-green-100 text-green-800';
      case 'ferme': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nouveau': return <AlertCircle className="w-4 h-4" />;
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'traite': return <CheckCircle className="w-4 h-4" />;
      case 'ferme': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const labels = {
      'consultation': 'Consultation',
      'demo': 'Démonstration',
      'formation': 'Formation',
      'audit': 'Audit',
      'integration': 'Intégration'
    };
    return labels[serviceType] || serviceType;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Retourner la date originale si le formatage échoue
    }
  };

  const updateContactStatus = async (contactId: string, newStatus: Contact['status']) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/contact/${contactId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour l'état local
      setContacts(prev => 
        prev.map(contact => 
          contact.id === contactId 
            ? { ...contact, status: newStatus }
            : contact
        )
      );

      // Mettre à jour le contact sélectionné si c'est celui-ci
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/contact/${contactId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du contact');
    }
  };

  // Composant de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  // Composant d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchContacts}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Contacts
              </h1>
              <p className="text-gray-600">
                Gérez et suivez tous vos contacts clients en un seul endroit
              </p>
            </div>
            <button
              onClick={fetchContacts}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouveaux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contacts.filter(c => c.status === 'nouveau').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contacts.filter(c => c.status === 'en_cours').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Traités</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.status === 'traite').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Filtres</span>
            </button>
          </div>

          {/* Filtres étendus */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En cours</option>
                    <option value="traite">Traité</option>
                    <option value="ferme">Fermé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service
                  </label>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tous">Tous les services</option>
                    <option value="consultation">Consultation</option>
                    <option value="demo">Démonstration</option>
                    <option value="formation">Formation</option>
                    <option value="audit">Audit</option>
                    <option value="integration">Intégration</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grille des contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header de la card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Building2 className="w-4 h-4 mr-1" />
                    {contact.company}
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(contact.status)}`}>
                  {getStatusIcon(contact.status)}
                  <span className="ml-1 capitalize">{contact.status?.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600 text-sm">
                  <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{getServiceTypeLabel(contact.service_type)}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{formatDate(contact.created_at)}</span>
                </div>
              </div>

              {/* Sujet */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sujet:</h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {contact.subject}
                </p>
              </div>

              {/* Message aperçu */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Message:</h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {contact.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedContact(contact)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </button>

                <div className="flex items-center space-x-2">
                  <select
                    value={contact.status}
                    onChange={(e) => updateContactStatus(contact.id, e.target.value as Contact['status'])}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En cours</option>
                    <option value="traite">Traité</option>
                    <option value="ferme">Fermé</option>
                  </select>

                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun contact */}
        {filteredContacts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun contact trouvé
            </h3>
            <p className="text-gray-600">
              {contacts.length === 0 
                ? "Aucun contact n'est disponible pour le moment"
                : "Essayez de modifier vos critères de recherche ou de filtrage"
              }
            </p>
          </div>
        )}

        {/* Modal de détail */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </h2>
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedContact.status)}`}>
                      {getStatusIcon(selectedContact.status)}
                      <span className="ml-1 capitalize">{selectedContact.status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Informations de contact
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">{selectedContact.company}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">{selectedContact.email}</span>
                        </div>
                        {selectedContact.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-600">{selectedContact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">
                            {getServiceTypeLabel(selectedContact.service_type)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Informations de suivi
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600">
                            {formatDate(selectedContact.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sujet</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                      {selectedContact.subject}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Message</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <select
                      value={selectedContact.status}
                      onChange={(e) => {
                        updateContactStatus(selectedContact.id, e.target.value as Contact['status']);
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="en_cours">En cours</option>
                      <option value="traite">Traité</option>
                      <option value="ferme">Fermé</option>
                    </select>

                    <button
                      onClick={() => deleteContact(selectedContact.id)}
                      className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCardsManager;