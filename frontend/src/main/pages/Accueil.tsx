import React from 'react';
import { Bot, Zap, Users, TrendingUp, ArrowRight, Play, CheckCircle, Star } from 'lucide-react';

const Accueil: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-purple-700 to-secondary-2 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-button/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <span className="inline-block bg-button/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium border border-button/30 font-open-sans">
                   Plateforme DXC Scrum IA Révolutionnaire
                </span>
                <h1 className="text-title font-bold leading-tight font-poppins">
                Transformez Vos Projets Agiles avec 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-button to-cyan-300 block">
                  la Voix de Vos Clients
                  </span>
                </h1>
                <p className="text-paragraph text-white/90 leading-relaxed font-open-sans">
                Optimisez vos projets avec une solution Scrum qui centralise, analyse et intègre les retours clients.
                Améliorez vos livrables, anticipez les besoins et adaptez vos sprints en continu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-button text-white px-8 py-4 rounded-2xl font-semibold hover:bg-button/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-poppins">
                  <span>Démarrer Maintenant</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2 font-poppins">
                  <Play className="w-5 h-5" />
                  <span>Voir la Démo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold font-poppins">98%</div>
                  <div className="text-sm text-white/80 font-open-sans">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-poppins">50+</div>
                  <div className="text-sm text-white/80 font-open-sans">Projets livrés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-poppins">100%</div>
                  <div className="text-sm text-white/80 font-open-sans">Suivi en temps réel</div>
                </div>
              </div>
            </div>

            {/* Right side - Features showcase */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl">
                    <Bot className="w-8 h-8 text-button" />
                    <div>
                      <h3 className="font-semibold font-poppins">Collecte Intelligente</h3>
                      <p className="text-sm text-white/80 font-open-sans">Système de feedback simple et accessible pour tous vos clients à chaque étape du projet.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-button" />
                    <div>
                      <h3 className="font-semibold font-poppins"> Analyse Stratégique</h3>
                      <p className="text-sm text-white/80 font-open-sans">Analyse structurée pour identifier les problèmes critiques et détecter les opportunités d'amélioration.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl">
                    <Users className="w-8 h-8 text-button" />
                    <div>
                      <h3 className="font-semibold font-poppins">Suivi & Transparence</h3>
                      <p className="text-sm text-white/80 font-open-sans">Rapports dynamiques et tableaux de bord pour une vision claire et partagée de l’évolution du projet.</p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cards">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-title text-secondary-2 mb-4 font-poppins">
            Fonctionnalités Clés Axées sur le Feedback Client
            </h2>
            <p className="text-paragraph text-secondary-2/70 max-w-3xl mx-auto font-open-sans">
            Notre plateforme combine les principes Agile Scrum et la collecte intelligente de feedback client pour une gestion de projet réactive,
             continue et centrée sur les besoins réels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Collecte de Feedback",
                description: "Collecte simple et accessible de retours clients via formulaires web, e-mails."
              },
              {
                icon: Zap,
                title: "Analyse Automatisée du Feedback",
                description: "Traitement structuré des retours pour détecter les tendances, problèmes récurrents et suggestions utiles."
              },
              {
                icon: Users,
                title: "Intégration Agile Continue",
                description: "Feedback client injecté automatiquement dans les sprints et backlog pour des ajustements rapides."
              },
              {
                icon: TrendingUp,
                title: "Dashboards en Temps Réel",
                description: "Visualisez l’impact des feedbacks sur l’évolution des tâches, des user stories et des releases."
              },
              {
                icon: CheckCircle,
                title: "Collaboration Renforcée",
                description: "Espace partagé pour favoriser les échanges transparents entre équipes et clients."
              },
              {
                icon: Star,
                title: "Suivi d’Amélioration Continue",
                description: "Historique de feedbacks avec suivi des actions prises, indicateurs d’impact et traçabilité des améliorations."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-2 mb-4 font-poppins">{feature.title}</h3>
                <p className="text-secondary-2/70 leading-relaxed font-open-sans">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-button text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-title mb-6 font-poppins">
          Transformez Vos Projets Agiles avec Notre Solution Scrum Intelligente
          </h2>
          <p className="text-paragraph mb-8 text-white/90 font-open-sans">
          Intégrez la collecte et l'analyse de feedback client pour une adaptation continue et optimisez la satisfaction
           de vos clients grâce à notre plateforme Scrum IA avancée.
          </p>
          <button className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-poppins">
            Commencer Votre Transformation
          </button>
        </div>
      </section>
    </div>
  );
};

export default Accueil;