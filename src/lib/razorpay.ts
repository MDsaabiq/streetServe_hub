// Add this function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Add RazorpayOptions interface
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  config?: any;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

export const createRazorpayOrder = async (amount: number) => {
  try {
    const url = import.meta.env.DEV 
      ? 'http://localhost:3001/api/create-razorpay-order'
      : '/api/create-razorpay-order';
      
    console.log('Creating Razorpay order with amount:', amount);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Razorpay order creation failed:', data);
      throw new Error(data.error || 'Failed to create Razorpay order');
    }

    console.log('Razorpay order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData: any) => {
  try {
    const url = import.meta.env.DEV 
      ? 'http://localhost:3001/api/verify-payment'
      : '/api/verify-payment';
      
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const updateOrderPaymentStatus = async (orderId: string, paymentData: any) => {
  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    await updateDoc(doc(db, 'orders', orderId), {
      paymentInfo: {
        ...paymentData,
        status: 'paid',
        paidAt: new Date()
      },
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
};
