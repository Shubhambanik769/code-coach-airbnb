
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import TrainerCard from '@/components/TrainerCard';
import { useCurrency } from '@/contexts/CurrencyContext';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [experienceFilter, setExperienceFilter] = useState('');
  const { convertPrice } = useCurrency();

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const loc = params.get('location') || '';
    const cat = params.get('category') || '';
    const exp = params.get('experience') || '';
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    
    setSearchTerm(query);
    setLocationFilter(loc);
    setCategoryFilter(cat);
    setExperienceFilter(exp);
    if (minPriceParam) setMinPrice(parseInt(minPriceParam));
    if (maxPriceParam) setMaxPrice(parseInt(maxPriceParam));
  }, [location.search]);

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['search-trainers', searchTerm, locationFilter, categoryFilter, sortBy, minPrice, maxPrice, experienceFilter],
    queryFn: async () => {
      console.log('Searching trainers with:', { 
        searchTerm, locationFilter, categoryFilter, sortBy, minPrice, maxPrice, experienceFilter 
      });
      
      let query = supabase
        .from('trainers')
        .select('*')
        .eq('status', 'approved'); // Only show approved trainers

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%,skills.cs.{${searchTerm}},bio.ilike.%${searchTerm}%`);
      }

      // Apply location filter
      if (locationFilter && locationFilter !== 'Remote') {
        query = query.or(`location.ilike.%${locationFilter}%,location.ilike.%Remote%`);
      } else if (locationFilter === 'Remote') {
        query = query.ilike('location', '%Remote%');
      }

      // Apply category filter
      if (categoryFilter) {
        query = query.or(`specialization.ilike.%${categoryFilter}%,skills.cs.{${categoryFilter}}`);
      }

      // Apply price range filter
      if (minPrice > 0) {
        query = query.gte('hourly_rate', minPrice);
      }
      if (maxPrice < 200) {
        query = query.lte('hourly_rate', maxPrice);
      }

      // Apply experience filter
      if (experienceFilter) {
        query = query.gte('experience_years', parseInt(experienceFilter));
      }

      const { data: trainersData, error } = await query;
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      console.log('Found trainers:', trainersData?.length);

      // Get trainer profiles and comprehensive feedback data
      const userIds = [...new Set(trainersData?.map(t => t.user_id) || [])];
      const trainerIds = [...new Set(trainersData?.map(t => t.id) || [])];
      
      const [profilesResult, reviewsResult, feedbackResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds),
        supabase.from('reviews').select('trainer_id, rating, would_recommend').in('trainer_id', trainerIds),
        supabase.from('feedback_responses')
          .select(`
            rating,
            would_recommend,
            feedback_links!inner(
              booking_id,
              bookings!inner(trainer_id)
            )
          `)
          .in('feedback_links.bookings.trainer_id', trainerIds)
      ]);

      // Process trainers with comprehensive data
      const processedTrainers = await Promise.all(trainersData?.map(async (trainer) => {
        const profile = profilesResult.data?.find(p => p.id === trainer.user_id);
        const trainerReviews = reviewsResult.data?.filter(r => r.trainer_id === trainer.id) || [];
        const trainerFeedback = feedbackResult.data?.filter(
          fr => fr.feedback_links?.bookings?.trainer_id === trainer.id
        ) || [];

        // Combine all ratings
        const allRatings = [
          ...trainerReviews.map(r => r.rating),
          ...trainerFeedback.map(f => f.rating)
        ];

        // Calculate comprehensive stats
        const avgRating = allRatings.length > 0 
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
          : 0;

        const totalReviews = allRatings.length;

        // Update the trainer's rating in the database for consistency
        if (totalReviews > 0) {
          await supabase
            .from('trainers')
            .update({
              rating: Number(avgRating.toFixed(1)),
              total_reviews: totalReviews
            })
            .eq('id', trainer.id);
        }

        return {
          ...trainer,
          profiles: profile,
          rating: Number(avgRating.toFixed(1)),
          total_reviews: totalReviews
        };
      }) || []);

      console.log('Processed trainers with ratings:', processedTrainers);

      // Apply sorting
      return processedTrainers.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'price_low':
            return (a.hourly_rate || 0) - (b.hourly_rate || 0);
          case 'price_high':
            return (b.hourly_rate || 0) - (a.hourly_rate || 0);
          case 'experience':
            return (b.experience_years || 0) - (a.experience_years || 0);
          case 'reviews':
            return (b.total_reviews || 0) - (a.total_reviews || 0);
          default:
            return 0;
        }
      });
    }
  });

  const handleTrainerSelect = (trainerId: string) => {
    console.log('Navigating to trainer profile:', trainerId);
    navigate(`/trainer/${trainerId}`);
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    const params = new URLSearchParams();
    if (newSearchTerm) params.set('q', newSearchTerm);
    if (locationFilter) params.set('location', locationFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (experienceFilter) params.set('experience', experienceFilter);
    if (minPrice > 0) params.set('minPrice', minPrice.toString());
    if (maxPrice < 200) params.set('maxPrice', maxPrice.toString());
    navigate(`/search?${params.toString()}`);
  };

  const getSearchTitle = () => {
    const filters = [searchTerm, locationFilter, categoryFilter].filter(Boolean);
    if (filters.length === 0) return 'All Trainers';
    return `Results for: ${filters.join(', ')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getSearchTitle()}
        </h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Refine your search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">Any Location</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="Toronto">Toronto</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || locationFilter || categoryFilter || experienceFilter || minPrice > 0 || maxPrice < 200) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Search: {searchTerm}
              </Badge>
            )}
            {locationFilter && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Location: {locationFilter}
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Category: {categoryFilter}
              </Badge>
            )}
            {experienceFilter && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Experience: {experienceFilter}+ years
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : trainers && trainers.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Found {trainers.length} trainer{trainers.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                onSelect={handleTrainerSelect}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Trainers Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center py-8">
              No trainers found matching your criteria. Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
