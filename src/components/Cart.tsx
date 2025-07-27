
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

export const Cart = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <Button variant="outline" size="sm" className="relative" onClick={handleCartClick}>
      <ShoppingCart className="h-4 w-4" />
      {getTotalItems() > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          {getTotalItems()}
        </Badge>
      )}
    </Button>
  );
};
