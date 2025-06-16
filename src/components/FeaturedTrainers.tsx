
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, MapPin, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FeaturedTrainers = () => {
  const navigate = useNavigate();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['featured-trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles!fk_trainers_user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .gte('rating', 4.5)
        .order('rating', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const handleViewProfile = (trainerId: string) => {
    navigate(`/trainer/${trainerId}`);
  };

  const handleViewAllTrainers = () => {
    navigate('/search');
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Meet Our <span className="text-gradient">Top Trainers</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Learn from industry experts who have worked at top tech companies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg h-80 shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Meet Our <span className="text-gradient">Top Trainers</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Learn from industry experts with the highest ratings
          </p>
        </div>

        {trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {trainers.map((trainer, index) => (
              <Card 
                key={trainer.id} 
                className="group cursor-pointer card-hover border-0 shadow-lg animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-0">
                  {/* Trainer Avatar & Badge */}
                  <div className="relative p-4 sm:p-6 pb-3 sm:pb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="relative">
                        <img
                          src={trainer.profiles?.avatar_url || `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`}
                          alt={trainer.profiles?.full_name || 'Trainer'}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
                            {trainer.rating >= 4.8 ? 'Top Rated' : trainer.rating >= 4.5 ? 'Expert' : 'Pro'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-techblue-600 transition-colors">
                          {trainer.profiles?.full_name || 'Professional Trainer'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{trainer.title}</p>
                        <p className="text-xs sm:text-sm font-semibold text-techblue-600">{trainer.specialization}</p>
                      </div>
                    </div>

                    {/* Rating & Location */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{trainer.rating}</span>
                        <span className="hidden sm:inline">({trainer.total_reviews} reviews)</span>
                        <span className="sm:hidden">({trainer.total_reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{trainer.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
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
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
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

                  {/* Action Button */}
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <Button 
                      onClick={() => handleViewProfile(trainer.id)}
                      className="w-full bg-techblue-600 hover:bg-techblue-700 text-white font-semibold py-2 sm:py-2.5 text-sm sm:text-base transition-all duration-300 transform group-hover:scale-105"
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured trainers available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Button 
            onClick={handleViewAllTrainers}
            size="lg" 
            variant="outline" 
            className="px-6 sm:px-8 py-2 sm:py-3 font-semibold border-techblue-600 text-techblue-600 hover:bg-techblue-600 hover:text-white transition-all duration-300 text-sm sm:text-base"
          >
            View All Trainers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrainers;
