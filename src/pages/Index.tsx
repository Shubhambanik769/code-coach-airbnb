
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
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CategoryCards />
      
      {/* Training Marketplace Section */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-blue-100">
              <Star className="h-4 w-4" />
              Training Marketplace
            </div>
            <h2 className="heading-lg text-gray-900 mb-8">
              Connect. Learn. <span className="text-gradient">Grow Together.</span>
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              Our marketplace connects skilled trainers with organizations seeking expert-led training programs. 
              Whether you're looking to teach or learn, we've got you covered.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            <Card className="group card-soft hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-blue-600 p-5 rounded-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="heading-md text-gray-900">For Expert Trainers</h3>
                    <p className="text-gray-600 body-md">Share your expertise and earn</p>
                  </div>
                </div>
                
                <ul className="space-y-6 text-gray-700 mb-10">
                  {[
                    "Browse hundreds of training requests",
                    "Set your own rates and schedule", 
                    "Build your professional network"
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="body-md">{text}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/training-marketplace">
                  <Button className="w-full btn-primary group-hover:scale-105 transition-transform text-base h-14">
                    Explore Opportunities
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group card-soft hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-purple-600 p-5 rounded-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="heading-md text-gray-900">For Organizations</h3>
                    <p className="text-gray-600 body-md">Find the perfect training partner</p>
                  </div>
                </div>
                
                <ul className="space-y-6 text-gray-700 mb-10">
                  {[
                    "Post detailed training requirements",
                    "Review qualified trainer applications",
                    "Choose the best fit for your team"
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="body-md">{text}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full btn-secondary group-hover:scale-105 transition-transform text-base h-14">
                    Post Training Request
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
