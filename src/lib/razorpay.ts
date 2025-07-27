export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const createRazorpayOrder = async (amount: number) => {
  try {
    const url = '/api/create-razorpay-order';
      
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

    // Get response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Server returned invalid response: ' + responseText.substring(0, 100));
    }
    
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
    const url = '/api/verify-payment';
      
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
