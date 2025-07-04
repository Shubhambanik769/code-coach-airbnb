
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
import { Calendar as CalendarIcon, Clock, User, CheckCircle } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Book a Session with {trainerName}
          </CardTitle>
          {hourlyRate > 0 && (
            <p className="text-sm text-gray-600">
              Rate: ₹{hourlyRate}/hour
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Available Slots - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8">Loading available slots...</div>
              ) : availableSlots?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available slots for this date. Please select another date.
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSlots?.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">
                            {slot.start_time} - {slot.end_time}
                          </div>
                          <div className="text-xs text-green-600">Available</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Training Session</DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Session Details</div>
                <div className="text-sm text-blue-700">
                  Date: {format(selectedDate, 'MMMM d, yyyy')}
                </div>
                <div className="text-sm text-blue-700">
                  Time: {selectedSlot.start_time} - {calculateEndTime(selectedSlot.start_time, durationHours)}
                </div>
                <div className="text-sm text-blue-700">
                  Duration: {durationHours} hour(s)
                </div>
                {hourlyRate > 0 && (
                  <div className="text-sm font-medium text-blue-900">
                    Total Cost: ₹{hourlyRate * durationHours}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="topic">Training Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Development, Python Basics"
                  value={trainingTopic}
                  onChange={(e) => setTrainingTopic(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization/Company</Label>
                <Input
                  id="organization"
                  placeholder="Your organization name (optional)"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Special Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Any specific requirements or notes (optional)"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending || !trainingTopic.trim()}
                  className="flex-1"
                >
                  {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                  className="flex-1"
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
