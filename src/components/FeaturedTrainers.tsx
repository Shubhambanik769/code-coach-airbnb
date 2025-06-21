import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const FeaturedTrainers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['featured-trainers'],
    queryFn: async () => {
      console.log('Fetching featured trainers for all users...');
      
      // Query trainers that have tags (admin has given them tags)
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .not('tags', 'is', null)
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false });
      
      console.log('Featured trainers data for public:', data);
      console.log('Featured trainers error:', error);
      
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      // Filter out trainers with empty tags and prioritize featured trainers
      const validTrainers = (data || []).filter(trainer => 
        trainer.tags && Array.isArray(trainer.tags) && trainer.tags.length > 0
      );

      // Sort: Featured trainers first, then by rating
      const sortedTrainers = validTrainers.sort((a, b) => {
        const aFeatured = Array.isArray(a.tags) && a.tags.includes('Featured') ? 1 : 0;
        const bFeatured = Array.isArray(b.tags) && b.tags.includes('Featured') ? 1 : 0;
        
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured; // Featured first
        }
        
        return (b.rating || 0) - (a.rating || 0); // Then by rating
      });

      return sortedTrainers;
    }
  });

  // Don't render the section if no trainers have tags
  if (!isLoading && trainers.length === 0) {
    return null;
  }

  const handleViewProfile = (trainerId: string) => {
    console.log('FeaturedTrainers: User authentication status:', !!user);
    
    if (!user) {
      console.log('FeaturedTrainers: User not authenticated, redirecting to login');
      navigate('/auth');
      return;
    }

    console.log('FeaturedTrainers: User authenticated, navigating to trainer profile:', trainerId);
    navigate(`/trainer/${trainerId}`);
  };

  const handleViewAllTrainers = () => {
    navigate('/trainers');
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

  const getBadgeText = (trainer: any) => {
    if (Array.isArray(trainer.tags) && trainer.tags.includes('Featured')) return 'Featured';
    if (trainer.total_reviews === 0) return 'New';
    if (trainer.rating >= 4.8) return 'Top Rated';
    if (trainer.rating >= 4.5) return 'Expert';
    return 'Pro';
  };

  const getBadgeStyle = (trainer: any) => {
    if (Array.isArray(trainer.tags) && trainer.tags.includes('Featured')) return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm';
    if (trainer.total_reviews === 0) return 'bg-slate-100 text-slate-600 border border-slate-200';
    if (trainer.rating >= 4.8) return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm';
    if (trainer.rating >= 4.5) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
    return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm';
  };

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Meet Our <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Elite Trainers</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Learn from industry experts with proven track records
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl h-96 shadow-xl border border-slate-100"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Elite Trainers</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Learn from industry experts with the highest ratings and proven expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {trainers.slice(0, 6).map((trainer, index) => {
            const displayName = trainer.name || trainer.profiles?.full_name || trainer.title || 'Professional Trainer';
            const rating = trainer.rating || 0;
            const totalReviews = trainer.total_reviews || 0;
            
            // Handle profile pictures for all users (including non-authenticated)
            const avatarUrl = trainer.profiles?.avatar_url 
              ? (trainer.profiles.avatar_url.startsWith('http') 
                  ? trainer.profiles.avatar_url 
                  : `https://rnovcrcvhaeuudqkymiw.supabase.co/storage/v1/object/public/avatars/${trainer.profiles.avatar_url}`)
              : `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;
            
            return (
              <Card 
                key={trainer.id} 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-0 relative">
                  {/* Elegant gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-blue-50/30 pointer-events-none"></div>
                  
                  {/* Header Section */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 p-0.5">
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.log('Featured trainer avatar failed to load:', avatarUrl);
                                e.currentTarget.src = `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face`;
                              }}
                            />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <Badge className={`text-xs px-2 py-1 font-medium ${getBadgeStyle(trainer)}`}>
                              {getBadgeText(trainer)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                            {displayName}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">{trainer.title}</p>
                          <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {trainer.specialization}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section - now visible to all users */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {rating > 0 ? (
                          <>
                            <div className="flex items-center space-x-1">
                              {renderStars(rating)}
                              <span className="font-bold text-slate-900 ml-1">{rating.toFixed(1)}</span>
                            </div>
                            <span className="text-slate-500">({totalReviews} reviews)</span>
                          </>
                        ) : (
                          <span className="text-slate-500 italic">New trainer</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{trainer.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {trainer.skills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                      {trainer.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                          +{trainer.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="font-bold text-slate-900 text-sm">{trainer.experience_years || 0}+</div>
                        <div className="text-xs text-slate-600">Years Exp.</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="font-bold text-slate-900 text-sm">{totalReviews}</div>
                        <div className="text-xs text-slate-600">Reviews</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                        <div className="font-bold text-blue-700 text-sm">${trainer.hourly_rate || 0}</div>
                        <div className="text-xs text-blue-600">per hour</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    <Button 
                      onClick={() => handleViewProfile(trainer.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]"
                    >
                      {user ? 'View Profile' : 'Login to View Profile'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={handleViewAllTrainers}
            size="lg" 
            variant="outline" 
            className="px-8 py-3 font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
          >
            View All Trainers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrainers;
