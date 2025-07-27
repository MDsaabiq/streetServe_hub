
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, User, X, AlertTriangle, RefreshCw, Star, Truck, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Order {
  id: string;
  originalOrderId?: string;
  productId?: string;
  productTitle?: string;
  quantity: number;
  price: number;
  totalAmount: number;
  vendorId?: string;
  vendorName?: string;
  buyerId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  items?: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    vendorId: string;
    vendorName: string;
  }>;
}

export const Orders = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const refreshOrders = async () => {
    if (!userProfile?.uid) return;

    setRefreshing(true);
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

      toast({
        title: "Orders Refreshed",
        description: "Your orders have been updated with the latest information.",
      });
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const cancelOrder = async (orderId: string, order: Order) => {
    if (!userProfile) return;

    setCancellingOrder(orderId);
    try {
      // Step 1: Update order status first
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Step 2: Restore inventory (separate operations for better reliability)
      const inventoryUpdates: Promise<void>[] = [];

      if (order.items && order.items.length > 0) {
        // New order format with items array
        for (const item of order.items) {
          if (item.productId) {
            const updatePromise = (async () => {
              try {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                  const productData = productDoc.data();
                  const currentQuantity = parseInt(productData.quantity) || 0;
                  const newQuantity = currentQuantity + item.quantity;

                  await updateDoc(productRef, {
                    quantity: newQuantity.toString(),
                    updatedAt: new Date()
                  });
                }
              } catch (error) {
                console.error(`Failed to restore inventory for product ${item.productId}:`, error);
              }
            })();
            inventoryUpdates.push(updatePromise);
          }
        }
      } else if (order.productId) {
        // Old order format with single product
        const updatePromise = (async () => {
          try {
            const productRef = doc(db, 'products', order.productId);
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
              const productData = productDoc.data();
              const currentQuantity = parseInt(productData.quantity) || 0;
              const newQuantity = currentQuantity + order.quantity;

              await updateDoc(productRef, {
                quantity: newQuantity.toString(),
                updatedAt: new Date()
              });
            }
          } catch (error) {
            console.error(`Failed to restore inventory for product ${order.productId}:`, error);
          }
        })();
        inventoryUpdates.push(updatePromise);
      }

      // Wait for all inventory updates to complete
      await Promise.allSettled(inventoryUpdates);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId ? { ...o, status: 'cancelled' as const } : o
        )
      );

      toast({
        title: "✅ Order Cancelled Successfully",
        description: `Order #${orderId.slice(-8).toUpperCase()} has been cancelled. Items returned to inventory.`,
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  const canCancelOrder = (order: Order) => {
    // Buyers can cancel orders that are not yet shipped or delivered
    return order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing';
  };

  // Simple cancellation without inventory restoration (for quick cancellation)
  const quickCancelOrder = async (orderId: string) => {
    if (!userProfile) return;

    setCancellingOrder(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId ? { ...o, status: 'cancelled' as const } : o
        )
      );

      toast({
        title: "✅ Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'processing': return 'outline';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
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
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your product orders and manage cancellations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshOrders}
          disabled={loading || refreshing}
          className="w-full sm:w-auto min-h-[44px] touch-manipulation"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-8 sm:p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Your orders will appear here once you start shopping
            </p>
            <Button
              onClick={() => window.location.href = '/marketplace'}
              className="min-h-[44px] touch-manipulation"
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cancellation Policy Info */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Cancellation Policy</p>
                  <p className="text-blue-800">
                    You can cancel orders that are <strong>pending</strong>, <strong>confirmed</strong>, or <strong>processing</strong>.
                    Once an order is shipped, it cannot be cancelled. Items will be automatically returned to inventory upon cancellation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 bg-gradient-card shadow-card">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg break-all sm:break-normal">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{order.createdAt.toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)} className="self-start">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                {order.items && order.items.length > 0 ? (
                  // New order format with multiple items
                  <div className="space-y-4">
                    <h4 className="font-semibold">Order Items ({order.items.length} item{order.items.length > 1 ? 's' : ''})</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">{item.title}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">by {item.vendorName}</p>
                            <p className="text-xs sm:text-sm">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right sm:text-left">
                            <p className="font-bold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <span className="text-base sm:text-lg font-semibold">Total Amount:</span>
                      <span className="text-base sm:text-lg font-bold text-primary">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  // Old order format with single product
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Product:</span> <span className="break-words">{order.productTitle}</span></p>
                        <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                        <p><span className="font-medium">Unit Price:</span> ₹{order.price?.toLocaleString()}</p>
                        <p className="text-base sm:text-lg font-bold text-primary">Total: ₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Vendor Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="break-words">{order.vendorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Order Button */}
                {canCancelOrder(order) && (
                  <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {order.status === 'pending' && "⏳ Waiting for vendor confirmation"}
                        {order.status === 'confirmed' && "✅ Order confirmed by vendor"}
                        {order.status === 'processing' && "🔄 Order is being processed"}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancellingOrder === order.id}
                            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                          >
                            <X className="h-4 w-4 mr-2" />
                            {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center text-left">
                              <AlertTriangle className="h-5 w-5 mr-2 text-destructive flex-shrink-0" />
                              Cancel Order #{order.id.slice(-8).toUpperCase()}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                              Choose how you want to cancel this order:
                              <br /><br />
                              <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="font-medium text-blue-900">🚀 Quick Cancel (Recommended)</p>
                                  <p className="text-sm text-blue-800">Fast cancellation - order status updated immediately</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                  <p className="font-medium text-yellow-900">📦 Full Cancel with Inventory</p>
                                  <p className="text-sm text-yellow-800">Slower but restores product inventory automatically</p>
                                </div>
                              </div>
                              <br />
                              <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> Both options will cancel your order. You will not be charged.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col gap-2">
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <AlertDialogAction
                                onClick={() => quickCancelOrder(order.id)}
                                className="flex-1 min-h-[44px] touch-manipulation bg-blue-600 text-white hover:bg-blue-700"
                              >
                                🚀 Quick Cancel
                              </AlertDialogAction>
                              <AlertDialogAction
                                onClick={() => cancelOrder(order.id, order)}
                                className="flex-1 min-h-[44px] touch-manipulation bg-yellow-600 text-white hover:bg-yellow-700"
                              >
                                📦 Full Cancel
                              </AlertDialogAction>
                            </div>
                            <AlertDialogCancel className="w-full min-h-[44px] touch-manipulation">
                              Keep Order
                            </AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(order.status)}
                      <span className={`text-sm font-medium ${
                        order.status === 'delivered' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {order.status === 'delivered' ? 'Order Completed Successfully' : 'Order Cancelled'}
                      </span>
                    </div>
                    {order.status === 'delivered' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/review/${order.productId || order.items?.[0]?.productId}/${order.id}`)}
                        className="w-full sm:w-auto"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Add Review
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
