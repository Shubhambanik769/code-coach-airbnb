
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements } from '@/hooks/useAgreements';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, MapPin, Star, BookOpen, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { format, parseISO, addHours } from 'date-fns';
import AgreementModal from '@/components/agreements/AgreementModal';
import { BMCIntegration, formatINR, createBookingReference } from '@/lib/bmc';

interface BookingCalendarProps {
  trainerId: string;
  trainerName: string;
  hourlyRate?: number;
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
}

interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string;
  company_name: string | null;
}

const BookingCalendar = ({ trainerId, trainerName, hourlyRate = 0 }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [trainingTopic, setTrainingTopic] = useState('');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [selectedClientEmail, setSelectedClientEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [durationHours, setDurationHours] = useState(1);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createAgreementForBooking, fetchAgreement } = useAgreements();

  // Fetch client profile for the dropdown
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as ClientProfile;
    },
    enabled: !!user?.id
  });

  // Fetch available slots for the selected date
  const { data: availableSlots, isLoading } = useQuery({
    queryKey: ['trainer-available-slots', trainerId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .eq('is_available', true)
        .eq('is_booked', false)
        .order('start_time');

      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!trainerId
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot?.start_time}`);
      const endTime = addHours(startTime, durationHours);
      const totalAmount = hourlyRate * durationHours;

      // Create booking first
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          trainer_id: trainerId,
          training_topic: trainingTopic,
          organization_name: organizationName,
          special_requirements: specialRequirements,
          client_name: selectedClientName,
          client_email: selectedClientEmail,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: durationHours,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          bmc_payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Generate BMC payment URL
      const bmc = new BMCIntegration(''); // Token handled server-side
      const paymentMessage = BMCIntegration.formatPaymentMessage({
        training_topic: trainingTopic,
        trainer_name: trainerName,
        start_time: startTime.toISOString()
      });
      
      const bookingReference = createBookingReference(data.id);
      const bmcPaymentUrl = bmc.generatePaymentUrl({
        amount: totalAmount,
        message: paymentMessage,
        reference: bookingReference,
        currency: 'INR'
      });

      // Update booking with BMC payment URL
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ bmc_payment_url: bmcPaymentUrl })
        .eq('id', data.id);

      if (updateError) throw updateError;

      // Update the availability slot to mark it as booked
      if (selectedSlot) {
        await supabase
          .from('trainer_availability')
          .update({ is_booked: true })
          .eq('id', selectedSlot.id);
      }

      return { ...data, bmc_payment_url: bmcPaymentUrl };
    },
    onSuccess: (bookingData) => {
      // Create agreement and show agreement modal instead of completing booking
      setPendingBookingId(bookingData.id);
      createAgreementForBooking.mutate({ 
        bookingId: bookingData.id, 
        userType: 'client' 
      });
      queryClient.invalidateQueries({ queryKey: ['trainer-available-slots'] });
      setIsBookingDialogOpen(false);
      
      // Show success message with payment instructions
      toast({
        title: "Booking Created Successfully!",
        description: "Complete your payment to confirm the session.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    }
  });

  // Handle agreement creation success
  const handleAgreementCreated = () => {
    if (pendingBookingId) {
      setIsAgreementModalOpen(true);
    }
  };

  // Handle agreement completion
  const handleAgreementCompleted = async () => {
    setIsAgreementModalOpen(false);
    
    // Get the booking with BMC payment URL
    if (pendingBookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('bmc_payment_url, total_amount')
        .eq('id', pendingBookingId)
        .single();
      
      if (booking?.bmc_payment_url) {
        toast({
          title: "Agreement Signed Successfully!",
          description: "Redirecting to payment page to complete your booking...",
        });
        
        // Redirect to BMC payment page
        setTimeout(() => {
          window.open(booking.bmc_payment_url, '_blank');
        }, 1500);
      }
    }
    
    setPendingBookingId(null);
    setSelectedSlot(null);
    setTrainingTopic('');
    setSelectedClientName('');
    setSelectedClientEmail('');
    setOrganizationName('');
    setSpecialRequirements('');
    setDurationHours(1);
  };

  // Fetch agreement data for the modal
  const { data: agreementData } = fetchAgreement(pendingBookingId || '');

  // Watch for agreement creation success
  createAgreementForBooking.isSuccess && !isAgreementModalOpen && pendingBookingId && handleAgreementCreated();

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session",
        variant: "destructive"
      });
      return;
    }

    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
    
    // Pre-fill client information if available
    if (clientProfile) {
      setSelectedClientName(clientProfile.full_name || '');
      setSelectedClientEmail(clientProfile.email || '');
      setOrganizationName(clientProfile.company_name || '');
    }
  };

  const handleBookingSubmit = () => {
    if (!trainingTopic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide the training topic",
        variant: "destructive"
      });
      return;
    }

    if (!selectedClientName.trim() || !selectedClientEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select your name and email",
        variant: "destructive"
      });
      return;
    }

    createBookingMutation.mutate({});
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`);
    const end = addHours(start, duration);
    return format(end, 'HH:mm');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <CalendarIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Session</h1>
            <p className="text-xl text-gray-600">with {trainerName}</p>
          </div>
        </div>
        
        {hourlyRate > 0 && (
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-8 py-4 shadow-sm">
            <Star className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-green-800">₹{hourlyRate}/hour</span>
          </div>
        )}
      </div>

      {/* Step-by-step Booking Process */}
      <div className="space-y-8">
        
        {/* Step 1: Select Date */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-bold text-lg">
                1
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <CalendarIcon className="h-7 w-7 text-primary" />
                  Select Your Preferred Date
                </CardTitle>
                <p className="text-gray-600 mt-1">Choose a date that works best for you</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="w-full scale-110"
                />
              </div>
            </div>
            
            {/* Selected Date Display */}
            {selectedDate && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Choose Time Slot */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-bold text-lg">
                2
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Clock className="h-7 w-7 text-green-600" />
                  Choose Available Time
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Available slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading available times...</p>
              </div>
            ) : availableSlots?.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Available Slots</h3>
                <p className="text-gray-500 text-lg">Please select another date to see available times.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots?.map((slot) => (
                  <button
                    key={slot.id}
                    className="group relative p-6 rounded-2xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-800 text-lg">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Available</div>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-primary">Book Now</span>
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Complete Your Booking
            </DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-6">
              {/* Session Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-lg">Session Summary</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Date:</span>
                    <span className="font-semibold text-blue-900">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Time:</span>
                    <span className="font-semibold text-blue-900">
                      {selectedSlot.start_time} - {calculateEndTime(selectedSlot.start_time, durationHours)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Duration:</span>
                    <span className="font-semibold text-blue-900">{durationHours} hour(s)</span>
                  </div>
                  {hourlyRate > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                      <span className="font-bold text-blue-700 text-lg">Total Cost:</span>
                      <span className="font-bold text-blue-900 text-xl">₹{hourlyRate * durationHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-5">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-700">Personal Information</h4>
                  
                  <div>
                    <Label htmlFor="clientName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedClientName} onValueChange={setSelectedClientName}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientProfile?.full_name && (
                          <SelectItem value={clientProfile.full_name}>
                            {clientProfile.full_name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="clientEmail" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedClientEmail} onValueChange={setSelectedClientEmail}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your email" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientProfile?.email && (
                          <SelectItem value={clientProfile.email}>
                            {clientProfile.email}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 mb-2 block">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="8"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="topic" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Training Topic <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., React Development, Python Basics"
                    value={trainingTopic}
                    onChange={(e) => setTrainingTopic(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="organization" className="text-sm font-semibold text-gray-700 mb-2 block">Organization/Company</Label>
                  <Input
                    id="organization"
                    placeholder="Your organization name (optional)"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-sm font-semibold text-gray-700 mb-2 block">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any specific requirements or notes (optional)"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={4}
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending || !trainingTopic.trim() || !selectedClientName.trim() || !selectedClientEmail.trim()}
                  className="flex-1 h-14 text-lg font-semibold"
                  size="lg"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                  className="flex-1 h-14 text-lg font-semibold"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Agreement Modal */}
      {pendingBookingId && agreementData && (
        <AgreementModal
          isOpen={isAgreementModalOpen}
          onClose={() => setIsAgreementModalOpen(false)}
          bookingId={pendingBookingId}
          userType="client"
          agreementData={agreementData}
          onSuccess={handleAgreementCompleted}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
