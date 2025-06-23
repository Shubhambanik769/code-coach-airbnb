
import { useEffect, useState } from 'react';
import { Star, Quote, Building, User, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  client_name: string;
  client_position: string;
  client_company: string;
  client_avatar_url?: string;
  company_logo_url?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      toast.error('Failed to fetch success stories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Home" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our expert trainers have transformed teams and accelerated careers across leading organizations.
          </p>
        </div>

        {/* Featured Stories */}
        {stories.filter(story => story.is_featured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-current" />
              Featured Stories
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {stories.filter(story => story.is_featured).map((story) => (
                <Card key={story.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Quote className="h-8 w-8 text-techblue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{story.title}</h3>
                        <p className="text-gray-600 italic leading-relaxed">{story.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={story.client_avatar_url} />
                          <AvatarFallback className="bg-techblue-100 text-techblue-700">
                            {getInitials(story.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-800">{story.client_name}</div>
                          <div className="text-sm text-gray-600">{story.client_position}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          {story.client_company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Stories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Success Stories</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Quote className="h-6 w-6 text-techblue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{story.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{story.content}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={story.client_avatar_url} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                          {getInitials(story.client_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{story.client_name}</div>
                        <div className="text-xs text-gray-500">{story.client_position}</div>
                      </div>
                      {story.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building className="h-3 w-3" />
                      {story.client_company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {stories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Success Stories Yet</h3>
            <p className="text-gray-500">Check back soon for inspiring stories from our community!</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SuccessStories;
