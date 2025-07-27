import React from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cart = [], removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="container mx-auto px-4 py-10 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-6">Your cart is empty.</p>
          <Button asChild>
            <Link to="/marketplace">Go to Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center gap-6 border-b pb-6"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-green-600 font-bold mt-1">₹{item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span>Qty:</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1"
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex justify-between items-center mt-10">
            <span className="text-2xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-green-600">₹{total}</span>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white font-bold">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;