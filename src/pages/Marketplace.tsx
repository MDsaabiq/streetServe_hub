import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Star, Filter } from 'lucide-react';

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    title: 'Fresh Vegetables Bundle',
    price: 299,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    vendor: 'Green Valley Farms',
    rating: 4.8,
    quantity: '5kg Mixed',
    category: 'Vegetables'
  },
  {
    id: '2',
    title: 'Premium Spices Set',
    price: 899,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    vendor: 'Spice Paradise',
    rating: 4.9,
    quantity: '500g Each',
    category: 'Spices'
  },
  {
    id: '3',
    title: 'Street Food Equipment Kit',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    vendor: 'Kitchen Pro',
    rating: 4.6,
    quantity: 'Complete Set',
    category: 'Equipment'
  },
  {
    id: '4',
    title: 'Organic Rice (Premium)',
    price: 450,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    vendor: 'Organic Valley',
    rating: 4.7,
    quantity: '10kg',
    category: 'Grains'
  },
  {
    id: '5',
    title: 'Fresh Meat Selection',
    price: 799,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
    vendor: 'Fresh Meat Co.',
    rating: 4.5,
    quantity: '2kg Mixed',
    category: 'Meat'
  },
  {
    id: '6',
    title: 'Cooking Oil Bundle',
    price: 650,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    vendor: 'Pure Oil Industries',
    rating: 4.4,
    quantity: '5L Total',
    category: 'Oil'
  }
];

export const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetables', 'Spices', 'Equipment', 'Grains', 'Meat', 'Oil'];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover fresh ingredients, equipment, and supplies for your street food business
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, vendors..."
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "marketplace" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-card transition-all duration-300 border-0 bg-gradient-card overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.rating}
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {product.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{product.vendor}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="marketplace" className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No products found. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;