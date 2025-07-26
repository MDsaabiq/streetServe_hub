
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, User } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  totalAmount: number;
  vendorId: string;
  vendorName: string;
  buyerId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export const Orders = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile?.uid) return;

      try {
        const q = query(
          collection(db, 'orders'),
          where('buyerId', '==', userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedOrders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Order);
        });

        setOrders(fetchedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userProfile?.uid, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'secondary';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track your product orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground">
              Your orders will appear here once you start shopping
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 bg-gradient-card shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Product Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Product:</span> {order.productTitle}</p>
                      <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                      <p><span className="font-medium">Unit Price:</span> ₹{order.price}</p>
                      <p className="text-lg font-bold text-primary">Total: ₹{order.totalAmount}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Vendor Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {order.vendorName}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
