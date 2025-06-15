
import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  const [searchFocus, setSearchFocus] = useState('');

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
            Find Expert <span className="text-gradient">IT Trainers</span><br className="hidden sm:block" />
            <span className="sm:hidden"> </span>for Your Team
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
            Connect with certified technology trainers for personalized learning experiences. 
            From coding bootcamps to enterprise software training.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-5xl mx-auto p-4 sm:p-6 shadow-2xl bg-white/95 backdrop-blur-sm animate-scale-in glow-effect mx-4 sm:mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Technology/Skill */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Technology</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="React, Python, AWS..."
                  className="pl-10 h-11 sm:h-12 border-0 bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                  onFocus={() => setSearchFocus('tech')}
                  onBlur={() => setSearchFocus('')}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Remote or City"
                  className="pl-10 h-11 sm:h-12 border-0 bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                  onFocus={() => setSearchFocus('location')}
                  onBlur={() => setSearchFocus('')}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Duration</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="1 week, 1 month..."
                  className="pl-10 h-11 sm:h-12 border-0 bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                  onFocus={() => setSearchFocus('duration')}
                  onBlur={() => setSearchFocus('')}
                />
              </div>
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Team Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="1-10 people"
                  className="pl-10 h-11 sm:h-12 border-0 bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                  onFocus={() => setSearchFocus('team')}
                  onBlur={() => setSearchFocus('')}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex justify-center">
            <Button size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Search Trainers
            </Button>
          </div>
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
