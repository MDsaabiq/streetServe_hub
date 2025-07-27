import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RazorpayPayment } from '@/components/RazorpayPayment';
import { createRazorpayOrder, verifyPayment, updateOrderPaymentStatus } from '@/lib/razorpay';
import { 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  CreditCard, 
  Truck, 
  Check,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingCart
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  runTransaction, 
  getDocs, 
  query, 
  where,
  updateDoc,
  getDoc
} from 'firebase/firestore';

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
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: userProfile?.displayName || '',
    phone: '',
    email: userProfile?.email || '',
    address: '',
    city: '',
    state: '',
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
      // Create Razorpay order first if payment method is not COD
      let razorpayOrder = null;
      if (paymentInfo.method !== 'cod') {
        try {
          razorpayOrder = await createRazorpayOrder(getTotalPrice());
          setRazorpayOrderId(razorpayOrder.id);
          console.log('Razorpay order created:', razorpayOrder);
        } catch (error) {
          console.error('Error creating Razorpay order:', error);
          toast({
            title: "Payment Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Use transaction to ensure inventory is updated atomically
      const orderIds = await runTransaction(db, async (transaction) => {
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

        // Group items by vendor
        const vendorGroups = cartItems.reduce((groups, item) => {
          if (!groups[item.vendorId]) {
            groups[item.vendorId] = [];
          }
          groups[item.vendorId].push(item);
          return groups;
        }, {} as Record<string, typeof cartItems>);

        // Create separate orders for each vendor
        const createdOrderIds: string[] = [];

        for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
          for (const item of vendorItems) {
            const orderRef = doc(collection(db, 'orders'));
            const orderData = {
              buyerId: userProfile.uid,
              buyerName: userProfile.displayName || 'Unknown',
              buyerEmail: userProfile.email,
              buyerPhone: shippingInfo.phone,
              buyerAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}`,
              productId: item.id,
              productTitle: item.title,
              quantity: item.quantity,
              price: item.price,
              totalAmount: item.price * item.quantity,
              vendorId: item.vendorId,
              vendorName: item.vendorName,
              shippingInfo,
              paymentInfo: {
                method: paymentInfo.method,
                status: paymentInfo.method === 'cod' ? 'pending' : 'pending',
                razorpayOrderId: razorpayOrder?.id || null
              },
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date()
            };

            transaction.set(orderRef, orderData);
            createdOrderIds.push(orderRef.id);
          }
        }

        return createdOrderIds;
      });

      setOrderId(orderIds[0]);
      
      // If COD, complete the order
      if (paymentInfo.method === 'cod') {
        clearCart();
        toast({
          title: "Orders Placed Successfully!",
          description: `${orderIds.length} order(s) have been placed and sent to vendors for confirmation.`,
        });
        setCurrentStep(4);
      } else {
        // For online payment, proceed to payment step
        setCurrentStep(4); // Show payment step
      }
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

  const handlePaymentSuccess = async (paymentData: any) => {
    setPaymentProcessing(true);
    try {
      // Verify payment
      const verification = await verifyPayment(paymentData);
      
      if (verification.status === 'success') {
        // Update all orders with payment info
        if (orderId) {
          await updateOrderPaymentStatus(orderId, {
            ...paymentData,
            method: paymentInfo.method
          });
        }

        clearCart();
        toast({
          title: "Payment Successful!",
          description: "Your order has been placed and payment confirmed.",
        });
        setCurrentStep(5); // Success step
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Payment was processed but verification failed. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: error.message || "Payment was cancelled or failed. Please try again.",
      variant: "destructive",
    });
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && <div className={`w-12 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Cart Review</span>
            <span>Shipping</span>
            <span>Payment</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step 1: Cart Review */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Review Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">by {item.vendorName}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total: ₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Shipping Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="Enter your full address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                    placeholder="Enter your state"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={shippingInfo.pincode}
                    onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                    placeholder="Enter your pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentInfo.method}
                onValueChange={(value) => setPaymentInfo({...paymentInfo, method: value})}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                      <Badge variant="secondary">COD</Badge>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-muted-foreground">Pay securely with card, UPI, or net banking</p>
                      </div>
                      <Badge variant="default">Secure</Badge>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment Processing (COD) */}
        {currentStep === 4 && paymentInfo.method === 'cod' && (
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

        {/* Step 4: Payment Processing (Online) */}
        {currentStep === 4 && paymentInfo.method === 'online' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Complete Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold">₹{getTotalPrice()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure payment powered by Razorpay
                  </p>
                </div>
                
                {razorpayOrderId && (
                  <RazorpayPayment
                    amount={getTotalPrice()}
                    orderId={razorpayOrderId}
                    userInfo={{
                      name: shippingInfo.fullName,
                      email: shippingInfo.email,
                      phone: shippingInfo.phone
                    }}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    loading={paymentProcessing}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment Success */}
        {currentStep === 5 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your order #{orderId?.slice(-8)} has been placed and payment confirmed.
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

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
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
