
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const EnhancedTrainerReviews = () => {
  const { user } = useAuth();

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['enhanced-trainer-reviews', user?.id],
    queryFn: async () => {
      // Get trainer data
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!trainer) throw new Error('Trainer not found');

      // Get reviews with student profiles
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (!reviews || reviews.length === 0) {
        return { reviews: [], stats: null };
      }

      // Get student profiles
      const studentIds = [...new Set(reviews.map(r => r.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      const reviewsWithProfiles = reviews.map(review => ({
        ...review,
        student_profile: profiles?.find(p => p.id === review.student_id)
      }));

      // Calculate detailed stats
      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      const averageCommunication = reviews.filter(r => r.communication_rating)
        .reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.filter(r => r.communication_rating).length || 0;
      const averagePunctuality = reviews.filter(r => r.punctuality_rating)
        .reduce((sum, r) => sum + (r.punctuality_rating || 0), 0) / reviews.filter(r => r.punctuality_rating).length || 0;
      const averageSkills = reviews.filter(r => r.skills_rating)
        .reduce((sum, r) => sum + (r.skills_rating || 0), 0) / reviews.filter(r => r.skills_rating).length || 0;
      
      const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
      }));

      const recommendationRate = reviews.filter(r => r.would_recommend).length / totalReviews * 100;

      return {
        reviews: reviewsWithProfiles,
        stats: {
          totalReviews,
          averageRating,
          averageCommunication,
          averagePunctuality,
          averageSkills,
          ratingDistribution,
          recommendationRate
        }
      };
    },
    enabled: !!user?.id
  });

  const renderStars = (rating: number, size = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewsData?.reviews || reviewsData.reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-400">
              Reviews will appear here after students complete sessions with you
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { reviews, stats } = reviewsData;

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(stats?.averageRating || 0, 'lg')}
            </div>
            <p className="text-sm text-gray-600">Overall Rating</p>
            <p className="text-xs text-gray-500">{stats?.totalReviews} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats?.averageCommunication.toFixed(1) || 'N/A'}
            </div>
            <div className="flex justify-center mb-2">
              {stats?.averageCommunication && renderStars(stats.averageCommunication, 'lg')}
            </div>
            <p className="text-sm text-gray-600">Communication</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats?.averagePunctuality.toFixed(1) || 'N/A'}
            </div>
            <div className="flex justify-center mb-2">
              {stats?.averagePunctuality && renderStars(stats.averagePunctuality, 'lg')}
            </div>
            <p className="text-sm text-gray-600">Punctuality</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats?.recommendationRate.toFixed(0) || 0}%
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Would Recommend</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-4">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{count}</span>
                <span className="text-sm text-gray-500 w-12">{percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.slice(0, 10).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.student_profile?.full_name || 'Anonymous Student'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(review.created_at || ''), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.rating)}
                      <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                    </div>
                    {review.would_recommend && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detailed Ratings */}
                {(review.communication_rating || review.punctuality_rating || review.skills_rating) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                    {review.communication_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Communication:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.communication_rating)}
                          <span className="text-xs">{review.communication_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {review.punctuality_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Punctuality:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.punctuality_rating)}
                          <span className="text-xs">{review.punctuality_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {review.skills_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Skills:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.skills_rating)}
                          <span className="text-xs">{review.skills_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {review.comment && (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTrainerReviews;
