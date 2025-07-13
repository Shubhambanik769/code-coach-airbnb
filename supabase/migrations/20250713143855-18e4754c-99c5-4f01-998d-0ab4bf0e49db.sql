-- Insert the Technology & IT Skills category with comprehensive subcategories
INSERT INTO public.service_categories (name, slug, icon_name, description, subcategories, is_active, display_order, base_price)
VALUES (
  'Technology & IT Skills',
  'technology-it-skills',
  'Code',
  'Comprehensive technology and IT skills training covering all major areas',
  ARRAY[
    'Web Development',
    'Mobile Development', 
    'Data Science & Analytics',
    'Cloud Computing',
    'DevOps & CI/CD',
    'Cybersecurity',
    'Machine Learning',
    'Python Programming',
    'JavaScript/React',
    'Database Management',
    'Software Architecture',
    'API Development',
    'Microservices',
    'Blockchain Development',
    'AI & Automation'
  ],
  true,
  0,
  5500.00
)
ON CONFLICT (slug) DO UPDATE SET
  subcategories = EXCLUDED.subcategories,
  updated_at = now();

-- Also add other major category groupings
INSERT INTO public.service_categories (name, slug, icon_name, description, subcategories, is_active, display_order, base_price)
VALUES (
  'Business & Entrepreneurship',
  'business-entrepreneurship',
  'BarChart3',
  'Business skills and entrepreneurship training',
  ARRAY[
    'Digital Marketing',
    'Project Management',
    'Financial Planning',
    'Leadership Skills',
    'Business Analytics',
    'Startup Management',
    'Investment & Trading',
    'Operations Management',
    'Sales & CRM',
    'Business Strategy',
    'E-commerce',
    'Supply Chain Management'
  ],
  true,
  1,
  4500.00
),
(
  'Creative & Design',
  'creative-design',
  'Smartphone',
  'Creative and design skills training',
  ARRAY[
    'UI/UX Design',
    'Graphic Design',
    'Video Editing',
    'Photography',
    'Motion Graphics',
    'Brand Design',
    'Web Design',
    'Product Design',
    'Animation',
    'Digital Art',
    'Logo Design',
    'Content Creation'
  ],
  true,
  2,
  4000.00
)
ON CONFLICT (slug) DO UPDATE SET
  subcategories = EXCLUDED.subcategories,
  updated_at = now();