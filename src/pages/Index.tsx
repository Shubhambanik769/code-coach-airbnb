
import HeroSection from '@/components/HeroSection';
import CategoryCards from '@/components/CategoryCards';
import HowItWorks from '@/components/HowItWorks';
import FeaturedTrainers from '@/components/FeaturedTrainers';
import TrustSection from '@/components/TrustSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <CategoryCards />
      
      {/* Training Marketplace Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Training Opportunities Marketplace
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse available training requests from organizations looking for expert trainers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-techblue-100 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-techblue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">For Trainers</h3>
                      <p className="text-gray-600">Find training opportunities that match your expertise</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-techblue-500" />
                      Browse open training requests
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-techblue-500" />
                      Connect with organizations directly
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-techblue-500" />
                      Build your training portfolio
                    </li>
                  </ul>
                  <Link to="/training-marketplace">
                    <Button className="w-full">
                      Explore Training Requests
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">For Organizations</h3>
                      <p className="text-gray-600">Post your training needs and find qualified trainers</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-green-500" />
                      Post detailed training requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Review trainer applications
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500" />
                      Select the best fit for your needs
                    </li>
                  </ul>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      Post Training Request
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeaturedTrainers />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
