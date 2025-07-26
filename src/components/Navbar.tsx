
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Store, Package, Building, ShoppingCart, BarChart3, FileText, LogOut } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

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

  const getBuyerMenuItems = () => [
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { label: 'Properties', href: '/properties', icon: Building },
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 }
  ];

  const getVendorMenuItems = () => [
    { label: 'My Products', href: '/vendor/products', icon: Package },
    { label: 'Orders', href: '/vendor/orders', icon: FileText },
    { label: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
    { label: 'Dashboard', href: '/dashboard', icon: Store }
  ];

  const getLandownerMenuItems = () => [
    { label: 'My Properties', href: '/landowner/properties', icon: Building },
    { label: 'Analytics', href: '/landowner/analytics', icon: BarChart3 },
    { label: 'Dashboard', href: '/dashboard', icon: Store }
  ];

  const getMenuItems = () => {
    switch (userProfile?.role) {
      case 'buyer':
        return getBuyerMenuItems();
      case 'vendor':
        return getVendorMenuItems();
      case 'landowner':
        return getLandownerMenuItems();
      default:
        return [];
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StreetServe
            </span>
          </Link>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-6">
            {currentUser && userProfile ? (
              <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent">
                        Menu
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-64 gap-3 p-4">
                          {getMenuItems().map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavigationMenuLink key={item.href} asChild>
                                <Link
                                  to={item.href}
                                  className={`flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                                    location.pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </Link>
                              </NavigationMenuLink>
                            );
                          })}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {userProfile.displayName || userProfile.email} ({userProfile.role})
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
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
