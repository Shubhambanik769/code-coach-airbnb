
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Link, Star, MessageSquare, Copy } from 'lucide-react';

const TrainerFeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch trainers with feedback data
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['admin-trainer-feedback', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`
          *,
          bookings (
            id,
            training_topic,
            start_time,
            student_id,
            feedback_links (
              id,
              token,
              is_active,
              created_at,
              expires_at,
              feedback_responses (
                id,
                respondent_name,
                respondent_email,
                rating,
                communication_rating,
                punctuality_rating,
                skills_rating,
                would_recommend,
                review_comment,
                submitted_at
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get profiles for student info
      const studentIds: string[] = [];
      data?.forEach(trainer => {
        trainer.bookings?.forEach((booking: any) => {
          if (booking.student_id && typeof booking.student_id === 'string') {
            studentIds.push(booking.student_id);
          }
        });
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      return data?.map(trainer => ({
        ...trainer,
        profiles: profiles
      })) || [];
    }
  });

  const { data: detailedFeedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['trainer-detailed-feedback', selectedTrainer?.id],
    queryFn: async () => {
      if (!selectedTrainer?.id) return null;

      const { data, error } = await supabase
        .from('feedback_responses')
        .select(`
          *,
          feedback_links (
            booking_id,
            bookings (
              training_topic,
              start_time,
              student_id
            )
          )
        `)
        .eq('feedback_links.bookings.trainer_id', selectedTrainer.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedTrainer?.id
  });

  const copyFeedbackLink = (token: string) => {
    const feedbackUrl = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(feedbackUrl);
    toast({
      title: "Link Copied!",
      description: "Feedback link has been copied to clipboard."
    });
  };

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

  const calculateTrainerStats = (trainer: any) => {
    const allFeedback = trainer.bookings?.flatMap((booking: any) => 
      booking.feedback_links?.flatMap((link: any) => link.feedback_responses || []) || []
    ) || [];

    const totalResponses = allFeedback.length;
    const avgRating = totalResponses > 0 
      ? allFeedback.reduce((sum: number, feedback: any) => sum + feedback.rating, 0) / totalResponses 
      : 0;
    const recommendationRate = totalResponses > 0 
      ? (allFeedback.filter((feedback: any) => feedback.would_recommend).length / totalResponses) * 100 
      : 0;

    return { totalResponses, avgRating, recommendationRate };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trainer Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Trainers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead>Total Feedback</TableHead>
                  <TableHead>Recommendation Rate</TableHead>
                  <TableHead>Active Links</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading trainers...
                    </TableCell>
                  </TableRow>
                ) : trainers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No trainers found
                    </TableCell>
                  </TableRow>
                ) : (
                  trainers?.map((trainer) => {
                    const stats = calculateTrainerStats(trainer);
                    const activeLinks = trainer.bookings?.flatMap((booking: any) => 
                      booking.feedback_links?.filter((link: any) => link.is_active) || []
                    ) || [];

                    return (
                      <TableRow key={trainer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-sm text-gray-500">{trainer.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {renderStars(Math.round(stats.avgRating))}
                            <span className="ml-1 text-sm">{stats.avgRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{stats.totalResponses}</TableCell>
                        <TableCell>{stats.recommendationRate.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {activeLinks.length} active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTrainer(trainer);
                                setFeedbackDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Feedback Details - {selectedTrainer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {feedbackLoading ? (
            <div className="text-center py-8">Loading feedback details...</div>
          ) : (
            <div className="space-y-6">
              {/* Active Feedback Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Feedback Links</h3>
                <div className="space-y-2">
                  {selectedTrainer?.bookings?.flatMap((booking: any) => 
                    booking.feedback_links?.filter((link: any) => link.is_active).map((link: any) => (
                      <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.training_topic}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(link.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(link.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyFeedbackLink(link.token)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      </div>
                    ))
                  ) || []}
                </div>
              </div>

              {/* Feedback Responses */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Feedback Responses</h3>
                <div className="space-y-4">
                  {detailedFeedback?.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{feedback.respondent_name}</p>
                          <p className="text-sm text-gray-500">{feedback.respondent_email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(feedback.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(feedback.rating)}
                            <span className="text-sm font-medium">{feedback.rating}/5</span>
                          </div>
                          {feedback.would_recommend && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        {feedback.communication_rating && (
                          <div>
                            <span className="text-gray-600">Communication: </span>
                            <span className="font-medium">{feedback.communication_rating}/5</span>
                          </div>
                        )}
                        {feedback.punctuality_rating && (
                          <div>
                            <span className="text-gray-600">Punctuality: </span>
                            <span className="font-medium">{feedback.punctuality_rating}/5</span>
                          </div>
                        )}
                        {feedback.skills_rating && (
                          <div>
                            <span className="text-gray-600">Skills: </span>
                            <span className="font-medium">{feedback.skills_rating}/5</span>
                          </div>
                        )}
                      </div>

                      {feedback.review_comment && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">"{feedback.review_comment}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerFeedbackManagement;
