
import { Receipt, Users, Briefcase, Shield } from 'lucide-react';

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Receipt,
      title: "Transparent pricing",
      description: "See fixed prices before you book. No hidden charges.",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Experts only",
      description: "Our professionals are well trained and have on-job expertise.",
      color: "text-blue-500"
    },
    {
      icon: Briefcase,
      title: "Fully equipped",
      description: "We bring everything needed to get the job done well.",
      color: "text-orange-500"
    },
    {
      icon: Shield,
      title: "100% Quality Assured",
      description: "If you don't love our service, we will make it right.",
      color: "text-blue-500"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Urban Company?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 ${benefit.color} mb-6`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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

export default WhyChooseUs;
