
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2, Star, MessageSquare } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: string;
  category: string;
  description: string;
  vendorId: string;
  vendorName: string;
  createdAt: Date;
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

export const VendorProducts = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<{ [productId: string]: Review[] }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userProfile?.uid) return;

      try {
        const q = query(
          collection(db, 'products'),
          where('vendorId', '==', userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const productId = doc.id;
          
          // Fetch reviews for this product
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
          
          fetchedProducts.push({
            id: productId,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            averageRating,
            totalReviews,
          } as Product);
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userProfile?.uid, toast]);

  const fetchProductReviews = async (productId: string) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const productReviews: Review[] = [];
      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        productReviews.push({
          id: doc.id,
          rating: data.rating,
          review: data.review,
          userName: data.userName,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      setReviews(prev => ({
        ...prev,
        [productId]: productReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Products</h1>
          <p className="text-muted-foreground">
            Manage your product listings and inventory
          </p>
        </div>
        <Button variant="marketplace" asChild>
          <Link to="/vendor/add-product">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="border-0 bg-gradient-card shadow-card">
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first product to the marketplace
            </p>
            <Button variant="marketplace" asChild>
              <Link to="/vendor/add-product">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="border-0 bg-gradient-card shadow-card overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">
                    {product.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {product.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {product.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity}</p>
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

                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/vendor/edit-product/${product.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {product.totalReviews && product.totalReviews > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => fetchProductReviews(product.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Show Reviews ({product.totalReviews})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Reviews for {product.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {reviews[product.id]?.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
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
                              <p className="text-sm text-muted-foreground">{review.review}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
