import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider"
import { Star, MapPin, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TrainerSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');
  const [specializationFilter, setSpecializationFilter] = useState(searchParams.get('specialization') || 'all');
  const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') || 'all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (sortBy) params.set('sort', sortBy);
    else params.delete('sort');
    if (locationFilter !== 'all') params.set('location', locationFilter);
    else params.delete('location');
    if (specializationFilter !== 'all') params.set('specialization', specializationFilter);
    else params.delete('specialization');
    if (ratingFilter !== 'all') params.set('rating', ratingFilter);
    else params.delete('rating');
    setSearchParams(params);
  }, [sortBy, locationFilter, specializationFilter, ratingFilter, setSearchParams, searchParams]);

  const { data: trainers = [], isLoading, error } = useQuery({
    queryKey: ['trainers', searchParams, sortBy, locationFilter, specializationFilter, ratingFilter, priceRange],
    queryFn: async () => {
      console.log('Fetching trainers with filters:', { 
        searchParams, 
        sortBy, 
        locationFilter, 
        specializationFilter, 
        ratingFilter, 
        priceRange 
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
        .eq('status', 'approved'); // Show all approved trainers regardless of tags

      // Apply search filters
      if (searchParams) {
        query = query.or(`title.ilike.%${searchParams}%,specialization.ilike.%${searchParams}%,skills.cs.{${searchParams}}`);
      }

      if (locationFilter && locationFilter !== 'all') {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (specializationFilter && specializationFilter !== 'all') {
        query = query.ilike('specialization', `%${specializationFilter}%`);
      }

      if (ratingFilter && ratingFilter !== 'all') {
        const minRating = parseFloat(ratingFilter);
        query = query.gte('rating', minRating);
      }

      if (priceRange.length === 2) {
        query = query.gte('hourly_rate', priceRange[0]).lte('hourly_rate', priceRange[1]);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'price_low':
          query = query.order('hourly_rate', { ascending: true });
          break;
        case 'price_high':
          query = query.order('hourly_rate', { ascending: false });
          break;
        case 'experience':
          query = query.order('experience_years', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Featured trainers first, then by rating
          query = query.order('rating', { ascending: false }).order('total_reviews', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      console.log('Trainers data:', data);

      // Sort to prioritize featured trainers if default sort
      if (sortBy === 'featured' || !sortBy) {
        return (data || []).sort((a, b) => {
          const aFeatured = a.tags?.includes('Featured') ? 1 : 0;
          const bFeatured = b.tags?.includes('Featured') ? 1 : 0;
          
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
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleViewProfile = (trainerId: string) => {
    window.location.href = `/trainer/${trainerId}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Card>
                  <CardContent>
                    <p>Loading filters...</p>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-3">
                <Card>
                  <CardContent>
                    <p>Loading trainers...</p>
                  </CardContent>
                </Card>
              </div>
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
          {/* Header and Search */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Trainer</h1>
              <p className="text-gray-500">Explore our expert trainers and enhance your skills</p>
            </div>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search by title, specialization, or skills"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <Button onClick={handleSearch} className="rounded-l-none">
                Search
              </Button>
            </div>
          </div>

          {/* Filters and Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filters Section */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Sort By</h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Featured" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Featured</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="price_low">Price (Low to High)</SelectItem>
                        <SelectItem value="price_high">Price (High to Low)</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Location</h2>
                    <Input
                      type="text"
                      placeholder="Enter location"
                      value={locationFilter === 'all' ? '' : locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="mb-2"
                    />
                    <Button variant="outline" onClick={() => setLocationFilter('all')} className="w-full">
                      Clear Location
                    </Button>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Specialization</h2>
                    <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Specializations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        {/* Add more specializations as needed */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Rating</h2>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="4.5">4.5 & Up</SelectItem>
                        <SelectItem value="4.0">4.0 & Up</SelectItem>
                        <SelectItem value="3.5">3.5 & Up</SelectItem>
                        {/* Add more rating options as needed */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Price Range</h2>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 500]}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setPriceRange(value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trainers Grid Section */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainers.map((trainer) => (
                  <Card key={trainer.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="w-12 h-12 rounded-full mr-4">
                          {trainer.profiles?.avatar_url ? (
                            <AvatarImage src={trainer.profiles.avatar_url} alt={trainer.profiles?.full_name || 'Trainer'} />
                          ) : (
                            <AvatarFallback>{trainer.profiles?.full_name?.substring(0, 2) || 'TR'}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{trainer.profiles?.full_name || 'N/A'}</h3>
                          <p className="text-gray-600">{trainer.title}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-700">{trainer.specialization}</p>
                        <div className="flex items-center mt-2">
                          {renderStars(trainer.rating || 0)}
                          <span className="text-gray-500 ml-2">({trainer.total_reviews || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">${trainer.hourly_rate}/hr</span>
                        </div>
                        <Button onClick={() => handleViewProfile(trainer.id)}>View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TrainerSearch;
