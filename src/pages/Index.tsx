
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import ServiceSlider from '@/components/ServiceSlider';
import HowItWorks from '@/components/HowItWorks';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import TrustSection from '@/components/TrustSection';
import MostBookedTrainings from '@/components/MostBookedTrainings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Search, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServiceSlider />
      <HowItWorks />
      <MostBookedTrainings />
      <CategoryCards />
      <FeaturedTrainers />
      <TrustSection />
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
