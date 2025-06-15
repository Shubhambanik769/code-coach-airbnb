
import { Search, MessageCircle, Calendar, Award } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse our extensive network of certified IT trainers based on technology, location, and expertise level.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: MessageCircle,
    title: 'Connect & Discuss',
    description: 'Message trainers directly to discuss your training needs, timeline, and custom curriculum requirements.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Calendar,
    title: 'Book & Schedule',
    description: 'Schedule training sessions that fit your team\'s schedule. Choose from in-person, remote, or hybrid options.',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Award,
    title: 'Learn & Grow',
    description: 'Get hands-on training with real-world projects, certification preparation, and ongoing support.',
    color: 'from-orange-500 to-red-500'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How <span className="text-gradient">TechTrainer</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with expert IT training in just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.title} 
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-techblue-200 to-purple-200 transform -translate-x-4 z-0"></div>
                )}

                {/* Step Number */}
                <div className="relative mb-6">
                  <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 z-10 relative`}>
                    <IconComponent className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-techblue-500 flex items-center justify-center text-techblue-600 font-bold text-sm z-10">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-techblue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to upskill your team?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of companies that trust TechTrainer for their technology training needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-techblue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Get Started Now
            </button>
            <button className="px-8 py-3 border-2 border-techblue-600 text-techblue-600 font-semibold rounded-lg hover:bg-techblue-600 hover:text-white transition-all duration-300">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
