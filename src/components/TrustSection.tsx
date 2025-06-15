
import { Shield, Award, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Verified Trainers',
    description: 'All trainers are background-checked and certified professionals',
    stat: '100%'
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Money-back guarantee if you\'re not satisfied with the training',
    stat: '30-day'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for all your training needs',
    stat: '24/7'
  },
  {
    icon: Users,
    title: 'Trusted by Companies',
    description: 'Over 500 companies trust us for their training requirements',
    stat: '500+'
  }
];

const companies = [
  { name: 'Google', logo: 'G' },
  { name: 'Microsoft', logo: 'M' },
  { name: 'Amazon', logo: 'A' },
  { name: 'Apple', logo: 'A' },
  { name: 'Meta', logo: 'F' },
  { name: 'Netflix', logo: 'N' }
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Companies <span className="text-gradient">Trust Us</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We prioritize quality, security, and results in everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="text-center border-0 shadow-lg card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="text-3xl font-bold text-techblue-600 mb-2">
                    {feature.stat}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trusted Companies */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-600 mb-8">
            Trusted by teams at
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div 
                key={company.name} 
                className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full hover:bg-techblue-50 transition-colors duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-2xl font-bold text-gray-600">
                  {company.logo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <blockquote className="text-xl md:text-2xl font-medium text-gray-700 italic mb-6">
            "TechTrainer helped us upskill our entire development team in React and AWS. 
            The quality of trainers and personalized approach exceeded our expectations."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
              alt="CEO"
              className="w-12 h-12 rounded-full"
            />
            <div className="text-left">
              <div className="font-semibold text-gray-900">David Chen</div>
              <div className="text-gray-600 text-sm">CTO, TechFlow Inc.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
