import React from 'react';
import { Users, Award, Globe, Target, Brain, Lightbulb, Shield, Zap } from 'lucide-react';

const APropos: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary-2 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-title mb-6 font-poppins">
              Pionniers de la Transformation Agile IA
            </h1>
            <p className="text-paragraph text-white/90 leading-relaxed font-open-sans">
              DXC Technology Maroc révolutionne la gestion de projets agiles en intégrant 
              l'intelligence artificielle et le traitement du langage naturel pour créer 
              des solutions Scrum de nouvelle génération.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-title text-secondary-2 mb-6 font-poppins">Notre Mission</h2>
                <p className="text-paragraph text-secondary-2/80 leading-relaxed mb-6 font-open-sans">
                  Transformer la façon dont les équipes collaborent et livrent des projets 
                  en combinant les méthodologies agiles éprouvées avec les dernières 
                  innovations en intelligence artificielle.
                </p>
                <div className="space-y-4">
                  {[
                    "Automatiser les processus Scrum répétitifs",
                    "Prédire et prévenir les blocages projet",
                    "Optimiser la performance des équipes",
                    "Démocratiser l'accès aux insights avancés"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-1 rounded-full">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-secondary-2/70 font-open-sans">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-button/5 p-8 rounded-3xl">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <Brain className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-2 mb-2 font-poppins">Intelligence Artificielle</h3>
                  <p className="text-secondary-2/70 font-open-sans">
                    Algorithmes avancés pour l'analyse prédictive et l'optimisation continue
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <Lightbulb className="w-12 h-12 text-button mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-2 mb-2 font-poppins">Innovation Continue</h3>
                  <p className="text-secondary-2/70 font-open-sans">
                    Recherche et développement constant pour rester à la pointe de la technologie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cards">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-title text-secondary-2 mb-4 font-poppins">Nos Valeurs</h2>
            <p className="text-paragraph text-secondary-2/70 max-w-3xl mx-auto font-open-sans">
              Les principes qui guident notre approche et définissent notre culture d'entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Collaboration",
                description: "Nous croyons en la force des équipes unies et de la communication transparente"
              },
              {
                icon: Zap,
                title: "Agilité",
                description: "Adaptation rapide aux changements et amélioration continue de nos processus"
              },
              {
                icon: Shield,
                title: "Fiabilité",
                description: "Solutions robustes et sécurisées pour accompagner la croissance de nos clients"
              },
              {
                icon: Award,
                title: "Excellence",
                description: "Recherche constante de la qualité et de l'innovation dans tout ce que nous faisons"
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-2 mb-4 font-poppins">{value.title}</h3>
                <p className="text-secondary-2/70 leading-relaxed font-open-sans">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-title text-secondary-2 mb-4 font-poppins">Notre Impact</h2>
            <p className="text-paragraph text-secondary-2/70 font-open-sans">
              Des chiffres qui témoignent de notre engagement et de notre expertise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { number: "98%", label: "Satisfaction client" },
              { number: "50+", label: "Projets livrés" },
              { number: "100%", label: "Suivi en temps réel" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2 font-poppins">{stat.number}</div>
                <div className="text-secondary-2/70 font-open-sans">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-20 bg-gradient-to-r from-secondary-2 to-primary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-title mb-6 font-poppins">Présence Mondiale, Expertise Locale</h2>
              <p className="text-paragraph text-white/90 mb-8 leading-relaxed font-open-sans">
                Basés au Maroc avec une vision internationale, nous combinons 
                l'expertise locale avec les standards mondiaux de DXC Technology 
                pour offrir des solutions adaptées au marché international.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-button" />
                  <span className="font-open-sans">Réseau mondial DXC Technology</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-button" />
                  <span className="font-open-sans">Équipe d'experts certifiés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-button" />
                  <span className="font-open-sans">Standards internationaux</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <h3 className="text-xl font-semibold mb-6 font-poppins">Nos Bureaux</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl">
                  <span className="font-open-sans">Rabat, Sala Al Jadida</span>
                  <span className="text-button font-semibold font-open-sans">Siège Principal</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl">
                  <span className="font-open-sans">Casablanca</span>
                  <span className="text-white/70 font-open-sans">Bureau Régional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default APropos;