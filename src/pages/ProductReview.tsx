import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export const ProductReview = () => {
  const { productId, orderId } = useParams();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        }
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!userProfile || !productId || !orderId) return;
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Add review to reviews collection
      await addDoc(collection(db, 'reviews'), {
        productId,
        orderId,
        userId: userProfile.uid,
        userName: userProfile.displayName || 'Anonymous',
        rating,
        review,
        createdAt: new Date(),
      });

      // Update product's average rating
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const totalRating = reviewsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().rating || 0),
        0
      ) + rating; // Include the new rating
      
      const totalReviews = reviewsSnapshot.size + 1; // Include the new review
      const averageRating = totalRating / totalReviews;

      // Update product document with new average rating
      await updateDoc(doc(db, 'products', productId), {
        averageRating,
        totalReviews,
        updatedAt: new Date()
      });

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      
      navigate('/orders');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => navigate('/orders')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {product && (
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-sm text-muted-foreground">by {product.vendorName}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Review (Optional)</label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <Button onClick={handleSubmitReview} disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
