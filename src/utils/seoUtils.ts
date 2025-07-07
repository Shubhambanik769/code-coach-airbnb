// SEO utility functions for Skilloop.io

export const generatePageTitle = (pageTitle: string, includeCompany = true): string => {
  if (!includeCompany) return pageTitle;
  return `${pageTitle} | Skilloop.io - Technology Training Platform`;
};

export const generateMetaDescription = (content: string, maxLength = 160): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3).trim() + '...';
};

export const generateKeywords = (baseKeywords: string[], additionalKeywords: string[] = []): string => {
  const defaultKeywords = [
    'technology training',
    'tech trainers', 
    'programming courses',
    'software development training',
    'online tech education',
    'expert trainers',
    'skilled trainers',
    'corporate training',
    'Skilloop'
  ];
  
  const allKeywords = [...new Set([...baseKeywords, ...additionalKeywords, ...defaultKeywords])];
  return allKeywords.join(', ');
};

export const generateCanonicalUrl = (path: string, baseUrl = 'https://skilloop.io'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;
  return url.endsWith('/') ? url : `${url}/`;
};

export const generateStructuredData = {
  breadcrumb: (items: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  course: (courseData: {
    name: string;
    description: string;
    provider: string;
    url?: string;
    image?: string;
    price?: number;
    currency?: string;
    duration?: string;
    instructor?: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": courseData.name,
    "description": courseData.description,
    "provider": {
      "@type": "Organization",
      "name": courseData.provider,
      "url": "https://skilloop.io"
    },
    ...(courseData.url && { "url": courseData.url }),
    ...(courseData.image && { "image": courseData.image }),
    ...(courseData.price && {
      "offers": {
        "@type": "Offer",
        "price": courseData.price,
        "priceCurrency": courseData.currency || "USD"
      }
    }),
    ...(courseData.duration && { "timeRequired": courseData.duration }),
    ...(courseData.instructor && {
      "instructor": {
        "@type": "Person",
        "name": courseData.instructor
      }
    })
  }),

  person: (personData: {
    name: string;
    jobTitle?: string;
    description?: string;
    url?: string;
    image?: string;
    skills?: string[];
    experience?: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": personData.name,
    ...(personData.jobTitle && { "jobTitle": personData.jobTitle }),
    ...(personData.description && { "description": personData.description }),
    ...(personData.url && { "url": personData.url }),
    ...(personData.image && { "image": personData.image }),
    ...(personData.skills && {
      "hasCredential": personData.skills.map(skill => ({
        "@type": "EducationalOccupationalCredential",
        "name": skill
      }))
    }),
    ...(personData.experience && { "workExample": personData.experience })
  }),

  faq: (faqItems: Array<{question: string, answer: string}>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }),

  organization: (orgData: {
    name: string;
    description: string;
    url: string;
    logo?: string;
    contactPoint?: {
      telephone: string;
      contactType: string;
    };
    sameAs?: string[];
  }) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": orgData.name,
    "description": orgData.description,
    "url": orgData.url,
    ...(orgData.logo && { "logo": orgData.logo }),
    ...(orgData.contactPoint && { "contactPoint": orgData.contactPoint }),
    ...(orgData.sameAs && { "sameAs": orgData.sameAs })
  })
};

export const defaultSEOConfig = {
  title: "Skilloop.io - Master Technology with Expert-Led Training | Find Tech Trainers",
  description: "Transform your tech skills with Skilloop.io - Connect with world-class technology trainers for personalized learning experiences. Book certified trainers in Python, React, AI, DevOps & more.",
  keywords: "technology training, tech trainers, programming courses, software development training, Python training, React training, AI training, DevOps training, corporate training, online tech education",
  image: "https://skilloop.io/og-image.png",
  url: "https://skilloop.io/",
  type: "website"
};

export const socialMediaLinks = {
  twitter: "https://twitter.com/skilloop",
  linkedin: "https://linkedin.com/company/skilloop", 
  facebook: "https://facebook.com/skilloop",
  youtube: "https://youtube.com/@skilloop",
  instagram: "https://instagram.com/skilloop"
};

// Core Web Vitals optimization helpers
export const optimizeImages = {
  // Generate responsive image sources
  generateSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Generate sizes attribute for responsive images
  generateSizes: (breakpoints: Array<{minWidth: string, width: string}>): string => {
    const sizeRules = breakpoints.map(bp => `(min-width: ${bp.minWidth}) ${bp.width}`);
    return sizeRules.join(', ');
  }
};

export const preloadCriticalResources = [
  { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', as: 'style' },
  { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
  { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
  { rel: 'preconnect', href: 'https://cdn.skilloop.io', crossOrigin: 'anonymous' }
];