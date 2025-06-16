
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Star, Users, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import TrainerCard from '@/components/TrainerCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['search-trainers', searchQuery, location, sortBy, priceRange, experienceLevel],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles!fk_trainers_user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`);
      }

      if (location && location !== 'all') {
        query = query.ilike('location', `%${location}%`);
      }

      if (priceRange === 'low') {
        query = query.lte('hourly_rate', 50);
      } else if (priceRange === 'medium') {
        query = query.gte('hourly_rate', 51).lte('hourly_rate', 100);
      } else if (priceRange === 'high') {
        query = query.gte('hourly_rate', 101);
      }

      if (experienceLevel === 'junior') {
        query = query.lte('experience_years', 3);
      } else if (experienceLevel === 'mid') {
        query = query.gte('experience_years', 4).lte('experience_years', 7);
      } else if (experienceLevel === 'senior') {
        query = query.gte('experience_years', 8);
      }

      if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('hourly_rate', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('hourly_rate', { ascending: false });
      } else if (sortBy === 'experience') {
        query = query.order('experience_years', { ascending: false });
      } else if (sortBy === 'reviews') {
        query = query.order('total_reviews', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setSortBy('rating');
    setPriceRange('all');
    setExperienceLevel('all');
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Enhanced Search Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Search Bar */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex flex-1 gap-4 w-full">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search skills, technologies, trainers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="relative flex-1 max-w-md">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Location or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Button onClick={handleSearch} className="bg-techblue-600 hover:bg-techblue-700 h-12 px-6">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviewed</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">$0 - $50</SelectItem>
                  <SelectItem value="medium">$51 - $100</SelectItem>
                  <SelectItem value="high">$100+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="junior">Junior (0-3 years)</SelectItem>
                  <SelectItem value="mid">Mid (4-7 years)</SelectItem>
                  <SelectItem value="senior">Senior (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters} className="text-sm">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Trainers'}
          </h1>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${trainers.length} trainers found`}
            {location && ` in ${location}`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg h-80 shadow-lg"></div>
              </div>
            ))}
          </div>
        ) : trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or removing some filters</p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
