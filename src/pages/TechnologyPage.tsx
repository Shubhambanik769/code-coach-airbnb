
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
    description: 'Web Development is the process of building and maintaining websites and web applications. It encompasses front-end development (user interfaces and experiences), back-end development (server logic and databases), and full-stack development that combines both disciplines.',
    subtitle: 'Whether you\'re building a simple landing page, a complex e-commerce platform, or a sophisticated SaaS application — web development is the foundation of everything on the internet.',
    benefits: [
      { icon: '🌍', title: 'Universal Market Demand', desc: 'Required across all industries and business sectors' },
      { icon: '💻', title: 'Team Integration', desc: 'Essential for product teams, startups, and digital agencies' },
      { icon: '💰', title: 'High ROI Investment', desc: 'Enables freelancing, employment, and entrepreneurship' },
      { icon: '🔧', title: 'Internal Capability', desc: 'Build custom tools, dashboards, and portals in-house' }
    ],
    technologies: [
      'HTML5, CSS3, JavaScript ES6+',
      'React.js, Angular, Vue.js',
      'Node.js, Express.js, Python Django',
      'Git, GitHub, CI/CD Pipelines',
      'MongoDB, MySQL, PostgreSQL',
      'Bootstrap, Tailwind CSS, Sass',
      'REST APIs, GraphQL, Microservices',
      'AWS, Vercel, Netlify, Firebase'
    ],
    gradient: 'from-blue-600 to-cyan-600',
    bgGradient: 'from-blue-50 via-white to-cyan-50'
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
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className={`py-20 lg:py-32 bg-gradient-to-br ${tech.bgGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="group hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${tech.gradient} flex items-center justify-center shadow-2xl`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {tech.name}
            </h1>
            
            <div className="flex items-center justify-center mb-8">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                {trainers.length}+ Expert Trainers Available
              </Badge>
            </div>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {tech.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - What is Web Development */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">💡</span>
                  What is Web Development?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  {tech.description}
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <p className="text-slate-700 italic text-lg leading-relaxed">
                    "Web development is not just about writing code—it's about creating digital experiences that connect businesses with their customers and solve real-world problems."
                  </p>
                </div>
              </div>

              {/* Technologies Grid */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-2xl mr-3">🛠️</span>
                  Core Technologies & Skills
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {tech.technologies.map((techGroup, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="font-medium text-slate-800 leading-relaxed">
                        {techGroup}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Why Learn */}
            <div className="lg:pl-8">
              <div className="sticky top-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📈</span>
                  Why Learn Web Development?
                </h2>
                <div className="space-y-6">
                  {tech.benefits.map((benefit, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-2">{benefit.title}</h4>
                          <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Section */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Ready to Start Learning?</h3>
                  <p className="mb-6 opacity-90">Connect with our expert trainers and accelerate your web development journey.</p>
                  <Button 
                    onClick={() => navigate('/trainers')}
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                  >
                    Find Your Trainer
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Trainers Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center">
              <Award className="w-10 h-10 mr-4 text-blue-600" />
              Top Web Development Trainers
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Learn from industry experts with proven track records and real-world experience
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl h-96 shadow-lg"></div>
                </div>
              ))}
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white border-0 shadow-lg animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden shadow-xl ring-4 ring-white">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;
                            }}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                          {displayName}
                        </h3>
                        <p className="text-slate-600 mb-3">{trainer.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {trainer.specialization}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-1">
                          {rating > 0 ? (
                            <>
                              {renderStars(rating)}
                              <span className="text-sm font-medium text-slate-700 ml-2">
                                {rating.toFixed(1)} ({totalReviews})
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">New trainer</span>
                          )}
                        </div>

                        <div className="flex items-center justify-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trainer.location || 'Remote'}
                        </div>

                        <div className="text-center">
                          <div className="font-bold text-blue-600 text-2xl">
                            ${trainer.hourly_rate || 0}/hr
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleViewProfile(trainer.id)}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {user ? 'View Profile' : 'Login to View'}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Trainers Found</h3>
                <p className="text-slate-500">We're working on adding more trainers for this technology soon.</p>
              </div>
            </div>
          )}

          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate('/trainers')}
              size="lg" 
              variant="outline"
              className="px-10 py-4 text-lg font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
            >
              Explore All Trainers
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TechnologyPage;
