
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import TrainerCard from '@/components/TrainerCard';

const SearchResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const { data: trainers = [], isLoading, error } = useQuery({
    queryKey: ['trainers', searchTerm, specialization, experienceLevel, priceRange, location, sortBy],
    queryFn: async () => {
      console.log('Fetching trainers with filters:', {
        searchTerm,
        specialization,
        experienceLevel,
        priceRange,
        location,
        sortBy
      });

      try {
        let query = supabase
          .from('trainers')
          .select(`
            *,
            profiles!inner(
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'approved');

        // Apply search term filter - simplified to avoid text search issues
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
        }

        // Apply specialization filter
        if (specialization) {
          query = query.ilike('specialization', `%${specialization}%`);
        }

        // Apply experience level filter
        if (experienceLevel) {
          const minExp = experienceLevel === 'junior' ? 0 : experienceLevel === 'mid' ? 3 : 7;
          const maxExp = experienceLevel === 'junior' ? 2 : experienceLevel === 'mid' ? 6 : 50;
          query = query.gte('experience_years', minExp).lte('experience_years', maxExp);
        }

        // Apply price range filter
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          if (max) {
            query = query.gte('hourly_rate', min).lte('hourly_rate', max);
          } else {
            query = query.gte('hourly_rate', min);
          }
        }

        // Apply location filter
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }

        // Apply sorting with fallback for null values
        const ascending = sortBy === 'price_low' || sortBy === 'experience_low';
        let sortColumn = 'rating';
        
        if (sortBy.includes('price')) {
          sortColumn = 'hourly_rate';
        } else if (sortBy.includes('experience')) {
          sortColumn = 'experience_years';
        }
        
        query = query.order(sortColumn, { ascending, nullsFirst: false });

        const { data, error } = await query;
        
        console.log('Trainers query result:', { data, error });
        
        if (error) {
          console.error('Database query error:', error);
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Search query failed:', err);
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on certain types of errors
      if (error?.code === 'PGRST116' || error?.message?.includes('syntax')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialization('');
    setExperienceLevel('');
    setPriceRange('');
    setLocation('');
    setSortBy('rating');
  };

  const activeFiltersCount = [searchTerm, specialization, experienceLevel, priceRange, location].filter(Boolean).length;

  // Handle error state with more specific error information
  if (error) {
    console.error('Search error details:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Search Error</h2>
              <p className="text-gray-600 mb-4">
                {(error as any)?.message || 'There was an issue loading trainers. Please try again.'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh Page
                </Button>
                <Button onClick={clearFilters} variant="secondary">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Trainer</h1>
          <p className="text-gray-600">Browse through our expert trainers and find the perfect match for your learning goals</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, title, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg py-3"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specializations</SelectItem>
                  <SelectItem value="weight loss">Weight Loss</SelectItem>
                  <SelectItem value="strength training">Strength Training</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="sports">Sports Training</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid-level (3-6 years)</SelectItem>
                  <SelectItem value="senior">Senior (7+ years)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50/hr</SelectItem>
                  <SelectItem value="50-100">$50 - $100/hr</SelectItem>
                  <SelectItem value="100-150">$100 - $150/hr</SelectItem>
                  <SelectItem value="150">$150+/hr</SelectItem>
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="los angeles">Los Angeles</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="miami">Miami</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience_high">Most Experienced</SelectItem>
                  <SelectItem value="experience_low">Least Experienced</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                    Search: {searchTerm} ×
                  </Badge>
                )}
                {specialization && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSpecialization('')}>
                    {specialization} ×
                  </Badge>
                )}
                {experienceLevel && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setExperienceLevel('')}>
                    {experienceLevel} experience ×
                  </Badge>
                )}
                {priceRange && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange('')}>
                    ${priceRange}/hr ×
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setLocation('')}>
                    {location} ×
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLoading ? 'Loading...' : `${trainers.length} trainers found`}
          </h2>
        </div>

        {/* Trainers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
            <div className="max-w-md mx-auto">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trainers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or removing some filters to see more results.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
