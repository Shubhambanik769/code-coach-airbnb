-- Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.service_categories(id),
  subcategory TEXT NOT NULL, -- This will store the specific subcategory from the categories array
  base_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  duration TEXT,
  description TEXT,
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create policies for packages
CREATE POLICY "Admins can manage all packages" 
ON public.packages 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view active packages" 
ON public.packages 
FOR SELECT 
TO anon, authenticated 
USING (is_active = true);

-- Create package_customization_options table
CREATE TABLE IF NOT EXISTS public.package_customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'select', 'checkbox', 'input'
  options JSONB DEFAULT '[]', -- Array of {label, price} objects
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for customization options
ALTER TABLE public.package_customization_options ENABLE ROW LEVEL SECURITY;

-- Create policies for customization options
CREATE POLICY "Admins can manage customization options" 
ON public.package_customization_options 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Everyone can view customization options for active packages" 
ON public.package_customization_options 
FOR SELECT 
TO anon, authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.packages 
    WHERE id = package_id AND is_active = true
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();