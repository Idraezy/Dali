import { useState } from "react";
import { Search, X, Star, ShoppingCart, CircleCheckBig } from "lucide-react";
import { Link } from "react-router-dom";
import sales1 from "../assets/sales1.jpg";
import sales2 from "../assets/sales2.jpg";
import sales3 from "../assets/sales3.jpg";
import sales4 from "../assets/sales4.jpg";
import sales5 from "../assets/sales5.jpg";
import sales6 from "../assets/sales6.jpg";
import sales7 from "../assets/sales7.jpg";
import sales8 from "../assets/sales8.jpg";
import sales9 from "../assets/sales9.jpg";
import sales10 from "../assets/sales10.jpg";
import sales11 from "../assets/sales11.jpg";
import sales12 from "../assets/sales12.jpg";
import sales13 from "../assets/sales13.jpg";
import sales14 from "../assets/sales14.jpg";
import sales15 from "../assets/sales15.jpg";
import sales16 from "../assets/sales16.jpg";
import pin1 from "../assets/pin1.jpg";
import pin2 from "../assets/pin2.jpg";
import pin3 from "../assets/pin3.jpg";
import pin4 from "../assets/pin4.jpg";
import pin5 from "../assets/pin5.jpg";
import pin6 from "../assets/pin6.jpg";
import pin7 from "../assets/pin7.jpg";
import pin8 from "../assets/pin8.jpg";
import dali5 from "../assets/dali5.jpg"

interface Product {
  id: number;
  image: string;
  name: string;
  price: string;
  category: string;
  description?: string;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

interface LatestProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

function Latest({ cart, setCart }: LatestProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [notification, setNotification] = useState<string | null>(null);

  const products: Product[] = [
    { id: 1, image: sales1, name: "Blue Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "A beautiful and comfortable blue long sleeve perfect for any occasion." },
    { id: 2, image: sales2, name: "Red Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "Stunning red long sleeve that makes a bold statement." },
    { id: 3, image: sales3, name: "Black Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "Classic black long sleeve for a timeless look." },
    { id: 4, image: sales4, name: "Brown Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "Elegant brown long sleeve with premium quality fabric." },
    { id: 5, image: sales5, name: "Deep-blue Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "Deep blue long sleeve for a sophisticated appearance." },
    { id: 6, image: sales6, name: "White Long sleeve", price: "₦5,500", category: "Long Sleeves", description: "Pure white long sleeve perfect for any wardrobe." },
    { id: 7, image: sales7, name: "Black Top", price: "₦4,500", category: "Basic Tops", description: "Essential black top for everyday wear." },
    { id: 8, image: sales8, name: "Pink Top", price: "₦4,500", category: "Basic Tops", description: "Vibrant pink top that brings color to your day." },
    { id: 9, image: sales9, name: "White Top", price: "₦4,500", category: "Basic Tops", description: "Crisp white top for a fresh look." },
    { id: 10, image: sales10, name: "Blue Top", price: "₦4,500", category: "Basic Tops", description: "Cool blue top for casual style." },
    { id: 11, image: sales11, name: "Blue Backless", price: "₦4,400", category: "Backless Top", description: "Chic blue backless top for a daring look." },
    { id: 12, image: sales12, name: "Black Backless", price: "₦4,400", category: "Backless Top", description: "Elegant black backless top perfect for special events." },
    { id: 13, image: sales13, name: "Red Backless", price: "₦4,400", category: "Backless Top", description: "Bold red backless top that turns heads." },
    { id: 14, image: sales14, name: "Brown Pin-down", price: "₦5,500", category: "Pin Down", description: "Stylish brown pin-down collection." },
    { id: 15, image: sales15, name: "Blue & Pink Pin-down", price: "₦11,000", category: "Pin Down", description: "Beautiful blue and pink pin-down set." },
    { id: 16, image: sales16, name: "Brown & Black Pin-down", price: "₦11,000", category: "Pin Down", description: "Premium brown and black pin-down collection." },
    { id: 17, image: pin1, name: "Elegant Charm", price: "₦5,500", category: "Frames", description: "Elegant frames that add charm to any look." },
    { id: 18, image: pin8, name: "Sophisticated", price: "₦5,500", category: "Frames", description: "Sophisticated frame collection for the refined taste." },
    { id: 19, image: pin2, name: "Nature's Touch", price: "₦5,500", category: "Frames", description: "Nature-inspired frames with organic beauty." },
    { id: 20, image: pin3, name: "Royal Experience", price: "₦5,500", category: "Frames", description: "Premium royal frames for the ultimate experience." },
    { id: 21, image: pin4, name: "8x10 Tiny black Frame", price: "₦7,000", category: "Frames", description: "Premium royal frames for the ultimate experience." },
    { id: 22, image: pin5, name: "8x10 Inches Frame", price: "₦7,000", category: "Frames", description: "Premium royal frames for the ultimate experience." },
    { id: 23, image: pin6, name: "16x24 Inches Acrylic", price: "₦7,500", category: "Frames", description: "Premium royal frames for the ultimate experience." },
    { id: 24, image: pin7, name: "8x10 Inches Culture Frame", price: "₦7,500", category: "Frames", description: "Premium royal frames for the ultimate experience." },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || product.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id: product.id, product, quantity: 1 }]);
    }
    
    setNotification(product.name);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.name || !reviewForm.comment) {
      alert("Please fill in all fields");
      return;
    }
    setReviews([...reviews, { id: reviews.length + 1, ...reviewForm }]);
    setReviewForm({ name: "", rating: 5, comment: "" });
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mx-5 py-5 min-h-screen text-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-40 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 font-semibold">
            <span className="text-2xl"><CircleCheckBig className="text-white"/></span>
            <span>{notification} added to your cart</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 mb-5 flex-wrap gap-4">
        <p className="text-3xl font-bold">Dali Wears</p>

        {/* Search Bar */}
        <div className="flex items-center bg-[#001D23] rounded-full px-4 py-2 flex-1 min-w-[200px] max-w-96">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for tops or frames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-white placeholder-gray-500"
          />
        </div>

        {/* Checkout Button */}
        <Link to="/cart">
          <button className="bg-[#00DA6B] p-2 px-5 rounded-xl text-black font-bold text-lg hover:bg-[#1d9948] transition">
            Checkout
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center mt-5 bg-[#001D23] p-8 rounded-xl gap-8 mb-10">
        <div className="w-full lg:w-1/2">
          <p className="text-4xl lg:text-6xl font-bold mb-4">New Arrivals</p>
          <p className="text-gray-300 mb-6">
            Our New Arrivals collection brings together the freshest fashion pieces and Pinterest-inspired frames — 
            created to help you express your style in every detail. 
            Whether you’re updating your wardrobe or adding a personal touch to your space, 
            each new item is carefully chosen to reflect creativity, confidence, and comfort. Explore bold colors, timeless fits, 
            and artistic designs that tell your story. Because your style isn’t just what you wear — it’s how you live.
          </p>
          <Link to="/about"><button className="bg-[#00DA6B] p-2 px-5 rounded-xl text-white text-xl hover:bg-[#1d9948] transition">
            Learn More
          </button></Link>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src={dali5}
            alt="New Arrival"
            className="w-full h-60 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {["All", "Basic Tops", "Long Sleeves", "Backless Top", "Pin Down", "Frames"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeFilter === filter
                ? "bg-[#00DA6B] text-black"
                : "bg-[#001D23] text-white hover:bg-[#002a35]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#001D23] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-[#00DA6B] text-lg font-bold mb-1">{product.price}</p>
              <p className="text-gray-400 text-sm mb-4">Category: {product.category}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-[#00DA6B] text-black font-bold py-2 rounded-lg hover:bg-[#1d9948] transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add
                </button>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 bg-[#001a1f] text-white font-bold py-2 rounded-lg hover:bg-[#002a35] transition border border-gray-600"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#001D23] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[#002a35] rounded-full z-10"
            >
              <X size={24} className="text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">
              <div className="flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 md:h-80 object-cover rounded-xl"
                />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedProduct.name}</h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                </div>

                <p className="text-gray-300 mb-4 text-sm">
                  {selectedProduct.description || "High-quality product with excellent craftsmanship."}
                </p>

                <p className="text-2xl md:text-3xl font-bold text-green-500 mb-6">{selectedProduct.price}</p>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    onClick={() => {
                      const phoneNumber = "2349164288560";
                      const message = `Hello Dali Wears,\nI'm interested in buying *${selectedProduct.name}*. Can you tell me more?`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
                    }}
                    className="flex-1 bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm md:text-base"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 bg-[#002a35] text-white font-bold py-2 md:py-3 rounded-lg hover:bg-[#003a45] transition border border-gray-600 text-sm md:text-base"
                  >
                    Back to Shop
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm md:text-base"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="px-4 md:px-8 pb-8 border-t border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold mb-6 mt-6 text-yellow-400">Leave a Review</h2>

              <div className="bg-[#002a35] p-4 md:p-6 rounded-xl mb-8">
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Rating:</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition"
                      >
                        <Star
                          size={20}
                          className={reviewForm.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-[#001D23] p-2 md:p-3 rounded-lg mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />

                <textarea
                  placeholder="Your Comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-[#001D23] p-2 md:p-3 rounded-lg mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20 text-sm"
                />

                <button
                  onClick={handleReviewSubmit}
                  className="w-full bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm md:text-base"
                >
                  Submit Review
                </button>
              </div>

              <h3 className="text-lg md:text-xl font-bold mb-4 text-yellow-400">Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first! ⭐</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#002a35] p-3 md:p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm md:text-base">{review.name}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs md:text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400">No products found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}

export default Latest;





























