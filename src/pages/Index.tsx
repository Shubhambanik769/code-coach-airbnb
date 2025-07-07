
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import HowItWorks from '@/components/HowItWorks';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import TrustSection from '@/components/TrustSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Search, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      <HeroSection />
      <CategoryCards />
      
      {/* Training Marketplace Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Training Marketplace
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Connect. Learn. <span className="text-gradient">Grow Together.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our marketplace connects skilled trainers with organizations seeking expert-led training programs. 
              Whether you're looking to teach or learn, we've got you covered.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Expert Trainers</h3>
                    <p className="text-gray-600 text-lg">Share your expertise and earn</p>
                  </div>
                </div>
                
                <ul className="space-y-4 text-gray-700 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Browse hundreds of training requests</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Set your own rates and schedule</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Build your professional network</span>
                  </li>
                </ul>
                
                <Link to="/training-marketplace">
                  <Button className="w-full btn-primary text-lg font-semibold h-12 group-hover:scale-105 transition-transform">
                    Explore Opportunities
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-100 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-purple-600 p-4 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Organizations</h3>
                    <p className="text-gray-600 text-lg">Find the perfect training partner</p>
                  </div>
                </div>
                
                <ul className="space-y-4 text-gray-700 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Post detailed training requirements</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Review qualified trainer applications</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-base">Choose the best fit for your team</span>
                  </li>
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full btn-secondary text-lg font-semibold h-12 group-hover:scale-105 transition-transform">
                    Post Training Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeaturedTrainers />
      <TrustSection />
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
