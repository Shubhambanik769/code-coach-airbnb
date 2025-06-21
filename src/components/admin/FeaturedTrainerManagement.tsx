
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Star, StarOff } from 'lucide-react';

const FeaturedTrainerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trainers with their featured status
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['featured-trainers-admin', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ trainerId, isFeatured }: { trainerId: string; isFeatured: boolean }) => {
      const currentTags = trainers?.find(t => t.id === trainerId)?.tags || [];
      let updatedTags = [...currentTags];

      if (isFeatured) {
        if (!updatedTags.includes('Featured')) {
          updatedTags.push('Featured');
        }
      } else {
        updatedTags = updatedTags.filter(tag => tag !== 'Featured');
      }

      const { error } = await supabase
        .from('trainers')
        .update({ tags: updatedTags })
        .eq('id', trainerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-trainers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['featured-trainers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: "Success",
        description: "Featured status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  });

  const isFeatured = (trainer: any) => {
    return trainer.tags && trainer.tags.includes('Featured');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Trainers Management</CardTitle>
        <p className="text-sm text-gray-600">
          Select trainers to be featured on the homepage under "Meet Our Elite Trainers"
        </p>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search approved trainers..."
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
                <TableHead>Specialization</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Featured Status</TableHead>
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
                    No approved trainers found
                  </TableCell>
                </TableRow>
              ) : (
                trainers?.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {trainer.profiles?.avatar_url && (
                          <img
                            src={trainer.profiles.avatar_url}
                            alt={trainer.profiles?.full_name || 'Trainer'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{trainer.profiles?.full_name || trainer.name}</div>
                          <div className="text-sm text-gray-500">{trainer.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{trainer.specialization || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {trainer.rating || '0.0'} ({trainer.total_reviews || 0})
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(trainer.tags as string[])?.map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant={tag === 'Featured' ? 'default' : 'outline'}
                            className={tag === 'Featured' ? 'bg-blue-600 text-white' : 'text-xs'}
                          >
                            {tag}
                          </Badge>
                        )) || <span className="text-gray-400 text-sm">No tags</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isFeatured(trainer) ? 'default' : 'secondary'}
                        className={isFeatured(trainer) ? 'bg-green-600 text-white' : ''}
                      >
                        {isFeatured(trainer) ? 'Featured' : 'Not Featured'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={isFeatured(trainer) ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => 
                          toggleFeaturedMutation.mutate({ 
                            trainerId: trainer.id, 
                            isFeatured: !isFeatured(trainer) 
                          })
                        }
                        disabled={toggleFeaturedMutation.isPending}
                      >
                        {isFeatured(trainer) ? (
                          <>
                            <StarOff className="h-4 w-4 mr-1" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Feature
                          </>
                        )}
                      </Button>
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

export default FeaturedTrainerManagement;
