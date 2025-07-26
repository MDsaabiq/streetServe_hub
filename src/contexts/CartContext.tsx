
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const addToCart = (product: any) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
          vendorId: product.vendorId,
          vendorName: product.vendorName
        }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.title} added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const checkout = async () => {
    if (!userProfile || items.length === 0) return;

    try {
      // Create orders for each vendor
      const vendorOrders = items.reduce((acc, item) => {
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = [];
        }
        acc[item.vendorId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create separate orders for each vendor
      for (const vendorId in vendorOrders) {
        const vendorItems = vendorOrders[vendorId];
        const totalAmount = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        for (const item of vendorItems) {
          await addDoc(collection(db, 'orders'), {
            productId: item.productId,
            productTitle: item.title,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.price * item.quantity,
            buyerId: userProfile.uid,
            buyerName: userProfile.displayName || 'Unknown User',
            buyerEmail: userProfile.email,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            status: 'pending',
            createdAt: new Date()
          });
        }
      }

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your orders have been sent to the vendors.",
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order.",
        variant: "destructive",
      });
    }
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    checkout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
