import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Package,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
}

const checkoutSteps: CheckoutStep[] = [
  { id: 1, title: 'Cart Review', description: 'Review your items' },
  { id: 2, title: 'Shipping Info', description: 'Enter delivery details' },
  { id: 3, title: 'Payment', description: 'Payment information' },
  { id: 4, title: 'Confirmation', description: 'Order confirmation' }
];

export const Checkout = () => {
  const { userProfile } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: userProfile?.displayName || '',
    phone: '',
    email: userProfile?.email || '',
    address: '',
    city: '',
    pincode: '',
    notes: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cod', // cod, card, upi
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: ''
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return cartItems.length > 0;
      case 2:
        return shippingInfo.fullName && shippingInfo.phone && shippingInfo.address && 
               shippingInfo.city && shippingInfo.pincode;
      case 3:
        if (paymentInfo.method === 'card') {
          return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv;
        } else if (paymentInfo.method === 'upi') {
          return paymentInfo.upiId;
        }
        return true; // COD
      default:
        return true;
    }
  };

  const processOrder = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      // Use transaction to ensure inventory is updated atomically
      const orderData = await runTransaction(db, async (transaction) => {
        // Check inventory and update quantities
        for (const item of cartItems) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Product ${item.title} no longer exists`);
          }
          
          const productData = productDoc.data();
          const currentQuantity = parseInt(productData.quantity) || 0;
          
          if (currentQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.title}. Available: ${currentQuantity}`);
          }
          
          // Update product quantity
          transaction.update(productRef, {
            quantity: (currentQuantity - item.quantity).toString(),
            updatedAt: new Date()
          });
        }
        
        // Create order
        const orderData = {
          buyerId: userProfile.uid,
          buyerName: userProfile.displayName || 'Unknown',
          buyerEmail: userProfile.email,
          items: cartItems.map(item => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            image: item.image
          })),
          shippingInfo,
          paymentInfo: {
            method: paymentInfo.method,
            status: paymentInfo.method === 'cod' ? 'pending' : 'paid'
          },
          totalAmount: getTotalPrice(),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return orderData;
      });
      
      // Add order to collection
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(orderRef.id);
      
      // Clear cart
      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderRef.id.slice(-8)} has been placed.`,
      });
      
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error processing order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {checkoutSteps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id 
              ? 'bg-primary border-primary text-primary-foreground' 
              : 'border-muted-foreground text-muted-foreground'
          }`}>
            {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
          </div>
          <div className="ml-3 mr-8">
            <p className={`text-sm font-medium ${
              currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
          {index < checkoutSteps.length - 1 && (
            <div className={`w-12 h-0.5 ${
              currentStep > step.id ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCartReview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <img 
                src={item.image || '/placeholder.svg'} 
                alt={item.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">by {item.vendorName}</p>
                <p className="text-sm">Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">₹{item.price} each</p>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount:</span>
          <span>₹{getTotalPrice().toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderShippingInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={shippingInfo.fullName}
              onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={shippingInfo.email}
            onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={shippingInfo.pincode}
              onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Delivery Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={shippingInfo.notes}
            onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
            placeholder="Any special instructions for delivery..."
          />
        </div>
      </CardContent>
    </Card>
  );

  if (cartItems.length === 0 && currentStep !== 4) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some products to your cart to proceed with checkout
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      {renderStepIndicator()}

      <div className="space-y-6">
        {currentStep === 1 && renderCartReview()}
        {currentStep === 2 && renderShippingInfo()}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant={paymentInfo.method === 'cod' ? 'default' : 'outline'}
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'cod'})}
                  >
                    Cash on Delivery
                  </Button>
                  <Button
                    variant={paymentInfo.method === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'card'})}
                  >
                    Credit/Debit Card
                  </Button>
                  <Button
                    variant={paymentInfo.method === 'upi' ? 'default' : 'outline'}
                    onClick={() => setPaymentInfo({...paymentInfo, method: 'upi'})}
                  >
                    UPI
                  </Button>
                </div>
                
                {paymentInfo.method === 'card' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <Input
                      placeholder="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                      />
                      <Input
                        placeholder="CVV"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                {paymentInfo.method === 'upi' && (
                  <div className="p-4 border rounded-lg">
                    <Input
                      placeholder="UPI ID (e.g., user@paytm)"
                      value={paymentInfo.upiId}
                      onChange={(e) => setPaymentInfo({...paymentInfo, upiId: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 4 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Your order #{orderId?.slice(-8)} has been placed and will be processed soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/orders')}>
                  View Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/marketplace')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep === 3 ? (
              <Button
                onClick={processOrder}
                disabled={!validateStep() || loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
                <Package className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
