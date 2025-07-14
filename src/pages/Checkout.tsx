import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Clock, CreditCard, Phone, Edit3, Plus, Check, ArrowLeft, Mail, Building, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { format, addHours } from 'date-fns';
import PaymentDialog from '@/components/PaymentDialog';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookingDetails, setBookingDetails] = useState({
    contactNumber: '',
    hrEmail: '',
    address: '',
    companyName: '',
    trainingTopic: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Get package data from cart or location state
  const packageData = cartItems.length > 0 ? cartItems[0] : location.state?.packageData;

  // Time slots for selection
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const createBookingMutation = useMutation({
    mutationFn: async ({ payNow }: { payNow: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      if (!selectedDate || !selectedTimeSlot) throw new Error('Please select date and time');
      if (!packageData) throw new Error('No package selected');

      const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot}:00`);
      const endTime = addHours(startTime, durationHours);
      const totalAmount = packageData.finalPrice || packageData.discountedPrice;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          trainer_id: 'default-trainer', // Will be assigned later
          training_topic: bookingDetails.trainingTopic || packageData.title,
          organization_name: bookingDetails.companyName,
          client_name: user.email,
          client_email: bookingDetails.hrEmail || user.email,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: durationHours,
          total_amount: totalAmount,
          status: payNow ? 'pending' : 'pending_payment',
          payment_status: payNow ? 'pending' : 'unpaid',
          payment_provider: 'paypal',
          location_city: bookingDetails.address
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (bookingData, variables) => {
      if (variables.payNow) {
        setCreatedBooking({
          ...bookingData,
          trainer_name: 'Professional Trainer'
        });
        setIsPaymentDialogOpen(true);
      } else {
        toast({
          title: "Booking Created!",
          description: "Your booking has been created. You can pay later from your dashboard.",
        });
        clearCart();
        navigate('/user/dashboard');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    }
  });

  const handlePayNow = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select date and time slot",
        variant: "destructive"
      });
      return;
    }
    createBookingMutation.mutate({ payNow: true });
  };

  const handlePayLater = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: "Missing Information", 
        description: "Please select date and time slot",
        variant: "destructive"
      });
      return;
    }
    createBookingMutation.mutate({ payNow: false });
  };

  const handlePaymentCompleted = () => {
    setIsPaymentDialogOpen(false);
    setCreatedBooking(null);
    clearCart();
    toast({
      title: "Payment Completed!",
      description: "Your booking has been confirmed.",
    });
    navigate('/user/dashboard');
  };

  if (!packageData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Package Selected</h2>
              <p className="text-muted-foreground mb-4">Please select a training package to proceed with checkout.</p>
              <Button onClick={() => navigate('/')}>Browse Packages</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const packageSavings = packageData.savings || (packageData.originalPrice - packageData.discountedPrice) || 0;
  const packagePrice = packageData.finalPrice || packageData.discountedPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {packageSavings > 0 && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
              💾 Saving ₹{packageSavings} on this order
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Contact Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trainingTopic" className="text-sm font-medium">
                      Training Topic <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="trainingTopic"
                      placeholder="e.g., Advanced React Development"
                      value={bookingDetails.trainingTopic}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, trainingTopic: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hrEmail" className="text-sm font-medium">
                      Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="hrEmail"
                        type="email"
                        placeholder="contact@company.com"
                        value={bookingDetails.hrEmail}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, hrEmail: e.target.value }))}
                        required
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Your Company Name"
                        value={bookingDetails.companyName}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, companyName: e.target.value }))}
                        required
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactNumber" className="text-sm font-medium">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={bookingDetails.contactNumber}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, contactNumber: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Training Location</h3>
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter training location or 'Online'"
                    value={bookingDetails.address}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Training can be conducted online or at your preferred location
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Time Slot */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Select Date & Time</h3>
                </div>
                
                {selectedDate && selectedTimeSlot ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTimeSlot}
                    </p>
                    <p className="text-sm text-green-600">Duration: {durationHours} hour(s)</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setIsDateTimeDialogOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => setIsDateTimeDialogOpen(true)}
                  >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Select Date & Time
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Training Summary */}
          <div className="space-y-6">
            {/* Training Package Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{packageData.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Professional Training</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{packagePrice?.toLocaleString()}</div>
                    {packageData.originalPrice && packageData.originalPrice !== packagePrice && (
                      <div className="text-sm text-muted-foreground line-through">₹{packageData.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {packageData.includes && (
                  <div className="space-y-2 mb-4">
                    {packageData.includes.map((inclusion, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        {inclusion}
                      </div>
                    ))}
                  </div>
                )}
                {packageData.duration && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {packageData.duration}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Training Package</span>
                  <span className="text-sm">₹{packagePrice?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{packagePrice?.toLocaleString()}</span>
                </div>
                
                <div className="space-y-2 mt-6">
                  <Button 
                    className="w-full" 
                    onClick={handlePayNow}
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? 'Creating...' : 'Pay Now'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handlePayLater}
                    disabled={createBookingMutation.isPending}
                  >
                    Create Booking & Pay Later
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Booking will be confirmed after payment. Pay later option allows you to secure your slot.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Date & Time Selection Dialog */}
      <Dialog open={isDateTimeDialogOpen} onOpenChange={setIsDateTimeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Date & Time</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Date</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Time</Label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTimeSlot === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeSlot(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Duration (hours)</Label>
              <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setIsDateTimeDialogOpen(false)}
              disabled={!selectedDate || !selectedTimeSlot}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      {createdBooking && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          booking={createdBooking}
          onPaymentCompleted={handlePaymentCompleted}
        />
      )}
    </div>
  );
};

export default Checkout;