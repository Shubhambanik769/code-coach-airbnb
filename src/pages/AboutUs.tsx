
import { useEffect } from 'react';
import { Users, Target, Heart, Award, Globe, Rocket, Shield, Star } from 'lucide-react';
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
      description: 'We maintain the highest standards in trainer vetting and quality assurance to ensure exceptional learning experiences.'
    },
    {
      icon: Heart,
      title: 'Human Connection',
      description: 'Technology is powerful, but human expertise and mentorship make the difference between learning and mastering.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Breaking down geographical barriers to connect world-class expertise with learners everywhere.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Building secure, reliable platforms where learners and trainers can focus on what matters most - growth.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      description: 'Former tech lead at Google with 15 years in EdTech innovation.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      description: 'Ex-Microsoft architect specializing in scalable learning platforms.'
    },
    {
      name: 'Dr. Aisha Patel',
      role: 'Head of Learning Experience',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      description: 'PhD in Educational Psychology with expertise in adult learning methodologies.'
    },
    {
      name: 'David Thompson',
      role: 'VP of Trainer Success',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      description: 'Former training director at AWS, passionate about educator empowerment.'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Expert Trainers', icon: Users },
    { number: '50+', label: 'Technologies', icon: Rocket },
    { number: '98%', label: 'Success Rate', icon: Star },
    { number: '75+', label: 'Countries', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-techblue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-techblue-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-purple-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Empowering the Future of 
            <span className="bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent"> Tech Education</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            We're on a mission to democratize access to world-class technology training by connecting 
            passionate learners with expert instructors who've walked the path to mastery.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/trainers')}
              className="bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              Meet Our Trainers
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-techblue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story: Born from <span className="text-gradient">Real Experience</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  It started with a simple frustration. As tech professionals ourselves, we watched countless 
                  talented individuals struggle to bridge the gap between theoretical knowledge and real-world 
                  application. Traditional education was falling short, and the industry was moving too fast 
                  for conventional approaches.
                </p>
                <p>
                  We realized that the most effective learning happens when experienced practitioners share 
                  their hard-earned insights directly with those eager to grow. Not through pre-recorded 
                  videos or generic courses, but through personalized, hands-on mentorship.
                </p>
                <p>
                  That's how Skilloop.io was born - a platform where real expertise meets genuine curiosity, 
                  where learning is personal, practical, and transformational.
                </p>
              </div>
            </div>
            <div className="animate-scale-in">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-gradient">Core Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide every decision we make and every relationship we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={value.title} className="text-center border-0 shadow-lg card-hover animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
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

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-gradient">Leadership Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate technologists and educators united by a vision to transform learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={member.name} className="text-center border-0 shadow-lg card-hover animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-techblue-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-techblue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Award className="w-16 h-16 mx-auto mb-8 opacity-80" />
            <h2 className="text-4xl font-bold mb-6 animate-fade-in">Our Mission</h2>
            <p className="text-2xl font-light leading-relaxed mb-8 animate-fade-in opacity-90" style={{ animationDelay: '0.2s' }}>
              "To bridge the gap between technological innovation and human potential by creating 
              meaningful connections between expert practitioners and passionate learners worldwide."
            </p>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-techblue-600 px-8 py-3 text-lg"
              >
                Join Our Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of learners who are already transforming their careers with expert-led training
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/trainers')}
              className="bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Find a Trainer
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/apply-trainer')}
              className="border-2 border-techblue-600 text-techblue-600 hover:bg-techblue-600 hover:text-white px-8 py-3"
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
