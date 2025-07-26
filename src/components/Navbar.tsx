
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Building, User, LogOut, Store, Package, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'vendor':
        return <Store className="h-4 w-4" />;
      case 'landowner':
        return <Building className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'vendor':
        return 'Vendor';
      case 'landowner':
        return 'Land Owner';
      default:
        return 'Buyer';
    }
  };

  const renderNavigationLinks = () => {
    if (!userProfile) return null;

    switch (userProfile.role) {
      case 'vendor':
        return (
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/vendor/products" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/vendor/products') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Products
            </Link>
            <Link 
              to="/vendor/orders" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/vendor/orders') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Orders
            </Link>
            <Button variant="marketplace" size="sm" asChild>
              <Link to="/vendor/add-product">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        );
      case 'landowner':
        return (
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/landowner/properties" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/landowner/properties') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Properties
            </Link>
            <Link 
              to="/landowner/requests" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/landowner/requests') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Lease Requests
            </Link>
            <Button variant="accent" size="sm" asChild>
              <Link to="/landowner/add-property">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </div>
        );
      default: // buyer
        return (
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/marketplace" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/marketplace' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Buy Goods
            </Link>
            <Link 
              to="/properties" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/properties' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Lease Property
            </Link>
          </div>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StreetServe
            </span>
          </Link>

          {/* Navigation Links */}
          {renderNavigationLinks()}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    {getRoleIcon(userProfile?.role)}
                    <span className="hidden sm:inline">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="hidden md:inline text-xs text-muted-foreground">
                      ({getRoleLabel(userProfile?.role)})
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="marketplace" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
