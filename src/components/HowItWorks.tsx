
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
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            How <span className="text-gradient">Skilloop.io</span> Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Get started with expert IT training in just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.title} 
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Connection Line - Hidden on mobile */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 sm:top-16 left-full w-full h-0.5 bg-gradient-to-r from-techblue-200 to-purple-200 transform -translate-x-4 z-0"></div>
                )}

                {/* Step Number */}
                <div className="relative mb-4 sm:mb-6">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 z-10 relative`}>
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full border-3 sm:border-4 border-techblue-500 flex items-center justify-center text-techblue-600 font-bold text-xs sm:text-sm z-10">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base px-2">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-r from-techblue-50 to-purple-50 rounded-2xl mx-4 sm:mx-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ready to upskill your team?
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of companies that trust Skilloop.io for their technology training needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="px-6 sm:px-8 py-3 bg-gradient-to-r from-techblue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
              Get Started Now
            </button>
            <button className="px-6 sm:px-8 py-3 border-2 border-techblue-600 text-techblue-600 font-semibold rounded-lg hover:bg-techblue-600 hover:text-white transition-all duration-300 text-sm sm:text-base">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
