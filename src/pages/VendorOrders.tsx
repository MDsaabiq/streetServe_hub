
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, User, Phone, MapPin, RefreshCw, Bell, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  originalOrderId?: string;
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  totalAmount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerAddress?: string;
  vendorId: string;
  vendorName?: string;
  shippingInfo?: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
  };
  paymentInfo?: {
    method: string;
    status: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
}

export const VendorOrders = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile?.uid) return;

      try {
        // First try to get orders with vendorId field
        let q = query(
          collection(db, 'orders'),
          where('vendorId', '==', userProfile.uid)
        );
        let querySnapshot = await getDocs(q);

        // If no orders found, try to get orders where items contain this vendor
        if (querySnapshot.empty) {
          q = query(collection(db, 'orders'));
          querySnapshot = await getDocs(q);
        }
        const fetchedOrders: Order[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Check if this order is for this vendor
          if (data.vendorId === userProfile.uid) {
            // Direct vendor order
            fetchedOrders.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as Order);
          } else if (data.items && Array.isArray(data.items)) {
            // Check if any items in the order are from this vendor
            const vendorItems = data.items.filter((item: any) => item.vendorId === userProfile.uid);
            if (vendorItems.length > 0) {
              // Create separate orders for each vendor item
              vendorItems.forEach((item: any) => {
                fetchedOrders.push({
                  id: doc.id + '_' + item.productId, // Unique ID for vendor-specific view
                  originalOrderId: doc.id,
                  productId: item.productId,
                  productTitle: item.title,
                  quantity: item.quantity,
                  price: item.price,
                  totalAmount: item.price * item.quantity,
                  buyerId: data.buyerId,
                  buyerName: data.buyerName,
                  buyerEmail: data.buyerEmail,
                  buyerPhone: data.shippingInfo?.phone,
                  buyerAddress: data.shippingInfo ?
                    `${data.shippingInfo.address}, ${data.shippingInfo.city}, ${data.shippingInfo.state} - ${data.shippingInfo.pincode}` :
                    undefined,
                  vendorId: item.vendorId,
                  vendorName: item.vendorName,
                  shippingInfo: data.shippingInfo,
                  paymentInfo: data.paymentInfo,
                  status: data.status || 'pending',
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate(),
                } as Order);
              });
            }
          }
        });

        setOrders(fetchedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

        console.log('Fetched orders for vendor:', userProfile.uid, fetchedOrders);
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
      // Use the same logic as initial fetch
      let q = query(
        collection(db, 'orders'),
        where('vendorId', '==', userProfile.uid)
      );
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(collection(db, 'orders'));
        querySnapshot = await getDocs(q);
      }

      const fetchedOrders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.vendorId === userProfile.uid) {
          fetchedOrders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Order);
        } else if (data.items && Array.isArray(data.items)) {
          const vendorItems = data.items.filter((item: any) => item.vendorId === userProfile.uid);
          if (vendorItems.length > 0) {
            vendorItems.forEach((item: any) => {
              fetchedOrders.push({
                id: doc.id + '_' + item.productId,
                originalOrderId: doc.id,
                productId: item.productId,
                productTitle: item.title,
                quantity: item.quantity,
                price: item.price,
                totalAmount: item.price * item.quantity,
                buyerId: data.buyerId,
                buyerName: data.buyerName,
                buyerEmail: data.buyerEmail,
                buyerPhone: data.shippingInfo?.phone,
                buyerAddress: data.shippingInfo ?
                  `${data.shippingInfo.address}, ${data.shippingInfo.city}, ${data.shippingInfo.state} - ${data.shippingInfo.pincode}` :
                  undefined,
                vendorId: item.vendorId,
                vendorName: item.vendorName,
                shippingInfo: data.shippingInfo,
                paymentInfo: data.paymentInfo,
                status: data.status || 'pending',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
              } as Order);
            });
          }
        }
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      // Find the order to get the correct document ID
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Use original order ID if this is a composite order
      const docId = (order as any).originalOrderId || orderId;

      await updateDoc(doc(db, 'orders', docId), {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus as any } : o
      ));

      const statusMessages = {
        'confirmed': 'Order confirmed! Customer will be notified.',
        'processing': 'Order marked as processing.',
        'shipped': 'Order marked as shipped! Customer will be notified.',
        'delivered': 'Order marked as delivered!',
        'cancelled': 'Order has been cancelled.'
      };

      toast({
        title: "✅ Status Updated",
        description: statusMessages[newStatus as keyof typeof statusMessages] || `Order status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
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

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Vendor Orders</h1>
            {getPendingOrdersCount() > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {getPendingOrdersCount()} pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage incoming orders, confirm deliveries, and track your sales
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
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground">
              Orders for your products will appear here
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
                    <h4 className="font-semibold mb-3">Customer & Delivery Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{order.shippingInfo?.fullName || order.buyerName}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-center">@</span>
                        <span className="break-all">{order.shippingInfo?.email || order.buyerEmail}</span>
                      </div>
                      {(order.shippingInfo?.phone || order.buyerPhone) && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{order.shippingInfo?.phone || order.buyerPhone}</span>
                        </div>
                      )}
                      {(order.shippingInfo?.address || order.buyerAddress) && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            {order.shippingInfo ? (
                              <div>
                                <div>{order.shippingInfo.address}</div>
                                <div>{order.shippingInfo.city}, {order.shippingInfo.pincode}</div>
                                {order.shippingInfo.notes && (
                                  <div className="text-muted-foreground mt-1">
                                    Note: {order.shippingInfo.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>{order.buyerAddress}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {order.paymentInfo && (
                        <div className="pt-2 border-t">
                          <span className="font-medium">Payment: </span>
                          <span className="capitalize">{order.paymentInfo.method}</span>
                          {order.paymentInfo.method === 'cod' && (
                            <span className="text-orange-600 ml-1">(Cash on Delivery)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                {order.status === 'pending' && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">New Order - Awaiting Your Response</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 min-h-[44px] touch-manipulation"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {updatingOrder === order.id ? 'Accepting...' : 'Accept Order'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 min-h-[44px] touch-manipulation"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {updatingOrder === order.id ? 'Declining...' : 'Decline'}
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === 'confirmed' && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Order Confirmed - Ready to Process</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 min-h-[44px] touch-manipulation"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Start Processing
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 min-h-[44px] touch-manipulation"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Mark as Shipped
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === 'processing' && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Order Being Processed</span>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      disabled={updatingOrder === order.id}
                      className="w-full min-h-[44px] touch-manipulation"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      {updatingOrder === order.id ? 'Updating...' : 'Mark as Shipped'}
                    </Button>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">Order Shipped - In Transit</span>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={updatingOrder === order.id}
                      className="w-full min-h-[44px] touch-manipulation"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updatingOrder === order.id ? 'Updating...' : 'Mark as Delivered'}
                    </Button>
                  </div>
                )}

                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`text-sm font-medium ${
                        order.status === 'delivered' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {order.status === 'delivered' ? 'Order Completed Successfully' : 'Order Cancelled'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
