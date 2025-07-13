import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Code, Smartphone, BarChart3, Cloud, Settings, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  description: string;
  base_price: number;
}

const iconMap = {
  Code,
  Smartphone,
  BarChart3,
  Cloud,
  Settings,
  Shield
};

const CategoryCards = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) setCategories(data);
    };
    
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    navigate(`/services/${slug}`);
  };

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Training Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive range of professional training services designed to elevate your skills and advance your career.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon_name as keyof typeof iconMap] || Code;
            
            return (
              <Card 
                key={category.id} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>
                  
                  {category.base_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Starting from</span>
                      <span className="text-lg font-bold text-primary">
                        ${category.base_price}/hr
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No training categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCards;