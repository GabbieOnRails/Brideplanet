import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Filter, Heart, Eye } from 'lucide-react';
import { products, Product } from '../constants';

interface ShopPageProps {
  addToCart: (product: Product) => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ addToCart }) => {
  const filteredProducts = products;

  return (
    <div className="bg-brand-offwhite min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-charcoal/30 mb-6 block">The Collection</span>
              <h1 className="editorial-heading text-6xl md:text-8xl text-brand-charcoal leading-[0.9] tracking-tighter">
                Shop Our <br /><span className="text-brand-charcoal/40 font-light italic">Latest Looks</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 pb-6">
              <div className="relative group">
                <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-charcoal transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="bg-transparent border-b border-brand-charcoal/10 outline-none pl-6 pr-4 py-3 text-xs italic w-48 focus:border-brand-charcoal transition-all focus:w-72"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-24">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={`shop-product-${product.id}`}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative aspect-[3.5/5] overflow-hidden rounded-[2.5rem] bg-neutral-100 mb-8 shadow-sm">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Actions - Always visible on mobile, hover on desktop */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3 lg:translate-x-16 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 transition-all duration-700">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Link 
                          to={`/product/${product.id}`}
                          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all shadow-xl"
                        >
                          <Eye size={18} />
                        </Link>
                      </motion.div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-charcoal hover:bg-brand-rose hover:text-white transition-all shadow-xl"
                      >
                        <Heart size={18} />
                      </motion.button>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      className="absolute bottom-6 left-6 right-6 py-5 bg-white/95 backdrop-blur-md text-brand-charcoal text-[10px] uppercase tracking-[0.2em] font-black lg:translate-y-24 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-700 hover:bg-brand-charcoal hover:text-white rounded-2xl flex items-center justify-center gap-2 shadow-2xl"
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </motion.button>
                  </div>

                  <div className="flex justify-between items-start px-2">
                    <Link to={`/product/${product.id}`} className="flex-grow">
                      <h3 className="text-base font-bold text-brand-charcoal group-hover:text-brand-charcoal/60 transition-colors leading-tight">{product.name}</h3>
                    </Link>
                    <p className="text-base font-black text-brand-charcoal text-right shadow-inner">{product.price}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 bg-brand-charcoal text-white rounded-t-[40px] md:rounded-t-[80px]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="editorial-heading text-4xl md:text-6xl mb-8">Can't Find Your <span className="italic font-light">Dream Look?</span></h2>
          <p className="text-white/40 italic mb-12 max-w-xl mx-auto">We specialize in custom bridal designs. Book a consultation to start your bespoke journey.</p>
          <Link 
            to="/book-consultation"
            className="px-12 py-4 border border-white/20 hover:bg-white hover:text-brand-charcoal transition-all text-[11px] uppercase tracking-[0.3em] font-bold rounded-sm inline-block"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
