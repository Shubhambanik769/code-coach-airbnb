import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

const FeedbackForm = () => {
  const { token: rawToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Enhanced token processing to handle both base64 and base64url
  const token = rawToken ? (() => {
    console.log('Processing token from URL:', rawToken);
    
    let processedToken = rawToken;
    
    // If it looks like base64url (no +, /, =), convert to base64
    if (!rawToken.includes('+') && !rawToken.includes('/') && !rawToken.includes('=')) {
      processedToken = rawToken.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add proper base64 padding
      const padding = processedToken.length % 4;
      if (padding) {
        processedToken += '='.repeat(4 - padding);
      }
      
      console.log('Converted base64url to base64:', processedToken);
    }
    
    return processedToken;
  })() : null;
  
  const [formData, setFormData] = useState({
    respondent_name: '',
    respondent_email: '',
    organization_name: '',
    rating: 0,
    review_comment: '',
    communication_rating: 0,
    punctuality_rating: 0,
    skills_rating: 0,
    would_recommend: true
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if user has already submitted feedback for this token
  useEffect(() => {
    if (token) {
      const submittedKey = `feedback_submitted_${token}`;
      const hasAlreadySubmitted = localStorage.getItem(submittedKey);
      if (hasAlreadySubmitted) {
        setHasSubmitted(true);
      }
    }
  }, [token]);

  // Fetch feedback link details - PUBLIC ACCESS (no authentication required)
  const { data: feedbackLink, isLoading, error } = useQuery({
    queryKey: ['feedback-link', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');
      
      console.log('Fetching feedback link for token:', token);
      
      // Use the anon key directly for public access - now works with updated RLS policies
      const { data, error } = await supabase
        .from('feedback_links')
        .select(`
          id,
          is_active,
          expires_at,
          bookings (
            training_topic,
            start_time,
            trainers (
              name,
              title
            )
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .single();

      console.log('Feedback link query result:', { data, error });

      if (error) {
        console.error('Error fetching feedback link:', error);
        throw new Error('This feedback link is invalid or has been deactivated.');
      }
      
      // Check if link has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This feedback link has expired');
      }

      return data;
    },
    retry: false
  });

  // Enhanced feedback submission that triggers rating updates
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: typeof formData) => {
      if (!feedbackLink?.id) throw new Error('Invalid feedback link');
      
      console.log('Submitting feedback:', feedbackData);
      
      // Check for duplicate submission
      const { data: existingFeedback, error: checkError } = await supabase
        .from('feedback_responses')
        .select('id')
        .eq('feedback_link_id', feedbackLink.id)
        .eq('respondent_email', feedbackData.respondent_email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing feedback:', checkError);
        throw checkError;
      }

      if (existingFeedback) {
        throw new Error('You have already submitted feedback for this session.');
      }

      // Prepare submission data
      const submissionData: any = {
        feedback_link_id: feedbackLink.id,
        respondent_name: feedbackData.respondent_name,
        respondent_email: feedbackData.respondent_email,
        rating: feedbackData.rating,
        review_comment: feedbackData.review_comment || null,
        organization_name: feedbackData.organization_name || null,
        would_recommend: feedbackData.would_recommend
      };

      // Only include optional rating fields if they have values > 0
      if (feedbackData.communication_rating > 0) {
        submissionData.communication_rating = feedbackData.communication_rating;
      }
      if (feedbackData.punctuality_rating > 0) {
        submissionData.punctuality_rating = feedbackData.punctuality_rating;
      }
      if (feedbackData.skills_rating > 0) {
        submissionData.skills_rating = feedbackData.skills_rating;
      }

      console.log('Final submission data:', submissionData);

      // Submit feedback
      const { error } = await supabase
        .from('feedback_responses')
        .insert(submissionData);

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }

      console.log('Feedback submitted successfully');
    },
    onSuccess: () => {
      // Mark as submitted in localStorage
      if (token) {
        const submittedKey = `feedback_submitted_${token}`;
        localStorage.setItem(submittedKey, 'true');
        setHasSubmitted(true);
      }
      
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully and will be visible on the trainer's profile."
      });
      navigate('/feedback-success');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
      console.error('Feedback submission error:', error);
    }
  });

  const handleStarClick = (field: string, rating: number) => {
    setFormData(prev => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.respondent_name || !formData.respondent_email || formData.rating === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide a rating.",
        variant: "destructive"
      });
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const renderStarRating = (field: string, value: number, label: string, required = false) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(field, star)}
            className="focus:outline-none"
            disabled={hasSubmitted}
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors ${hasSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error || !feedbackLink) {
    console.error('Feedback link error or not found:', { error, feedbackLink });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-gray-600 mb-4">
              Debug: Raw token = {rawToken || 'null'}, Processed token = {token || 'null'}
            </p>
            <p className="text-gray-600 mb-4">
              {error?.message || "This feedback link is invalid, expired, or has been deactivated."}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Submitted</h2>
            <p className="text-gray-600 mb-4">
              You have already submitted feedback for this session. Thank you for your response!
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Training Feedback</CardTitle>
            <div className="text-gray-600 space-y-1">
              <p><strong>Session:</strong> {feedbackLink.bookings?.training_topic}</p>
              <p><strong>Trainer:</strong> {feedbackLink.bookings?.trainers?.name}</p>
              <p><strong>Date:</strong> {new Date(feedbackLink.bookings?.start_time || '').toLocaleDateString()}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.respondent_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, respondent_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.respondent_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, respondent_email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organization">Organization Name</Label>
                <Input
                  id="organization"
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                />
              </div>

              {/* Overall Rating */}
              {renderStarRating('rating', formData.rating, 'Overall Rating', true)}

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderStarRating('communication_rating', formData.communication_rating, 'Communication')}
                {renderStarRating('punctuality_rating', formData.punctuality_rating, 'Punctuality')}
                {renderStarRating('skills_rating', formData.skills_rating, 'Technical Skills')}
              </div>

              {/* Review Comment */}
              <div>
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your experience with this training session..."
                  value={formData.review_comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_comment: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Recommendation */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={formData.would_recommend}
                  onChange={(e) => setFormData(prev => ({ ...prev, would_recommend: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="recommend">I would recommend this trainer</Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitFeedbackMutation.isPending || hasSubmitted}
              >
                {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackForm;
