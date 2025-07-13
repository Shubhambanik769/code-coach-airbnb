
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import ServiceSlider from '@/components/ServiceSlider';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import MostBookedTrainings from '@/components/MostBookedTrainings';
import OfferSlider from '@/components/OfferSlider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServiceSlider />
      <MostBookedTrainings />
      <OfferSlider />
      <CategoryCards />
      <FeaturedTrainers />
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
