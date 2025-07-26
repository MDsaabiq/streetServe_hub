
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, ShoppingCart, DollarSign, Users, Calendar } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
  topProducts: Array<{
    id: string;
    title: string;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    productTitle: string;
    buyerName: string;
    amount: number;
    status: string;
    date: Date;
  }>;
}

export const VendorAnalytics = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userProfile?.uid) return;

      try {
        // Fetch products
        const productsQuery = query(
          collection(db, 'products'),
          where('vendorId', '==', userProfile.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const totalProducts = productsSnapshot.size;

        // Fetch orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('vendorId', '==', userProfile.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        
        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let thisMonthOrders = 0;
        const customerSet = new Set();
        const productStats: { [key: string]: { title: string; orderCount: number; revenue: number } } = {};
        const recentOrdersData: any[] = [];

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        ordersSnapshot.forEach((doc) => {
          const order = doc.data();
          const orderDate = order.createdAt?.toDate() || new Date();
          
          totalRevenue += order.totalAmount || 0;
          customerSet.add(order.buyerId);

          // This month calculations
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            thisMonthRevenue += order.totalAmount || 0;
            thisMonthOrders += 1;
          }

          // Product statistics
          const productId = order.productId;
          if (!productStats[productId]) {
            productStats[productId] = {
              title: order.productTitle || 'Unknown Product',
              orderCount: 0,
              revenue: 0
            };
          }
          productStats[productId].orderCount += 1;
          productStats[productId].revenue += order.totalAmount || 0;

          // Recent orders (last 10)
          recentOrdersData.push({
            id: doc.id,
            productTitle: order.productTitle || 'Unknown Product',
            buyerName: order.buyerName || 'Unknown Buyer',
            amount: order.totalAmount || 0,
            status: order.status || 'pending',
            date: orderDate
          });
        });

        // Sort and get top products
        const topProducts = Object.entries(productStats)
          .map(([id, stats]) => ({ id, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Sort recent orders by date
        const recentOrders = recentOrdersData
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 10);

        setAnalytics({
          totalProducts,
          totalOrders: ordersSnapshot.size,
          totalRevenue,
          activeCustomers: customerSet.size,
          thisMonthRevenue,
          thisMonthOrders,
          topProducts,
          recentOrders
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userProfile?.uid, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your business performance and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{analytics.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-marketplace" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{analytics.activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* This Month Stats */}
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              This Month Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Orders</span>
                <span className="text-xl font-bold">{analytics.thisMonthOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Revenue</span>
                <span className="text-xl font-bold text-success">₹{analytics.thisMonthRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Order Value</span>
                <span className="text-xl font-bold">
                  ₹{analytics.thisMonthOrders > 0 ? Math.round(analytics.thisMonthRevenue / analytics.thisMonthOrders) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">{product.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">₹{product.revenue.toLocaleString()}</p>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{order.productTitle}</p>
                  <p className="text-sm text-muted-foreground">by {order.buyerName}</p>
                  <p className="text-xs text-muted-foreground">{order.date.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.amount}</p>
                  <Badge variant="outline" className="mt-1">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;
