import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Clock, CreditCard, Phone, Edit3, Plus, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { packageData } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    contactNumber: '+91 9954194880',
    address: 'Home - 306, Block 4, Kendriya Vihar 2, Karo...',
    slot: '',
    paymentMethod: 'invoice'
  });

  const [selectedAddons, setSelectedAddons] = useState([]);

  // Sample training package data (would come from props/state in real app)
  const trainingPackage = packageData || {
    title: 'Advanced Excel Training (3 Sessions)',
    trainer: 'John Doe - Excel Expert',
    originalPrice: 1150,
    discountedPrice: 1035,
    savings: 115,
    inclusions: [
      'Live Zoom + Recordings',
      'Mini projects + doubt-solving',
      'Post-training test + certification'
    ]
  };

  // Add-on services
  const addons = [
    {
      id: 1,
      title: 'Resume Boosting Workshop',
      price: 1499,
      image: '/lovable-uploads/b7ca0c88-cbc0-47c4-a4f9-27b939ba79bb.png'
    },
    {
      id: 2,
      title: 'Mock Interview Session',
      price: 1999,
      image: '/lovable-uploads/b7ca0c88-cbc0-47c4-a4f9-27b939ba79bb.png'
    }
  ];

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(item => item.id === addon.id);
      if (exists) {
        return prev.filter(item => item.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return trainingPackage.discountedPrice + addonTotal;
  };

  const handleCheckout = () => {
    // Handle checkout logic here
    console.log('Proceeding to payment...', {
      bookingDetails,
      trainingPackage,
      selectedAddons,
      total: calculateTotal()
    });
    navigate('/payment/success');
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
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
            💾 Saving ₹{trainingPackage.savings} on this order
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Send booking details to</h3>
                </div>
                <div className="text-lg font-medium">{bookingDetails.contactNumber}</div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">Address</h3>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="text-muted-foreground">{bookingDetails.address}</div>
              </CardContent>
            </Card>

            {/* Time Slot */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Slot</h3>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Select time & date
                </Button>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Payment Method</h3>
                </div>
                <RadioGroup value={bookingDetails.paymentMethod} onValueChange={(value) => 
                  setBookingDetails(prev => ({ ...prev, paymentMethod: value }))
                }>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invoice" id="invoice" />
                    <Label htmlFor="invoice">Corporate Invoice (GST Available)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI Payment</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Cancellation policy</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Free cancellations if done more than 48 hrs before the training or if a professional trainer isn't assigned. A fee will be charged otherwise.
                </p>
                <Button variant="link" className="p-0 text-sm text-primary">
                  Read full policy
                </Button>
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
                    <CardTitle className="text-lg">{trainingPackage.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{trainingPackage.trainer}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{trainingPackage.discountedPrice.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground line-through">₹{trainingPackage.originalPrice.toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {trainingPackage.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      {inclusion}
                    </div>
                  ))}
                </div>
                <Button variant="link" className="p-0 text-sm text-primary">
                  Edit package
                </Button>
              </CardContent>
            </Card>

            {/* Add-ons Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequently added together</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img 
                      src={addon.image} 
                      alt={addon.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{addon.title}</h4>
                      <p className="text-sm font-bold">₹{addon.price.toLocaleString()}</p>
                    </div>
                    <Button
                      variant={selectedAddons.find(item => item.id === addon.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAddonToggle(addon)}
                    >
                      {selectedAddons.find(item => item.id === addon.id) ? 'Added' : 'Add'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="no-call" />
                  <Label htmlFor="no-call" className="text-sm">
                    Avoid calling before reaching the location
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Coupons */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">%</span>
                    </div>
                    <span className="text-sm font-medium">Coupons and offers</span>
                  </div>
                  <span className="text-sm text-primary">2 offers →</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Item total</span>
                  <span className="text-sm">₹{trainingPackage.originalPrice.toLocaleString()}</span>
                </div>
                {trainingPackage.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Package discount</span>
                    <span className="text-sm">-₹{trainingPackage.savings.toLocaleString()}</span>
                  </div>
                )}
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Add-ons</span>
                    <span className="text-sm">+₹{selectedAddons.reduce((sum, addon) => sum + addon.price, 0).toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Amount to pay</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                <Button variant="link" className="p-0 text-sm text-right w-full">
                  View breakup
                </Button>
                
                <Button className="w-full mt-4" onClick={handleCheckout}>
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;