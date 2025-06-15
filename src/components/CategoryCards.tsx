
import { Code, Cloud, Database, Shield, Smartphone, BarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'React, Angular, Vue.js, Node.js',
    count: '500+ trainers',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Cloud,
    title: 'Cloud Computing',
    description: 'AWS, Azure, Google Cloud',
    count: '300+ trainers',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Database,
    title: 'Data Science',
    description: 'Python, R, Machine Learning',
    count: '250+ trainers',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    description: 'Ethical Hacking, Penetration Testing',
    count: '180+ trainers',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'iOS, Android, React Native',
    count: '220+ trainers',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: BarChart,
    title: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD',
    count: '160+ trainers',
    color: 'from-yellow-500 to-orange-500'
  }
];

const CategoryCards = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Popular <span className="text-gradient">Training Categories</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our most in-demand technology training areas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.title} 
                className="group cursor-pointer card-hover border-0 shadow-lg bg-card-gradient animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-techblue-600 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-techblue-600 bg-techblue-50 px-2 sm:px-3 py-1 rounded-full">
                      {category.count}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 group-hover:text-techblue-600 font-medium transition-colors">
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
