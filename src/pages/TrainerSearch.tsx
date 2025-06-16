import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import SearchButton from '@/components/SearchButton';
import TrainerCard from '@/components/TrainerCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, Star, MapPin, DollarSign, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface Trainer {
  id: string;
  title: string;
  specialization: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  skills: string[];
  bio: string;
  location: string;
  timezone: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

const TrainerSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [specialization, setSpecialization] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState([500]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers', searchQuery, specialization, minRating, maxRate[0], sortBy],
    queryFn: async () => {
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

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`);
      }

      if (specialization) {
        query = query.ilike('specialization', `%${specialization}%`);
      }

      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      if (maxRate[0] < 500) {
        query = query.lte('hourly_rate', maxRate[0]);
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
        default:
          query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
  };

  const handleMinRatingChange = (value: number) => {
    setMinRating(value);
  };

  const handleMaxRateChange = (value: number[]) => {
    setMaxRate(value);
  };

  const handleTrainerClick = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Trainer</h1>
          <SearchButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} `}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Specialization */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialization</h4>
                  <Input
                    type="text"
                    placeholder="e.g., Weight Loss"
                    value={specialization}
                    onChange={(e) => handleSpecializationChange(e.target.value)}
                  />
                </div>

                {/* Minimum Rating */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Minimum Rating</h4>
                  <Select value={minRating.toString()} onValueChange={handleMinRatingChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="3">3 Stars & Up</SelectItem>
                      <SelectItem value="4">4 Stars & Up</SelectItem>
                      <SelectItem value="4.5">4.5 Stars & Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Hourly Rate */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Max Hourly Rate</h4>
                  <div className="flex items-center justify-between">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                  <Slider
                    defaultValue={maxRate}
                    max={500}
                    step={10}
                    onValueChange={handleMaxRateChange}
                  />
                  <div className="text-sm text-gray-500 text-right">Up to ${maxRate[0]}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading ? 'Searching...' : `${trainers.length} trainer${trainers.length !== 1 ? 's' : ''} found`}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : trainers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainers.map((trainer) => (
                  <Card key={trainer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTrainerClick(trainer.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={trainer.profiles?.avatar_url} />
                          <AvatarFallback className="bg-techblue-100 text-techblue-700 font-semibold">
                            {trainer.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {trainer.profiles?.full_name || 'Professional Trainer'}
                          </h3>
                          <p className="text-techblue-600 font-medium mb-2">{trainer.title}</p>
                          <p className="text-gray-600 text-sm mb-2">{trainer.specialization}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-gray-900">{trainer.rating}</span>
                              <span>({trainer.total_reviews})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{trainer.location || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-techblue-600">${trainer.hourly_rate}</div>
                          <div className="text-sm text-gray-500">per hour</div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {trainer.bio || 'Experienced trainer ready to help you achieve your goals.'}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {trainer.skills?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{trainer.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-techblue-600">{trainer.experience_years}+</div>
                          <div className="text-xs text-gray-500">Years</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-techblue-600">{trainer.total_reviews * 2}</div>
                          <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">98%</div>
                          <div className="text-xs text-gray-500">Success</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trainers found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSearch;
