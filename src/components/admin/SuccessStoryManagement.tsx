
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Image, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  client_name: string;
  client_position: string;
  client_company: string;
  client_avatar_url?: string;
  company_logo_url?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const SuccessStoryManagement = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    client_name: '',
    client_position: '',
    client_company: '',
    client_avatar_url: '',
    company_logo_url: '',
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      toast.error('Failed to fetch success stories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStory) {
        const { error } = await supabase
          .from('success_stories')
          .update(formData)
          .eq('id', editingStory.id);

        if (error) throw error;
        toast.success('Success story updated successfully');
      } else {
        const { error } = await supabase
          .from('success_stories')
          .insert([formData]);

        if (error) throw error;
        toast.success('Success story created successfully');
      }

      resetForm();
      setIsDialogOpen(false);
      fetchStories();
    } catch (error) {
      toast.error('Failed to save success story');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;

    try {
      const { error } = await supabase
        .from('success_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Success story deleted successfully');
      fetchStories();
    } catch (error) {
      toast.error('Failed to delete success story');
      console.error('Error:', error);
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      client_name: story.client_name,
      client_position: story.client_position,
      client_company: story.client_company,
      client_avatar_url: story.client_avatar_url || '',
      company_logo_url: story.company_logo_url || '',
      is_featured: story.is_featured,
      display_order: story.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      content: '',
      client_name: '',
      client_position: '',
      client_company: '',
      client_avatar_url: '',
      company_logo_url: '',
      is_featured: false,
      display_order: 0,
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Success Stories Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Success Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStory ? 'Edit Success Story' : 'Add New Success Story'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Story title"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Success story content"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Client's full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_position">Position *</Label>
                    <Input
                      id="client_position"
                      value={formData.client_position}
                      onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
                      placeholder="Client's position"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_company">Company *</Label>
                    <Input
                      id="client_company"
                      value={formData.client_company}
                      onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="client_avatar_url">Client Avatar URL</Label>
                    <Input
                      id="client_avatar_url"
                      value={formData.client_avatar_url}
                      onChange={(e) => setFormData({ ...formData, client_avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="company_logo_url">Company Logo URL</Label>
                    <Input
                      id="company_logo_url"
                      value={formData.company_logo_url}
                      onChange={(e) => setFormData({ ...formData, company_logo_url: e.target.value })}
                      placeholder="https://example.com/logo.jpg"
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Feature this story</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingStory ? 'Update' : 'Create'} Story
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-techblue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id} className="border-l-4 border-l-techblue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{story.title}</h3>
                        {story.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.content}</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={story.client_avatar_url} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {getInitials(story.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{story.client_name}</div>
                          <div className="text-xs text-gray-500">{story.client_position} at {story.client_company}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(story)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(story.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {stories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No success stories found. Add your first story to get started!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuccessStoryManagement;
