
import SearchButton from '@/components/SearchButton';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] bg-background overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight tracking-tight">
            Master Technology with <span className="text-gradient">Expert-Led Training</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Connect with world-class technology trainers who deliver personalized learning experiences. 
            From cutting-edge frameworks to enterprise solutions - we've got you covered.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-5xl mx-auto p-8 airbnb-shadow apple-blur animate-scale-in border-0">
          <SearchButton />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-20 animate-fade-in">
          <div className="text-center group">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rose-600 mb-3 group-hover:scale-110 transition-transform duration-300">2,500+</div>
            <div className="text-muted-foreground text-base sm:text-lg font-medium">Expert Trainers</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rose-600 mb-3 group-hover:scale-110 transition-transform duration-300">50+</div>
            <div className="text-muted-foreground text-base sm:text-lg font-medium">Technologies</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rose-600 mb-3 group-hover:scale-110 transition-transform duration-300">98%</div>
            <div className="text-muted-foreground text-base sm:text-lg font-medium">Success Rate</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rose-600 mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-muted-foreground text-base sm:text-lg font-medium">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
