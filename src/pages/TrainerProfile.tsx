
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, Award, TrendingUp, User, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';

const TrainerProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: trainerData, isLoading } = useQuery({
    queryKey: ['public-trainer-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('No trainer ID provided');

      // Get trainer data
      const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (trainerError) throw trainerError;

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', trainer.user_id)
        .single();

      // Get all reviews and feedback for comprehensive stats
      const [reviewsResult, feedbackResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('rating, comment, created_at, communication_rating, punctuality_rating, skills_rating, would_recommend')
          .eq('trainer_id', trainer.id),
        
        supabase
          .from('feedback_responses')
          .select(`
            rating,
            review_comment,
            submitted_at,
            communication_rating,
            punctuality_rating,
            skills_rating,
            would_recommend,
            respondent_name,
            feedback_links!inner (
              booking_id,
              bookings!inner (trainer_id)
            )
          `)
          .eq('feedback_links.bookings.trainer_id', trainer.id)
      ]);

      const reviews = reviewsResult.data || [];
      const feedbackResponses = feedbackResult.data || [];

      // Combine all feedback data
      const allFeedback = [
        ...reviews.map(r => ({ ...r, type: 'review', date: r.created_at })),
        ...feedbackResponses.map(f => ({ ...f, type: 'feedback', date: f.submitted_at, comment: f.review_comment }))
      ];

      // Calculate comprehensive statistics
      let stats = null;
      if (allFeedback.length > 0) {
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

        stats = {
          totalResponses,
          averageRating,
          averageCommunication,
          averagePunctuality,
          averageSkills,
          ratingDistribution,
          recommendationRate,
          recentReviews: allFeedback
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
        };
      }

      return { trainer, profile, stats };
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trainerData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trainer Not Found</h2>
            <p className="text-gray-600">The trainer you're looking for doesn't exist or is not available.</p>
          </div>
        </div>
      </div>
    );
  }

  const { trainer, profile, stats } = trainerData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile?.avatar_url} alt={trainer.name} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{trainer.name}</h1>
                    <p className="text-xl text-gray-600 mb-2">{trainer.title}</p>
                    
                    {/* Tags */}
                    {trainer.tags && trainer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Rating and Reviews */}
                    {stats ? (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(stats.averageRating)}
                            <span className="font-medium text-gray-900 ml-1">
                              {stats.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            ({stats.totalResponses} {stats.totalResponses === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                        
                        {stats.recommendationRate > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {stats.recommendationRate.toFixed(0)}% recommend
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {renderStars(0)}
                          <span className="text-gray-500 ml-1">New trainer</span>
                        </div>
                        <span className="text-gray-500">(No reviews yet)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      ${trainer.hourly_rate || 0}
                    </div>
                    <div className="text-gray-500">per hour</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {trainer.experience_years && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="font-semibold">{trainer.experience_years}+ years</div>
                      <div className="text-sm text-gray-500">Experience</div>
                    </div>
                  )}
                  
                  {trainer.specialization && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="font-semibold">{trainer.specialization}</div>
                      <div className="text-sm text-gray-500">Specialty</div>
                    </div>
                  )}
                  
                  {stats && stats.averageCommunication > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="font-semibold">{stats.averageCommunication.toFixed(1)}/5</div>
                      <div className="text-sm text-gray-500">Communication</div>
                    </div>
                  )}
                  
                  {stats && stats.averageSkills > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="font-semibold">{stats.averageSkills.toFixed(1)}/5</div>
                      <div className="text-sm text-gray-500">Skills</div>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full md:w-auto">
                  Book Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {trainer.bio || 'No bio available.'}
                </p>
                
                {trainer.skills && trainer.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Skills & Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {stats && stats.recentReviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentReviews.map((review: any, index: number) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 font-medium">{review.rating}/5</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Breakdown */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-4">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-3">Send Message</Button>
                <Button variant="outline" className="w-full">Book Consultation</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
