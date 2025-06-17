
import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Initialize any necessary data or tracking
    console.log('Index page loaded');
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
    </div>
  );
};

export default Index;
