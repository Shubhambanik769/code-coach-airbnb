
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, CreditCard, Users } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface BookingCalendarProps {
  trainerId: string;
  trainerName: string;
  hourlyRate: number;
}

const BookingCalendar = ({ trainerId, trainerName, hourlyRate }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    trainingTopic: '',
    duration: 1,
    notes: '',
    organizationName: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['trainer-availability', trainerId, selectedDate],
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
      return data;
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingInfo: any) => {
      const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot.start_time}`);
      const endTime = new Date(startTime.getTime() + bookingInfo.duration * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          trainer_id: trainerId,
          student_id: 'user-id-placeholder', // This would come from auth context
          training_topic: bookingInfo.trainingTopic,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: bookingInfo.duration,
          total_amount: hourlyRate * bookingInfo.duration,
          notes: bookingInfo.notes,
          organization_name: bookingInfo.organizationName,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      setShowBookingForm(false);
      setSelectedSlot(null);
      setBookingData({
        trainingTopic: '',
        duration: 1,
        notes: '',
        organizationName: ''
      });
      toast({
        title: "Booking Requested",
        description: "Your booking request has been sent to the trainer."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleBooking = () => {
    if (!selectedSlot || !bookingData.trainingTopic) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createBookingMutation.mutate(bookingData);
  };

  const availableDates = [...Array(30)].map((_, i) => addDays(new Date(), i));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book a Session with {trainerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">
              Available Times - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">Loading availability...</div>
              ) : availability.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No available slots for this date
                </div>
              ) : (
                availability.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {slot.start_time} - {slot.end_time}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedSlot && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">Selected Time Slot</h4>
                <p className="text-sm text-gray-600">
                  {format(selectedDate, 'MMM d, yyyy')} • {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
              </div>
              <Badge variant="secondary">${hourlyRate}/hour</Badge>
            </div>

            <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
              <DialogTrigger asChild>
                <Button className="w-full bg-techblue-600 hover:bg-techblue-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Book This Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Your Booking</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Training Topic *</Label>
                    <Input
                      id="topic"
                      value={bookingData.trainingTopic}
                      onChange={(e) => setBookingData({...bookingData, trainingTopic: e.target.value})}
                      placeholder="e.g., React Development, Python Basics"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="8"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="organization">Organization (optional)</Label>
                    <Input
                      id="organization"
                      value={bookingData.organizationName}
                      onChange={(e) => setBookingData({...bookingData, organizationName: e.target.value})}
                      placeholder="Company or personal"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      placeholder="Any specific requirements or goals..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Rate per hour:</span>
                      <span>${hourlyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Duration:</span>
                      <span>{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${hourlyRate * bookingData.duration}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    disabled={createBookingMutation.isPending}
                    className="w-full bg-techblue-600 hover:bg-techblue-700"
                  >
                    {createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
