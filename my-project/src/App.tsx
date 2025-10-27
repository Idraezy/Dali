import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import HomePage from './homepage/HomePage';
import Footer from './components/Footer';
import Latest from './pages/Latest';
import Contact from './pages/Contact';
import Cart  from './pages/Cart'; // ✅ import CartItem here
import type { CartItem } from "./pages/Cart";
import About from './pages/About';
import ScrollToTop from "./components/ScrollToTop";
import Header from './components/Header';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]); // ✅ fixed line

  return (
    <Router>
      <div>
        <ScrollToTop />
        <Header cart={cart} />

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
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
