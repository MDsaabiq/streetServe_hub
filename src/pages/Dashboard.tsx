import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Building, Users, Plus, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const Dashboard = () => {
  const { userProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile?.uid) return;

      try {
        if (userProfile.role === 'buyer') {
          // Fetch orders
          const ordersQuery = query(collection(db, 'orders'), where('buyerId', '==', userProfile.uid));
          const ordersSnapshot = await getDocs(ordersQuery);
          
          // Fetch lease requests
          const leaseQuery = query(collection(db, 'leaseRequests'), where('requesterId', '==', userProfile.uid));
          const leaseSnapshot = await getDocs(leaseQuery);

          const recentOrders = ordersSnapshot.docs.slice(0, 2).map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          const recentLeaseRequests = leaseSnapshot.docs.slice(0, 2).map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setDashboardData({
            totalOrders: ordersSnapshot.size,
            totalLeaseRequests: leaseSnapshot.size,
            recentOrders,
            recentLeaseRequests
          });
        } else if (userProfile.role === 'vendor') {
          // Fetch vendor data
          const productsQuery = query(collection(db, 'products'), where('vendorId', '==', userProfile.uid));
          const productsSnapshot = await getDocs(productsQuery);
          
          const ordersQuery = query(collection(db, 'orders'), where('vendorId', '==', userProfile.uid));
          const ordersSnapshot = await getDocs(ordersQuery);

          let totalRevenue = 0;
          ordersSnapshot.docs.forEach(doc => {
            const order = doc.data();
            if (order.status === 'delivered') {
              totalRevenue += order.totalAmount;
            }
          });

          setDashboardData({
            totalProducts: productsSnapshot.size,
            totalOrders: ordersSnapshot.size,
            totalRevenue,
            totalCustomers: new Set(ordersSnapshot.docs.map(doc => doc.data().buyerId)).size
          });
        } else if (userProfile.role === 'landowner') {
          // Fetch landowner data
          const propertiesQuery = query(collection(db, 'properties'), where('ownerId', '==', userProfile.uid));
          const propertiesSnapshot = await getDocs(propertiesQuery);
          
          const leaseQuery = query(collection(db, 'leaseRequests'), where('ownerId', '==', userProfile.uid));
          const leaseSnapshot = await getDocs(leaseQuery);

          let monthlyRevenue = 0;
          let occupiedCount = 0;
          propertiesSnapshot.docs.forEach(doc => {
            const property = doc.data();
            if (property.availability === 'Occupied') {
              occupiedCount++;
              monthlyRevenue += property.price;
            }
          });

          setDashboardData({
            totalProperties: propertiesSnapshot.size,
            totalLeaseRequests: leaseSnapshot.size,
            occupiedProperties: occupiedCount,
            monthlyRevenue
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile?.uid, userProfile?.role]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const renderBuyerDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{dashboardData.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Lease Requests</p>
                <p className="text-2xl font-bold">{dashboardData.totalLeaseRequests || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Orders
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders?.length > 0 ? (
                dashboardData.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.productTitle}</p>
                      <p className="text-sm text-muted-foreground">₹{order.totalAmount}</p>
                    </div>
                    <span className="text-primary font-medium">{order.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Property Requests
              <Button variant="outline" size="sm" asChild>
                <Link to="/lease-requests">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentLeaseRequests?.length > 0 ? (
                dashboardData.recentLeaseRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.propertyTitle}</p>
                      <p className="text-sm text-muted-foreground">₹{request.propertyPrice}/month</p>
                    </div>
                    <span className="text-primary font-medium">{request.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recent requests</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVendorDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Products Listed</p>
                <p className="text-2xl font-bold">{dashboardData.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Orders Received</p>
                <p className="text-2xl font-bold">{dashboardData.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">₹{dashboardData.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{dashboardData.totalCustomers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Your Products</h2>
        <Button variant="marketplace" asChild>
          <Link to="/vendor/add-product">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );

  const renderLandownerDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Properties Listed</p>
                <p className="text-2xl font-bold">{dashboardData.totalProperties || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Lease Requests</p>
                <p className="text-2xl font-bold">{dashboardData.totalLeaseRequests || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold">₹{dashboardData.monthlyRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">{dashboardData.occupiedProperties || 0}/{dashboardData.totalProperties || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Your Properties</h2>
        <Button variant="marketplace" asChild>
          <Link to="/landowner/add-property">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (userProfile?.role) {
      case 'vendor':
        return renderVendorDashboard();
      case 'landowner':
        return renderLandownerDashboard();
      default:
        return renderBuyerDashboard();
    }
  };

  const getRoleTitle = () => {
    switch (userProfile?.role) {
      case 'vendor':
        return 'Vendor Dashboard';
      case 'landowner':
        return 'Land Owner Dashboard';
      default:
        return 'Buyer Dashboard';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userProfile?.displayName || 'User'}!
        </h1>
        <p className="text-muted-foreground">{getRoleTitle()}</p>
      </div>

      {getDashboardContent()}
    </div>
  );
};

export default Dashboard;
