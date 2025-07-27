import React, { useState, useEffect } from 'react';
import { Clock, User, Star, MessageCircle, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus, Filter, Calendar } from 'lucide-react';

// Interface pour les données de feedback
interface Feedback {
    id: string;
    author: string;
    email: string;
    content: string;
    rating: number;
    timestamp: string;
    deliverableId?: string;
    project?: string;
    category?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    tags?: string[];
}

// Fonction pour déterminer le sentiment basé sur la note
const determineSentiment = (rating: number): 'positive' | 'neutral' | 'negative' => {
    if (rating >= 4) return 'positive';
    if (rating >= 3) return 'neutral';
    return 'negative';
};

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
        // Données de démonstration pour le design
        return [
        ];
    }
};

// Composant pour afficher les étoiles de notation
const StarRating: React.FC<{ rating: number; showScore?: boolean }> = ({ rating, showScore = false }) => {
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
            {showScore && (
                <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
            )}
        </div>
    );
};

// Composant pour formater la date
const formatDate = (timestamp: string): string => {
    try {
        if (!timestamp || timestamp.trim() === '') {
            return 'Date inconnue';
        }

        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'Erreur de date';
    }
};

// Composant pour les badges de sentiment
const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
    const configs = {
        positive: { bg: 'bg-green-100', text: 'text-green-700', label: 'Positive' },
        neutral: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moyenne' },
        negative: { bg: 'bg-red-100', text: 'text-red-700', label: 'Examiné' }
    };
    
    const config = configs[sentiment as keyof typeof configs] || configs.neutral;
    
    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

// Composant principal
const ClientFeedback: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sentimentFilter, setSentimentFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    // Fonction pour charger les feedbacks
    const loadFeedbacks = async () => {
        try {
            setError(null);
            const data = await fetchFeedbacks();
            
            const validatedData = data.map(feedback => ({
                ...feedback,
                id: feedback.id || `feedback-${Date.now()}-${Math.random()}`,
                author: feedback.client?.name || 'Anonyme',
                content: feedback.content || 'Pas de contenu',
                rating: typeof feedback.rating === 'number' ? feedback.rating : 0,
                timestamp: feedback.timestamp || new Date().toISOString(),
                sentiment: feedback.sentiment || 'neutral'
            }));

            const sortedData = validatedData.sort((a, b) => {
                try {
                    const dateA = new Date(a.timestamp).getTime();
                    const dateB = new Date(b.timestamp).getTime();
                    return dateB - dateA;
                } catch (error) {
                    return 0;
                }
            });
            
            setFeedbacks(sortedData);
        } catch (err) {
            setError('Impossible de charger les feedbacks. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadFeedbacks();
        setRefreshing(false);
    };

    useEffect(() => {
        loadFeedbacks();
    }, []);

    // Filtrer les feedbacks
    const filteredFeedbacks = feedbacks.filter(feedback => {
        const sentimentMatch = sentimentFilter === 'all' || feedback.sentiment === sentimentFilter;
        const projectMatch = projectFilter === 'all' || feedback.project === projectFilter;
        return sentimentMatch && projectMatch;
    });

    // Calculer les statistiques
    const stats = {
        positive: filteredFeedbacks.filter(f => f.rating > 3 ).length,
        neutral: filteredFeedbacks.filter(f => f.rating  == 3).length,
        negative: filteredFeedbacks.filter(f => f.rating < 3).length,
        averageRating: filteredFeedbacks.length > 0 
            ? filteredFeedbacks.reduce((acc, f) => acc + f.rating, 0) / filteredFeedbacks.length 
            : 0
    };

    const totalFeedbacks = filteredFeedbacks.length;
    const positivePercentage = totalFeedbacks > 0 ? Math.round((stats.positive / totalFeedbacks) * 100) : 0;
    const neutralPercentage = totalFeedbacks > 0 ? Math.round((stats.neutral / totalFeedbacks) * 100) : 0;
    const negativePercentage = totalFeedbacks > 0 ? Math.round((stats.negative / totalFeedbacks) * 100) : 0;

    // Obtenir les projets uniques
    const uniqueProjects = [...new Set(feedbacks.map(f => f.project).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Chargement des feedbacks...</span>
            </div>
        );
    }

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Plateforme de Gestion Agile</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MessageCircle className="h-4 w-4" />
                            <span>{totalFeedbacks} feedbacks reçus</span>
                        </div>
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Section Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedbacks Clients</h2>
                    <p className="text-gray-600">Aperçu des retours et évaluations de vos clients</p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sentiment Positif</p>
                                <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
                                <p className="text-sm text-gray-500">{positivePercentage}%</p>
                            </div>
                            <div className="flex items-center text-green-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sentiment Neutre</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.neutral}</p>
                                <p className="text-sm text-gray-500">{neutralPercentage}%</p>
                            </div>
                            <div className="flex items-center text-yellow-600">
                                <Minus className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sentiment Négatif</p>
                                <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
                                <p className="text-sm text-gray-500">{negativePercentage}%</p>
                            </div>
                            <div className="flex items-center text-red-600">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Note Moyenne</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}</p>
                                <StarRating rating={Math.round(stats.averageRating)} />
                            </div>
                            <div className="flex items-center text-purple-600">
                                <Star className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filtres:</span>
                        </div>
                        
                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous les sentiments</option>
                            <option value="positive">Positif</option>
                            <option value="neutral">Neutre</option>
                            <option value="negative">Négatif</option>
                        </select>

                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous les projets</option>
                            {uniqueProjects.map(project => (
                                <option key={project} value={project}>{project}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Liste des feedbacks */}
                {filteredFeedbacks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Aucun feedback ne correspond aux filtres sélectionnés.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeedbacks.map((feedback) => (
                            <div
                                key={feedback.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{feedback.author}</h3>
                                            <p className="text-sm text-gray-500">{feedback.email}</p>
                                            <p className="text-sm text-gray-600">{feedback.project} • {feedback.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <SentimentBadge sentiment={feedback.sentiment || 'neutral'} />
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(feedback.timestamp)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed">{feedback.content}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <StarRating rating={feedback.rating} showScore />
                                        <span className="text-sm text-gray-500">
                                            Score IA: +{(feedback.rating * 0.17).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    {feedback.tags && feedback.tags.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Tags:</span>
                                            {feedback.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientFeedback;