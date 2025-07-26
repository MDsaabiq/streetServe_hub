import React, { useState, useEffect } from 'react';
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
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle escape key and prevent body scroll when menu is open
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    const handleResize = () => {
      // Close mobile menu when resizing to desktop
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

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
      return [
        { to: "/marketplace", label: "Marketplace" },
        { to: "/properties", label: "Properties" },
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up" }
      ];
    }

    switch (userProfile.role) {
      case 'buyer':
        return [
          { to: "/marketplace", label: "Marketplace" },
          { to: "/properties", label: "Properties" },
          { to: "/orders", label: "My Orders" },
          { to: "/lease-requests", label: "Lease Requests" }
        ];
      case 'vendor':
        return [
          { to: "/marketplace", label: "Marketplace" },
          { to: "/vendor/products", label: "My Products" },
          { to: "/vendor/add-product", label: "Add Product" },
          { to: "/vendor/orders", label: "Orders" }
        ];
      case 'landowner':
        return [
          { to: "/properties", label: "Browse Properties" },
          { to: "/landowner/properties", label: "My Properties" },
          { to: "/landowner/add-property", label: "Add Property" },
          { to: "/landowner/analytics", label: "Analytics" },
          { to: "/lease-requests", label: "Lease Requests" }
        ];
      default:
        return [
          { to: "/marketplace", label: "Marketplace" },
          { to: "/properties", label: "Properties" }
        ];
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

  const navigationItems = getNavigationItems();

  return (
    <nav className="navbar-container bg-background border-b relative w-full">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto navbar-tablet-layout">
        {/* Logo */}
        <Link to="/" className="navbar-logo font-bold text-xl sm:text-2xl flex-shrink-0 z-10 touch-manipulation">
          StreetServe
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-6 flex-1 justify-end">
          <div className="flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {currentUser && (
            <div className="flex items-center space-x-4 ml-6">
              {userProfile?.role === 'buyer' && <Cart />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
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
            </div>
          )}
        </div>

        {/* Mobile Navigation - Cart and Hamburger */}
        <div className="lg:hidden flex items-center space-x-3">
          {currentUser && userProfile?.role === 'buyer' && (
            <div className="flex-shrink-0">
              <Cart />
            </div>
          )}

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="navbar-hamburger navbar-mobile-touch p-2 h-11 w-11 touch-manipulation flex-shrink-0 relative"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="navbar-icons">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-200" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-200" />
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="navbar-mobile-menu lg:hidden absolute top-16 left-0 right-0 bg-background border-b shadow-xl z-50 max-h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)] overflow-y-auto"
          role="menu"
          aria-labelledby="mobile-menu-button"
        >
          <div className="px-4 sm:px-6 py-6 space-y-2 min-h-0">
            {/* Navigation Links */}
            {navigationItems.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className="navbar-mobile-menu-item navbar-mobile-touch block py-4 px-4 text-base font-medium hover:bg-muted active:bg-muted/80 rounded-lg transition-colors touch-manipulation min-h-[48px] flex items-center"
                role="menuitem"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                {item.label}
              </Link>
            ))}

            {/* User Section for Mobile */}
            {currentUser && (
              <>
                <div className="navbar-user-section border-t border-border pt-4 mt-4">
                  <div className="flex items-center px-4 py-3 bg-muted/50 rounded-lg mb-3 touch-manipulation">
                    <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                      <AvatarImage src={userProfile?.image} alt={userProfile?.displayName} />
                      <AvatarFallback className="text-sm">{userProfile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{userProfile?.displayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userProfile?.role || 'User'}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="navbar-mobile-menu-item navbar-mobile-touch block py-4 px-4 text-base font-medium hover:bg-muted active:bg-muted/80 rounded-lg transition-colors touch-manipulation min-h-[48px] flex items-center"
                    role="menuitem"
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    Profile Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="navbar-mobile-menu-item navbar-mobile-touch block w-full text-left py-4 px-4 text-base font-medium hover:bg-destructive/10 active:bg-destructive/20 rounded-lg transition-colors text-destructive touch-manipulation min-h-[48px] flex items-center"
                    role="menuitem"
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="navbar-mobile-backdrop lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 touch-manipulation"
          onClick={closeMobileMenu}
          onTouchStart={(e) => {
            e.preventDefault();
            closeMobileMenu();
          }}
          aria-hidden="true"
          role="presentation"
        />
      )}
    </nav>
  );
};

export default Navbar;
