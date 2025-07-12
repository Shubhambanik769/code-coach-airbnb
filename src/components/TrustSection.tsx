
import { Star, Award, Users, CheckCircle } from 'lucide-react';

const TrustSection = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Happy Students',
      description: 'Professionals trained successfully'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: 'Average Rating',
      description: 'Based on 2,500+ reviews'
    },
    {
      icon: Award,
      value: '500+',
      label: 'Expert Trainers',
      description: 'Certified industry professionals'
    },
    {
      icon: CheckCircle,
      value: '95%',
      label: 'Success Rate',
      description: 'Career advancement achieved'
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who have advanced their careers through our expert-led training programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
