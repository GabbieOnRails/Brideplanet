import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Phone, Mail, MapPin, Calendar, Tag, List, Ruler, Gem, Clock, Scissors, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import PricingPage from './pages/PricingPage';
import ProcessPage from './pages/ProcessPage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Product } from './constants';
import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function App() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-rose selection:text-white text-brand-charcoal">
      <Navbar cartCount={cart.length} onCartClick={() => setIsCartOpen(true)} />
      
      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[110] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="editorial-heading text-2xl text-brand-charcoal">Your Bag</span>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 flex items-center justify-center border border-brand-charcoal/10 rounded-full text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto no-scrollbar space-y-8">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-brand-charcoal/40 italic mb-8">Your bag is empty.</p>
                    <Link 
                      to="/shop" 
                      onClick={() => setIsCartOpen(false)}
                      className="inline-block border border-brand-charcoal/10 px-8 py-3 text-[10px] uppercase tracking-widest font-black"
                    >
                      Browse Boutique
                    </Link>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`cart-item-${item.id}-${index}`} className="flex gap-4 group">
                      <div className="w-24 h-32 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-sm font-bold text-brand-charcoal mb-1">{item.name}</h4>
                          <p className="text-xs text-brand-charcoal/40 italic">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black">{item.price}</span>
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-auto pt-10 border-t border-brand-charcoal/5 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Estimated Total</span>
                    <span className="text-2xl font-black">
                      ₦{cart.reduce((acc, item) => acc + item.priceValue, 0).toLocaleString()}
                    </span>
                  </div>
                  <Link 
                    to="/checkout" 
                    onClick={() => setIsCartOpen(false)}
                    className="w-full block bg-brand-charcoal text-white text-center py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand-rose transition-colors shadow-xl"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-20 lg:pt-24 focus:outline-none bg-neutral-100/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage addToCart={addToCart} />} />
              <Route path="/product/:id" element={<ProductDetailsPage addToCart={addToCart} />} />
              <Route path="/book-consultation" element={<BookingPage />} />
              <Route path="/price-guide" element={<PricingPage />} />
              <Route path="/our-process" element={<ProcessPage />} />
              <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
