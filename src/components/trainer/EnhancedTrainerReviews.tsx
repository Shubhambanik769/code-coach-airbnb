
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

      // Get both reviews and feedback responses
      const [reviewsResult, feedbackResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('trainer_id', trainer.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('feedback_responses')
          .select(`
            *,
            feedback_links (
              booking_id,
              bookings (
                training_topic,
                start_time
              )
            )
          `)
          .eq('feedback_links.bookings.trainer_id', trainer.id)
          .order('submitted_at', { ascending: false })
      ]);

      const reviews = reviewsResult.data || [];
      const feedbackResponses = feedbackResult.data || [];

      if (reviews.length === 0 && feedbackResponses.length === 0) {
        return { allFeedback: [], stats: null };
      }

      // Combine both data sources
      const allFeedback = [
        ...reviews.map(review => ({
          ...review,
          type: 'review',
          date: review.created_at,
          name: 'Anonymous Student' // Reviews don't have respondent names
        })),
        ...feedbackResponses.map(feedback => ({
          ...feedback,
          type: 'feedback',
          date: feedback.submitted_at,
          name: feedback.respondent_name,
          comment: feedback.review_comment
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate comprehensive stats
      const totalResponses = allFeedback.length;
      const averageRating = allFeedback.reduce((sum, item) => sum + item.rating, 0) / totalResponses;
      
      const communicationRatings = allFeedback.filter(item => item.communication_rating);
      const averageCommunication = communicationRatings.length > 0 
        ? communicationRatings.reduce((sum, item) => sum + item.communication_rating, 0) / communicationRatings.length 
        : 0;
      
      const punctualityRatings = allFeedback.filter(item => item.punctuality_rating);
      const averagePunctuality = punctualityRatings.length > 0 
        ? punctualityRatings.reduce((sum, item) => sum + item.punctuality_rating, 0) / punctualityRatings.length 
        : 0;
      
      const skillsRatings = allFeedback.filter(item => item.skills_rating);
      const averageSkills = skillsRatings.length > 0 
        ? skillsRatings.reduce((sum, item) => sum + item.skills_rating, 0) / skillsRatings.length 
        : 0;
      
      const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: allFeedback.filter(item => item.rating === rating).length,
        percentage: (allFeedback.filter(item => item.rating === rating).length / totalResponses) * 100
      }));

      const recommendationRate = (allFeedback.filter(item => item.would_recommend).length / totalResponses) * 100;

      return {
        allFeedback,
        stats: {
          totalResponses,
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

  if (!reviewsData?.allFeedback || reviewsData.allFeedback.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Student Reviews & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No reviews or feedback yet</p>
            <p className="text-sm text-gray-400">
              Reviews and feedback will appear here after students complete sessions with you
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { allFeedback, stats } = reviewsData;

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
            <p className="text-xs text-gray-500">{stats?.totalResponses} total responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats?.averageCommunication > 0 ? stats.averageCommunication.toFixed(1) : 'N/A'}
            </div>
            <div className="flex justify-center mb-2">
              {stats?.averageCommunication > 0 && renderStars(stats.averageCommunication, 'lg')}
            </div>
            <p className="text-sm text-gray-600">Communication</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats?.averagePunctuality > 0 ? stats.averagePunctuality.toFixed(1) : 'N/A'}
            </div>
            <div className="flex justify-center mb-2">
              {stats?.averagePunctuality > 0 && renderStars(stats.averagePunctuality, 'lg')}
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

      {/* Recent Reviews & Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allFeedback.slice(0, 10).map((item, index) => (
              <div key={`${item.type}-${item.id}-${index}`} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name || 'Anonymous Student'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(item.date), 'MMM dd, yyyy')}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.type === 'review' ? 'Review' : 'Feedback Form'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(item.rating)}
                      <span className="ml-1 text-sm font-medium">{item.rating}/5</span>
                    </div>
                    {item.would_recommend && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detailed Ratings for Feedback */}
                {item.type === 'feedback' && (item.communication_rating || item.punctuality_rating || item.skills_rating) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                    {item.communication_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Communication:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(item.communication_rating)}
                          <span className="text-xs">{item.communication_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {item.punctuality_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Punctuality:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(item.punctuality_rating)}
                          <span className="text-xs">{item.punctuality_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {item.skills_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Skills:</span>
                        <div className="flex items-center gap-1">
                          {renderStars(item.skills_rating)}
                          <span className="text-xs">{item.skills_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {item.comment && (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    "{item.comment}"
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
