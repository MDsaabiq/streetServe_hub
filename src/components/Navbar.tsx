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

  return (
    <nav className="bg-background border-b">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="font-bold text-2xl mr-6">
          StreetServe
        </Link>
        <div className="flex items-center space-x-4 ml-auto">
          <Link to="/marketplace" className="text-sm font-medium hover:underline">
            Marketplace
          </Link>
          <Link to="/properties" className="text-sm font-medium hover:underline">
            Properties
          </Link>
          
          {currentUser && (
            <>
              <Cart />
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
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {currentUser.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor/add-product">Add Product</Link>
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'landowner' && (
                    <DropdownMenuItem asChild>
                      <Link to="/landowner/add-property">Add Property</Link>
                    </DropdownMenuItem>
                  )}
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
