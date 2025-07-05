import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText, Clock, DollarSign, User, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  userType: 'client' | 'trainer';
  agreementData?: any;
  onSuccess?: () => void;
}

const AgreementModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  userType, 
  agreementData,
  onSuccess 
}: AgreementModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signAgreementMutation = useMutation({
    mutationFn: async (action: 'accept' | 'reject') => {
      setIsProcessing(true);
      
      if (action === 'reject') {
        // If rejected, cancel the booking
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
          
        if (bookingError) throw bookingError;
        return { action: 'reject' };
      }

      // If accepting, create or update agreement
      let agreementId = agreementData?.id;
      
      if (!agreementId) {
        // Create new agreement
        const { data: bookingData, error: fetchError } = await supabase
          .from('bookings')
          .select('*, trainer_id, student_id, total_amount, duration_hours')
          .eq('id', bookingId)
          .single();
          
        if (fetchError) throw fetchError;
        
        const hourlyRate = bookingData.total_amount / bookingData.duration_hours;
        
        // Generate agreement terms
        const { data: agreementTerms, error: termsError } = await supabase
          .rpc('generate_agreement_terms', { p_booking_id: bookingId });
          
        if (termsError) throw termsError;
        
        const { data: newAgreement, error: createError } = await supabase
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
        agreementId = newAgreement.id;
        
        // Update booking with agreement reference
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ agreement_id: agreementId })
          .eq('id', bookingId);
          
        if (updateError) throw updateError;
      } else {
        // Update existing agreement
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
          // Both signed, update agreement and booking status
          await supabase
            .from('agreements')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', agreementId);
            
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId);
        }
      }
      
      return { action: 'accept', agreementId };
    },
    onSuccess: (result) => {
      setIsProcessing(false);
      if (result.action === 'accept') {
        toast({
          title: "Agreement Signed",
          description: "You have successfully signed the training agreement."
        });
      } else {
        toast({
          title: "Booking Cancelled",
          description: "The booking has been cancelled due to agreement rejection."
        });
      }
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error.message || "Failed to process agreement",
        variant: "destructive"
      });
    }
  });

  if (!agreementData?.agreement_terms) {
    return null;
  }

  const terms = agreementData.agreement_terms;
  const clientSigned = agreementData.client_signature_status === 'accepted';
  const trainerSigned = agreementData.trainer_signature_status === 'accepted';
  const bothSigned = clientSigned && trainerSigned;
  const currentUserSigned = userType === 'client' ? clientSigned : trainerSigned;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Training Service Agreement
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Agreement Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Agreement Status</h3>
                <div className="flex gap-2">
                  <Badge variant={clientSigned ? "default" : "secondary"} className="gap-1">
                    {clientSigned ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    Client {clientSigned ? 'Signed' : 'Pending'}
                  </Badge>
                  <Badge variant={trainerSigned ? "default" : "secondary"} className="gap-1">
                    {trainerSigned ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    Trainer {trainerSigned ? 'Signed' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Client Information</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {terms.client_details?.name || 'Not specified'}</p>
                  <p><strong>Email:</strong> {terms.client_details?.email || 'Not specified'}</p>
                  {terms.client_details?.company_name && (
                    <p><strong>Company:</strong> {terms.client_details.company_name}</p>
                  )}
                  {terms.client_details?.designation && (
                    <p><strong>Designation:</strong> {terms.client_details.designation}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">Trainer Information</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {terms.trainer_details?.name || 'Not specified'}</p>
                  <p><strong>Email:</strong> {terms.trainer_details?.email || 'Not specified'}</p>
                  {terms.trainer_details?.specialization && (
                    <p><strong>Specialization:</strong> {terms.trainer_details.specialization}</p>
                  )}
                  {terms.trainer_details?.experience_years && (
                    <p><strong>Experience:</strong> {terms.trainer_details.experience_years} years</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Training Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Training Details</h3>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <p><strong>Topic:</strong> {terms.booking_details?.training_topic}</p>
                <p><strong>Duration:</strong> {terms.booking_details?.duration_hours} hours</p>
                <p><strong>Start Date:</strong> {format(new Date(terms.booking_details?.start_time), 'PPP')}</p>
                <p><strong>Time:</strong> {format(new Date(terms.booking_details?.start_time), 'HH:mm')} - {format(new Date(terms.booking_details?.end_time), 'HH:mm')}</p>
                {terms.booking_details?.organization_name && (
                  <p><strong>Organization:</strong> {terms.booking_details.organization_name}</p>
                )}
                {terms.booking_details?.special_requirements && (
                  <p><strong>Special Requirements:</strong> {terms.booking_details.special_requirements}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Financial Terms */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Financial Terms</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <p><strong>Hourly Rate:</strong> ₹{terms.financial_terms?.hourly_rate}</p>
                <p><strong>Total Duration:</strong> {terms.financial_terms?.duration_hours} hours</p>
                <p className="text-lg"><strong>Total Cost:</strong> ₹{terms.financial_terms?.total_cost}</p>
              </div>
            </div>

            <Separator />

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Terms & Conditions</h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                <div>
                  <strong>Cancellation Policy:</strong>
                  <p className="text-sm mt-1">{terms.terms_and_conditions?.cancellation_policy}</p>
                </div>
                <div>
                  <strong>Payment Terms:</strong>
                  <p className="text-sm mt-1">{terms.terms_and_conditions?.payment_terms}</p>
                </div>
                <div>
                  <strong>Professional Conduct:</strong>
                  <p className="text-sm mt-1">{terms.terms_and_conditions?.liability}</p>
                </div>
                <div>
                  <strong>Intellectual Property:</strong>
                  <p className="text-sm mt-1">{terms.terms_and_conditions?.intellectual_property}</p>
                </div>
                <div>
                  <strong>Confidentiality:</strong>
                  <p className="text-sm mt-1">{terms.terms_and_conditions?.confidentiality}</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            {!bothSigned && !currentUserSigned && (
              <>
                <Separator />
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-900 mb-3">Digital Signature Required</h3>
                  <p className="text-yellow-800 mb-4">
                    By clicking "Accept Agreement", you agree to all the terms and conditions outlined above. 
                    This constitutes your digital signature on this training service agreement.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => signAgreementMutation.mutate('accept')}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Agreement
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => signAgreementMutation.mutate('reject')}
                      disabled={isProcessing}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Agreement
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Completed Agreement */}
            {bothSigned && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Agreement Completed</h3>
                </div>
                <p className="text-green-800 mb-3">
                  This agreement has been digitally signed by both parties and is now active.
                </p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Client signed: {format(new Date(agreementData.client_agreed_at), 'PPp')}</p>
                  <p>Trainer signed: {format(new Date(agreementData.trainer_agreed_at), 'PPp')}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementModal;