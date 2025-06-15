
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface TrainerScheduleProps {
  trainerId: string;
}

const TrainerSchedule = ({ trainerId }: TrainerScheduleProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['trainer-schedule', trainerId, currentWeek],
    queryFn: async () => {
      const weekEnd = addDays(currentWeek, 6);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student_profile:profiles(full_name, email)
        `)
        .eq('trainer_id', trainerId)
        .gte('start_time', currentWeek.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');

      if (error) throw error;
      return data;
    },
    enabled: !!trainerId
  });

  const getBookingsForDay = (date: Date) => {
    return bookings?.filter(booking => 
      isSameDay(new Date(booking.start_time), date)
    ) || [];
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToPrevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date()));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-l-green-500 bg-green-50';
      case 'pending': return 'border-l-yellow-500 bg-yellow-50';
      case 'completed': return 'border-l-blue-500 bg-blue-50';
      case 'cancelled': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevWeek}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              Next
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Week of {format(currentWeek, 'MMM dd')} - {format(addDays(currentWeek, 6), 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayBookings = getBookingsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-3 min-h-32 ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="font-semibold text-sm mb-2">
                    <div className={isToday ? 'text-blue-600' : 'text-gray-900'}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayBookings.length === 0 ? (
                      <div className="text-xs text-gray-400 text-center py-2">
                        No sessions
                      </div>
                    ) : (
                      dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-2 rounded border-l-4 text-xs ${getStatusColor(booking.status)}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">
                              {format(new Date(booking.start_time), 'HH:mm')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">
                              {booking.student_profile?.full_name || 'Student'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 capitalize">
                            {booking.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerSchedule;
