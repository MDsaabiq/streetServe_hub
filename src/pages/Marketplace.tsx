import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { collection, getDocs, query, orderBy, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vendorId: string;
  vendorName: string;
  quantity: string;
  averageRating?: number;
  totalReviews?: number;
}

export const Marketplace = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const categories = ['All', 'Ingredients', 'Packaging', 'Utensils', 'Equipment', 'Spices', 'Other'];

  useEffect(() => {
    const fetchProductsWithRatings = async () => {
      setLoading(true);
      try {
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        
        const productsWithRatings = await Promise.all(
          productsSnapshot.docs.map(async (doc) => {
            const productData = { id: doc.id, ...doc.data() } as Product;
            
            // Fetch reviews for this product
            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('productId', '==', doc.id)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            
            if (reviewsSnapshot.size > 0) {
              const totalRating = reviewsSnapshot.docs.reduce(
                (sum, reviewDoc) => sum + (reviewDoc.data().rating || 0),
                0
              );
              productData.averageRating = totalRating / reviewsSnapshot.size;
              productData.totalReviews = reviewsSnapshot.size;
            } else {
              productData.averageRating = 0;
              productData.totalReviews = 0;
            }
            
            return productData;
          })
        );
        
        setProducts(productsWithRatings);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithRatings();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userProfile?.uid) return;
      
      try {
        const favQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', userProfile.uid)
        );
        const favSnapshot = await getDocs(favQuery);
        const favSet = new Set<string>();
        favSnapshot.forEach((doc) => {
          favSet.add(doc.data().productId);
        });
        setFavorites(favSet);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [userProfile?.uid]);

  const handleToggleFavorite = async (productId: string) => {
    if (!userProfile?.uid) return;

    try {
      if (favorites.has(productId)) {
        // Remove from favorites
        const favQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', userProfile.uid),
          where('productId', '==', productId)
        );
        const favSnapshot = await getDocs(favQuery);
        favSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // Add to favorites
        await addDoc(collection(db, 'favorites'), {
          userId: userProfile.uid,
          productId,
          createdAt: new Date(),
        });
        setFavorites(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Find everything you need for your street food business
        </p>
      </div>

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
          {/* Removed Filter button */}
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
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
                  <Eye className="mr-2 h-4 w-4" />
                  View
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
                  onClick={() => handleToggleFavorite(product.id)}
                  className={favorites.has(product.id) ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-red-500' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {products.length === 0 
              ? "No products available yet. Vendors can start listing their products!" 
              : "No products found. Try adjusting your search or filters."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
