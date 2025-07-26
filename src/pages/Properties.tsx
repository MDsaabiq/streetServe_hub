import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Star, Filter } from 'lucide-react';

// Mock data for demonstration
const mockProperties = [
  {
    id: '1',
    title: 'Downtown Food Court Space',
    price: 15000,
    location: 'Connaught Place, Delhi',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    owner: 'Delhi Properties Ltd.',
    rating: 4.8,
    area: '200 sq ft',
    type: 'Food Court',
    availability: 'Immediate'
  },
  {
    id: '2',
    title: 'Street Side Stall Location',
    price: 8000,
    location: 'Chandni Chowk, Delhi',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    owner: 'Old Delhi Estates',
    rating: 4.6,
    area: '100 sq ft',
    type: 'Street Stall',
    availability: 'From Next Month'
  },
  {
    id: '3',
    title: 'Modern Kitchen Space',
    price: 25000,
    location: 'Gurgaon, Haryana',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    owner: 'Modern Spaces Inc.',
    rating: 4.9,
    area: '500 sq ft',
    type: 'Kitchen',
    availability: 'Immediate'
  },
  {
    id: '4',
    title: 'Market Plaza Corner',
    price: 12000,
    location: 'Karol Bagh, Delhi',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400',
    owner: 'Market Plaza Group',
    rating: 4.5,
    area: '150 sq ft',
    type: 'Market Stall',
    availability: 'Available'
  },
  {
    id: '5',
    title: 'University Campus Kiosk',
    price: 10000,
    location: 'DU Campus, Delhi',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    owner: 'Campus Properties',
    rating: 4.7,
    area: '80 sq ft',
    type: 'Kiosk',
    availability: 'From Next Week'
  },
  {
    id: '6',
    title: 'Shopping Mall Food Court',
    price: 35000,
    location: 'Select City Walk, Delhi',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    owner: 'Mall Management Co.',
    rating: 4.8,
    area: '300 sq ft',
    type: 'Mall Space',
    availability: 'Immediate'
  }
];

export const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const propertyTypes = ['All', 'Food Court', 'Street Stall', 'Kitchen', 'Market Stall', 'Kiosk', 'Mall Space'];

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || property.type === selectedType;
    return matchesSearch && matchesType;
  });

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
                  {property.rating}
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
              <p className="text-sm text-muted-foreground">by {property.owner}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">{property.area}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium text-success">{property.availability}</span>
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

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No properties found. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;