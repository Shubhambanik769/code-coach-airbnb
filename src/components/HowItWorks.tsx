
import { Receipt, Users, Briefcase, Shield } from 'lucide-react';

const HowItWorks = () => {
  const benefits = [{
    icon: Receipt,
    title: "Transparent pricing",
    description: "See fixed prices before you book. No hidden charges.",
    color: "text-orange-500"
  }, {
    icon: Users,
    title: "Experts only",
    description: "Our professionals are well trained and have on-job expertise.",
    color: "text-blue-500"
  }, {
    icon: Briefcase,
    title: "Fully equipped",
    description: "We bring everything needed to get the job done well.",
    color: "text-orange-500"
  }, {
    icon: Shield,
    title: "100% Quality Assured",
    description: "If you don't love our service, we will make it right.",
    color: "text-blue-500"
  }];

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why choose us?
          </h2>
          <p className="text-lg text-gray-600">
            We provide quality training services with complete transparency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
