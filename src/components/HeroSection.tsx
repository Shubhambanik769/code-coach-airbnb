
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (location.trim()) {
      navigate(`/services?location=${encodeURIComponent(location)}`);
    }
  };

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
  ];

  return (
    <section 
      className="relative min-h-[600px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')`
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex items-center min-h-[500px]">
          <div className="w-full lg:w-1/2 text-white">
            <div className="mb-6">
              <span className="text-sm font-medium tracking-widest uppercase opacity-90">
                TRAINING COMPANY
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Quality training services, on demand
            </h1>
            
            <p className="text-xl mb-12 opacity-90 leading-relaxed max-w-md">
              Experienced, hand-picked Professionals to serve you at your doorstep
            </p>

            {/* Location selector */}
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-gray-900 font-semibold mb-4">
                Where do you need a service?
              </h3>
              
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 text-gray-600">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {location && (
                <button
                  onClick={handleSearch}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
