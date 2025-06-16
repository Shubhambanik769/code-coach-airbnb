
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TrainerCalendarProps {
  trainerId: string;
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
      return data;
    },
    enabled: !!trainerId
  });

  const addSlotMutation = useMutation({
    mutationFn: async ({ date, startTime, endTime }: { date: Date; startTime: string; endTime: string }) => {
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add time slot",
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
        description: "Availability updated"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
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
                    <DialogTitle>Add Time Slot</DialogTitle>
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
                      Add Slot
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">Loading availability...</div>
              ) : availability?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No time slots for this date
                </div>
              ) : (
                availability?.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.is_booked
                        ? 'bg-red-50 border-red-200'
                        : slot.is_available
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        slot.is_booked
                          ? 'bg-red-100 text-red-700'
                          : slot.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {slot.is_booked ? 'Booked' : slot.is_available ? 'Available' : 'Blocked'}
                      </span>
                      {!slot.is_booked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSlotMutation.mutate({
                            slotId: slot.id,
                            isAvailable: slot.is_available
                          })}
                        >
                          {slot.is_available ? 'Block' : 'Unblock'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerCalendar;
