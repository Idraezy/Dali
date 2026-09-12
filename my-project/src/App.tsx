import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import HomePage from './homepage/HomePage';
import Footer from './components/Footer';
import Latest from './pages/Latest';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ScrollToTop from "./components/ScrollToTop";
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import { AuthProvider } from './lib/AuthContext';
import { ChatProvider } from './lib/ChatContext';
import { WishlistProvider } from './lib/WishlistContext';
import { useCart } from './lib/useCart';

const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Faq = lazy(() => import('./pages/Faq'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Notifications = lazy(() => import('./pages/Notifications'));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );
}

function App() {
  const { cart, setCart } = useCart();

  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
        <ChatProvider>
        <div>
          <ScrollToTop />
          <Header cart={cart} />

          <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HomePage />
                </>
              }
            />
            <Route path="/latest" element={<Latest cart={cart} setCart={setCart} />} />
            <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout cart={cart} setCart={setCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist cart={cart} setCart={setCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
          </Suspense>

          <Footer />
          <ChatWidget />
        </div>
        </ChatProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
