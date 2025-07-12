import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  icon_name: string;
}

const Services = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleBookService = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      navigate(`/book/${category.slug}?location=${encodeURIComponent(location)}&teamSize=${teamSize}&duration=${duration}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24">
        {/* Location Header */}
        <section className="bg-white py-8 border-b">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              <span>Services in {location || 'Your City'}</span>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Change location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 people</SelectItem>
                  <SelectItem value="6-15">6-15 people</SelectItem>
                  <SelectItem value="16-30">16-30 people</SelectItem>
                  <SelectItem value="30+">30+ people</SelectItem>
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half-day">Half day (4 hours)</SelectItem>
                  <SelectItem value="full-day">Full day (8 hours)</SelectItem>
                  <SelectItem value="2-days">2 days</SelectItem>
                  <SelectItem value="week">1 week</SelectItem>
                  <SelectItem value="custom">Custom duration</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-12 bg-primary hover:bg-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Training Services
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Flexible timing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Team training</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{category.base_price?.toLocaleString()}
                        </span>
                        <span className="text-gray-600 text-sm ml-1">starting price</span>
                      </div>
                      <Button 
                        onClick={() => handleBookService(category.id)}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;