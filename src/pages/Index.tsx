
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <HeroSection />
      <CategoryCards />
      <FeaturedTrainers />
      <HowItWorks />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
