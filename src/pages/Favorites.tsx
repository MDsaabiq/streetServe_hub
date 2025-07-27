import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Trash2, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vendorName: string;
  quantity: string;
  averageRating?: number;
  totalReviews?: number;
}

export const Favorites = () => {
  const { userProfile } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userProfile?.uid) return;

      try {
        const favQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', userProfile.uid)
        );
        const favSnapshot = await getDocs(favQuery);
        
        const products: Product[] = [];
        for (const favDoc of favSnapshot.docs) {
          const productId = favDoc.data().productId;
          const productDoc = await getDoc(doc(db, 'products', productId));
          
          if (productDoc.exists()) {
            // Fetch reviews for rating
            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('productId', '==', productId)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            
            let averageRating = 0;
            let totalReviews = 0;
            
            if (reviewsSnapshot.size > 0) {
              const totalRating = reviewsSnapshot.docs.reduce(
                (sum, reviewDoc) => sum + (reviewDoc.data().rating || 0),
                0
              );
              averageRating = totalRating / reviewsSnapshot.size;
              totalReviews = reviewsSnapshot.size;
            }
            
            products.push({
              id: productDoc.id,
              ...productDoc.data(),
              averageRating,
              totalReviews,
            } as Product);
          }
        }
        
        setFavoriteProducts(products);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: "Error",
          description: "Failed to load favorites.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userProfile?.uid, toast]);

  const handleRemoveFromFavorites = async (productId: string) => {
    if (!userProfile?.uid) return;

    try {
      const favQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userProfile.uid),
        where('productId', '==', productId)
      );
      const favSnapshot = await getDocs(favQuery);
      
      favSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Removed from favorites",
        description: "Product removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          Products you've saved for later
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding products to your favorites from the marketplace
            </p>
            <Button variant="marketplace" onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-card transition-all duration-300 border-0 bg-gradient-card overflow-hidden">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/90">
                    {product.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {product.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">by {product.vendorName}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                    <p className="text-sm text-muted-foreground">Items Left: {product.quantity}</p>
                  </div>
                </div>
                
                {/* Rating Display */}
                {product.totalReviews && product.totalReviews > 0 ? (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(product.averageRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.averageRating?.toFixed(1)} ({product.totalReviews} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">No reviews yet</span>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="marketplace" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromFavorites(product.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
