
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  onUploadSuccess?: (url: string) => void;
}

const ProfilePictureUpload = ({ currentAvatarUrl, onUploadSuccess }: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `trainer-avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: (url) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      onUploadSuccess?.(url);
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
          <Camera className="h-4 w-4 text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Upload a professional photo</p>
        <label className="inline-flex items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </>
              )}
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
