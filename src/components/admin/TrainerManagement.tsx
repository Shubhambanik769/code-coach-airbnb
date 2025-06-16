
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle, Eye, Star } from 'lucide-react';
import TrainerTagManagement from './TrainerTagManagement';

const TrainerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trainers with profile data
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['admin-trainers', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: trainersData, error } = await query;
      if (error) throw error;

      // Fetch trainer profiles separately
      const userIds = [...new Set(trainersData?.map(t => t.user_id) || [])];
      
      const { data: profilesData } = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds) : { data: [] };

      // Map the data together
      return trainersData?.map(trainer => ({
        ...trainer,
        profile: profilesData?.find(p => p.id === trainer.user_id)
      })) || [];
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
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: "Success",
        description: "Trainer status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trainer status",
        variant: "destructive"
      });
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainer Management</CardTitle>
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
            </SelectContent>
          </Select>
        </div>

        {/* Trainers Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading trainers...
                  </TableCell>
                </TableRow>
              ) : trainers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No trainers found
                  </TableCell>
                </TableRow>
              ) : (
                trainers?.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {trainer.profile?.avatar_url && (
                          <img
                            src={trainer.profile.avatar_url}
                            alt={trainer.profile?.full_name || 'Trainer'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {trainer.profile?.full_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{trainer.title}</TableCell>
                    <TableCell>{trainer.specialization || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {trainer.rating || '0.0'}
                      </div>
                    </TableCell>
                    <TableCell>${trainer.hourly_rate || '0'}/hr</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(trainer.status)}>
                        {trainer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(trainer.tags as string[])?.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        )) || <span className="text-gray-400 text-sm">No tags</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {trainer.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                updateStatusMutation.mutate({ trainerId: trainer.id, status: 'approved' })
                              }
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                updateStatusMutation.mutate({ trainerId: trainer.id, status: 'rejected' })
                              }
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <TrainerTagManagement 
                          trainerId={trainer.id} 
                          currentTags={(trainer.tags as string[]) || []} 
                        />
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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

export default TrainerManagement;
