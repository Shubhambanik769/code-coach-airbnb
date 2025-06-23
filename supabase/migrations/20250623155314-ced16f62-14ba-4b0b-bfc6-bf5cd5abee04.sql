
-- Create success_stories table
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_position TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_avatar_url TEXT,
  company_logo_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Success stories are publicly readable" 
  ON public.success_stories 
  FOR SELECT 
  USING (true);

-- Policy for admin insert
CREATE POLICY "Admins can insert success stories" 
  ON public.success_stories 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admin update
CREATE POLICY "Admins can update success stories" 
  ON public.success_stories 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admin delete
CREATE POLICY "Admins can delete success stories" 
  ON public.success_stories 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample success story
INSERT INTO public.success_stories (
  title,
  content,
  client_name,
  client_position,
  client_company,
  is_featured,
  display_order
) VALUES (
  'Exceptional React and AWS Training',
  'TechTrainer helped us upskill our entire development team in React and AWS. The quality of trainers and personalized approach exceeded our expectations.',
  'David Chen',
  'CTO',
  'TechFlow Inc.',
  true,
  1
);
