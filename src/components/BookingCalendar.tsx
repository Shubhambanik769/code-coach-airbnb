
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, CreditCard, Users, CheckCircle2, Star } from 'lucide-react';
import { format, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns';

interface BookingCalendarProps {
  trainerId: string;
  trainerName: string;
  hourlyRate: number;
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  date: string;
  is_available: boolean;
  is_booked: boolean;
}

interface ConfirmedBooking {
  start_time: string;
  end_time: string;
  status: string;
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
  const { user } = useAuth();

  // Fetch availability slots for the selected date
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['trainer-availability', trainerId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .eq('is_available', true)
        .order('start_time');

      if (error) throw error;
      return data as AvailabilitySlot[];
    }
  });

  // Fetch confirmed bookings for the selected date
  const { data: confirmedBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['confirmed-bookings', trainerId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('trainer_id', trainerId)
        .eq('status', 'confirmed')
        .gte('start_time', format(selectedDate, 'yyyy-MM-dd 00:00:00'))
        .lt('start_time', format(addDays(selectedDate, 1), 'yyyy-MM-dd 00:00:00'));

      if (error) throw error;
      return data as ConfirmedBooking[];
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingInfo: any) => {
      if (!user) {
        throw new Error('User must be authenticated to book a session');
      }

      const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot.start_time}`);
      const endTime = new Date(startTime.getTime() + bookingInfo.duration * 60 * 60 * 1000);
      
      console.log('Creating booking with user ID:', user.id);
      
      // Check for conflicts with confirmed bookings before creating
      const hasConflict = confirmedBookings.some(booking => {
        const bookingStart = parseISO(booking.start_time);
        const bookingEnd = parseISO(booking.end_time);
        
        return (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        );
      });

      if (hasConflict) {
        throw new Error('This time slot conflicts with an existing confirmed booking');
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          trainer_id: trainerId,
          student_id: user.id,
          training_topic: bookingInfo.trainingTopic,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: bookingInfo.duration,
          total_amount: hourlyRate * bookingInfo.duration,
          notes: bookingInfo.notes,
          organization_name: bookingInfo.organizationName,
          status: 'pending'
        });

      if (error) {
        console.error('Booking creation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      queryClient.invalidateQueries({ queryKey: ['confirmed-bookings'] });
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
    onError: (error: any) => {
      console.error('Booking mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter available slots to exclude those that conflict with confirmed bookings
  const getAvailableSlots = () => {
    if (!availability || !confirmedBookings) return [];

    return availability.filter(slot => {
      if (slot.is_booked) return false;

      // Check if this slot conflicts with any confirmed booking
      const slotStart = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.start_time}`);
      const slotEnd = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.end_time}`);

      const hasConflict = confirmedBookings.some(booking => {
        const bookingStart = parseISO(booking.start_time);
        const bookingEnd = parseISO(booking.end_time);

        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      return !hasConflict;
    });
  };

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session.",
        variant: "destructive"
      });
      return;
    }

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

  const isLoading = isLoadingAvailability || isLoadingBookings;
  const availableSlots = getAvailableSlots();

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Book with {trainerName}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mb-6 text-lg">Sign in to book your training session</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
            size="lg"
          >
            Sign In to Book
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6" />
            <div>
              <h3 className="text-xl font-semibold">Book with {trainerName}</h3>
              <p className="text-blue-100 text-sm">Choose your preferred time slot</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${hourlyRate}</div>
            <div className="text-blue-100 text-sm">per hour</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Calendar Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Select Date
            </h4>
            <div className="bg-gray-50 rounded-xl p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="mx-auto border-0 bg-transparent"
              />
            </div>
          </div>
          
          {/* Time Slots Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Available Times - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No available slots for this date</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                    className={`h-14 text-left flex-col items-start justify-center transition-all duration-200 ${
                      selectedSlot?.id === slot.id 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105" 
                        : "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="font-medium">
                      {slot.start_time} - {slot.end_time}
                    </div>
                    <div className={`text-xs ${selectedSlot?.id === slot.id ? "text-blue-100" : "text-gray-500"}`}>
                      Available
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Slot & Booking */}
          {selectedSlot && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Selected Time Slot</h4>
                    <p className="text-gray-600">
                      {format(selectedDate, 'MMM d, yyyy')} • {selectedSlot.start_time} - {selectedSlot.end_time}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ${hourlyRate}/hour
                </Badge>
              </div>

              <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-medium transition-all hover:shadow-lg"
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Book This Session
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Complete Your Booking
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Session Details</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedSlot.start_time}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                          Training Topic *
                        </Label>
                        <Input
                          id="topic"
                          value={bookingData.trainingTopic}
                          onChange={(e) => setBookingData({...bookingData, trainingTopic: e.target.value})}
                          placeholder="e.g., React Development, Python Basics"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                          Duration (hours)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="8"
                          value={bookingData.duration}
                          onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value) || 1})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
                          Organization (optional)
                        </Label>
                        <Input
                          id="organization"
                          value={bookingData.organizationName}
                          onChange={(e) => setBookingData({...bookingData, organizationName: e.target.value})}
                          placeholder="Company or personal"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                          Additional Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                          placeholder="Any specific requirements or goals..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rate per hour:</span>
                        <span className="font-medium">${hourlyRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">${hourlyRate * bookingData.duration}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleBooking}
                      disabled={createBookingMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all hover:shadow-lg"
                    >
                      {createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
