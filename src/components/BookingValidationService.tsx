
import { supabase } from '@/integrations/supabase/client';

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBooking?: {
    id: string;
    status: string;
    start_time: string;
    end_time: string;
    training_topic: string;
  };
  message?: string;
}

export const checkBookingConflicts = async (
  trainerId: string,
  startTime: string,
  endTime: string,
  clientId: string,
  excludeBookingId?: string
): Promise<BookingConflict> => {
  try {
    // Check for trainer conflicts (confirmed or pending bookings)
    let trainerConflictQuery = supabase
      .from('bookings')
      .select('id, status, start_time, end_time, training_topic')
      .eq('trainer_id', trainerId)
      .in('status', ['confirmed', 'pending'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeBookingId) {
      trainerConflictQuery = trainerConflictQuery.neq('id', excludeBookingId);
    }

    const { data: trainerConflicts, error: trainerError } = await trainerConflictQuery;

    if (trainerError) {
      console.error('Error checking trainer conflicts:', trainerError);
      throw trainerError;
    }

    if (trainerConflicts && trainerConflicts.length > 0) {
      const conflict = trainerConflicts[0];
      return {
        hasConflict: true,
        conflictingBooking: conflict,
        message: `Trainer is not available at this time. There's a ${conflict.status} booking for "${conflict.training_topic}" from ${new Date(conflict.start_time).toLocaleString()} to ${new Date(conflict.end_time).toLocaleString()}.`
      };
    }

    // Check for client conflicts (pending or confirmed bookings)
    let clientConflictQuery = supabase
      .from('bookings')
      .select('id, status, start_time, end_time, training_topic')
      .eq('student_id', clientId)
      .in('status', ['confirmed', 'pending'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeBookingId) {
      clientConflictQuery = clientConflictQuery.neq('id', excludeBookingId);
    }

    const { data: clientConflicts, error: clientError } = await clientConflictQuery;

    if (clientError) {
      console.error('Error checking client conflicts:', clientError);
      throw clientError;
    }

    if (clientConflicts && clientConflicts.length > 0) {
      const conflict = clientConflicts[0];
      return {
        hasConflict: true,
        conflictingBooking: conflict,
        message: `You already have a ${conflict.status} booking at this time for "${conflict.training_topic}" from ${new Date(conflict.start_time).toLocaleString()} to ${new Date(conflict.end_time).toLocaleString()}.`
      };
    }

    return {
      hasConflict: false,
      message: 'No conflicts found. You can proceed with the booking.'
    };
  } catch (error) {
    console.error('Error in checkBookingConflicts:', error);
    throw error;
  }
};

export const validateBookingTime = (startTime: string, endTime: string): { isValid: boolean; message?: string } => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Check if start time is in the past
  if (start <= now) {
    return {
      isValid: false,
      message: 'Booking start time cannot be in the past.'
    };
  }

  // Check if end time is after start time
  if (end <= start) {
    return {
      isValid: false,
      message: 'Booking end time must be after start time.'
    };
  }

  // Check minimum duration (15 minutes)
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    return {
      isValid: false,
      message: 'Minimum booking duration is 15 minutes.'
    };
  }

  // Check maximum duration (24 hours)
  if (durationMinutes > 24 * 60) {
    return {
      isValid: false,
      message: 'Maximum booking duration is 24 hours.'
    };
  }

  return {
    isValid: true,
    message: 'Booking time is valid.'
  };
};
