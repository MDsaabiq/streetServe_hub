import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ArrowLeft, ShoppingCart, Heart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

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

interface Review {
  id: string;
  rating: number;
  review: string;
  userName: string;
  createdAt: Date;
}

export const ProductDetails = () => {
  const { productId } = useParams();
  const { userProfile } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      try {
        // Fetch product
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          
          // Fetch reviews
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('productId', '==', productId)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          
          const productReviews: Review[] = [];
          let totalRating = 0;
          
          reviewsSnapshot.forEach((doc) => {
            const data = doc.data();
            const review = {
              id: doc.id,
              rating: data.rating,
              review: data.review,
              userName: data.userName,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
            productReviews.push(review);
            totalRating += data.rating;
          });
          
          productData.averageRating = reviewsSnapshot.size > 0 ? totalRating / reviewsSnapshot.size : 0;
          productData.totalReviews = reviewsSnapshot.size;
          
          setProduct(productData);
          setReviews(productReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        }

        // Check if product is in favorites
        if (userProfile?.uid) {
          const favQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', userProfile.uid),
            where('productId', '==', productId)
          );
          const favSnapshot = await getDocs(favQuery);
          setIsFavorite(favSnapshot.size > 0);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, userProfile?.uid, toast]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  const handleToggleFavorite = async () => {
    if (!userProfile?.uid || !productId) return;

    try {
      if (isFavorite) {
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
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Product removed from your favorites.",
        });
      } else {
        // Add to favorites
        await addDoc(collection(db, 'favorites'), {
          userId: userProfile.uid,
          productId,
          createdAt: new Date(),
        });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Product added to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    }
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => navigate('/marketplace')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-muted-foreground">by {product.vendorName}</p>
          </div>

          <div className="text-3xl font-bold text-green-600">
            ₹{product.price.toLocaleString()}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Items Left: {product.quantity}</p>
          </div>

          {/* Rating */}
          {product.totalReviews && product.totalReviews > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg">
                {product.averageRating?.toFixed(1)} ({product.totalReviews} reviews)
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground">No reviews yet</div>
          )}

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleFavorite}
              className={isFavorite ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-muted-foreground">{review.review}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;