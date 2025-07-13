-- Add subcategories column to service_categories table
ALTER TABLE public.service_categories 
ADD COLUMN subcategories TEXT[] DEFAULT '{}';

-- Update existing categories with sample subcategories
UPDATE public.service_categories 
SET subcategories = ARRAY[
  'Frontend Development',
  'Backend Development', 
  'Full-stack Development',
  'React/Vue/Angular',
  'Node.js/Express',
  'Database Design'
]
WHERE slug = 'web-development';

UPDATE public.service_categories 
SET subcategories = ARRAY[
  'iOS Development',
  'Android Development',
  'React Native',
  'Flutter Development',
  'Mobile UI/UX',
  'App Store Deployment'
]
WHERE slug = 'mobile-development';

UPDATE public.service_categories 
SET subcategories = ARRAY[
  'Machine Learning',
  'Data Analytics',
  'Python Programming',
  'Data Visualization',
  'Statistical Analysis',
  'Big Data Processing'
]
WHERE slug = 'data-science';

UPDATE public.service_categories 
SET subcategories = ARRAY[
  'AWS Certification',
  'Azure Fundamentals',
  'Google Cloud Platform',
  'Cloud Architecture',
  'Cloud Security',
  'Cloud Migration'
]
WHERE slug = 'cloud-computing';

UPDATE public.service_categories 
SET subcategories = ARRAY[
  'CI/CD Pipelines',
  'Docker Containers',
  'Kubernetes',
  'Infrastructure as Code',
  'Monitoring & Logging',
  'DevOps Culture'
]
WHERE slug = 'devops';

UPDATE public.service_categories 
SET subcategories = ARRAY[
  'Network Security',
  'Ethical Hacking',
  'Security Auditing',
  'Penetration Testing',
  'Cybersecurity Framework',
  'Incident Response'
]
WHERE slug = 'cybersecurity';