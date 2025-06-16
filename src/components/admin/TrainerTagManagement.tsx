
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tags, Plus, X } from 'lucide-react';

interface TrainerTagManagementProps {
  trainerId: string;
  currentTags: string[];
}

const TrainerTagManagement = ({ trainerId, currentTags }: TrainerTagManagementProps) => {
  const [newTag, setNewTag] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTagsMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      const { error } = await supabase
        .from('trainers')
        .update({ tags })
        .eq('id', trainerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-trainers'] });
      toast({
        title: "Success",
        description: "Tags updated successfully"
      });
    }
  });

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()];
      updateTagsMutation.mutate(updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    updateTagsMutation.mutate(updatedTags);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="h-4 w-4 mr-2" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Trainer Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new tag (e.g., Expert, Top Rated, Verified)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} disabled={!newTag.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {currentTags.length > 0 ? (
                currentTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags assigned</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {['Expert', 'Top Rated', 'Verified', 'Popular', 'Specialist', 'Premium'].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (!currentTags.includes(tag)) {
                      const updatedTags = [...currentTags, tag];
                      updateTagsMutation.mutate(updatedTags);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerTagManagement;
