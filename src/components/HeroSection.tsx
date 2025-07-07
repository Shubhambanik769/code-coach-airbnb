
import SearchButton from '@/components/SearchButton';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] bg-gradient-to-br from-techblue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Subtle background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-techblue-200 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-purple-200 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-12 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 sm:pt-32 lg:pt-40 pb-20 sm:pb-24">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-xl text-gray-900 mb-8 max-w-4xl mx-auto">
            Master Technology with <span className="text-gradient">Expert-Led Training</span>
          </h1>
          <p className="body-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Connect with world-class technology trainers who deliver personalized learning experiences. 
            From cutting-edge frameworks to enterprise solutions.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto p-8 glass-effect animate-scale-in border-0 shadow-2xl">
          <SearchButton />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-20 animate-fade-in">
          {[
            { number: "2,500+", label: "Expert Trainers" },
            { number: "50+", label: "Technologies" },
            { number: "98%", label: "Success Rate" },
            { number: "24/7", label: "Support" }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-techblue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-gray-600 text-sm sm:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
