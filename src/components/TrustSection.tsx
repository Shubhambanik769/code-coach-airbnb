
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
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

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

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Students Trained",
      color: "text-blue-600"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Average Rating",
      color: "text-yellow-500"
    },
    {
      icon: Award,
      value: "500+",
      label: "Certified Trainers",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Success Rate",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Organizations
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied learners and organizations who have achieved their goals with our expert trainers.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Success Story */}
        {featuredStory && (
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-techblue-50 to-purple-50 border-techblue-200">
            <CardContent className="p-8 sm:p-12">
              <div className="flex items-start gap-4 sm:gap-6">
                <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-techblue-600 flex-shrink-0 mt-2" />
                <div className="flex-1">
                  <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 italic">
                    "{featuredStory.content}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                      <AvatarImage src={featuredStory.client_avatar_url} />
                      <AvatarFallback className="bg-techblue-100 text-techblue-700 font-semibold">
                        {getInitials(featuredStory.client_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{featuredStory.client_name}</div>
                      <div className="text-gray-600">{featuredStory.client_position}</div>
                      <div className="text-techblue-600 font-medium">{featuredStory.client_company}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fallback testimonial if no featured story */}
        {!featuredStory && (
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-techblue-50 to-purple-50 border-techblue-200">
            <CardContent className="p-8 sm:p-12">
              <div className="flex items-start gap-4 sm:gap-6">
                <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-techblue-600 flex-shrink-0 mt-2" />
                <div className="flex-1">
                  <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 italic">
                    "TechTrainer helped us upskill our entire development team in React and AWS. The quality of trainers and personalized approach exceeded our expectations."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                      <AvatarFallback className="bg-techblue-100 text-techblue-700 font-semibold">
                        DC
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">David Chen</div>
                      <div className="text-gray-600">CTO</div>
                      <div className="text-techblue-600 font-medium">TechFlow Inc.</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trust Indicators */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-gray-600 mb-6">Trusted by teams at</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Microsoft</div>
            <div className="text-2xl font-bold text-gray-400">Amazon</div>
            <div className="text-2xl font-bold text-gray-400">Netflix</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
