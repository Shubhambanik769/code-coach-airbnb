
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, DollarSign, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';

interface TrainingRequestFormData {
  title: string;
  description: string;
  target_audience: 'college' | 'corporate' | 'custom';
  expected_start_date: string;
  expected_end_date: string;
  duration_hours: number;
  delivery_mode: 'online' | 'offline' | 'hybrid';
  location: string;
  language_preference: string;
  tools_required: string[];
  syllabus_content: string;
  allow_trainer_pricing: boolean;
  allow_trainer_syllabus: boolean;
  budget_min: number;
  budget_max: number;
  application_deadline: string;
}

interface TrainingRequestFormProps {
  onSuccess?: () => void;
}

const TrainingRequestForm = ({ onSuccess }: TrainingRequestFormProps) => {
  const [formData, setFormData] = useState<TrainingRequestFormData>({
    title: '',
    description: '',
    target_audience: 'corporate',
    expected_start_date: '',
    expected_end_date: '',
    duration_hours: 8,
    delivery_mode: 'online',
    location: '',
    language_preference: 'English',
    tools_required: [],
    syllabus_content: '',
    allow_trainer_pricing: true,
    allow_trainer_syllabus: false,
    budget_min: 0,
    budget_max: 0,
    application_deadline: ''
  });

  const [toolsInput, setToolsInput] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createRequestMutation = useMutation({
    mutationFn: async (data: TrainingRequestFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('training_requests')
        .insert({
          client_id: user.id,
          title: data.title,
          description: data.description,
          target_audience: data.target_audience,
          expected_start_date: data.expected_start_date || null,
          expected_end_date: data.expected_end_date || null,
          duration_hours: data.duration_hours,
          delivery_mode: data.delivery_mode,
          location: data.location || null,
          language_preference: data.language_preference,
          tools_required: data.tools_required,
          syllabus_content: data.syllabus_content || null,
          allow_trainer_pricing: data.allow_trainer_pricing,
          allow_trainer_syllabus: data.allow_trainer_syllabus,
          budget_min: data.budget_min || null,
          budget_max: data.budget_max || null,
          application_deadline: data.application_deadline || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Training request posted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['training-requests'] });
      onSuccess?.();
      // Reset form
      setFormData({
        title: '',
        description: '',
        target_audience: 'corporate',
        expected_start_date: '',
        expected_end_date: '',
        duration_hours: 8,
        delivery_mode: 'online',
        location: '',
        language_preference: 'English',
        tools_required: [],
        syllabus_content: '',
        allow_trainer_pricing: true,
        allow_trainer_syllabus: false,
        budget_min: 0,
        budget_max: 0,
        application_deadline: ''
      });
      setToolsInput('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post training request",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your training request",
        variant: "destructive"
      });
      return;
    }
    createRequestMutation.mutate(formData);
  };

  const handleToolsChange = (value: string) => {
    setToolsInput(value);
    const tools = value.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);
    setFormData(prev => ({ ...prev, tools_required: tools }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Post Training Requirement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Training Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., React.js Development Bootcamp"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your training requirements..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value: 'college' | 'corporate' | 'custom') => 
                  setFormData(prev => ({ ...prev, target_audience: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college">College Students</SelectItem>
                  <SelectItem value="corporate">Corporate Employees</SelectItem>
                  <SelectItem value="custom">Custom Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expected_start_date">Expected Start Date</Label>
              <Input
                id="expected_start_date"
                type="date"
                value={formData.expected_start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="expected_end_date">Expected End Date</Label>
              <Input
                id="expected_end_date"
                type="date"
                value={formData.expected_end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_end_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="duration_hours">Duration (Hours)</Label>
              <Input
                id="duration_hours"
                type="number"
                value={formData.duration_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
          </div>

          {/* Delivery & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delivery_mode">Delivery Mode</Label>
              <Select
                value={formData.delivery_mode}
                onValueChange={(value: 'online' | 'offline' | 'hybrid') => 
                  setFormData(prev => ({ ...prev, delivery_mode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location (if offline/hybrid)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="language_preference">Language Preference</Label>
              <Input
                id="language_preference"
                value={formData.language_preference}
                onChange={(e) => setFormData(prev => ({ ...prev, language_preference: e.target.value }))}
                placeholder="English, Hindi, etc."
              />
            </div>
            <div>
              <Label htmlFor="tools_required">Required Tools/Technologies</Label>
              <Input
                id="tools_required"
                value={toolsInput}
                onChange={(e) => handleToolsChange(e.target.value)}
                placeholder="React, Node.js, MongoDB (comma-separated)"
              />
            </div>
            <div>
              <Label htmlFor="syllabus_content">Syllabus/Curriculum</Label>
              <Textarea
                id="syllabus_content"
                value={formData.syllabus_content}
                onChange={(e) => setFormData(prev => ({ ...prev, syllabus_content: e.target.value }))}
                placeholder="Provide detailed syllabus or leave empty to allow trainer proposals"
                rows={6}
              />
            </div>
          </div>

          {/* Budget & Preferences */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Minimum Budget ($)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_min: parseFloat(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="budget_max">Maximum Budget ($)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_max: parseFloat(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="datetime-local"
                value={formData.application_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Trainer Preferences */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_trainer_pricing"
                checked={formData.allow_trainer_pricing}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, allow_trainer_pricing: !!checked }))
                }
              />
              <Label htmlFor="allow_trainer_pricing">Allow trainers to quote their own pricing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_trainer_syllabus"
                checked={formData.allow_trainer_syllabus}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, allow_trainer_syllabus: !!checked }))
                }
              />
              <Label htmlFor="allow_trainer_syllabus">Allow trainers to propose their own syllabus</Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createRequestMutation.isPending}
            className="w-full"
          >
            {createRequestMutation.isPending ? 'Posting...' : 'Post Training Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrainingRequestForm;
