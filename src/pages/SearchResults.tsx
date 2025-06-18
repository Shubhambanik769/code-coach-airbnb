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
  const [locationFilter, setLocationFilter] = useState('any');
  const [categoryFilter, setCategoryFilter] = useState('any');
  const [sortBy, setSortBy] = useState('rating');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [experienceFilter, setExperienceFilter] = useState('any');
  const { convertPrice } = useCurrency();

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const loc = params.get('location') || 'any';
    const cat = params.get('category') || 'any';
    const exp = params.get('experience') || 'any';
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    
    setSearchTerm(query);
    setLocationFilter(loc);
    setCategoryFilter(cat);
    setExperienceFilter(exp);
    if (minPriceParam) setMinPrice(parseInt(minPriceParam));
    if (maxPriceParam) setMaxPrice(parseInt(maxPriceParam));
  }, [location.search]);

  // Enhanced search matching function
  const createSearchableText = (trainer: any) => {
    const searchableFields = [
      trainer.name,
      trainer.title,
      trainer.specialization,
      trainer.bio,
      trainer.location,
      ...(trainer.skills || []),
      ...(trainer.tags || []),
      // Add profile name if available
      trainer.profiles?.full_name,
      // Add common tech keywords
      'aws', 'solution', 'architect', 'cloud', 'computing'
    ].filter(Boolean);
    
    return searchableFields.join(' ').toLowerCase();
  };

  // Improved search term matching with better keyword detection
  const matchesSearchTerm = (trainer: any, searchTerm: string) => {
    if (!searchTerm) return true;
    
    const searchableText = createSearchableText(trainer);
    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    
    return searchWords.some(word => {
      // Direct substring match
      if (searchableText.includes(word)) return true;
      
      // Check for common abbreviations and variations
      const variations = getSearchVariations(word);
      return variations.some(variation => searchableText.includes(variation));
    });
  };

  // Get search variations for better matching
  const getSearchVariations = (word: string) => {
    const variations = [word];
    
    // Common tech abbreviations and variations
    const techMappings: { [key: string]: string[] } = {
      'aws': ['amazon web services', 'amazon', 'cloud', 'solution architect'],
      'gcp': ['google cloud platform', 'google cloud'],
      'azure': ['microsoft azure', 'microsoft cloud'],
      'k8s': ['kubernetes'],
      'js': ['javascript'],
      'ts': ['typescript'],
      'react': ['reactjs', 'react.js'],
      'node': ['nodejs', 'node.js'],
      'ml': ['machine learning'],
      'ai': ['artificial intelligence'],
      'devops': ['dev ops', 'development operations']
    };
    
    if (techMappings[word]) {
      variations.push(...techMappings[word]);
    }
    
    return variations;
  };

  const { data: trainers, isLoading, error } = useQuery({
    queryKey: ['search-trainers', searchTerm, locationFilter, categoryFilter, sortBy, minPrice, maxPrice, experienceFilter],
    queryFn: async () => {
      console.log('Searching trainers with:', { 
        searchTerm, locationFilter, categoryFilter, sortBy, minPrice, maxPrice, experienceFilter 
      });
      
      // Query trainers with proper foreign key reference - accessible to all users
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles!fk_trainers_user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved');

      // Apply location filter
      if (locationFilter && locationFilter !== 'any') {
        if (locationFilter === 'Remote') {
          query = query.ilike('location', '%Remote%');
        } else {
          query = query.or(`location.ilike.%${locationFilter}%,location.ilike.%Remote%`);
        }
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== 'any') {
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
      if (experienceFilter && experienceFilter !== 'any') {
        query = query.gte('experience_years', parseInt(experienceFilter));
      }

      const { data: trainersData, error } = await query;
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      console.log('Raw trainers data:', trainersData?.length || 0);

      if (!trainersData || trainersData.length === 0) {
        return [];
      }

      // Apply search term filtering client-side for better keyword matching
      let filteredTrainers = trainersData;
      if (searchTerm) {
        filteredTrainers = trainersData.filter(trainer => matchesSearchTerm(trainer, searchTerm));
        console.log(`After search term filtering: ${filteredTrainers.length} trainers`);
      }

      if (filteredTrainers.length === 0) {
        return [];
      }

      // Get trainer IDs for fetching reviews and feedback - public data accessible to all
      const trainerIds = filteredTrainers.map(t => t.id);
      
      // Fetch reviews and feedback in parallel - both accessible to public
      const [reviewsResult, feedbackResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('trainer_id, rating, would_recommend')
          .in('trainer_id', trainerIds),
        supabase
          .from('feedback_responses')
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

      if (reviewsResult.error) {
        console.error('Error fetching reviews:', reviewsResult.error);
      }
      if (feedbackResult.error) {
        console.error('Error fetching feedback:', feedbackResult.error);
      }

      // Process trainers with comprehensive rating data
      const processedTrainers = filteredTrainers.map((trainer) => {
        const trainerReviews = reviewsResult.data?.filter(r => r.trainer_id === trainer.id) || [];
        const trainerFeedback = feedbackResult.data?.filter(
          fr => fr.feedback_links?.bookings?.trainer_id === trainer.id
        ) || [];

        // Combine all ratings
        const allRatings = [
          ...trainerReviews.map(r => r.rating).filter(r => r != null),
          ...trainerFeedback.map(f => f.rating).filter(r => r != null)
        ];

        // Calculate comprehensive stats
        const avgRating = allRatings.length > 0 
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
          : 0;

        const totalReviews = allRatings.length;

        // Fix the profiles structure
        const profileData = Array.isArray(trainer.profiles) 
          ? trainer.profiles[0] 
          : trainer.profiles;

        return {
          ...trainer,
          rating: Number(avgRating.toFixed(1)),
          total_reviews: totalReviews,
          profiles: profileData ? {
            avatar_url: profileData.avatar_url,
            full_name: profileData.full_name
          } : undefined
        };
      });

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
    if (locationFilter && locationFilter !== 'any') params.set('location', locationFilter);
    if (categoryFilter && categoryFilter !== 'any') params.set('category', categoryFilter);
    if (experienceFilter && experienceFilter !== 'any') params.set('experience', experienceFilter);
    if (minPrice > 0) params.set('minPrice', minPrice.toString());
    if (maxPrice < 200) params.set('maxPrice', maxPrice.toString());
    navigate(`/search?${params.toString()}`);
  };

  const getSearchTitle = () => {
    const filters = [searchTerm, locationFilter !== 'any' ? locationFilter : '', categoryFilter !== 'any' ? categoryFilter : ''].filter(Boolean);
    if (filters.length === 0) return 'All Trainers';
    return `Results for: ${filters.join(', ')}`;
  };

  const getSuggestedKeywords = () => {
    if (!trainers || trainers.length === 0) return [];
    
    // Extract popular keywords from all trainers
    const keywords = new Set<string>();
    trainers.forEach(trainer => {
      if (trainer.skills) trainer.skills.forEach((skill: string) => keywords.add(skill));
      if (trainer.specialization) keywords.add(trainer.specialization);
      if (trainer.tags) trainer.tags.forEach((tag: string) => keywords.add(tag));
    });
    
    return Array.from(keywords).slice(0, 8);
  };

  if (error) {
    console.error('Search error:', error);
  }

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
              placeholder="Search by skills, expertise, name, or technology..."
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
                <SelectItem value="any">Any Location</SelectItem>
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
                <SelectItem value="any">All Categories</SelectItem>
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

        {/* Suggested Keywords */}
        {!searchTerm && getSuggestedKeywords().length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
            <div className="flex flex-wrap gap-2">
              {getSuggestedKeywords().map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSearch(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(searchTerm || (locationFilter && locationFilter !== 'any') || (categoryFilter && categoryFilter !== 'any') || (experienceFilter && experienceFilter !== 'any') || minPrice > 0 || maxPrice < 200) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Search: {searchTerm}
              </Badge>
            )}
            {locationFilter && locationFilter !== 'any' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Location: {locationFilter}
              </Badge>
            )}
            {categoryFilter && categoryFilter !== 'any' && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Category: {categoryFilter}
              </Badge>
            )}
            {experienceFilter && experienceFilter !== 'any' && (
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
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No trainers found matching your criteria. Try:
              </p>
              <ul className="text-gray-500 text-sm space-y-1 mb-6">
                <li>• Using different keywords (e.g., "AWS", "Cloud", "Solution Architect")</li>
                <li>• Removing some filters</li>
                <li>• Checking spelling</li>
                <li>• Using broader search terms</li>
              </ul>
              {getSuggestedKeywords().length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getSuggestedKeywords().slice(0, 5).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => handleSearch(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
