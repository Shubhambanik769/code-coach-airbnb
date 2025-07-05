import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Clock, User } from 'lucide-react';

const EnhancedTrainerApproval = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingTrainers, isLoading } = useQuery({
    queryKey: ['pending-trainers'],
    queryFn: async () => {
      const { data: trainers, error } = await supabase
        .from('trainers')
        .select(`
          *, 
          profiles(full_name, email, phone, company_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return trainers;
    }
  });

  const updateTrainerStatusMutation = useMutation({
    mutationFn: async ({ trainerId, status, feedback }: { trainerId: string; status: string; feedback?: string }) => {
      const { error } = await supabase
        .from('trainers')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', trainerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-trainers'] });
      toast({
        title: "Success",
        description: "Trainer status updated successfully"
      });
      setIsDialogOpen(false);
    }
  });

  const handleApprove = (trainerId: string) => {
    updateTrainerStatusMutation.mutate({ trainerId, status: 'approved' });
  };

  const handleReject = (trainerId: string) => {
    updateTrainerStatusMutation.mutate({ trainerId, status: 'rejected' });
  };

  const viewTrainerDetails = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Trainer Approvals ({pendingTrainers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading pending trainers...</div>
          ) : pendingTrainers?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending trainer applications</div>
          ) : (
            <div className="grid gap-4">
              {pendingTrainers?.map((trainer) => (
                <Card key={trainer.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <User className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="font-semibold">{trainer.name}</h3>
                          <p className="text-sm text-gray-600">{trainer.title}</p>
                          <p className="text-xs text-gray-500">{trainer.profiles?.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{trainer.experience_years} years exp</Badge>
                            <Badge variant="outline">${trainer.hourly_rate}/hr</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewTrainerDetails(trainer)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleApprove(trainer.id)} className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReject(trainer.id)} className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trainer Application Review</DialogTitle>
          </DialogHeader>
          {selectedTrainer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Name</h4>
                  <p>{selectedTrainer.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Title</h4>
                  <p>{selectedTrainer.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p>{selectedTrainer.profiles?.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p>{selectedTrainer.profiles?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Experience</h4>
                  <p>{selectedTrainer.experience_years} years</p>
                </div>
                <div>
                  <h4 className="font-semibold">Hourly Rate</h4>
                  <p>${selectedTrainer.hourly_rate}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">Bio</h4>
                <p className="text-sm text-gray-700">{selectedTrainer.bio || 'No bio provided'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Skills</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTrainer.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  )) || <span className="text-gray-500">No skills listed</span>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReject(selectedTrainer.id)} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedTrainer.id)} className="text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTrainerApproval;