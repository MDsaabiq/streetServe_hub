import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  User,
  Mail,
  Calendar,
  Shield,
  MapPin,
  Phone,
  Building,
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  Award,
  Target,
  DollarSign
} from 'lucide-react';

export const Profile = () => {
  const { userProfile, currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    businessName: '',
    businessType: '',
    description: '',
    website: '',
    gst: ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        displayName: userProfile.displayName || '',
        phone: (userProfile as any).phone || '',
        address: (userProfile as any).address || '',
        city: (userProfile as any).city || '',
        state: (userProfile as any).state || '',
        pincode: (userProfile as any).pincode || '',
        businessName: (userProfile as any).businessName || '',
        businessType: (userProfile as any).businessType || '',
        description: (userProfile as any).description || '',
        website: (userProfile as any).website || '',
        gst: (userProfile as any).gst || ''
      });
      fetchStats();
      fetchRecentActivity();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    if (!userProfile) return;

    try {
      let statsData = {};

      if (userProfile.role === 'buyer') {
        // Fetch buyer stats
        const ordersQuery = query(
          collection(db, 'orders'),
          where('buyerId', '==', userProfile.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        const leaseQuery = query(
          collection(db, 'leaseRequests'),
          where('requesterId', '==', userProfile.uid)
        );
        const leaseSnapshot = await getDocs(leaseQuery);

        let totalSpent = 0;
        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          if (order.status === 'delivered') {
            totalSpent += order.totalAmount || 0;
          }
        });

        statsData = {
          totalOrders: ordersSnapshot.size,
          totalSpent,
          leaseRequests: leaseSnapshot.size,
          memberSince: userProfile.createdAt?.toLocaleDateString() || 'Unknown'
        };
      } else if (userProfile.role === 'vendor') {
        // Fetch vendor stats
        const productsQuery = query(
          collection(db, 'products'),
          where('vendorId', '==', userProfile.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);

        const ordersQuery = query(
          collection(db, 'orders'),
          where('vendorId', '==', userProfile.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        let totalRevenue = 0;
        let totalSold = 0;
        const customers = new Set();

        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          if (order.status === 'delivered') {
            totalRevenue += order.totalAmount || 0;
            totalSold += order.quantity || 0;
            customers.add(order.buyerId);
          }
        });

        statsData = {
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalRevenue,
          totalCustomers: customers.size,
          totalSold
        };
      } else if (userProfile.role === 'landowner') {
        // Fetch landowner stats
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('ownerId', '==', userProfile.uid)
        );
        const propertiesSnapshot = await getDocs(propertiesQuery);

        const leaseQuery = query(
          collection(db, 'leaseRequests'),
          where('ownerId', '==', userProfile.uid)
        );
        const leaseSnapshot = await getDocs(leaseQuery);

        let monthlyRevenue = 0;
        let occupiedCount = 0;

        propertiesSnapshot.docs.forEach(doc => {
          const property = doc.data();
          if (property.availability === 'Occupied') {
            occupiedCount++;
            monthlyRevenue += property.price || 0;
          }
        });

        statsData = {
          totalProperties: propertiesSnapshot.size,
          occupiedProperties: occupiedCount,
          monthlyRevenue,
          leaseRequests: leaseSnapshot.size
        };
      }

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    if (!userProfile) return;

    try {
      let activityData: any[] = [];

      if (userProfile.role === 'buyer') {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('buyerId', '==', userProfile.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        activityData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'order',
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
      } else if (userProfile.role === 'vendor') {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('vendorId', '==', userProfile.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        activityData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'sale',
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
      } else if (userProfile.role === 'landowner') {
        const leaseQuery = query(
          collection(db, 'leaseRequests'),
          where('ownerId', '==', userProfile.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const leaseSnapshot = await getDocs(leaseQuery);

        activityData = leaseSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'lease',
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
      }

      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !userProfile) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        updatedAt: new Date()
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      displayName: userProfile?.displayName || '',
      phone: (userProfile as any).phone || '',
      address: (userProfile as any).address || '',
      city: (userProfile as any).city || '',
      state: (userProfile as any).state || '',
      pincode: (userProfile as any).pincode || '',
      businessName: (userProfile as any).businessName || '',
      businessType: (userProfile as any).businessType || '',
      description: (userProfile as any).description || '',
      website: (userProfile as any).website || '',
      gst: (userProfile as any).gst || ''
    });
    setIsEditing(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'vendor':
        return 'default';
      case 'landowner':
        return 'secondary';
      case 'buyer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'vendor':
        return 'Sell products and manage inventory';
      case 'landowner':
        return 'Rent out properties and manage leases';
      case 'buyer':
        return 'Purchase products and rent properties';
      default:
        return 'User';
    }
  };

  const renderStatsCards = () => {
    if (userProfile?.role === 'buyer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">₹{stats.totalSpent?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.leaseRequests || 0}</p>
                  <p className="text-sm text-muted-foreground">Lease Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else if (userProfile?.role === 'vendor') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalCustomers || 0}</p>
                  <p className="text-sm text-muted-foreground">Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSold || 0}</p>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else if (userProfile?.role === 'landowner') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProperties || 0}</p>
                  <p className="text-sm text-muted-foreground">Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.occupiedProperties || 0}</p>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">₹{stats.monthlyRevenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.leaseRequests || 0}</p>
                  <p className="text-sm text-muted-foreground">Lease Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === 'order' && <ShoppingCart className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'sale' && <Package className="h-5 w-5 text-green-600" />}
                  {activity.type === 'lease' && <Building className="h-5 w-5 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {activity.type === 'order' && `Order for ${activity.items?.[0]?.title || 'items'}`}
                    {activity.type === 'sale' && `Sale: ${activity.items?.[0]?.title || 'items'}`}
                    {activity.type === 'lease' && `Lease request for ${activity.propertyTitle}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.createdAt?.toLocaleDateString()} •
                    {activity.type === 'order' && ` ₹${activity.totalAmount?.toLocaleString()}`}
                    {activity.type === 'sale' && ` ₹${activity.totalAmount?.toLocaleString()}`}
                    {activity.type === 'lease' && ` ${activity.status}`}
                  </p>
                </div>
                <Badge variant={
                  activity.status === 'delivered' || activity.status === 'approved' ? 'default' :
                  activity.status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPersonalInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            {isEditing ? (
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.displayName || 'Not set'}</div>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.phone || 'Not set'}</div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          {isEditing ? (
            <Textarea
              id="address"
              value={profileData.address}
              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md">{profileData.address || 'Not set'}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            {isEditing ? (
              <Input
                id="city"
                value={profileData.city}
                onChange={(e) => setProfileData({...profileData, city: e.target.value})}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.city || 'Not set'}</div>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            {isEditing ? (
              <Input
                id="state"
                value={profileData.state}
                onChange={(e) => setProfileData({...profileData, state: e.target.value})}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.state || 'Not set'}</div>
            )}
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            {isEditing ? (
              <Input
                id="pincode"
                value={profileData.pincode}
                onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.pincode || 'Not set'}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBusinessInfo = () => {
    if (userProfile?.role === 'buyer') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {userProfile?.role === 'vendor' ? 'Business Information' : 'Property Business Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              {isEditing ? (
                <Input
                  id="businessName"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">{profileData.businessName || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              {isEditing ? (
                <Input
                  id="businessType"
                  value={profileData.businessType}
                  onChange={(e) => setProfileData({...profileData, businessType: e.target.value})}
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">{profileData.businessType || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                placeholder="Describe your business..."
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profileData.description || 'Not set'}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="https://..."
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">{profileData.website || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="gst">GST Number</Label>
              {isEditing ? (
                <Input
                  id="gst"
                  value={profileData.gst}
                  onChange={(e) => setProfileData({...profileData, gst: e.target.value})}
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">{profileData.gst || 'Not set'}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and view your activity
        </p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile.image} alt={userProfile.displayName} />
              <AvatarFallback className="text-lg">
                {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {userProfile.displayName || 'User'}
              </CardTitle>
              <Badge variant={getRoleBadgeVariant(userProfile.role)} className="capitalize">
                <Shield className="mr-1 h-3 w-3" />
                {userProfile.role}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(userProfile.role)}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                Member since {userProfile.createdAt?.toLocaleDateString() || 'Unknown'}
              </div>
            </div>
            <div className="ml-auto">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          {userProfile.role !== 'buyer' && <TabsTrigger value="business">Business Info</TabsTrigger>}
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          {renderPersonalInfo()}
        </TabsContent>

        {userProfile.role !== 'buyer' && (
          <TabsContent value="business">
            {renderBusinessInfo()}
          </TabsContent>
        )}

        <TabsContent value="activity">
          {renderRecentActivity()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
