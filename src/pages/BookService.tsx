import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
}

const BookService = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    location: searchParams.get('location') || '',
    teamSize: searchParams.get('teamSize') || '',
    duration: searchParams.get('duration') || '',
    companyName: '',
    contactPerson: '',
    email: user?.email || '',
    phone: '',
    trainingTopic: '',
    requirements: '',
    preferredDate: undefined as Date | undefined,
    timeSlot: '',
    budget: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchCategory = async () => {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
      
      if (data) {
        setCategory(data);
        setFormData(prev => ({ 
          ...prev, 
          trainingTopic: data.name,
          budget: data.base_price?.toString() || ''
        }));
      }
    };

    if (categorySlug) {
      fetchCategory();
    }
  }, [categorySlug, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;

    setLoading(true);
    try {
      // Calculate pricing
      const basePrice = category.base_price || 5000;
      const teamMultiplier = formData.teamSize === '6-15' ? 1.5 : formData.teamSize === '16-30' ? 2 : formData.teamSize === '30+' ? 3 : 1;
      const durationMultiplier = formData.duration === 'full-day' ? 2 : formData.duration === '2-days' ? 4 : formData.duration === 'week' ? 20 : 1;
      const totalAmount = basePrice * teamMultiplier * durationMultiplier;
      const platformFee = totalAmount * 0.2; // 20% platform fee
      const clientPayment = totalAmount + platformFee;

      // Create booking
      const startTime = formData.preferredDate?.toISOString() || new Date().toISOString();
      const endTime = new Date(new Date(startTime).getTime() + (durationMultiplier * 4 * 60 * 60 * 1000)).toISOString();
      
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          trainer_id: '', // Will be assigned by platform
          training_topic: formData.trainingTopic,
          start_time: startTime,
          end_time: endTime,
          duration_hours: durationMultiplier * 4,
          total_amount: totalAmount,
          location_city: formData.location,
          team_size: parseInt(formData.teamSize.split('-')[0]) || 1,
          service_category: category.slug,
          organization_name: formData.companyName,
          client_name: formData.contactPerson,
          client_email: formData.email,
          special_requirements: formData.requirements,
          client_payment_amount: clientPayment,
          platform_fee_amount: platformFee,
          platform_fee_percentage: 20,
          trainer_assignment_status: 'pending',
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Request Submitted!",
        description: "We'll find the best trainer for you and send confirmation shortly.",
      });

      // Redirect to payment
      navigate(`/payment/${booking.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back button */}
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Book {category.name} Training
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Company Name *"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Contact Person *"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Training Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Training Details</h3>
                    <Input
                      placeholder="Specific Training Topic"
                      value={formData.trainingTopic}
                      onChange={(e) => setFormData({...formData, trainingTopic: e.target.value})}
                    />
                    <Textarea
                      placeholder="Special Requirements or Learning Objectives"
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      rows={4}
                    />
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.preferredDate}
                            onSelect={(date) => setFormData({...formData, preferredDate: date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Select value={formData.timeSlot} onValueChange={(value) => setFormData({...formData, timeSlot: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Preferred time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM - 1 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (2 PM - 6 PM)</SelectItem>
                          <SelectItem value="full-day">Full Day (9 AM - 6 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 h-12">
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{formData.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{formData.teamSize || 'Team size not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formData.duration || 'Duration not set'}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>₹{category.base_price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total (estimated):</span>
                      <span>₹{category.base_price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Final price will be calculated based on your requirements
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookService;