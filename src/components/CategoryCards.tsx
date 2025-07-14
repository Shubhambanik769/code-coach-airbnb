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
      const {
        data
      } = await supabase.from('service_categories').select('*').eq('is_active', true).order('display_order');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);
  const handleCategoryClick = (slug: string) => {
    navigate(`/services/${slug}`);
  };
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Training Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of professional training programs designed to enhance your skills
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon_name as keyof typeof iconMap] || Settings;
            
            return (
              <Card 
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-gradient-to-br from-white to-muted/30"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                      {category.base_price && (
                        <p className="text-primary font-semibold mt-2">
                          Starting from ₹{category.base_price}
                        </p>
                      )}
                    </div>
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