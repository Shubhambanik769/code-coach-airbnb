
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Star, MapPin, Clock, Users, Award, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import BookingCalendar from '@/components/BookingCalendar';

interface TrainerDetail {
  id: string;
  name: string;
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

const TrainerProfile = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();

  // Fetch trainer profile - PUBLIC ACCESS (no authentication required)
  const { data: trainer, isLoading } = useQuery({
    queryKey: ['trainer-profile', trainerId],
    queryFn: async () => {
      console.log('Fetching trainer with ID:', trainerId);
      
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('id', trainerId)
        .eq('status', 'approved')
        .single();
      
      console.log('Trainer data:', data);
      console.log('Trainer error:', error);
      
      if (error) throw error;
      return data;
    },
    enabled: !!trainerId
  });

  // Fetch reviews - PUBLIC ACCESS
  const { data: reviews = [] } = useQuery({
    queryKey: ['trainer-reviews', trainerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!trainerId
  });

  // Fetch feedback responses - PUBLIC ACCESS
  const { data: feedbackResponses = [] } = useQuery({
    queryKey: ['trainer-feedback-responses', trainerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_responses')
        .select(`
          *,
          feedback_links!inner (
            booking_id,
            bookings!inner (
              trainer_id,
              training_topic,
              start_time
            )
          )
        `)
        .eq('feedback_links.bookings.trainer_id', trainerId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!trainerId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trainer not found</h1>
          <Button onClick={() => navigate('/search')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  // Combine reviews and feedback responses for comprehensive review display
  const allReviews = [
    ...reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      skills_rating: r.skills_rating,
      communication_rating: r.communication_rating,
      punctuality_rating: r.punctuality_rating,
      would_recommend: r.would_recommend,
      reviewer_name: r.profiles?.full_name || 'Anonymous',
      organization: undefined,
      source: 'booking'
    })),
    ...feedbackResponses.map(fr => ({
      id: fr.id,
      rating: fr.rating,
      comment: fr.review_comment,
      created_at: fr.submitted_at,
      skills_rating: fr.skills_rating,
      communication_rating: fr.communication_rating,
      punctuality_rating: fr.punctuality_rating,
      would_recommend: fr.would_recommend,
      reviewer_name: fr.respondent_name,
      organization: fr.organization_name,
      source: 'feedback'
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Calculate average ratings from all sources
  const totalResponses = allReviews.length;
  const averageRatings = {
    overall: totalResponses > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalResponses : 0,
    skills: totalResponses > 0 ? allReviews.filter(r => r.skills_rating).reduce((acc, r) => acc + (r.skills_rating || 0), 0) / allReviews.filter(r => r.skills_rating).length : 0,
    communication: totalResponses > 0 ? allReviews.filter(r => r.communication_rating).reduce((acc, r) => acc + (r.communication_rating || 0), 0) / allReviews.filter(r => r.communication_rating).length : 0,
    punctuality: totalResponses > 0 ? allReviews.filter(r => r.punctuality_rating).reduce((acc, r) => acc + (r.punctuality_rating || 0), 0) / allReviews.filter(r => r.punctuality_rating).length : 0,
  };

  const recommendationRate = totalResponses > 0 
    ? (allReviews.filter(r => r.would_recommend).length / totalResponses) * 100 
    : 0;

  // Display name with fallback logic
  const displayName = trainer.name || trainer.profiles?.full_name || trainer.title || 'Professional Trainer';
  const displayFirstName = displayName.split(' ')[0] || 'Trainer';

  // Use combined data for ratings instead of trainer data
  const displayRating = averageRatings.overall > 0 ? averageRatings.overall : (trainer.rating || 0);
  const displayReviewCount = totalResponses > 0 ? totalResponses : (trainer.total_reviews || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/search')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-techblue-600 to-techblue-700 text-white p-8">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24 border-4 border-white">
                  <AvatarImage src={trainer.profiles?.avatar_url} />
                  <AvatarFallback className="bg-white text-techblue-600 text-2xl font-bold">
                    {displayName.split(' ').map(n => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">
                      {displayName}
                    </h1>
                    <Badge className="bg-green-500 text-white">
                      {displayRating >= 4.8 ? 'Top Rated' : displayRating >= 4.5 ? 'Expert' : 'Pro'}
                    </Badge>
                  </div>
                  <p className="text-xl text-blue-100 mb-2">{trainer.title}</p>
                  <p className="text-lg text-blue-200 mb-4">{trainer.specialization}</p>
                  
                  <div className="flex items-center space-x-6 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-300 fill-current" />
                      <span className="font-semibold text-white">{displayRating.toFixed(1)}</span>
                      <span>({displayReviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-5 h-5" />
                      <span>{trainer.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-5 h-5" />
                      <span>{trainer.timezone || 'Flexible'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold">${trainer.hourly_rate}</div>
                  <div className="text-blue-200">per hour</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-techblue-600">{trainer.experience_years}+</div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-techblue-600">{displayReviewCount}</div>
                  <div className="text-sm text-gray-500">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-techblue-600">{Math.round(recommendationRate)}%</div>
                  <div className="text-sm text-gray-500">Recommend Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-techblue-600">${trainer.hourly_rate}</div>
                  <div className="text-sm text-gray-500">Per Hour</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="booking">Book Session</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  About {displayFirstName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {trainer.bio || 'This trainer is an experienced professional ready to help you achieve your learning goals with personalized guidance and expert knowledge.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.skills?.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Specialization</h4>
                    <p className="text-gray-600">{trainer.specialization}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Experience Level</h4>
                    <p className="text-gray-600">{trainer.experience_years}+ years in the field</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {/* Detailed Ratings */}
            {totalResponses > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Detailed Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {averageRatings.skills > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Technical Skills</span>
                          <span className="text-sm text-gray-600">{averageRatings.skills.toFixed(1)}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-techblue-600 h-2 rounded-full" 
                            style={{ width: `${(averageRatings.skills / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {averageRatings.communication > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Communication</span>
                          <span className="text-sm text-gray-600">{averageRatings.communication.toFixed(1)}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-techblue-600 h-2 rounded-full" 
                            style={{ width: `${(averageRatings.communication / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {averageRatings.punctuality > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Punctuality</span>
                          <span className="text-sm text-gray-600">{averageRatings.punctuality.toFixed(1)}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-techblue-600 h-2 rounded-full" 
                            style={{ width: `${(averageRatings.punctuality / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Reviews & Feedback ({totalResponses})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalResponses > 0 ? (
                  <div className="space-y-6">
                    {allReviews.slice(0, 10).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {review.reviewer_name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                              {review.organization && (
                                <span className="text-sm text-gray-500">from {review.organization}</span>
                              )}
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {review.source === 'feedback' ? 'Team Feedback' : 'Direct Review'}
                              </Badge>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                            )}
                            {review.would_recommend && (
                              <div className="flex items-center space-x-1 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4" />
                                <span>Would recommend</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <BookingCalendar 
              trainerId={trainer.id}
              trainerName={displayName}
              hourlyRate={trainer.hourly_rate || 0}
            />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Response Time</h4>
                    <p className="text-sm text-gray-600">Usually responds within 2 hours</p>
                  </div>
                  <Badge variant="secondary">Fast Response</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Languages</h4>
                    <p className="text-sm text-gray-600">English (Native)</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Time Zone</h4>
                    <p className="text-sm text-gray-600">{trainer.timezone || 'UTC'}</p>
                  </div>
                </div>

                <Button className="w-full bg-techblue-600 hover:bg-techblue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainerProfile;
