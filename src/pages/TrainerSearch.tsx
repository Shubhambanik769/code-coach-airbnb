
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Star, MapPin, Clock, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRate: 1000,
    location: '',
    skills: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers', searchQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .gte('rating', filters.minRating)
        .lte('hourly_rate', filters.maxRate);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    navigate(`/search?${params.toString()}`);
  };

  const handleTrainerClick = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Perfect Trainer</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by skills, specialization, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" className="bg-techblue-600 hover:bg-techblue-700 h-12 px-8">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Hourly Rate ($)</label>
                    <Input
                      type="number"
                      min="0"
                      value={filters.maxRate}
                      onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) || 1000 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFilters({ minRating: 0, maxRate: 1000, location: '', skills: [] })}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          <p className="text-gray-600 mb-6">
            Found {trainers.length} trainers {searchQuery && `for "${searchQuery}"`}
          </p>
        </div>

        {/* Trainers Grid */}
        {trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <Card
                key={trainer.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                onClick={() => handleTrainerClick(trainer.id)}
              >
                <CardContent className="p-0">
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-r from-techblue-600 to-techblue-700 text-white p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-white">
                        <AvatarImage src={trainer.profiles?.avatar_url} />
                        <AvatarFallback className="bg-white text-techblue-600 font-bold text-lg">
                          {trainer.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{trainer.profiles?.full_name || 'Professional Trainer'}</h3>
                        <p className="text-blue-100">{trainer.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-300 fill-current" />
                        <span className="font-semibold">{trainer.rating}</span>
                        <span className="text-blue-200">({trainer.total_reviews})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${trainer.hourly_rate}</div>
                        <div className="text-blue-200 text-sm">/hour</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Specialization</h4>
                      <p className="text-gray-600">{trainer.specialization}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {trainer.skills?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trainer.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{trainer.experience_years}+ years</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{trainer.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSearch;
