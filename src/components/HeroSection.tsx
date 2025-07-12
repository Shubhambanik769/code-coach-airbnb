
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (location.trim()) {
      navigate(`/services?location=${encodeURIComponent(location)}&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Professional B2B Training
            <br />
            <span className="text-primary">at your office</span>
          </h1>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Book verified trainers for your team. Get instant quotes and flexible scheduling.
          </p>

          {/* Location-first search */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-12">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter your city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for training services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 rounded-xl"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Happy Clients" },
              { number: "2K+", label: "Expert Trainers" },
              { number: "50+", label: "Technologies" },
              { number: "4.8★", label: "Average Rating" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
