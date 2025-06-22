
import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const Index = () => {
  useEffect(() => {
    // Initialize any necessary data or tracking
    console.log('Index page loaded');
    
    // Ensure favicon is set correctly
    const favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234F46E5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237C3AED;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='url(%23grad)'/%3E%3Ctext x='16' y='22' font-family='Inter, sans-serif' font-size='12' font-weight='bold' text-anchor='middle' fill='white'%3ESL%3C/text%3E%3C/svg%3E";
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Category Cards */}
      <CategoryCards />
      
      {/* Featured Trainers */}
      <FeaturedTrainers />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Trust Section */}
      <TrustSection />
      
      {/* Footer */}
      <Footer />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
