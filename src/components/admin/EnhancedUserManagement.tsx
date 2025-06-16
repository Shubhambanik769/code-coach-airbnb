
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
import { Search, Flag, Ban, Eye, Edit, AlertTriangle } from 'lucide-react';

const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with activity data
  const { data: users, isLoading } = useQuery({
    queryKey: ['enhanced-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data: profilesData, error } = await query;
      if (error) throw error;

      // Get user activity data (bookings count, last activity)
      const userIds = profilesData?.map(u => u.id) || [];
      
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('student_id, created_at, status')
        .in('student_id', userIds);

      // Get trainer data for users who are trainers
      const { data: trainersData } = await supabase
        .from('trainers')
        .select('user_id, status, total_reviews, rating')
        .in('user_id', userIds);

      return profilesData?.map(user => {
        const userBookings = bookingsData?.filter(b => b.student_id === user.id) || [];
        const trainerProfile = trainersData?.find(t => t.user_id === user.id);
        const lastActivity = userBookings.length > 0 
          ? new Date(Math.max(...userBookings.map(b => new Date(b.created_at).getTime())))
          : new Date(user.created_at);

        return {
          ...user,
          bookings_count: userBookings.length,
          completed_bookings: userBookings.filter(b => b.status === 'completed').length,
          last_activity: lastActivity,
          trainer_profile: trainerProfile,
          is_flagged: false // Add flagging logic here
        };
      }) || [];
    }
  });

  // Flag user mutation
  const flagUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      // In a real app, you'd have a separate table for user flags
      console.log('Flagging user:', userId, 'Reason:', reason);
      toast({
        title: "User Flagged",
        description: "User has been flagged for review"
      });
    }
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
      toast({
        title: "Success",
        description: "User role updated successfully"
      });
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'trainer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityBadgeColor = (lastActivity: Date) => {
    const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 7) return 'bg-green-100 text-green-800';
    if (daysSince <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Trainer Info</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActivityBadgeColor(user.last_activity)}>
                        {Math.floor((Date.now() - user.last_activity.getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {user.bookings_count}</div>
                        <div>Completed: {user.completed_bookings}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.trainer_profile ? (
                        <div className="text-sm">
                          <div>Rating: {user.trainer_profile.rating || 0}</div>
                          <div>Reviews: {user.trainer_profile.total_reviews || 0}</div>
                          <Badge className={user.trainer_profile.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'}>
                            {user.trainer_profile.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not a trainer</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.last_activity.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(role) => 
                            updateUserMutation.mutate({ userId: user.id, role })
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => flagUserMutation.mutate({ userId: user.id, reason: 'Manual flag' })}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="h-4 w-4" />
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

export default EnhancedUserManagement;
