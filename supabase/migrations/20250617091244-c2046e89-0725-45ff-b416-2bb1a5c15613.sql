
-- Fix the storage policies for avatars bucket to allow proper uploads
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Create new policies with proper folder structure handling
-- Allow authenticated users to upload their own avatars (simplified path check)
CREATE POLICY "Users can upload their avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    name LIKE auth.uid()::text || '/%' OR 
    name LIKE 'trainer-avatars/' || auth.uid()::text || '-%'
  )
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    name LIKE auth.uid()::text || '/%' OR 
    name LIKE 'trainer-avatars/' || auth.uid()::text || '-%'
  )
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (
    name LIKE auth.uid()::text || '/%' OR 
    name LIKE 'trainer-avatars/' || auth.uid()::text || '-%'
  )
);
