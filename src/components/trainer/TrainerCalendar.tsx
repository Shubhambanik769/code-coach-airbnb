
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, Plus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';

interface TrainerCalendarProps {
  trainerId: string;
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
}

interface ConfirmedBooking {
  start_time: string;
  end_time: string;
  status: string;
  training_topic: string;
  client_profile?: {
    full_name: string | null;
    email: string;
  };
}

const TrainerCalendar = ({ trainerId }: TrainerCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery({
    queryKey: ['trainer-availability', trainerId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .order('start_time');

      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!trainerId
  });

  // Fetch confirmed bookings for the selected date with client details
  const { data: confirmedBookings = [] } = useQuery({
    queryKey: ['confirmed-bookings-trainer', trainerId, selectedDate],
    queryFn: async () => {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, status, training_topic, student_id')
        .eq('trainer_id', trainerId)
        .in('status', ['confirmed', 'assigned', 'delivering'])
        .gte('start_time', format(selectedDate, 'yyyy-MM-dd 00:00:00'))
        .lt('start_time', format(selectedDate, 'yyyy-MM-dd 23:59:59'));

      if (error) throw error;

      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Fetch client profiles
      const studentIds = [...new Set(bookingsData.map(b => b.student_id))];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      return bookingsData.map(booking => ({
        ...booking,
        client_profile: clientProfiles?.find(profile => profile.id === booking.student_id)
      })) as ConfirmedBooking[];
    },
    enabled: !!trainerId
  });

  const addSlotMutation = useMutation({
    mutationFn: async ({ date, startTime, endTime }: { date: Date; startTime: string; endTime: string }) => {
      // Check if the new slot conflicts with any confirmed bookings
      const slotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
      const slotEnd = new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`);

      const hasConflict = confirmedBookings.some(booking => {
        const bookingStart = parseISO(booking.start_time);
        const bookingEnd = parseISO(booking.end_time);

        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      if (hasConflict) {
        throw new Error('This time slot conflicts with an existing confirmed booking');
      }

      const { error } = await supabase
        .from('trainer_availability')
        .insert({
          trainer_id: trainerId,
          date: format(date, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          is_booked: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      setIsAddingSlot(false);
      setStartTime('09:00');
      setEndTime('10:00');
      toast({
        title: "Success",
        description: "Time slot added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add time slot",
        variant: "destructive"
      });
    }
  });

  const toggleSlotMutation = useMutation({
    mutationFn: async ({ slotId, isAvailable }: { slotId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('trainer_availability')
        .update({ is_available: !isAvailable })
        .eq('id', slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast({
        title: "Success",
        description: "Availability updated successfully"
      });
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from('trainer_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast({
        title: "Success",
        description: "Time slot deleted successfully"
      });
    }
  });

  const handleAddSlot = () => {
    if (startTime >= endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    addSlotMutation.mutate({
      date: selectedDate,
      startTime,
      endTime
    });
  };

  // Check if a slot conflicts with confirmed bookings
  const isSlotConflicted = (slot: AvailabilitySlot) => {
    const slotStart = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.start_time}`);
    const slotEnd = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.end_time}`);

    return confirmedBookings.some(booking => {
      const bookingStart = parseISO(booking.start_time);
      const bookingEnd = parseISO(booking.end_time);

      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      );
    });
  };

  const getSlotStatus = (slot: AvailabilitySlot) => {
    if (isSlotConflicted(slot)) return 'conflicted';
    if (slot.is_booked) return 'booked';
    if (slot.is_available) return 'available';
    return 'blocked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'booked': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'blocked': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'conflicted': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50 border-green-200 text-green-700';
      case 'booked': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'blocked': return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'conflicted': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Availability Calendar Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage your availability slots to allow clients to book sessions with you
          </p>
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability Slot</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddSlot}
                        disabled={addSlotMutation.isPending}
                        className="w-full"
                      >
                        {addSlotMutation.isPending ? 'Adding...' : 'Add Slot'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Confirmed Bookings Section */}
              {confirmedBookings.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Confirmed Bookings</span>
                  </div>
                  <div className="space-y-2">
                    {confirmedBookings.map((booking, index) => (
                      <div key={index} className="bg-white rounded p-2 border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm text-blue-800">
                              {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
                            </div>
                            <div className="text-xs text-blue-600">{booking.training_topic}</div>
                            <div className="text-xs text-gray-600">
                              {booking.client_profile?.full_name || booking.client_profile?.email || 'Client'}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Slots Section */}
              <div className="space-y-2">
                <h4 className="font-medium">Availability Slots</h4>
                {isLoading ? (
                  <div className="text-center py-8">Loading availability...</div>
                ) : availability?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No time slots for this date. Add some to allow bookings.
                  </div>
                ) : (
                  availability?.map((slot) => {
                    const status = getSlotStatus(slot);
                    
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status)}`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status)}
                          <div>
                            <div className="font-medium">{slot.start_time} - {slot.end_time}</div>
                            <div className="text-xs capitalize">{status}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!slot.is_booked && status !== 'conflicted' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSlotMutation.mutate({
                                  slotId: slot.id,
                                  isAvailable: slot.is_available
                                })}
                                disabled={toggleSlotMutation.isPending}
                              >
                                {slot.is_available ? 'Block' : 'Unblock'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteSlotMutation.mutate(slot.id)}
                                disabled={deleteSlotMutation.isPending}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Available for booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Already booked</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Blocked/Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Conflicted with booking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerCalendar;
