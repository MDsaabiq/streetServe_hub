import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Building, ArrowRight, Star, Users, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-marketplace.jpg';

export const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're buying goods, selling products, or leasing property, StreetServe has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* E-commerce Card */}
            <Card className="group hover:shadow-card transition-all duration-300 border-0 bg-gradient-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold ml-4">Buy & Sell Goods</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Connect with vendors to source fresh ingredients, equipment, and supplies for your street food business.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-primary mr-2" />
                    Browse verified vendors
                  </li>
                  <li className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-primary mr-2" />
                    Secure payment system
                  </li>
                  <li className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-primary mr-2" />
                    Order tracking & history
                  </li>
                </ul>
                <Button variant="marketplace" className="w-full" asChild>
                  <Link to="/marketplace">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Property Card */}
            <Card className="group hover:shadow-card transition-all duration-300 border-0 bg-gradient-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Building className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold ml-4">Lease Property</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Find the perfect location for your street food business or list your property for lease.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-accent mr-2" />
                    Prime locations available
                  </li>
                  <li className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-accent mr-2" />
                    Flexible lease terms
                  </li>
                  <li className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-accent mr-2" />
                    Direct landlord contact
                  </li>
                </ul>
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/properties">
                    Browse Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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

      {/* CTA Section */}
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
    </div>
  );
};

export default Home;