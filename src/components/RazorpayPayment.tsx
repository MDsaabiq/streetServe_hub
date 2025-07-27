import React from 'react';
import { Button } from '@/components/ui/button';
import { loadRazorpayScript, RazorpayOptions } from '@/lib/razorpay';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

interface RazorpayPaymentProps {
  amount: number;
  orderId: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  orderId,
  userInfo,
  onSuccess,
  onFailure,
  loading = false,
  disabled = false
}) => {
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      
      if (!scriptLoaded) {
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'StreetServe Hub',
        description: 'Order Payment',
        order_id: orderId,
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using INR',
                instruments: [
                  {
                    method: 'card'
                  },
                  {
                    method: 'upi'
                  }
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: (response: any) => {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            onFailure(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onFailure(error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
};




