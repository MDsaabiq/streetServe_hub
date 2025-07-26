
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Calendar, MapPin, Building, RefreshCw } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface LeaseRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  ownerId: string;
  ownerName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  businessType: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface LeaseRequestModalProps {
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  propertyLocation: string;
  propertyPrice: number;
  onRequestSent?: () => void;
}

const LeaseRequestModal = ({ propertyId, propertyTitle, ownerId, ownerName, propertyLocation, propertyPrice, onRequestSent }: LeaseRequestModalProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    businessType: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const requestData = {
        propertyId,
        propertyTitle,
        propertyLocation,
        propertyPrice,
        ownerId,
        ownerName,
        requesterId: userProfile.uid,
        requesterName: userProfile.displayName || 'Unknown User',
        requesterEmail: userProfile.email,
        requesterPhone: formData.phone,
        businessType: formData.businessType,
        message: formData.message,
        status: 'pending',
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'leaseRequests'), requestData);

      toast({
        title: "Request sent!",
        description: "Your lease request has been sent to the property owner.",
      });

      setOpen(false);
      setFormData({ phone: '', businessType: '', message: '' });

      // Trigger refresh in parent component
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error('Error sending lease request:', error);
      toast({
        title: "Error",
        description: "Failed to send lease request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" className="flex-1">
          Request Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Lease - {propertyTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              placeholder="Your contact number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type</label>
            <Input
              placeholder="e.g., Street Food Stall, Snack Corner"
              value={formData.businessType}
              onChange={(e) => setFormData({...formData, businessType: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Tell the owner about your business plans..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const LeaseRequests = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setActionLoading(requestId);
    try {
      await updateDoc(doc(db, 'leaseRequests', requestId), {
        status: action,
        updatedAt: new Date()
      });

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: action } : req
      ));

      toast({
        title: `Request ${action}`,
        description: `The lease request has been ${action}.`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action.slice(0, -1)} the request.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userProfile?.uid || !userProfile?.role) {
        console.log('User profile not ready:', userProfile);
        setLoading(false);
        return;
      }

      try {
        let q;
        if (userProfile.role === 'landowner') {
          // For landowners: fetch requests for their properties
          q = query(
            collection(db, 'leaseRequests'),
            where('ownerId', '==', userProfile.uid)
          );
        } else {
          // For buyers: fetch requests they've sent
          q = query(
            collection(db, 'leaseRequests'),
            where('requesterId', '==', userProfile.uid)
          );
        }

        const querySnapshot = await getDocs(q);
        const fetchedRequests: LeaseRequest[] = [];

        console.log(`Fetching ${userProfile.role} requests for user ${userProfile.uid}`);
        console.log(`Query returned ${querySnapshot.size} documents`);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Document data:', data);
          fetchedRequests.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as LeaseRequest);
        });

        console.log('Final requests array:', fetchedRequests);
        setRequests(fetchedRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error fetching lease requests:', error);
        toast({
          title: "Error",
          description: "Failed to fetch lease requests.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userProfile?.uid, userProfile?.role, toast, refreshTrigger]);

  if (loading || !userProfile) {
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {userProfile?.role === 'landowner' ? 'Incoming Lease Requests' : 'My Lease Requests'}
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.role === 'landowner'
              ? 'Manage lease requests for your properties'
              : 'Track your property lease requests'
            }
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="space-y-4">
          <Card className="border-0 bg-gradient-card shadow-card">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Requests Yet</h3>
              <p className="text-muted-foreground">
                {userProfile?.role === 'landowner'
                  ? 'No lease requests have been received for your properties yet'
                  : 'Your lease requests will appear here'
                }
              </p>
            </CardContent>
          </Card>

          {/* Debug info */}
          <Card className="border border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <p><strong>User ID:</strong> {userProfile?.uid}</p>
              <p><strong>User Role:</strong> {userProfile?.role}</p>
              <p><strong>User Email:</strong> {userProfile?.email}</p>
              <p><strong>Query Type:</strong> {userProfile?.role === 'landowner' ? 'ownerId' : 'requesterId'}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-0 bg-gradient-card shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.propertyTitle}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {request.propertyLocation}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {request.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Business Type:</span> {request.businessType}
                  </div>
                  <div>
                    <span className="font-medium">Monthly Rent:</span> ₹{request.propertyPrice.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">
                      {userProfile?.role === 'landowner' ? 'Requester:' : 'Owner:'}
                    </span> {userProfile?.role === 'landowner' ? request.requesterName : request.ownerName}
                  </div>
                  {userProfile?.role === 'landowner' && (
                    <div>
                      <span className="font-medium">Contact:</span> {request.requesterEmail}
                      {request.requesterPhone && ` • ${request.requesterPhone}`}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="text-muted-foreground mt-1">{request.message}</p>
                  </div>

                  {userProfile?.role === 'landowner' && request.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'approved')}
                        disabled={actionLoading === request.id}
                        className="flex-1"
                      >
                        {actionLoading === request.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                        disabled={actionLoading === request.id}
                        className="flex-1"
                      >
                        {actionLoading === request.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { LeaseRequestModal };
export default LeaseRequests;
