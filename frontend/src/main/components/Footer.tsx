import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-2 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img src="/logo.png" alt=""  style={{width:"80px", height:"70px"}}/>
              </div>
              <div>
                <h3 className="font-bold font-poppins">DXC Technology</h3>
                <p className="text-sm text-white/70 font-open-sans">Maroc</p>
              </div>
            </div>
            <p className="text-white/80 font-open-sans leading-relaxed">
            DXC Technology aide les entreprises à moderniser leur informatique,
             sécuriser leurs clouds et améliorer leur performance et expérience client.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg font-poppins">Services</h4>
            <ul className="space-y-2 font-open-sans">
              <li><a href="#" className="text-white/80 hover:text-button transition-colors">Collecte de Feedback Client</a></li>
              <li><a href="#" className="text-white/80 hover:text-button transition-colors">Analyse Prédictive du Feedback</a></li>
              <li><a href="#" className="text-white/80 hover:text-button transition-colors">Intégration Scrum Intelligente</a></li>
              <li><a href="#" className="text-white/80 hover:text-button transition-colors">Tableaux de Bord Temps Réel</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg font-poppins">Contact</h4>
            <div className="space-y-3 font-open-sans">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-button" />
                <span className="text-white/80">Rabat, Maroc</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-button" />
                <span className="text-white/80">+212 5XX-XXXXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-button" />
                <span className="text-white/80">contact@dxc.ma</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg font-poppins">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/dxcmaroc/" className="bg-white/10 p-2 rounded-lg hover:bg-button transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-button transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://dxc.com/ma/en" className="bg-white/10 p-2 rounded-lg hover:bg-button transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 font-open-sans">
            © 2025 DXC Technology Maroc. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;