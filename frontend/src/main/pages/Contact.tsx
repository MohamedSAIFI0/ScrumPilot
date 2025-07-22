import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: 'consultation'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary-2 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-title mb-6 font-poppins">
            Contactez Nos Experts Scrum IA
          </h1>
          <p className="text-paragraph text-white/90 max-w-4xl mx-auto leading-relaxed font-open-sans">
            Prêt à transformer vos projets agiles ? Notre équipe d'experts est là pour vous accompagner 
            dans votre parcours de transformation digitale.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-cards/50 p-8 rounded-3xl">
              <div className="mb-8">
                <h2 className="text-title text-secondary-2 mb-4 font-poppins">Parlons de Votre Projet</h2>
                <p className="text-secondary-2/70 font-open-sans">
                  Remplissez ce formulaire et nous vous recontacterons dans les 24 heures
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                      required
                    />
                  </div>
                </div>

                {/* Email & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Entreprise *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Service Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                      Type de service
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                    >
                      <option value="consultation">Consultation gratuite</option>
                      <option value="demo">Démonstration produit</option>
                      <option value="formation">Formation équipe</option>
                      <option value="audit">Audit processus</option>
                      <option value="integration">Intégration système</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Ex: Implémentation Scrum IA pour équipe de 20 développeurs"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-secondary-2 mb-2 font-open-sans">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Décrivez votre projet, vos défis actuels et vos objectifs..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 resize-none font-open-sans"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-button text-white py-4 rounded-2xl font-semibold hover:bg-button/90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-poppins"
                >
                  <Send className="w-5 h-5" />
                  <span>Envoyer le Message</span>
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-gradient-to-br from-primary/5 to-button/5 p-8 rounded-3xl">
                <h3 className="text-xl font-semibold text-secondary-2 mb-6 font-poppins">
                  Informations de Contact
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-2 mb-1 font-poppins">Adresse</h4>
                      <p className="text-secondary-2/70 font-open-sans">
                        Technopolis<br />
                        Rabat, Sala Al Jadida
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-button/10 p-3 rounded-2xl">
                      <Phone className="w-6 h-6 text-button" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-2 mb-1 font-poppins">Téléphone</h4>
                      <p className="text-secondary-2/70 font-open-sans">
                        +212 5XX-XXXXXX<br />
                        +212 6XX-XXXXXX (Mobile)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-2 mb-1 font-poppins">Email</h4>
                      <p className="text-secondary-2/70 font-open-sans">
                        contact@dxc.ma<br />
                        support@dxc.ma
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-button/10 p-3 rounded-2xl">
                      <Clock className="w-6 h-6 text-button" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-2 mb-1 font-poppins">Horaires</h4>
                      <p className="text-secondary-2/70 font-open-sans">
                        Lun - Ven: 8h00 - 18h00<br />
                        Sam: 9h00 - 13h00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </section>

     
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-button text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-title mb-6 font-poppins">
            Prêt à Commencer Votre Transformation ?
          </h2>
          <p className="text-paragraph mb-8 text-white/90 font-open-sans">
            Nos experts sont disponibles pour discuter de vos besoins spécifiques 
            et vous proposer une solution sur mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
              Consultation Gratuite
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 font-poppins">
              +212 5XX-XXXXXX
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;