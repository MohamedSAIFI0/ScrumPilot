import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onPageChange, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À propos' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
    { id: 'connexion', label: 'Connexion' },
  ];

  return (
    <header className="relative z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className=" p-2 rounded-lg">
            <img src="/logo.png" alt="" style={{width:"60px", height:'50px'}}/>
          </div>
          <div className="text-secondary-2">
            <h1 className="text-xl font-bold font-poppins">DXC Technology Maroc</h1>
            <p className="text-sm text-secondary-2/70 font-open-sans">DXC - Scrum IA</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`font-medium transition-all duration-300 font-open-sans ${
                currentPage === item.id
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-secondary-2/70 hover:text-primary hover:border-b-2 hover:border-primary/50 pb-1'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-secondary-2" />
          ) : (
            <Menu className="w-6 h-6 text-secondary-2" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left font-medium transition-colors font-open-sans ${
                  currentPage === item.id
                    ? 'text-primary'
                    : 'text-secondary-2/70 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;