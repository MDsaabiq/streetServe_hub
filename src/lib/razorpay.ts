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
    const url = 'http://localhost:3001/api/create-razorpay-order';
      
    console.log('Creating Razorpay order with amount:', amount);
    console.log('Fetching URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
      }),
    }).catch(fetchError => {
      console.error('Fetch failed:', fetchError);
      throw new Error('Network error: ' + fetchError.message);
    });

    console.log('Response received:', response.status);
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Server error: ' + responseText.substring(0, 200));
    }
    
    if (!response.ok) {
      console.error('Order creation failed:', data);
      throw new Error(data.error || 'Failed to create order');
    }

    console.log('Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
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
