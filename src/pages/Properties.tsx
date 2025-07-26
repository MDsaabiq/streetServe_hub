
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Star, Filter } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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

export const Properties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const propertyTypes = ['All', 'Food Court', 'Street Stall', 'Kitchen', 'Market Stall', 'Kiosk', 'Mall Space', 'Restaurant Space', 'Other'];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
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
          description: "Failed to fetch properties.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || property.type === selectedType;
    return matchesSearch && matchesType;
  });

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Properties for Lease</h1>
        <p className="text-muted-foreground">
          Find the perfect location for your street food business
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by location, property type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Property Type Filter */}
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "accent" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="group hover:shadow-card transition-all duration-300 border-0 bg-gradient-card overflow-hidden">
            <div className="aspect-video overflow-hidden relative">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-background/90">
                  {property.type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center bg-background/90 rounded-full px-2 py-1 text-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  4.5
                </div>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg group-hover:text-accent transition-colors">
                {property.title}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <p className="text-sm text-muted-foreground">by {property.ownerName}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">{property.area}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Availability:</span>
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
                <Button variant="accent" className="flex-1">
                  Request Lease
                </Button>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {properties.length === 0 
              ? "No properties available yet. Land owners can start listing their properties!" 
              : "No properties found. Try adjusting your search or filters."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;
