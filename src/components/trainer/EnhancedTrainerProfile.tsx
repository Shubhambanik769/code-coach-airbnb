import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Save, X, Plus, Linkedin, Github, Globe, BookOpen, Award, Languages } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';

interface EnhancedTrainerProfileProps {
  trainerId: string;
}

const EnhancedTrainerProfile = ({ trainerId }: EnhancedTrainerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
    skills: [] as string[],
    linkedin_profile: '',
    github_profile: '',
    portfolio_url: '',
    languages_spoken: [] as string[],
    education: [] as string[],
    achievements: [] as string[],
    teaching_methodology: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainerData, isLoading } = useQuery({
    queryKey: ['enhanced-trainer-profile', trainerId],
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
        skills: trainer.skills || [],
        linkedin_profile: trainer.linkedin_profile || '',
        github_profile: trainer.github_profile || '',
        portfolio_url: trainer.portfolio_url || '',
        languages_spoken: trainer.languages_spoken || [],
        education: trainer.education || [],
        achievements: trainer.achievements || [],
        teaching_methodology: trainer.teaching_methodology || ''
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
      queryClient.invalidateQueries({ queryKey: ['enhanced-trainer-profile'] });
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
        skills: trainer.skills || [],
        linkedin_profile: trainer.linkedin_profile || '',
        github_profile: trainer.github_profile || '',
        portfolio_url: trainer.portfolio_url || '',
        languages_spoken: trainer.languages_spoken || [],
        education: trainer.education || [],
        achievements: trainer.achievements || [],
        teaching_methodology: trainer.teaching_methodology || ''
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

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages_spoken.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages_spoken: [...formData.languages_spoken, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages_spoken: formData.languages_spoken.filter(lang => lang !== language)
    });
  };

  const addEducation = () => {
    if (newEducation.trim() && !formData.education.includes(newEducation.trim())) {
      setFormData({
        ...formData,
        education: [...formData.education, newEducation.trim()]
      });
      setNewEducation('');
    }
  };

  const removeEducation = (education: string) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu !== education)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements.includes(newAchievement.trim())) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter(ach => ach !== achievement)
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Professional Profile
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
                queryClient.invalidateQueries({ queryKey: ['enhanced-trainer-profile'] });
              }}
            />
          </div>

          {/* Basic Information */}
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
                  placeholder="e.g., Senior Software Engineer & Tech Trainer"
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
                  placeholder="e.g., Full Stack Development, Cloud Architecture"
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

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            {isEditing ? (
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell clients about your professional background, expertise, and training approach..."
                rows={4}
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.bio || 'No bio provided'}</p>
            )}
          </div>

          {/* Teaching Methodology */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Methodology
            </label>
            {isEditing ? (
              <Textarea
                value={formData.teaching_methodology}
                onChange={(e) => setFormData({ ...formData, teaching_methodology: e.target.value })}
                placeholder="Describe your teaching approach, preferred methods, and what makes your training effective..."
                rows={3}
              />
            ) : (
              <p className="text-gray-900">{trainerData?.trainer?.teaching_methodology || 'Not specified'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Professional Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Linkedin className="inline h-4 w-4 mr-1" />
                LinkedIn Profile
              </label>
              {isEditing ? (
                <Input
                  value={formData.linkedin_profile}
                  onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              ) : (
                <p className="text-gray-900">
                  {trainerData?.trainer?.linkedin_profile ? (
                    <a href={trainerData.trainer.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {trainerData.trainer.linkedin_profile}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Github className="inline h-4 w-4 mr-1" />
                GitHub Profile
              </label>
              {isEditing ? (
                <Input
                  value={formData.github_profile}
                  onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })}
                  placeholder="https://github.com/username"
                />
              ) : (
                <p className="text-gray-900">
                  {trainerData?.trainer?.github_profile ? (
                    <a href={trainerData.trainer.github_profile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {trainerData.trainer.github_profile}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Portfolio URL
              </label>
              {isEditing ? (
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              ) : (
                <p className="text-gray-900">
                  {trainerData?.trainer?.portfolio_url ? (
                    <a href={trainerData.trainer.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {trainerData.trainer.portfolio_url}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Expertise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills & Certifications
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Languages className="inline h-4 w-4 mr-1" />
              Languages Spoken
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <Button type="button" onClick={addLanguage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages_spoken.map((language, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeLanguage(language)}>
                      {language} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trainerData?.trainer?.languages_spoken?.length > 0 ? (
                  trainerData.trainer.languages_spoken.map((language: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No languages specified</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Education & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education & Qualifications
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newEducation}
                    onChange={(e) => setNewEducation(e.target.value)}
                    placeholder="Add education or qualification"
                    onKeyPress={(e) => e.key === 'Enter' && addEducation()}
                  />
                  <Button type="button" onClick={addEducation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.education.map((education, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{education}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(education)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {trainerData?.trainer?.education?.length > 0 ? (
                  trainerData.trainer.education.map((education: string, index: number) => (
                    <p key={index} className="text-gray-900 border-l-4 border-blue-500 pl-3 py-1">
                      {education}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No education information added</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Achievements
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add an achievement or recognition"
                    onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                  />
                  <Button type="button" onClick={addAchievement}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{achievement}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAchievement(achievement)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {trainerData?.trainer?.achievements?.length > 0 ? (
                  trainerData.trainer.achievements.map((achievement: string, index: number) => (
                    <p key={index} className="text-gray-900 border-l-4 border-green-500 pl-3 py-1">
                      {achievement}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No achievements added</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Tags (Read-only) */}
      {trainerData?.trainer?.tags && (trainerData.trainer.tags as string[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Admin Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(trainerData.trainer.tags as string[]).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTrainerProfile;