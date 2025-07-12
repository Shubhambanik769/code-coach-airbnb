import { useEffect, useState } from 'react';
import { Star, Users, Award, TrendingUp, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
interface FeaturedStory {
  id: string;
  title: string;
  content: string;
  client_name: string;
  client_position: string;
  client_company: string;
  client_avatar_url?: string;
}
const TrustSection = () => {
  const [featuredStory, setFeaturedStory] = useState<FeaturedStory | null>(null);
  useEffect(() => {
    fetchFeaturedStory();
  }, []);
  const fetchFeaturedStory = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('success_stories').select('*').eq('is_featured', true).order('display_order', {
        ascending: true
      }).limit(1).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching featured story:', error);
        return;
      }
      if (data) {
        setFeaturedStory(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const stats = [{
    icon: Users,
    value: "10,000+",
    label: "Students Trained",
    color: "text-blue-600"
  }, {
    icon: Star,
    value: "4.9/5",
    label: "Average Rating",
    color: "text-yellow-500"
  }, {
    icon: Award,
    value: "500+",
    label: "Certified Trainers",
    color: "text-green-600"
  }, {
    icon: TrendingUp,
    value: "95%",
    label: "Success Rate",
    color: "text-purple-600"
  }];
  return;
};
export default TrustSection;