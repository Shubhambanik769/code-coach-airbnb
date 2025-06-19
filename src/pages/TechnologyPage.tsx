
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, MapPin, Code, Users, TrendingUp, Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const technologyData = {
  'web-development': {
    name: 'Web Development & Related Technologies',
    icon: Code,
    description: 'Web Development is the process of building and maintaining websites and web applications. It includes front-end (what users see), back-end (server logic, databases), and full-stack development.',
    subtitle: 'Whether you\'re building a landing page, an e-commerce platform, or a SaaS app — web development is the foundation of everything on the internet.',
    benefits: [
      { icon: '🌍', title: 'Universal Demand', desc: 'Needed across all industries' },
      { icon: '💻', title: 'Essential for Teams', desc: 'Product teams, startups, digital agencies' },
      { icon: '💰', title: 'High ROI Skill', desc: 'Enables freelancing, jobs, and entrepreneurship' },
      { icon: '🔧', title: 'Internal Tools', desc: 'Build dashboards, portals, and custom tools' }
    ],
    technologies: [
      'HTML5, CSS3, JavaScript',
      'React.js, Angular, Vue.js',
      'Node.js, Express.js',
      'Git & GitHub, CI/CD',
      'MongoDB, MySQL, PostgreSQL',
      'Bootstrap, Tailwind CSS',
      'REST APIs, GraphQL',
      'Vercel, Netlify, Firebase, AWS'
    ],
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 via-cyan-50 to-indigo-50'
  }
};

const TechnologyPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const tech = technologyData[slug as keyof typeof technologyData];

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['technology-trainers', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .contains('skills', [slug?.replace('-', ' ')])
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (!tech) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Technology Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const IconComponent = tech.icon;

  const handleViewProfile = (trainerId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/trainer/${trainerId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className={`py-16 lg:py-24 bg-gradient-to-br ${tech.bgGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-300 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${tech.gradient} flex items-center justify-center mr-4 shadow-xl`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                    {tech.name}
                  </h1>
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                    {trainers.length}+ Expert Trainers
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">💡</span>
                    What is Web Development?
                  </h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-slate-600 italic text-lg">
                    {tech.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-scale-in">
              <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Why Learn Web Development?
                  </h3>
                  <div className="space-y-4">
                    {tech.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-2xl">{benefit.icon}</span>
                        <div>
                          <div className="font-semibold text-slate-900">{benefit.title}</div>
                          <div className="text-slate-600 text-sm">{benefit.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center">
              <span className="text-3xl mr-2">🛠️</span>
              Related Skills & Technologies
            </h2>
            <p className="text-lg text-slate-600">Master these essential technologies and frameworks</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tech.technologies.map((techGroup, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-slate-700 leading-relaxed">
                    {techGroup}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Trainers Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 mr-3 text-blue-600" />
              Top Web Development Trainers
            </h2>
            <p className="text-lg text-slate-600">Learn from industry experts with proven expertise</p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl h-80 shadow-lg"></div>
                </div>
              ))}
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trainers.map((trainer, index) => {
                const displayName = trainer.name || trainer.profiles?.full_name || 'Professional Trainer';
                const rating = trainer.rating || 0;
                const totalReviews = trainer.total_reviews || 0;
                
                const avatarUrl = trainer.profiles?.avatar_url 
                  ? (trainer.profiles.avatar_url.startsWith('http') 
                      ? trainer.profiles.avatar_url 
                      : `https://rnovcrcvhaeuudqkymiw.supabase.co/storage/v1/object/public/avatars/${trainer.profiles.avatar_url}`)
                  : `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;

                return (
                  <Card 
                    key={trainer.id}
                    className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden shadow-lg">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;
                            }}
                          />
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {displayName}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">{trainer.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {trainer.specialization}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-1">
                          {rating > 0 ? (
                            <>
                              {renderStars(rating)}
                              <span className="text-sm font-medium text-slate-700 ml-1">
                                {rating.toFixed(1)} ({totalReviews})
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">New trainer</span>
                          )}
                        </div>

                        <div className="flex items-center justify-center text-sm text-slate-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {trainer.location || 'Remote'}
                        </div>

                        <div className="text-center">
                          <div className="font-bold text-blue-600 text-lg">
                            ${trainer.hourly_rate || 0}/hr
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleViewProfile(trainer.id)}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                          size="sm"
                        >
                          {user ? 'View Profile' : 'Login to View'}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <p className="text-slate-500">No trainers found for this technology yet.</p>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/trainers')}
              size="lg" 
              variant="outline"
              className="px-8 py-3 font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            >
              View All Trainers
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TechnologyPage;
