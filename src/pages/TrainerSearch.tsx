
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider"
import { Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrainerCard from '@/components/TrainerCard';

const TrainerSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [specializationFilter, setSpecializationFilter] = useState(searchParams.get('specialization') || 'all');
  const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') || 'all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]); // Updated for INR
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    if (locationFilter) params.set('location', locationFilter);
    if (specializationFilter && specializationFilter !== 'all') params.set('specialization', specializationFilter);
    if (ratingFilter && ratingFilter !== 'all') params.set('rating', ratingFilter);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  }, [sortBy, locationFilter, specializationFilter, ratingFilter, searchTerm, setSearchParams]);

  const { data: trainers = [], isLoading, error } = useQuery({
    queryKey: ['trainers', sortBy, locationFilter, specializationFilter, ratingFilter, priceRange, searchTerm],
    queryFn: async () => {
      console.log('Fetching trainers with filters:', { 
        sortBy, 
        locationFilter, 
        specializationFilter, 
        ratingFilter, 
        priceRange,
        searchTerm
      });

      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved');

      // Apply search term filter only if provided
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
      }

      // Apply location filter only if provided
      if (locationFilter && locationFilter.trim()) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      // Apply specialization filter only if not 'all'
      if (specializationFilter && specializationFilter !== 'all') {
        query = query.ilike('specialization', `%${specializationFilter}%`);
      }

      // Apply rating filter only if not 'all'
      if (ratingFilter && ratingFilter !== 'all') {
        const minRating = parseFloat(ratingFilter);
        query = query.gte('rating', minRating);
      }

      // Apply price range filter
      if (priceRange.length === 2 && priceRange[0] > 0) {
        query = query.gte('hourly_rate', priceRange[0]).lte('hourly_rate', priceRange[1]);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'price_low':
          query = query.order('hourly_rate', { ascending: true, nullsFirst: false });
          break;
        case 'price_high':
          query = query.order('hourly_rate', { ascending: false, nullsFirst: false });
          break;
        case 'experience':
          query = query.order('experience_years', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Featured trainers first, then by rating
          query = query.order('rating', { ascending: false, nullsFirst: false }).order('total_reviews', { ascending: false, nullsFirst: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      console.log('Trainers data:', data);

      // Post-query sorting for featured trainers
      if (sortBy === 'featured') {
        return (data || []).sort((a, b) => {
          const aFeatured = Array.isArray(a.tags) && a.tags.includes('Featured') ? 1 : 0;
          const bFeatured = Array.isArray(b.tags) && b.tags.includes('Featured') ? 1 : 0;
          
          if (aFeatured !== bFeatured) {
            return bFeatured - aFeatured;
          }
          
          return (b.rating || 0) - (a.rating || 0);
        });
      }

      return data || [];
    }
  });

  const handleSearch = () => {
    // Search is now handled by the useEffect hook
  };

  const clearAllFilters = () => {
    setSortBy('featured');
    setLocationFilter('');
    setSpecializationFilter('all');
    setRatingFilter('all');
    setPriceRange([0, 10000]);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Trainer</h1>
              <p className="text-gray-500">Loading trainers...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Trainer</h1>
              <p className="text-red-500">Error: {error.message}</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Trainer</h1>
            <p className="text-gray-500">Explore our expert trainers and enhance your skills</p>
          </div>

          {/* Vertical Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by name, title, or specialization"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    type="text"
                    placeholder="Any location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any specialization</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5 & Up</SelectItem>
                      <SelectItem value="4.0">4.0 & Up</SelectItem>
                      <SelectItem value="3.5">3.5 & Up</SelectItem>
                      <SelectItem value="3.0">3.0 & Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Featured" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="price_low">Price (Low to High)</SelectItem>
                      <SelectItem value="price_high">Price (High to Low)</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} per hour
                </label>
                <Slider
                  defaultValue={[0, 10000]}
                  max={20000}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              {trainers.length} trainer{trainers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Trainers Grid */}
          {trainers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 text-lg">No trainers found matching your criteria.</p>
                <Button onClick={clearAllFilters} className="mt-4">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  trainer={{
                    id: trainer.id,
                    name: trainer.name,
                    title: trainer.title,
                    specialization: trainer.specialization,
                    location: trainer.location,
                    hourly_rate: trainer.hourly_rate,
                    rating: trainer.rating,
                    total_reviews: trainer.total_reviews,
                    bio: trainer.bio,
                    skills: trainer.skills,
                    experience_years: trainer.experience_years,
                    tags: trainer.tags,
                    profiles: trainer.profiles
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TrainerSearch;
