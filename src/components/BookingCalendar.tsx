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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, MapPin, Star, BookOpen } from 'lucide-react';
import { format, parseISO, addHours } from 'date-fns';

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

const BookingCalendar = ({ trainerId, trainerName, hourlyRate = 0 }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [trainingTopic, setTrainingTopic] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [durationHours, setDurationHours] = useState(1);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          trainer_id: trainerId,
          training_topic: trainingTopic,
          organization_name: organizationName,
          special_requirements: specialRequirements,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: durationHours,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update the availability slot to mark it as booked
      if (selectedSlot) {
        await supabase
          .from('trainer_availability')
          .update({ is_booked: true })
          .eq('id', selectedSlot.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-available-slots'] });
      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
      setTrainingTopic('');
      setOrganizationName('');
      setSpecialRequirements('');
      setDurationHours(1);
      toast({
        title: "Booking Created Successfully!",
        description: "Your booking request has been sent to the trainer. You will be notified once confirmed."
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

    createBookingMutation.mutate({});
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${startTime}`);
    const end = addHours(start, duration);
    return format(end, 'HH:mm');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <CalendarIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Book a Session</h2>
            <p className="text-lg text-gray-600">with {trainerName}</p>
          </div>
        </div>
        
        {hourlyRate > 0 && (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <Star className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">₹{hourlyRate}/hour</span>
          </div>
        )}
      </div>

      {/* Main Booking Interface */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Calendar Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900">Select Date</h3>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Right Column - Time Slots Section */}
            <div className="space-y-4 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Available Times</h3>
                  <p className="text-sm text-gray-600">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[400px] flex flex-col">
                {isLoading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : availableSlots?.length === 0 ? (
                  <div className="text-center py-16 flex-1 flex flex-col justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h4>
                    <p className="text-gray-500">Please select another date to see available times.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1">
                    {availableSlots?.map((slot) => (
                      <button
                        key={slot.id}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-200 transition-all duration-200 group"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-green-800 text-lg">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="text-sm text-green-600">Available</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">Book Now</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Book Training Session
            </DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-6">
              {/* Session Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Session Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Date:</span>
                    <span className="font-medium text-blue-900">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Time:</span>
                    <span className="font-medium text-blue-900">
                      {selectedSlot.start_time} - {calculateEndTime(selectedSlot.start_time, durationHours)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-medium text-blue-900">{durationHours} hour(s)</span>
                  </div>
                  {hourlyRate > 0 && (
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="font-semibold text-blue-700">Total Cost:</span>
                      <span className="font-bold text-blue-900 text-lg">₹{hourlyRate * durationHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="8"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                    Training Topic <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., React Development, Python Basics"
                    value={trainingTopic}
                    onChange={(e) => setTrainingTopic(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700">Organization/Company</Label>
                  <Input
                    id="organization"
                    placeholder="Your organization name (optional)"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any specific requirements or notes (optional)"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending || !trainingTopic.trim()}
                  className="flex-1 h-12 font-medium"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                  className="flex-1 h-12 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCalendar;
