
import { Code, Cloud, Database, Shield, Smartphone, BarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'React, Angular, Vue.js, Node.js',
    count: '500+ trainers',
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-slate-50 to-blue-50',
    borderColor: 'border-blue-100',
    slug: 'web-development'
  },
  {
    icon: Cloud,
    title: 'Cloud Computing',
    description: 'AWS, Azure, Google Cloud',
    count: '300+ trainers',
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-slate-50 to-purple-50',
    borderColor: 'border-purple-100',
    slug: 'cloud-computing'
  },
  {
    icon: Database,
    title: 'Data Science',
    description: 'Python, R, Machine Learning',
    count: '250+ trainers',
    color: 'from-green-500 to-teal-500',
    bgGradient: 'from-slate-50 to-emerald-50',
    borderColor: 'border-emerald-100',
    slug: 'data-science'
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    description: 'Ethical Hacking, Penetration Testing',
    count: '180+ trainers',
    color: 'from-red-500 to-orange-500',
    bgGradient: 'from-slate-50 to-red-50',
    borderColor: 'border-red-100',
    slug: 'cybersecurity'
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'iOS, Android, React Native',
    count: '220+ trainers',
    color: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-slate-50 to-indigo-50',
    borderColor: 'border-indigo-100',
    slug: 'mobile-development'
  },
  {
    icon: BarChart,
    title: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD',
    count: '160+ trainers',
    color: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-slate-50 to-amber-50',
    borderColor: 'border-amber-100',
    slug: 'devops'
  }
];

const CategoryCards = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/technology/${slug}`);
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Popular <span className="text-gradient">Training Categories</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Explore our most in-demand technology training areas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.title} 
                className="card-minimal group cursor-pointer card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className="p-8 relative overflow-hidden">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 airbnb-shadow`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-rose-600 transition-colors duration-300">
                    {category.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-full">
                      {category.count}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-rose-600 font-medium transition-colors duration-300 group-hover:translate-x-1">
                      Explore →
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
