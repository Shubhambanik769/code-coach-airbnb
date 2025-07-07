
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
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    slug: 'web-development'
  },
  {
    icon: Cloud,
    title: 'Cloud Computing',
    description: 'AWS, Azure, Google Cloud',
    count: '300+ trainers',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    slug: 'cloud-computing'
  },
  {
    icon: Database,
    title: 'Data Science',
    description: 'Python, R, Machine Learning',
    count: '250+ trainers',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    slug: 'data-science'
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    description: 'Ethical Hacking, Penetration Testing',
    count: '180+ trainers',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-50',
    accentColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    slug: 'cybersecurity'
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'iOS, Android, React Native',
    count: '220+ trainers',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    accentColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    slug: 'mobile-development'
  },
  {
    icon: BarChart,
    title: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD',
    count: '160+ trainers',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    slug: 'devops'
  }
];

const CategoryCards = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/technology/${slug}`);
  };

  return (
    <section className="section-padding bg-gradient-to-b from-muted to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-emerald-200 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="text-center mb-20">
          <h2 className="heading-lg text-foreground mb-6">
            Popular <span className="text-gradient">Training Categories</span>
          </h2>
          <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our most in-demand technology training areas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.title}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover background effect */}
                <div className={`absolute inset-0 ${category.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 blur-xl`}></div>
                
                <Card 
                  className="relative cursor-pointer bg-card/90 backdrop-blur-sm border-0 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in overflow-hidden"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  
                  <CardContent className="p-8 relative">
                    {/* Icon with enhanced styling */}
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      {/* Icon glow effect */}
                      <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${category.color} opacity-30 blur-lg group-hover:opacity-50 transition-all duration-500`}></div>
                    </div>
                    
                    <h3 className={`text-2xl font-bold text-foreground mb-4 group-hover:${category.accentColor} transition-colors duration-300`}>
                      {category.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${category.accentColor} bg-gradient-to-r ${category.bgColor} to-white px-4 py-2 rounded-2xl border ${category.borderColor} shadow-sm`}>
                        {category.count}
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        <span className="text-sm font-semibold">Explore</span>
                        <div className="w-6 h-6 rounded-full bg-muted group-hover:bg-accent flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                          <span className="text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
