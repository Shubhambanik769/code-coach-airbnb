import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText, Clock, DollarSign, User, Calendar, Building, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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

  const generatePDF = async () => {
    if (!agreementData?.agreement_terms) return;
    
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('agreement-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const terms = agreementData.agreement_terms;
      const fileName = `Training_Agreement_${terms.booking_details?.training_topic.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      pdf.save(fileName);
      
      toast({
        title: "PDF Generated",
        description: "Agreement PDF has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
          <div id="agreement-content" className="space-y-6 p-4 bg-white">
            {/* Legal Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">PROFESSIONAL TRAINING SERVICE AGREEMENT</h1>
              <p className="text-sm text-gray-600 mt-2">This agreement is legally binding between the parties</p>
              <p className="text-xs text-gray-500">Agreement ID: {agreementData.id}</p>
              <p className="text-xs text-gray-500">Generated on: {format(new Date(agreementData.created_at), 'PPP')}</p>
            </div>
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

            {/* Legal Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">LEGAL TERMS & CONDITIONS</h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg space-y-4 text-sm">
                <div>
                  <strong>1. SERVICE DELIVERY:</strong>
                  <p className="mt-1">The Trainer agrees to provide professional training services as specified above. Services must be delivered with professional competence and in accordance with industry standards.</p>
                </div>
                <div>
                  <strong>2. PAYMENT TERMS:</strong>
                  <p className="mt-1">Payment is due within 7 days of training completion. Late payments may incur interest charges of 1.5% per month. All amounts are in Indian Rupees (INR).</p>
                </div>
                <div>
                  <strong>3. CANCELLATION POLICY:</strong>
                  <p className="mt-1">Either party may cancel with 24 hours written notice. Cancellations within 24 hours may incur charges of 50% of the total fee. Emergency cancellations will be handled case-by-case.</p>
                </div>
                <div>
                  <strong>4. INTELLECTUAL PROPERTY:</strong>
                  <p className="mt-1">All training materials, methodologies, and proprietary content remain the property of the Trainer. Client may use materials for internal training purposes only.</p>
                </div>
                <div>
                  <strong>5. CONFIDENTIALITY:</strong>
                  <p className="mt-1">Both parties agree to maintain strict confidentiality of all proprietary information disclosed during training sessions.</p>
                </div>
                <div>
                  <strong>6. LIABILITY & INDEMNIFICATION:</strong>
                  <p className="mt-1">Trainer's liability is limited to the total amount paid. Client agrees to indemnify Trainer against any claims arising from misuse of training content.</p>
                </div>
                <div>
                  <strong>7. FORCE MAJEURE:</strong>
                  <p className="mt-1">Neither party shall be liable for delays or failures due to circumstances beyond reasonable control, including natural disasters, government actions, or technical failures.</p>
                </div>
                <div>
                  <strong>8. GOVERNING LAW:</strong>
                  <p className="mt-1">This agreement shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Bangalore, Karnataka.</p>
                </div>
                <div>
                  <strong>9. ENTIRE AGREEMENT:</strong>
                  <p className="mt-1">This document constitutes the entire agreement between parties and supersedes all prior negotiations, representations, or agreements.</p>
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
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={generatePDF}
            disabled={isGeneratingPdf}
            className="gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementModal;