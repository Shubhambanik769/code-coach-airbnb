import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const PackageCustomizer = ({ 
  isOpen, 
  onClose, 
  packageData, 
  onAddToCart 
}) => {
  const [customization, setCustomization] = useState({});
  const [totalPrice, setTotalPrice] = useState(packageData?.discountedPrice || 0);

  // Sample customization options (in real app, this would come from the package data)
  const customizationOptions = packageData?.customizationOptions || [
    {
      id: 1,
      name: 'Delivery Mode',
      type: 'select',
      options: [
        { label: 'Online Only', price: 0 },
        { label: 'Offline Only', price: 2000 },
        { label: 'Hybrid (3 days online + 3 days offline)', price: 1500 }
      ],
      required: true
    },
    {
      id: 2,
      name: 'Additional Projects',
      type: 'checkbox',
      options: [
        { label: 'E-commerce Project', price: 3000 },
        { label: 'Java Spring Boot Project', price: 2500 },
        { label: 'Portfolio Website', price: 1500 },
        { label: 'API Development Project', price: 2000 }
      ],
      required: false
    },
    {
      id: 3,
      name: 'One-on-One Mentoring',
      type: 'select',
      options: [
        { label: 'No mentoring', price: 0 },
        { label: '2 sessions', price: 2000 },
        { label: '5 sessions', price: 4500 },
        { label: '10 sessions', price: 8000 }
      ],
      required: false
    },
    {
      id: 4,
      name: 'Duration Extension',
      type: 'select',
      options: [
        { label: 'Standard duration', price: 0 },
        { label: 'Add 2 weeks', price: 1500 },
        { label: 'Add 4 weeks', price: 2800 },
        { label: 'Add 8 weeks', price: 5000 }
      ],
      required: false
    }
  ];

  useEffect(() => {
    calculateTotalPrice();
  }, [customization, packageData]);

  const calculateTotalPrice = () => {
    let total = packageData?.discountedPrice || 0;
    
    customizationOptions.forEach(option => {
      if (option.type === 'select' && customization[option.id]) {
        const selectedOption = option.options.find(opt => opt.label === customization[option.id]);
        if (selectedOption) {
          total += selectedOption.price;
        }
      } else if (option.type === 'checkbox' && customization[option.id]) {
        customization[option.id].forEach(selectedLabel => {
          const selectedOption = option.options.find(opt => opt.label === selectedLabel);
          if (selectedOption) {
            total += selectedOption.price;
          }
        });
      }
    });
    
    setTotalPrice(total);
  };

  const handleSelectChange = (optionId, value) => {
    setCustomization(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const handleCheckboxChange = (optionId, value, checked) => {
    setCustomization(prev => {
      const currentSelections = prev[optionId] || [];
      if (checked) {
        return {
          ...prev,
          [optionId]: [...currentSelections, value]
        };
      } else {
        return {
          ...prev,
          [optionId]: currentSelections.filter(item => item !== value)
        };
      }
    });
  };

  const isValidCustomization = () => {
    return customizationOptions.every(option => {
      if (option.required) {
        return customization[option.id] && 
               (option.type === 'checkbox' ? customization[option.id].length > 0 : true);
      }
      return true;
    });
  };

  const handleAddToCart = () => {
    if (!isValidCustomization()) {
      alert('Please complete all required selections');
      return;
    }

    const customizedPackage = {
      ...packageData,
      customization,
      finalPrice: totalPrice,
      id: Date.now() // Generate unique ID for customized package
    };

    onAddToCart(customizedPackage);
    onClose();
  };

  const getSavingsAmount = () => {
    return (packageData?.basePrice || 0) - (packageData?.discountedPrice || 0);
  };

  const getAdditionalCost = () => {
    return totalPrice - (packageData?.discountedPrice || 0);
  };

  if (!packageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Customize Your Package</span>
            <Badge variant="secondary">{packageData.title}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customization Options */}
          <div className="lg:col-span-2 space-y-6">
            {customizationOptions.map((option) => (
              <Card key={option.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {option.name}
                    {option.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {option.type === 'select' ? (
                    <RadioGroup
                      value={customization[option.id] || ''}
                      onValueChange={(value) => handleSelectChange(option.id, value)}
                    >
                      {option.options.map((choice) => (
                        <div key={choice.label} className="flex items-center space-x-2 p-2 rounded-lg border">
                          <RadioGroupItem value={choice.label} id={`${option.id}-${choice.label}`} />
                          <Label 
                            htmlFor={`${option.id}-${choice.label}`} 
                            className="flex-1 flex justify-between items-center cursor-pointer"
                          >
                            <span>{choice.label}</span>
                            <div className="flex items-center gap-2">
                              {choice.price > 0 ? (
                                <span className="text-green-600 font-medium">+₹{choice.price.toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-500">Included</span>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {option.options.map((choice) => (
                        <div key={choice.label} className="flex items-center space-x-2 p-2 rounded-lg border">
                          <Checkbox
                            id={`${option.id}-${choice.label}`}
                            checked={(customization[option.id] || []).includes(choice.label)}
                            onCheckedChange={(checked) => handleCheckboxChange(option.id, choice.label, checked)}
                          />
                          <Label 
                            htmlFor={`${option.id}-${choice.label}`} 
                            className="flex-1 flex justify-between items-center cursor-pointer"
                          >
                            <span>{choice.label}</span>
                            <span className="text-green-600 font-medium">+₹{choice.price.toLocaleString()}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Base Package</span>
                    <span>₹{packageData.discountedPrice.toLocaleString()}</span>
                  </div>
                  {getSavingsAmount() > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Package Discount</span>
                      <span className="text-sm">-₹{getSavingsAmount().toLocaleString()}</span>
                    </div>
                  )}
                  {getAdditionalCost() > 0 && (
                    <div className="flex justify-between items-center text-blue-600">
                      <span className="text-sm">Customizations</span>
                      <span className="text-sm">+₹{getAdditionalCost().toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {totalPrice !== packageData.basePrice && (
                    <div className="text-sm text-gray-500 mt-1">
                      Original: ₹{packageData.basePrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAddToCart}
                  disabled={!isValidCustomization()}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add to Cart - ₹{totalPrice.toLocaleString()}
                </Button>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Customization Benefits:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Tailored to your specific needs</li>
                        <li>• Flexible scheduling options</li>
                        <li>• Expert guidance included</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageCustomizer;