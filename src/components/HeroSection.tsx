
import SearchButton from '@/components/SearchButton';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] bg-gradient-to-br from-techblue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-techblue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-12 h-12 sm:w-20 sm:h-20 bg-purple-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-pink-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Transform Learning with <span className="bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent">Skilloop.io</span><br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Expert-Led Training Solutions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
            Connect with world-class technology trainers who deliver personalized learning experiences. 
            From cutting-edge frameworks to enterprise solutions - we've got you covered.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto p-6 shadow-2xl bg-white/95 backdrop-blur-sm animate-scale-in glow-effect">
          <SearchButton />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 animate-fade-in px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-techblue-600 mb-1 sm:mb-2">2,500+</div>
            <div className="text-gray-600 text-sm sm:text-base">Expert Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-techblue-600 mb-1 sm:mb-2">50+</div>
            <div className="text-gray-600 text-sm sm:text-base">Technologies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-techblue-600 mb-1 sm:mb-2">98%</div>
            <div className="text-gray-600 text-sm sm:text-base">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-techblue-600 mb-1 sm:mb-2">24/7</div>
            <div className="text-gray-600 text-sm sm:text-base">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
