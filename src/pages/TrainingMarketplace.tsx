
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Search, Calendar, MapPin, Users, DollarSign, FileText, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicTrainingRequestCard from '@/components/training/PublicTrainingRequestCard';

interface TrainingRequest {
  id: string;
  title: string;
  description: string | null;
  target_audience: string;
  expected_start_date: string | null;
  expected_end_date: string | null;
  duration_hours: number | null;
  delivery_mode: string | null;
  location: string | null;
  language_preference: string | null;
  tools_required: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  application_deadline: string | null;
  created_at: string;
  client_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const TrainingMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryModeFilter, setDeliveryModeFilter] = useState('all');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch training requests with client information
  const { data: requests, isLoading } = useQuery({
    queryKey: ['public-training-requests', searchTerm, deliveryModeFilter, targetAudienceFilter],
    queryFn: async () => {
      let query = supabase
        .from('training_requests')
        .select(`
          id,
          title,
          description,
          target_audience,
          expected_start_date,
          expected_end_date,
          duration_hours,
          delivery_mode,
          location,
          language_preference,
          tools_required,
          budget_min,
          budget_max,
          application_deadline,
          created_at,
          client_id,
          profiles(full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (deliveryModeFilter !== 'all') {
        query = query.eq('delivery_mode', deliveryModeFilter);
      }

      if (targetAudienceFilter !== 'all') {
        query = query.eq('target_audience', targetAudienceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });

  const handleViewDetails = (requestId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Navigate to trainer dashboard to see full details and apply
    navigate('/trainer-dashboard', { state: { activeTab: 'requests', requestId } });
  };

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Training Requests Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting training opportunities from organizations and individuals looking for expert trainers
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Training Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search training requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={deliveryModeFilter} onValueChange={setDeliveryModeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Delivery Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="bg-techblue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-techblue-600">{filteredRequests?.length || 0}</div>
                  <div className="text-sm text-gray-600">Active Requests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-techblue-600">
                    {filteredRequests?.filter(r => r.delivery_mode === 'online').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Online Opportunities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-techblue-600">
                    {filteredRequests?.filter(r => r.target_audience === 'corporate').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Corporate Training</div>
                </div>
              </div>
            </div>

            {/* Request Cards */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading training opportunities...</p>
                </div>
              ) : filteredRequests?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No training requests found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria to find more opportunities</p>
                </div>
              ) : (
                filteredRequests?.map((request) => (
                  <PublicTrainingRequestCard
                    key={request.id}
                    request={request}
                    onViewDetails={handleViewDetails}
                    isAuthenticated={!!user}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action for Non-Trainers */}
        {!user && (
          <Card className="bg-gradient-to-r from-techblue-600 to-techblue-700 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Training?</h2>
              <p className="text-techblue-100 mb-6">
                Join our platform to apply for training opportunities and build your training career
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="secondary"
                  size="lg"
                >
                  Login to Apply
                </Button>
                <Button 
                  onClick={() => navigate('/apply-trainer')}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-techblue-700"
                >
                  Become a Trainer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrainingMarketplace;
