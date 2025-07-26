
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Building, FileText, DollarSign, Users, Calendar } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface LandownerAnalyticsData {
  totalProperties: number;
  availableProperties: number;
  occupiedProperties: number;
  totalLeaseRequests: number;
  activeLeases: number;
  monthlyRevenue: number;
  topProperties: Array<{
    id: string;
    title: string;
    requestCount: number;
    price: number;
  }>;
  recentRequests: Array<{
    id: string;
    propertyTitle: string;
    requesterName: string;
    status: string;
    date: Date;
  }>;
}

export const LandownerAnalytics = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<LandownerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userProfile?.uid) return;

      try {
        // Fetch properties
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('ownerId', '==', userProfile.uid)
        );
        const propertiesSnapshot = await getDocs(propertiesQuery);
        
        let availableProperties = 0;
        let occupiedProperties = 0;
        let monthlyRevenue = 0;
        const propertyStats: { [key: string]: { title: string; requestCount: number; price: number } } = {};

        propertiesSnapshot.forEach((doc) => {
          const property = doc.data();
          
          if (property.availability === 'Available') {
            availableProperties += 1;
          } else if (property.availability === 'Occupied') {
            occupiedProperties += 1;
            monthlyRevenue += property.price || 0;
          }

          propertyStats[doc.id] = {
            title: property.title || 'Unknown Property',
            requestCount: 0,
            price: property.price || 0
          };
        });

        // Fetch lease requests
        const leaseRequestsQuery = query(
          collection(db, 'leaseRequests'),
          where('ownerId', '==', userProfile.uid)
        );
        const leaseRequestsSnapshot = await getDocs(leaseRequestsQuery);
        
        let activeLeases = 0;
        const recentRequestsData: any[] = [];

        leaseRequestsSnapshot.forEach((doc) => {
          const request = doc.data();
          const requestDate = request.createdAt?.toDate() || new Date();

          if (request.status === 'approved') {
            activeLeases += 1;
          }

          // Update property stats
          const propertyId = request.propertyId;
          if (propertyStats[propertyId]) {
            propertyStats[propertyId].requestCount += 1;
          }

          // Recent requests
          recentRequestsData.push({
            id: doc.id,
            propertyTitle: request.propertyTitle || 'Unknown Property',
            requesterName: request.requesterName || 'Unknown User',
            status: request.status || 'pending',
            date: requestDate
          });
        });

        // Sort and get top properties
        const topProperties = Object.entries(propertyStats)
          .map(([id, stats]) => ({ id, ...stats }))
          .sort((a, b) => b.requestCount - a.requestCount)
          .slice(0, 5);

        // Sort recent requests by date
        const recentRequests = recentRequestsData
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 10);

        setAnalytics({
          totalProperties: propertiesSnapshot.size,
          availableProperties,
          occupiedProperties,
          totalLeaseRequests: leaseRequestsSnapshot.size,
          activeLeases,
          monthlyRevenue,
          topProperties,
          recentRequests
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
        <h1 className="text-3xl font-bold mb-2">Property Analytics</h1>
        <p className="text-muted-foreground">
          Track your property portfolio performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{analytics.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Lease Requests</p>
                <p className="text-2xl font-bold">{analytics.totalLeaseRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Leases</p>
                <p className="text-2xl font-bold">{analytics.activeLeases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-marketplace" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{analytics.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Property Status */}
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Property Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{analytics.availableProperties}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({Math.round((analytics.availableProperties / analytics.totalProperties) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Occupied</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{analytics.occupiedProperties}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({Math.round((analytics.occupiedProperties / analytics.totalProperties) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Occupancy Rate</span>
                <span className="text-xl font-bold text-success">
                  {Math.round((analytics.occupiedProperties / analytics.totalProperties) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Popular Properties */}
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Most Requested Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProperties.map((property, index) => (
                <div key={property.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{property.requestCount} requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">₹{property.price.toLocaleString()}/mo</p>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lease Requests */}
      <Card className="border-0 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Lease Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{request.propertyTitle}</p>
                  <p className="text-sm text-muted-foreground">by {request.requesterName}</p>
                  <p className="text-xs text-muted-foreground">{request.date.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {request.status}
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

export default LandownerAnalytics;
