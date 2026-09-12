import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { useAuth } from "../lib/useAuth";
import { formatNaira } from "../lib/format";
import type { CartItem } from "../lib/types";

export type { CartItem };

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function Cart({ cart, setCart }: CartProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = (cart || []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceed = () => {
    navigate(user ? "/checkout" : "/login?redirect=/checkout");
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10">
      <h1 className="text-3xl font-bold mb-10 text-center">Your Cart</h1>

      {!cart || cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl text-gray-400 mb-8">Your cart is empty</p>
          <Link to="/latest">
            <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition text-lg">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-[#001D23] rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <ProductImage
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-lg flex-shrink-0"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{item.product.name}</h3>
                  <p className="text-[#00DA6B] font-bold mb-2">
                    {formatNaira(item.product.price)}
                  </p>
                  <p className="text-gray-400 text-sm">Category: {item.product.category}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-[#002a35] p-2 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-[#003a45] rounded transition"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-[#003a45] rounded transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded transition text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="text-right w-full sm:w-auto">
                  <p className="text-gray-400 text-sm">Subtotal:</p>
                  <p className="text-lg font-bold text-[#00DA6B]">
                    {formatNaira(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#001D23] rounded-xl p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="flex justify-between text-xl font-bold mb-6 border-b border-gray-700 pb-6">
                <span>Total:</span>
                <span className="text-[#00DA6B]">{formatNaira(total)}</span>
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition mb-3"
              >
                Proceed to Checkout
              </button>

              <Link to="/latest">
                <button className="w-full bg-[#002a35] text-white font-bold py-3 rounded-lg hover:bg-[#003a45] transition border border-gray-600">
                  Continue Shopping
                </button>
              </Link>

              <button
                onClick={handleClearCart}
                className="w-full mt-3 bg-red-500 bg-opacity-20 text-red-500 font-bold py-3 rounded-lg hover:bg-opacity-30 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
