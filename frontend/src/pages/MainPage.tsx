import React, { useState } from 'react';
import Header from '../main/components/Header';
import Footer from '../main/components/Footer';
import Accueil from '../main/pages/Accueil';
import APropos from '../main/pages/APropos';
import Services from '../main/pages/Services';
import Contact from '../main/pages/Contact';
import Connexion from '../main/pages/Connexion';

function MainPage() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return <Accueil />;
      case 'apropos':
        return <APropos />;
      case 'services':
        return <Services />;
      case 'contact':
        return <Contact />;
      case 'connexion':
        return <Connexion onPageChange={setCurrentPage}/>;
      default:
        return <Accueil />;
    }
  };

  // Don't show header and footer for connexion and register pages
  if(currentPage === 'connexion' || currentPage === 'register'){
    return renderPage();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default MainPage;