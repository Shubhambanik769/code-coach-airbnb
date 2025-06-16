
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Star, Clock, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

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
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const TrainerSearch = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers', searchQuery, skillFilter, locationFilter, minRating],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles!trainers_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      
      if (error) throw error;
      
      // Filter by skills if specified
      let filteredData = data || [];
      if (skillFilter) {
        filteredData = filteredData.filter(trainer => 
          trainer.skills?.some(skill => 
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          )
        );
      }
      
      return filteredData;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL params for better UX
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const viewProfile = (trainerId: string) => {
    navigate(`/trainer-profile/${trainerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-techblue-600">Trainer</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced professionals who can accelerate your learning journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by skills, specialization, or experience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Skills (e.g., React, Python)"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
              <Button type="submit" className="bg-techblue-600 hover:bg-techblue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Searching...' : `${trainers.length} trainers found`}
          </p>
        </div>

        {/* Trainer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                {/* Header with Avatar and Badge */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                        <AvatarImage src={trainer.profiles?.avatar_url} />
                        <AvatarFallback className="bg-techblue-100 text-techblue-600 text-lg font-semibold">
                          {trainer.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1">
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                          {trainer.rating >= 4.8 ? 'Top Rated' : trainer.rating >= 4.5 ? 'Expert' : 'Pro'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-techblue-600 transition-colors">
                        {trainer.profiles?.full_name || 'Professional Trainer'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">{trainer.title}</p>
                      <p className="text-sm font-semibold text-techblue-600">{trainer.specialization}</p>
                    </div>
                  </div>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">{trainer.rating}</span>
                      <span>({trainer.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{trainer.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
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
                </div>

                {/* Stats */}
                <div className="px-6 pb-4 grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-gray-900">{trainer.experience_years}+ years</div>
                    <div className="text-gray-500">Experience</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{trainer.total_reviews * 2}</div>
                    <div className="text-gray-500">Students</div>
                  </div>
                  <div>
                    <div className="font-bold text-techblue-600">${trainer.hourly_rate}/hr</div>
                    <div className="text-gray-500">Starting</div>
                  </div>
                </div>

                {/* Bio Preview */}
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {trainer.bio || 'Experienced professional ready to help you achieve your goals.'}
                  </p>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <Button 
                    onClick={() => viewProfile(trainer.id)}
                    className="w-full bg-techblue-600 hover:bg-techblue-700 text-white font-semibold py-2.5 transition-all duration-300 transform group-hover:scale-105"
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && trainers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('');
                setLocationFilter('');
                setMinRating(0);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSearch;
