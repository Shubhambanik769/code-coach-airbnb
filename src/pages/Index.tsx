
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
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoryCards />
      
      {/* Training Marketplace Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-rose-100">
              <Star className="h-4 w-4" />
              Training Marketplace
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight">
              Connect. Learn. <span className="text-gradient">Grow Together.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Our marketplace connects skilled trainers with organizations seeking expert-led training programs. 
              Whether you're looking to teach or learn, we've got you covered.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="card-minimal group card-hover border-0 bg-gradient-to-br from-rose-50/50 to-rose-100/30 overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-3xl shadow-lg">
                    <Briefcase className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">For Expert Trainers</h3>
                    <p className="text-muted-foreground text-lg">Share your expertise and earn</p>
                  </div>
                </div>
                
                <ul className="space-y-5 text-foreground mb-10">
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Browse hundreds of training requests</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Set your own rates and schedule</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Build your professional network</span>
                  </li>
                </ul>
                
                <Link to="/training-marketplace">
                  <Button className="w-full btn-rose text-lg font-semibold h-14 group-hover:scale-[1.02] transition-all duration-300">
                    Explore Opportunities
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="card-minimal group card-hover border-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">For Organizations</h3>
                    <p className="text-muted-foreground text-lg">Find the perfect training partner</p>
                  </div>
                </div>
                
                <ul className="space-y-5 text-foreground mb-10">
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Post detailed training requirements</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Review qualified trainer applications</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-lg">Choose the best fit for your team</span>
                  </li>
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full btn-secondary text-lg font-semibold h-14 group-hover:scale-[1.02] transition-all duration-300">
                    Post Training Request
                    <ArrowRight className="ml-3 h-6 w-6" />
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
