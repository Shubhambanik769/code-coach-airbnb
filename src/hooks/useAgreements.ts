import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAgreements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchAgreement = (bookingId: string) => {
    return useQuery({
      queryKey: ['agreement', bookingId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('agreements')
          .select('*')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      enabled: !!bookingId
    });
  };

  const createAgreementForBooking = useMutation({
    mutationFn: async ({ bookingId, userType }: { bookingId: string; userType: 'client' | 'trainer' }) => {
      // First get booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, trainer_id, student_id, total_amount, duration_hours')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      const hourlyRate = bookingData.total_amount / bookingData.duration_hours;

      // Generate agreement terms
      const { data: agreementTerms, error: termsError } = await supabase
        .rpc('generate_agreement_terms', { p_booking_id: bookingId });

      if (termsError) throw termsError;

      // Create agreement with initial signature
      const { data: agreement, error: createError } = await supabase
        .from('agreements')
        .insert({
          booking_id: bookingId,
          hourly_rate: hourlyRate,
          total_cost: bookingData.total_amount,
          agreement_terms: agreementTerms,
          [userType === 'client' ? 'client_signature_status' : 'trainer_signature_status']: 'accepted',
          [userType === 'client' ? 'client_agreed_at' : 'trainer_agreed_at']: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update booking with agreement reference
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ agreement_id: agreement.id })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      return agreement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreement'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agreement",
        variant: "destructive"
      });
    }
  });

  const signAgreement = useMutation({
    mutationFn: async ({ 
      agreementId, 
      userType, 
      action 
    }: { 
      agreementId: string; 
      userType: 'client' | 'trainer'; 
      action: 'accept' | 'reject' 
    }) => {
      if (action === 'reject') {
        // Update agreement to rejected status
        const { error } = await supabase
          .from('agreements')
          .update({
            [userType === 'client' ? 'client_signature_status' : 'trainer_signature_status']: 'rejected'
          })
          .eq('id', agreementId);

        if (error) throw error;

        // Update booking status to cancelled
        const { data: agreement } = await supabase
          .from('agreements')
          .select('booking_id')
          .eq('id', agreementId)
          .single();

        if (agreement) {
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', agreement.booking_id);
        }

        return { action: 'reject' };
      }

      // Accept the agreement
      const updateData: any = {
        [userType === 'client' ? 'client_signature_status' : 'trainer_signature_status']: 'accepted',
        [userType === 'client' ? 'client_agreed_at' : 'trainer_agreed_at']: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('agreements')
        .update(updateData)
        .eq('id', agreementId);

      if (updateError) throw updateError;

      // Check if both parties have signed
      const { data: updatedAgreement, error: fetchError } = await supabase
        .from('agreements')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (fetchError) throw fetchError;

      if (updatedAgreement.client_signature_status === 'accepted' && 
          updatedAgreement.trainer_signature_status === 'accepted') {
        // Both signed, complete the agreement and confirm booking
        await supabase
          .from('agreements')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', agreementId);

        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', updatedAgreement.booking_id);
      }

      return { action: 'accept', agreement: updatedAgreement };
    },
    onSuccess: (result) => {
      if (result.action === 'accept') {
        toast({
          title: "Agreement Signed",
          description: "You have successfully signed the training agreement."
        });
      } else {
        toast({
          title: "Agreement Rejected",
          description: "The agreement has been rejected and booking cancelled."
        });
      }
      queryClient.invalidateQueries({ queryKey: ['agreement'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process agreement",
        variant: "destructive"
      });
    }
  });

  return {
    fetchAgreement,
    createAgreementForBooking,
    signAgreement
  };
};