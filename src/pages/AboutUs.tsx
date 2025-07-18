
import { useEffect } from 'react';
import { Target, Heart, Award, Globe, Rocket, Shield, Star, Users, TrendingUp, Clock, CheckCircle, ArrowRight, Zap, BookOpen, Award as AwardIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('About Us page loaded');
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Excellence First',
      description: 'Rigorously vetted trainers ensuring exceptional learning experiences.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Heart,
      title: 'Human Connection',
      description: 'Personal mentorship that makes the difference between learning and mastering.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Breaking barriers to connect world-class expertise with learners everywhere.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Secure platforms where learning and growth are the only focus.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Students Trained', icon: Users, color: 'text-blue-600' },
    { number: '2.5K+', label: 'Expert Trainers', icon: BookOpen, color: 'text-green-600' },
    { number: '98%', label: 'Success Rate', icon: Star, color: 'text-yellow-600' },
    { number: '75+', label: 'Countries', icon: Globe, color: 'text-purple-600' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast Learning',
      description: 'Accelerate your career with hands-on training from industry experts.',
      highlight: '3x faster'
    },
    {
      icon: CheckCircle,
      title: 'Verified Experts',
      description: 'Every trainer is thoroughly vetted with proven industry experience.',
      highlight: '100% verified'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Book sessions that fit your schedule, from anywhere in the world.',
      highlight: '24/7 available'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Track progress and see measurable improvements in your skills.',
      highlight: 'Guaranteed results'
    }
  ];

  const journeySteps = [
    {
      step: '01',
      title: 'Choose Your Path',
      description: 'Browse expert trainers and technologies.',
      icon: Target
    },
    {
      step: '02',
      title: 'Connect & Learn',
      description: 'Book personalized sessions with industry professionals.',
      icon: Users
    },
    {
      step: '03',
      title: 'Transform Career',
      description: 'Apply new skills and advance in your field.',
      icon: Rocket
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-purple-200 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-indigo-200 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4 mr-2" />
              Revolutionizing Tech Education
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Where
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> Expertise </span>
              Meets
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent"> Ambition</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Connecting passionate learners with seasoned industry experts for transformative tech education.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/trainers')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Learning Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/apply-trainer')}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                Become a Trainer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.label} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className={`text-4xl font-bold mb-3 ${stat.color}`}>{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100 to-purple-100"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4 mr-2" />
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Born from Real-World 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Frustration</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-800">
                  Traditional education wasn't keeping pace with rapidly evolving tech.
                </p>
                <p>
                  We witnessed talented individuals struggle to bridge the gap between theory and practice. 
                  Generic courses and outdated curriculums failed to prepare learners for real challenges.
                </p>
                <p className="text-xl font-semibold text-blue-600">
                  Skilloop.io was born—where expertise meets ambition, and learning becomes transformation.
                </p>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl opacity-20 blur-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&auto=format" 
                alt="Team collaboration and innovation"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Why Choose Skilloop
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Future of 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Tech Learning</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Personalized, expert-led training that accelerates your career growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.title} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8 text-center">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {feature.highlight}
                    </div>
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Core Values
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Drives Us 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Forward</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={value.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in bg-white" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Your Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple Steps to 
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Success</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.step} className="text-center relative animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  {index < journeySteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-6"></div>
                  )}
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-xl mb-6 shadow-lg">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-r from-blue-800 to-purple-800"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8">
            <AwardIcon className="w-5 h-5 mr-2" />
            Our Mission
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-in">Transforming Careers Through Connection</h2>
          <p className="text-xl md:text-2xl font-light leading-relaxed mb-12 animate-fade-in opacity-90" style={{ animationDelay: '0.2s' }}>
            Bridge the gap between technological innovation and human potential by creating 
            meaningful connections between expert practitioners and passionate learners worldwide.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Join Our Community
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join thousands accelerating their careers with personalized, expert-led training that delivers real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/trainers')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Find Your Trainer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/apply-trainer')}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Become a Trainer
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
