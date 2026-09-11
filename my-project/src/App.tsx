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
import { AuthProvider } from './lib/AuthContext';
import { useCart } from './lib/useCart';

const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/admin/Admin'));

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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
