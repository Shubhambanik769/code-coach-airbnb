
-- Create storage bucket for trainer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trainer-documents', 'trainer-documents', false);

-- Create policy to allow trainers to upload their own documents
CREATE POLICY "Trainers can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow trainers to view their own documents
CREATE POLICY "Trainers can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow trainers to update their own documents
CREATE POLICY "Trainers can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow trainers to delete their own documents
CREATE POLICY "Trainers can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trainer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
