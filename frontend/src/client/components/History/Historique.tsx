import React, { useState, useEffect } from 'react';
import { Clock, User, Star, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';

// Interface pour les données de feedback
interface Feedback {
    id: string;
    author?: string;
    content: string;
    rating: number;
    created_at: string;
    deliverable_id?: string;
    category?: string;
    priority?: string;
}

// Fonction pour récupérer les feedbacks depuis l'API
const fetchFeedbacks = async (): Promise<Feedback[]> => {
    try {
        const response = await fetch('http://localhost:8000/api/feedback/');
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des feedbacks');
        }
        
        const data: Feedback[] = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
};

// Composant pour afficher les étoiles de notation
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${
                        star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                    }`}
                />
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
        </div>
    );
};

// Composant pour formater la date - VERSION CORRIGÉE
const formatDate = (created_at: string): string => {
    try {
        // Si le created_at est vide ou null, retourner une valeur par défaut
        if (!created_at) {
            return 'Date non disponible';
        }

        // Créer l'objet Date
        const date = new Date(created_at);
        
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
            console.warn('Date invalide:', created_at);
            return 'Date invalide';
        }

        // Formater la date
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error, 'Created_at:', created_at);
        return 'Erreur de date';
    }
};

// Composant principal Historique
const Historique: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Fonction pour charger les feedbacks
    const loadFeedbacks = async () => {
        try {
            setError(null);
            const data = await fetchFeedbacks();
            
            // Debug: Afficher les données reçues
            console.log('Données reçues:', data);
            
            // Trier par date décroissante (plus récent en premier)
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                
                // Si les dates sont invalides, les mettre à la fin
                if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                if (isNaN(dateA.getTime())) return 1;
                if (isNaN(dateB.getTime())) return -1;
                
                return dateB.getTime() - dateA.getTime();
            });
            
            setFeedbacks(sortedData);
        } catch (err) {
            setError('Impossible de charger les feedbacks. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour rafraîchir les données
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadFeedbacks();
        setRefreshing(false);
    };

    // Charger les feedbacks au montage du composant
    useEffect(() => {
        loadFeedbacks();
    }, []);

    // Rendu du composant de chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Chargement des feedbacks...</span>
            </div>
        );
    }

    // Rendu du composant d'erreur
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                </div>
                <button
                    onClick={handleRefresh}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className=" mx-auto p-6 bg-white">
            {/* En-tête avec titre et bouton de rafraîchissement */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                    Historique des Feedbacks
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2  bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* Statistiques */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{feedbacks.length}</div>
                        <div className="text-sm text-gray-600">Total feedbacks</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {feedbacks.length > 0 
                                ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
                                : '0'
                            }
                        </div>
                        <div className="text-sm text-gray-600">Note moyenne</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600">
                            {new Set(feedbacks.map(f => f.author)).size}
                        </div>
                        <div className="text-sm text-gray-600">Contributeurs</div>
                    </div>
                </div>
            </div>

            {/* Liste des feedbacks */}
            {feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun feedback disponible pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* En-tête du feedback */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{feedback.author}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {formatDate(feedback.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <StarRating rating={feedback.rating} />
                            </div>

                            {/* Contenu du feedback */}
                            <div className="mt-3">
                                <p className="text-gray-700 leading-relaxed">{feedback.content}</p>
                            </div>

                           
                            {/* Debug: Afficher la valeur brute du timestamp */}
                            <div className="mt-2 text-xs text-gray-800">
                            {formatDate(feedback.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Historique;