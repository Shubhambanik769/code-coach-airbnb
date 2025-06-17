
import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import EnhancedSearchButton from '@/components/EnhancedSearchButton';
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
      
      {/* Enhanced Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Trainer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Search through thousands of expert trainers and find the perfect match for your learning goals
            </p>
          </div>
          <EnhancedSearchButton />
        </div>
      </section>

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
