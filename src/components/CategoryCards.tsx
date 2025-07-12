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
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(category => {
      const IconComponent = iconMap[category.icon_name as keyof typeof iconMap] || Code;
      return <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleCategoryClick(category.slug)}>
            
          </Card>;
    })}
    </div>;
};
export default CategoryCards;