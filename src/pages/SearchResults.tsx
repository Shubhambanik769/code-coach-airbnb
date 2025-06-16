
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

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterBy, setFilterBy] = useState('all');

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
  }, [location.search]);

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['search-trainers', searchTerm, sortBy, filterBy],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select('*')
        .eq('status', 'approved');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%,skills.cs.{${searchTerm}}`);
      }

      // Apply category filter
      if (filterBy !== 'all') {
        query = query.ilike('specialization', `%${filterBy}%`);
      }

      const { data: trainersData, error } = await query;
      if (error) throw error;

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
      const processedTrainers = trainersData?.map(trainer => {
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

        return {
          ...trainer,
          profiles: profile,
          rating: Number(avgRating.toFixed(1)),
          total_reviews: totalReviews
        };
      }) || [];

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
          default:
            return 0;
        }
      });
    }
  });

  const handleTrainerSelect = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    navigate(`/search?q=${encodeURIComponent(newSearchTerm)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'All Trainers'}
        </h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trainers by name, specialization, or skills..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="weight loss">Weight Loss</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
              {searchTerm 
                ? `No trainers found matching "${searchTerm}". Try adjusting your search terms.`
                : 'No trainers available at the moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
