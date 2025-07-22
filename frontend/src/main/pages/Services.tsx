import React from 'react';
import { Bot, Brain, BarChart3, Users, Zap, Shield, Target, ArrowRight, CheckCircle, Star } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-button text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-title mb-6 font-poppins">
          Services Scrum IA avec Feedback Client Intégré
          </h1>
          <p className="text-paragraph text-white/90 max-w-4xl mx-auto leading-relaxed font-open-sans">
          Transformez vos processus agiles grâce à la collecte et 
          l'analyse intelligente du feedback client pour une adaptation continue.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-20">
            {/* Service 1 - Scrum Master IA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-title text-secondary-2 font-poppins">Feedback Client Intelligent</h2>
                </div>
                <p className="text-paragraph text-secondary-2/80 leading-relaxed font-open-sans">
                Solution qui centralise et analyse le feedback client dans vos cycles Scrum. Identifie les tendances,
                 anticipe les besoins et optimise la satisfaction client en temps réel.
                </p>
                <div className="space-y-3">
                  {[
                    " Collecte feedback multi-clients simplifiée",
                    "Analyse prédictive des tendances critiques",
                    "Intégration transparente cycles Scrum",
                    "Tableaux de bord temps réel parties prenantes"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-secondary-2/70 font-open-sans">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2 font-poppins">
                  <span>En savoir plus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-button/5 p-8 rounded-3xl">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-2/70 font-open-sans">Satisfaction Client</span>
                      <span className="text-primary font-semibold font-poppins">+85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-2/70 font-open-sans">Réduction Blocages</span>
                      <span className="text-button font-semibold font-poppins">-70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-button h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service 2 - Analytics Prédictifs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-button/5 to-primary/5 p-8 rounded-3xl lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <BarChart3 className="w-8 h-8 text-button mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary-2 font-poppins">95%</div>
                    <div className="text-sm text-secondary-2/70 font-open-sans">Précision</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary-2 font-poppins">48h</div>
                    <div className="text-sm text-secondary-2/70 font-open-sans">Anticipation</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <Zap className="w-8 h-8 text-button mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary-2 font-poppins">Real-time</div>
                    <div className="text-sm text-secondary-2/70 font-open-sans">Analyse</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary-2 font-poppins">360°</div>
                    <div className="text-sm text-secondary-2/70 font-open-sans">Vision</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 lg:order-2">
                <div className="flex items-center space-x-4">
                  <div className="bg-button/10 p-3 rounded-2xl">
                    <BarChart3 className="w-8 h-8 text-button" />
                  </div>
                  <h2 className="text-title text-center text-secondary-2 font-poppins">Analyse Stratégique de Feedback</h2>
                </div>
                <p className="text-paragraph text-center text-secondary-2/80 leading-relaxed font-open-sans">
                Transformez le feedback client en insights actionnables. 
                Notre IA identifie les tendances critiques et optimise vos sprints en temps réel.
                </p>
                <div className="space-y-3">
                  {[
                    "Identification tendances critiques avec 95% précision",
                    " Détection précoce points de friction",
                    " Intégration transparente cycles Agile",
                    "Rapports intelligents PO et Scrum Master"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-button" />
                      <span className="text-secondary-2/70 font-open-sans">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="bg-button text-white px-6 py-3 rounded-2xl font-semibold hover:bg-button/90 transition-all duration-300 flex items-center space-x-2 font-poppins">
                  <span>Découvrir</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Service 3 - NLP pour Équipes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-title text-secondary-2 font-poppins">Collaboration Équipes-Clients</h2>
                </div>
                <p className="text-paragraph text-secondary-2/80 leading-relaxed font-open-sans">
                Améliorez la communication équipes-clients via l'analyse de feedback.
                 Détectez les frictions et renforcez la collaboration continue.
                </p>
                <div className="space-y-3">
                  {[
                    "Analyse sentiment communications",
                    "Détection problèmes collaboration",
                    "Suggestions amélioration transparence",
                    "Rapports engagement parties prenantes"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-secondary-2/70 font-open-sans">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2 font-poppins">
                  <span>Explorer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-secondary-2/5 p-8 rounded-3xl">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-2 font-open-sans">Sentiment Positif</span>
                      <span className="text-green-500 font-semibold font-poppins">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-2 font-open-sans">Engagement Équipe</span>
                      <span className="text-blue-500 font-semibold font-poppins">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-2 font-open-sans">Communication Efficace</span>
                      <span className="text-purple-500 font-semibold font-poppins">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-cards">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-title text-secondary-2 mb-4 font-poppins">Services Complémentaires</h2>
            <p className="text-paragraph text-secondary-2/70 max-w-3xl mx-auto font-open-sans">
            Suite complète pour votre transformation agile avec feedback client
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Formation Scrum IA",
                description: "Programmes de formation certifiants pour maîtriser les outils Scrum assistés par IA",
                features: ["Certification officielle", "Modules pratiques", "Support continu"]
              },
              {
                icon: Shield,
                title: "Audit & Optimisation",
                description: "Évaluation complète de vos processus agiles avec recommandations d'amélioration",
                features: ["Audit complet", "Plan d'action", "Suivi personnalisé"]
              },
              {
                icon: Zap,
                title: "Intégration Système",
                description: "Intégration transparente avec vos outils existants (Jira, Azure DevOps, etc.)",
                features: ["API robustes", "Migration sécurisée", "Support technique"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-2 mb-4 font-poppins">{service.title}</h3>
                <p className="text-secondary-2/70 mb-6 leading-relaxed font-open-sans">{service.description}</p>
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm text-secondary-2/70 font-open-sans">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center space-x-2 font-poppins">
                  <span>En savoir plus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-button text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-title mb-6 font-poppins">
            Transformez Vos Projets Dès Aujourd'hui
          </h2>
          <p className="text-paragraph mb-8 text-white/90 font-open-sans">
            Contactez nos experts pour une démonstration personnalisée de nos solutions Scrum IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
              Demander une Démo
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 font-poppins">
              Parler à un Expert
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;