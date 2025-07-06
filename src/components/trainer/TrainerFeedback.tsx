import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface FeedbackData {
  id: string;
  rating: number;
  skills_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  review_comment: string | null;
  would_recommend: boolean | null;
  respondent_name: string;
  respondent_email: string;
  organization_name: string | null;
  submitted_at: string;
  booking: {
    id: string;
    training_topic: string;
    start_time: string;
    duration_hours: number;
  };
}

interface TrainerFeedbackProps {
  trainerId: string;
}

const TrainerFeedback = ({ trainerId }: TrainerFeedbackProps) => {
  const [ratingFilter, setRatingFilter] = useState('all');

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['trainer-feedback', trainerId],
    queryFn: async () => {
      console.log('Fetching feedback for trainer:', trainerId);
      
      // Get feedback responses for this trainer's bookings
      const { data, error } = await supabase
        .from('feedback_responses')
        .select(`
          id,
          rating,
          skills_rating,
          communication_rating,
          punctuality_rating,
          review_comment,
          would_recommend,
          respondent_name,
          respondent_email,
          organization_name,
          submitted_at,
          feedback_links!inner (
            booking_id,
            bookings!inner (
              id,
              training_topic,
              start_time,
              duration_hours,
              trainer_id
            )
          )
        `)
        .eq('feedback_links.bookings.trainer_id', trainerId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: FeedbackData[] = (data || []).map(item => ({
        id: item.id,
        rating: item.rating,
        skills_rating: item.skills_rating,
        communication_rating: item.communication_rating,
        punctuality_rating: item.punctuality_rating,
        review_comment: item.review_comment,
        would_recommend: item.would_recommend,
        respondent_name: item.respondent_name,
        respondent_email: item.respondent_email,
        organization_name: item.organization_name,
        submitted_at: item.submitted_at,
        booking: {
          id: item.feedback_links.bookings.id,
          training_topic: item.feedback_links.bookings.training_topic,
          start_time: item.feedback_links.bookings.start_time,
          duration_hours: item.feedback_links.bookings.duration_hours
        }
      }));

      return transformedData;
    },
    enabled: !!trainerId
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredFeedback = feedbackData?.filter(feedback => {
    if (ratingFilter === 'all') return true;
    const rating = feedback.rating;
    switch (ratingFilter) {
      case '5': return rating === 5;
      case '4': return rating === 4;
      case '3': return rating === 3;
      case '2': return rating === 2;
      case '1': return rating === 1;
      default: return true;
    }
  });

  const averageRating = feedbackData?.length 
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : '0.0';

  const recommendationRate = feedbackData?.length
    ? Math.round((feedbackData.filter(f => f.would_recommend === true).length / feedbackData.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading feedback...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-xl font-bold">{feedbackData?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className={`text-xl font-bold ${getRatingColor(parseFloat(averageRating))}`}>
                  {averageRating}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Recommendation Rate</p>
                <p className="text-xl font-bold text-green-600">{recommendationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold">
                  {feedbackData?.filter(f => {
                    const feedbackDate = new Date(f.submitted_at);
                    const now = new Date();
                    return feedbackDate.getMonth() === now.getMonth() && 
                           feedbackDate.getFullYear() === now.getFullYear();
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Received Feedback
            </CardTitle>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedback?.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No feedback yet</h3>
              <p className="text-gray-600">
                Complete more training sessions to receive feedback from clients.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback?.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{feedback.booking.training_topic}</h4>
                      <p className="text-sm text-gray-600">
                        Session on {format(new Date(feedback.booking.start_time), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(feedback.rating)}
                        <span className="ml-1 text-sm font-medium">{feedback.rating}.0</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(feedback.submitted_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{feedback.respondent_name}</p>
                      <p className="text-sm text-gray-500">{feedback.respondent_email}</p>
                      {feedback.organization_name && (
                        <p className="text-xs text-blue-600">{feedback.organization_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Detailed Ratings */}
                  {(feedback.skills_rating || feedback.communication_rating || feedback.punctuality_rating) && (
                    <div className="grid grid-cols-3 gap-4 py-2 border-t border-b">
                      {feedback.skills_rating && (
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Skills</p>
                          <div className="flex justify-center gap-1">
                            {renderStars(feedback.skills_rating)}
                          </div>
                        </div>
                      )}
                      {feedback.communication_rating && (
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Communication</p>
                          <div className="flex justify-center gap-1">
                            {renderStars(feedback.communication_rating)}
                          </div>
                        </div>
                      )}
                      {feedback.punctuality_rating && (
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Punctuality</p>
                          <div className="flex justify-center gap-1">
                            {renderStars(feedback.punctuality_rating)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {feedback.review_comment && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm italic">"{feedback.review_comment}"</p>
                    </div>
                  )}

                  {feedback.would_recommend !== null && (
                    <div className="flex items-center gap-2">
                      {feedback.would_recommend ? (
                        <>
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Would recommend</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Would not recommend</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerFeedback;