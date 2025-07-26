import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { Cart } from '@/components/Cart';

const Navbar = () => {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    if (!currentUser || !userProfile) {
      return (
        <>
          <Link to="/marketplace" className="text-sm font-medium hover:underline">
            Marketplace
          </Link>
          <Link to="/properties" className="text-sm font-medium hover:underline">
            Properties
          </Link>
          <Link to="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
          <Link to="/signup" className="text-sm font-medium hover:underline">
            Sign Up
          </Link>
        </>
      );
    }

    switch (userProfile.role) {
      case 'buyer':
        return (
          <>
            <Link to="/marketplace" className="text-sm font-medium hover:underline">
              Marketplace
            </Link>
            <Link to="/properties" className="text-sm font-medium hover:underline">
              Properties
            </Link>
            <Link to="/orders" className="text-sm font-medium hover:underline">
              My Orders
            </Link>
            <Link to="/lease-requests" className="text-sm font-medium hover:underline">
              Lease Requests
            </Link>
          </>
        );
      case 'vendor':
        return (
          <>
            <Link to="/marketplace" className="text-sm font-medium hover:underline">
              Marketplace
            </Link>
            <Link to="/vendor/products" className="text-sm font-medium hover:underline">
              My Products
            </Link>
            <Link to="/vendor/add-product" className="text-sm font-medium hover:underline">
              Add Product
            </Link>
            <Link to="/vendor/orders" className="text-sm font-medium hover:underline">
              Orders
            </Link>
          </>
        );
      case 'landowner':
        return (
          <>
            <Link to="/properties" className="text-sm font-medium hover:underline">
              Browse Properties
            </Link>
            <Link to="/landowner/properties" className="text-sm font-medium hover:underline">
              My Properties
            </Link>
            <Link to="/landowner/add-property" className="text-sm font-medium hover:underline">
              Add Property
            </Link>
            <Link to="/landowner/analytics" className="text-sm font-medium hover:underline">
              Analytics
            </Link>
            <Link to="/lease-requests" className="text-sm font-medium hover:underline">
              Lease Requests
            </Link>
          </>
        );
      default:
        return (
          <>
            <Link to="/marketplace" className="text-sm font-medium hover:underline">
              Marketplace
            </Link>
            <Link to="/properties" className="text-sm font-medium hover:underline">
              Properties
            </Link>
          </>
        );
    }
  };

  // Role-based dropdown menu items
  const getDropdownItems = () => {
    if (!currentUser || !userProfile) return null;

    switch (userProfile.role) {
      case 'buyer':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/orders">My Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/lease-requests">Lease Requests</Link>
            </DropdownMenuItem>
          </>
        );
      case 'vendor':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/vendor/products">My Products</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/vendor/add-product">Add Product</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/vendor/orders">Manage Orders</Link>
            </DropdownMenuItem>
          </>
        );
      case 'landowner':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/landowner/properties">My Properties</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/landowner/add-property">Add Property</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/landowner/analytics">Analytics</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/lease-requests">Lease Requests</Link>
            </DropdownMenuItem>
          </>
        );
      default:
        return (
          <DropdownMenuItem asChild>
            <Link to="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
        );
    }
  };

  return (
    <nav className="bg-background border-b">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="font-bold text-2xl mr-6">
          StreetServe
        </Link>
        <div className="flex items-center space-x-4 ml-auto">
          {getNavigationItems()}

          {currentUser && (
            <>
              {userProfile?.role === 'buyer' && <Cart />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.image} alt={userProfile?.displayName} />
                      <AvatarFallback>{userProfile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    My Account ({userProfile?.role || 'User'})
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getDropdownItems()}
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
