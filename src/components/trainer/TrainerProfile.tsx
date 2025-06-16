
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X, Plus } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';

interface TrainerProfileProps {
  trainerId: string;
}

const TrainerProfile = ({ trainerId }: TrainerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainerData, isLoading } = useQuery({
    queryKey: ['trainer-profile', trainerId],
    queryFn: async () => {
      const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', trainerId)
        .single();
      
      if (trainerError) throw trainerError;

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', trainer.user_id)
        .single();

      return { trainer, profile };
    },
    enabled: !!trainerId
  });

  useEffect(() => {
    if (trainerData?.trainer) {
      const trainer = trainerData.trainer;
      setFormData({
        name: trainer.name || '',
        title: trainer.title || '',
        bio: trainer.bio || '',
        specialization: trainer.specialization || '',
        experience_years: trainer.experience_years || 0,
        hourly_rate: trainer.hourly_rate || 0,
        skills: trainer.skills || []
      });
    }
  }, [trainerData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('trainers')
        .update(data)
        .eq('id', trainerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (trainerData?.trainer) {
      const trainer = trainerData.trainer;
      setFormData({
        name: trainer.name || '',
        title: trainer.title || '',
        bio: trainer.bio || '',
        specialization: trainer.specialization || '',
        experience_years: trainer.experience_years || 0,
        hourly_rate: trainer.hourly_rate || 0,
        skills: trainer.skills || []
      });
    }
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Profile
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex justify-center">
          <ProfilePictureUpload 
            currentAvatarUrl={trainerData?.profile?.avatar_url}
            onUploadSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.name || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title
            </label>
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Certified Personal Trainer"
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.title || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            {isEditing ? (
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Weight Loss, Strength Training"
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.specialization || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience (Years)
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                min="0"
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.experience_years || 0} years</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate ($)
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            ) : (
              <p className="text-gray-900">${trainerData?.trainer?.hourly_rate || 0}/hour</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about yourself, your experience, and training philosophy..."
              rows={4}
            />
          ) : (
            <p className="text-gray-900">{trainerData?.trainer?.bio || 'No bio provided'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills & Certifications
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill or certification"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trainerData?.trainer?.skills?.length > 0 ? (
                trainerData.trainer.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No skills added</p>
              )}
            </div>
          )}
        </div>

        {/* Display Tags (Read-only for trainers) */}
        {trainerData?.trainer?.tags && trainerData.trainer.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {trainerData.trainer.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerProfile;
