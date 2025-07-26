import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Building, ArrowRight, Star, Users, MapPin, Plus, Package } from 'lucide-react';
import heroImage from '@/assets/hero-marketplace.jpg';
import { useAuth } from '@/contexts/AuthContext';

export const Home = () => {
  const { userProfile } = useAuth();

  // Render different hero/features for each user type
  const renderUserSection = () => {
    if (userProfile?.role === 'buyer') {
      return (
        <>
          {/* Hero Section for Buyer */}
          <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome, Buyer!
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Discover goods and lease properties for your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/marketplace" className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Goods
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="accent" asChild>
                  <Link to="/properties" className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Lease Property
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Buyer Features Section */}
          <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Everything You Need for Your Business
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Discover products, find locations, and manage your street food business efficiently
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingCart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Browse Marketplace</h3>
                    <p className="text-muted-foreground mb-6">
                      Discover a wide variety of products from trusted vendors for your business needs
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/marketplace">Shop Now</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Find Properties</h3>
                    <p className="text-muted-foreground mb-6">
                      Browse available properties and find the perfect location for your street food business
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/properties">Browse Properties</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Track Orders</h3>
                    <p className="text-muted-foreground mb-6">
                      Monitor your purchases, track delivery status, and manage your order history
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/orders">My Orders</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      );
    }
    if (userProfile?.role === 'vendor') {
      return (
        <>
          {/* Hero Section for Vendor */}
          <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome, Vendor!
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Add your inventory and manage your product listings
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/vendor/add-product" className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Inventory
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="accent" asChild>
                  <Link to="/vendor/products" className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    My Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Vendor Features Section */}
          <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Grow Your Food Business
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to manage and expand your street food business
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Add Inventory</h3>
                    <p className="text-muted-foreground mb-6">
                      Easily add new products with photos, descriptions, and pricing to your inventory
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/vendor/add-product">Add Product</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingCart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Manage Products</h3>
                    <p className="text-muted-foreground mb-6">
                      View, edit, and manage all your products, update prices and availability
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/vendor/products">My Products</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Track Orders</h3>
                    <p className="text-muted-foreground mb-6">
                      Receive and manage customer orders, update order status and delivery
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/vendor/orders">View Orders</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      );
    }
    if (userProfile?.role === 'landowner') {
      return (
        <>
          {/* Hero Section for Landlord */}
          <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome, Landowner!
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Manage your properties and connect with street food entrepreneurs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/landowner/add-property" className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Property
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="accent" asChild>
                  <Link to="/landowner/properties" className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    My Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

        {/* Landowner Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Property Management Made Easy
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Maximize your property's potential with our comprehensive landowner tools
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Easy Property Listing</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your properties with detailed descriptions, photos, and pricing in minutes
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/landowner/add-property">Add Property</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Property Management</h3>
                  <p className="text-muted-foreground mb-6">
                    View and manage all your properties, track inquiries, and update availability
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/landowner/properties">My Properties</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-card shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Lease Requests</h3>
                  <p className="text-muted-foreground mb-6">
                    Receive and manage lease requests from street food entrepreneurs
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/lease-requests">View Requests</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        </>
      );
    }
    // Default: show all options (for not logged in or unknown user)
    return (
      <>
        {/* Hero Section for All */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          </div>
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                StreetServe
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              The ultimate platform connecting street food entrepreneurs with vendors and property owners
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="hero" asChild>
                <Link to="/marketplace" className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Goods
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="accent" asChild>
                <Link to="/properties" className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Lease Property
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen">
      {renderUserSection()}

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm opacity-90">Active Vendors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm opacity-90">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">200+</div>
              <div className="text-sm opacity-90">Properties Available</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged-in users */}
      {!userProfile && (
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Street Food Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who trust StreetServe for their business needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="hero" asChild>
                <Link to="/signup">
                  <Users className="mr-2 h-5 w-5" />
                  Get Started Today
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/login">
                  Already have an account?
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;