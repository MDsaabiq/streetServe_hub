
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Edit, Trash2, MapPin } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  area: string;
  type: string;
  availability: string;
  description: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
}

export const LandownerProperties = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!userProfile?.uid) return;

      try {
        const q = query(
          collection(db, 'properties'),
          where('ownerId', '==', userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProperties: Property[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProperties.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Property);
        });

        setProperties(fetchedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your properties.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [userProfile?.uid, toast]);

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deleteDoc(doc(db, 'properties', propertyId));
      setProperties(properties.filter(p => p.id !== propertyId));
      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property.",
        variant: "destructive",
      });
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your property listings and lease requests
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link to="/landowner/add-property">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-12 text-center">
            <Building className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by listing your first property for lease
            </p>
            <Button variant="accent" asChild>
              <Link to="/landowner/add-property">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="border-0 bg-gradient-card shadow-card overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">
                    {property.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {property.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {property.title}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">{property.area}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={property.availability === 'Available' ? 'default' : 'secondary'}>
                      {property.availability}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-accent">₹{property.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/landowner/edit-property/${property.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProperty(property.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandownerProperties;
