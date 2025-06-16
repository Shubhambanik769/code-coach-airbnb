
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Ban, Edit, RotateCcw, DollarSign, User } from 'lucide-react';

const EnhancedTrainerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [newPricing, setNewPricing] = useState({ hourly_rate: 0, session_rate: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trainers with enhanced data
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['enhanced-trainers', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: trainersData, error } = await query;
      if (error) throw error;

      // Get trainer profiles and pricing
      const userIds = [...new Set(trainersData?.map(t => t.user_id) || [])];
      const trainerIds = [...new Set(trainersData?.map(t => t.id) || [])];
      
      const [profilesResult, pricingResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', userIds),
        supabase.from('trainer_pricing').select('*').in('trainer_id', trainerIds),
        supabase.from('bookings').select('trainer_id, total_amount, status').in('trainer_id', trainerIds)
      ]);

      return trainersData?.map(trainer => {
        const profile = profilesResult.data?.find(p => p.id === trainer.user_id);
        const pricing = pricingResult.data?.find(p => p.trainer_id === trainer.id);
        const trainerBookings = bookingsResult.data?.filter(b => b.trainer_id === trainer.id) || [];
        const totalEarnings = trainerBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);

        return {
          ...trainer,
          profile,
          pricing,
          total_bookings: trainerBookings.length,
          total_earnings: totalEarnings
        };
      }) || [];
    }
  });

  // Update trainer status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ trainerId, status }: { trainerId: string; status: string }) => {
      const { error } = await supabase
        .from('trainers')
        .update({ status })
        .eq('id', trainerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-trainers'] });
      toast({
        title: "Success",
        description: "Trainer status updated successfully"
      });
    }
  });

  // Update trainer pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: async ({ trainerId, pricing }: { trainerId: string; pricing: any }) => {
      const { error } = await supabase
        .from('trainer_pricing')
        .upsert({
          trainer_id: trainerId,
          hourly_rate: pricing.hourly_rate,
          session_rate: pricing.session_rate,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-trainers'] });
      setEditingTrainer(null);
      toast({
        title: "Success",
        description: "Trainer pricing updated successfully"
      });
    }
  });

  // Reset trainer account mutation
  const resetTrainerMutation = useMutation({
    mutationFn: async (trainerId: string) => {
      const { error } = await supabase
        .from('trainers')
        .update({ 
          rating: 0, 
          total_reviews: 0,
          status: 'pending'
        })
        .eq('id', trainerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-trainers'] });
      toast({
        title: "Success",
        description: "Trainer account reset successfully"
      });
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      case 'banned': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Trainer Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trainers Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Current Pricing</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
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
                trainers?.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trainer.profile?.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{trainer.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>{trainer.specialization || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>₹{trainer.pricing?.hourly_rate || trainer.hourly_rate || 0}/hr</div>
                        {trainer.pricing?.session_rate && (
                          <div>₹{trainer.pricing.session_rate}/session</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Rating: {trainer.rating || 0}/5</div>
                        <div>Bookings: {trainer.total_bookings}</div>
                        <div>Earnings: ₹{trainer.total_earnings}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(trainer.status)}>
                        {trainer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTrainer(trainer);
                                setNewPricing({
                                  hourly_rate: trainer.pricing?.hourly_rate || trainer.hourly_rate || 0,
                                  session_rate: trainer.pricing?.session_rate || 0
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Trainer Pricing</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                                <Input
                                  id="hourly_rate"
                                  type="number"
                                  value={newPricing.hourly_rate}
                                  onChange={(e) => setNewPricing({
                                    ...newPricing,
                                    hourly_rate: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="session_rate">Session Rate (₹)</Label>
                                <Input
                                  id="session_rate"
                                  type="number"
                                  value={newPricing.session_rate}
                                  onChange={(e) => setNewPricing({
                                    ...newPricing,
                                    session_rate: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                              <Button
                                onClick={() => updatePricingMutation.mutate({
                                  trainerId: trainer.id,
                                  pricing: newPricing
                                })}
                                disabled={updatePricingMutation.isPending}
                              >
                                Update Pricing
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={trainer.status}
                          onValueChange={(status) => 
                            updateStatusMutation.mutate({ trainerId: trainer.id, status })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetTrainerMutation.mutate(trainer.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTrainerManagement;
