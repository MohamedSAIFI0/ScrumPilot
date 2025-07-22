import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, Check,  MapPin, Globe, Users, Zap, Shield, TrendingUp } from 'lucide-react';
import { login } from '../../services/apiLogin';
import { useNavigate } from 'react-router-dom';

interface ConnexionProps {
  onPageChange?: (page: string) => void;
}

const Connexion: React.FC<ConnexionProps> = ({ onPageChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { role } = await login(formData.email, formData.password);
  
      // Redirection basée sur le rôle
      switch (role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'PO':
          navigate('/product-owner');
          break;
        case 'SM':
          navigate('/scrum-master');
          break;
        case 'DEV':
          navigate('/dev-team');
          break;
        case 'CLIENT':
          navigate('/client');
          break;
        default:
          navigate('/'); // fallback
      }
    } catch (err: any) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-700 to-secondary-2 font-poppins">
      <div className="flex min-h-screen">
        {/* Left Section - Branding & Information */}
        <div className="flex-1 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-button/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          {/* Main Content */}
          <div className="text-center max-w-2xl z-10">
            <div className="mb-8">
              <span className="inline-block bg-button/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium border border-button/30 mb-6">
                Innovation Digitale
              </span>
            </div>

            <h1 className="text-title font-bold mb-8 leading-tight">
              Transformez Votre
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-button to-cyan-300">
                Avenir Numérique
              </span>
            </h1>
            
            <p className="text-paragraph mb-12 text-white/90 leading-relaxed max-w-xl mx-auto">
              Rejoignez DXC Technology Maroc et découvrez comment nos solutions 
              innovantes transforment les entreprises à travers le monde. 
              Votre succès est notre priorité.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Zap className="w-8 h-8 text-button mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Innovation IA</h3>
                <p className="text-sm text-white/80">Solutions intelligentes et automatisées</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Shield className="w-8 h-8 text-button mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Sécurité Avancée</h3>
                <p className="text-sm text-white/80">Protection de données de niveau entreprise</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Users className="w-8 h-8 text-button mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Équipe Experte</h3>
                <p className="text-sm text-white/80">Consultants certifiés et expérimentés</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-button mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Croissance Durable</h3>
                <p className="text-sm text-white/80">Stratégies de transformation digitale</p>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Rabat Sala Al Jadida, Rabat</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Présence Mondiale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Registration Form */}
        <div className="w-full max-w-lg bg-cards/95 backdrop-blur-xl flex flex-col justify-center p-8 relative">
          {/* Background decorative elements */}
          <div className="absolute top-16 right-16 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-8 w-32 h-32 bg-button/10 rounded-full blur-xl"></div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-title text-secondary-2 mb-2 font-poppins">Connectez-vous</h2>
              <p className="text-secondary-2/70 font-open-sans">Vous êtes les bienvenus dans notre communauté d'innovation.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
             
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-2/50 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Adresse email professionnelle"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-cards border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                  required
                />
              </div>

              
              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-2/50 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 bg-cards border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-secondary-2 font-open-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-2/50 hover:text-secondary-2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              

              {/* Checkboxes */}
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                      formData.newsletter 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300 group-hover:border-primary'
                    }`}>
                      {formData.newsletter && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-secondary-2/70 font-open-sans">
                  Se souvenir de moi
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-center font-semibold">{error}</div>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-button text-white py-4 rounded-2xl font-semibold hover:bg-button/90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-poppins disabled:opacity-60"
                disabled={loading}
              >
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
              </button>
            
            </form>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-6 text-secondary-2/60 text-sm font-open-sans">
            <p>© 2025 DXC Technology Maroc. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;