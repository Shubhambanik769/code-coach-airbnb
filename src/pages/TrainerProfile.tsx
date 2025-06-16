
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, TrendingUp, User, DollarSign } from 'lucide-react';
import BookingCalendar from '@/components/BookingCalendar';

const TrainerProfilePage = () => {
  const { id } = useParams();

  const { data: trainerData, isLoading } = useQuery({
    queryKey: ['trainer-public-profile', id],
    queryFn: async () => {
      // Get trainer data
      const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id)
        .single();

      if (trainerError) throw trainerError;

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', trainer.user_id)
        .single();

      // Get reviews from reviews table
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('trainer_id', id);

      // Get feedback responses through feedback links
      const { data: feedbackResponses } = await supabase
        .from('feedback_responses')
        .select(`
          *,
          feedback_links!inner(
            booking_id,
            bookings!inner(trainer_id)
          )
        `)
        .eq('feedback_links.bookings.trainer_id', id);

      // Combine all feedback data
      const allFeedback = [
        ...(reviews || []).map(r => ({
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          communication_rating: r.communication_rating,
          punctuality_rating: r.punctuality_rating,
          skills_rating: r.skills_rating,
          would_recommend: r.would_recommend,
          respondent_name: 'Anonymous User',
          source: 'review'
        })),
        ...(feedbackResponses || []).map(fr => ({
          rating: fr.rating,
          comment: fr.review_comment,
          created_at: fr.submitted_at,
          communication_rating: fr.communication_rating,
          punctuality_rating: fr.punctuality_rating,
          skills_rating: fr.skills_rating,
          would_recommend: fr.would_recommend,
          respondent_name: fr.respondent_name,
          source: 'feedback'
        }))
      ];

      return { 
        trainer: { ...trainer, profile },
        reviews: allFeedback
      };
    },
    enabled: !!id
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRecommendationRate = () => {
    if (!trainerData?.reviews || trainerData.reviews.length === 0) return 0;
    const recommendations = trainerData.reviews.filter(r => r.would_recommend).length;
    return Math.round((recommendations / trainerData.reviews.length) * 100);
  };

  const getBadgeText = () => {
    const trainer = trainerData?.trainer;
    // First check if trainer has admin tags
    if (trainer?.tags && (trainer.tags as string[]).length > 0) {
      return (trainer.tags as string[])[0]; // Show the first tag
    }
    
    // Fallback to rating-based badges
    const rating = trainer?.rating || 0;
    if (rating >= 4.8) return 'Top Rated';
    if (rating >= 4.5) return 'Expert';
    if (rating >= 4.0) return 'Pro';
    return 'New';
  };

  const getBadgeColor = () => {
    const trainer = trainerData?.trainer;
    // If trainer has admin tags, use blue
    if (trainer?.tags && (trainer.tags as string[]).length > 0) {
      return 'bg-blue-500 text-white';
    }
    
    // Fallback to rating-based colors
    const rating = trainer?.rating || 0;
    if (rating >= 4.8) return 'bg-green-500 text-white';
    if (rating >= 4.5) return 'bg-blue-500 text-white';
    if (rating >= 4.0) return 'bg-purple-500 text-white';
    return 'bg-gray-500 text-white';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const trainer = trainerData?.trainer;
  const reviews = trainerData?.reviews || [];

  if (!trainer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainer Not Found</h1>
            <p className="text-gray-600">The trainer you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trainer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={trainer.profile?.avatar_url} 
                    alt={trainer.profile?.full_name || trainer.name} 
                  />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {trainer.profile?.full_name || trainer.name}
                    </h1>
                    <Badge className={getBadgeText() === 'New' ? '' : getBadgeColor()}>
                      {getBadgeText()}
                    </Badge>
                  </div>
                  
                  <p className="text-xl text-gray-600 mb-4">{trainer.title}</p>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4 mb-4">
                    {trainer.rating && trainer.rating > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(trainer.rating)}
                            <span className="text-lg font-medium text-gray-700 ml-1">
                              {trainer.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                        {reviews.length > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {getRecommendationRate()}% recommend
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(0)}
                          <span className="text-gray-500 ml-1">New trainer</span>
                        </div>
                        <span className="text-gray-500">(No reviews yet)</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {trainer.experience_years && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {trainer.experience_years}+ years experience
                      </div>
                    )}
                    {trainer.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trainer.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-blue-600 mb-1">
                    <DollarSign className="h-6 w-6" />
                    {trainer.hourly_rate || 0}
                  </div>
                  <p className="text-sm text-gray-500">per hour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{trainer.bio || 'No bio available'}</p>
              
              {trainer.specialization && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Specialization</h3>
                  <Badge variant="secondary">{trainer.specialization}</Badge>
                </div>
              )}

              {trainer.skills && trainer.skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Tags */}
              {trainer.tags && (trainer.tags as string[]).length > 1 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {(trainer.tags as string[]).slice(1).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.respondent_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {review.source === 'review' ? 'User Review' : 'Client Feedback'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                      )}
                      
                      {/* Detailed ratings */}
                      {(review.communication_rating || review.punctuality_rating || review.skills_rating) && (
                        <div className="flex gap-4 text-sm text-gray-600">
                          {review.communication_rating && (
                            <span>Communication: {review.communication_rating}/5</span>
                          )}
                          {review.punctuality_rating && (
                            <span>Punctuality: {review.punctuality_rating}/5</span>
                          )}
                          {review.skills_rating && (
                            <span>Skills: {review.skills_rating}/5</span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingCalendar 
              trainerId={id!} 
              trainerName={trainer.profile?.full_name || trainer.name}
              hourlyRate={trainer.hourly_rate || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfilePage;
