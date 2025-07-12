
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, getTotalPrice, getTotalSavings } = useCart();

  const handleCheckout = () => {
    if (items.length > 0) {
      // For now, we'll pass the first item to checkout
      // In a more complete implementation, you might want to handle multiple items
      navigate('/checkout', { state: { packageData: items[0] } });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Browse our training packages and add them to your cart.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Packages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Shopping Cart ({items.length} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      {item.duration && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Duration: {item.duration}
                        </p>
                      )}
                      {item.includes && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Includes:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {item.includes.map((inclusion, index) => (
                              <li key={index}>• {inclusion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            ₹{(item.finalPrice || item.discountedPrice).toLocaleString()}
                          </span>
                          {item.originalPrice !== (item.finalPrice || item.discountedPrice) && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {item.savings > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            Save ₹{item.savings.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Savings</span>
                      <span>-₹{getTotalSavings().toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>

                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Skilloop Promise:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Certified trainers only</li>
                    <li>• 48hr cancellation policy</li>
                    <li>• Full refund guarantee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
