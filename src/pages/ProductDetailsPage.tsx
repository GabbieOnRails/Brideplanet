import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronLeft, Star, Ruler, Info, ShieldCheck, Heart } from 'lucide-react';
import { products, Product } from '../constants';

interface ProductDetailsPageProps {
  addToCart: (product: Product) => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/shop');
    }
  }, [id, navigate]);

  if (!product) return null;

  return (
    <div className="bg-brand-offwhite min-h-screen py-16 md:py-32 px-6 md:px-12 lg:px-16">
      <div className="max-w-[1600px] mx-auto">
        {/* Back Button */}
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors mb-12 text-[10px] uppercase tracking-[0.2em] font-black"
        >
          <ChevronLeft size={16} /> Back to Collection
        </Link>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Image Gallery */}
          <div className="w-full lg:w-3/5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="aspect-[4/5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-neutral-100 shadow-2xl relative group"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-8 right-8 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-brand-charcoal hover:bg-brand-rose hover:text-white transition-all shadow-xl"
              >
                <Heart size={24} className={isLiked ? "fill-current" : ""} />
              </motion.button>
            </motion.div>
          </div>

          {/* Details Content */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-sans font-bold text-brand-charcoal mb-4 leading-none tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-brand-charcoal">
                  {[...Array(5)].map((_, i) => (
                    <Star key={`detail-star-${product.id}-${i}`} size={14} className="fill-current" />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/20">Verified Product</span>
              </div>
              <p className="text-3xl font-black text-brand-charcoal mb-10">{product.price}</p>
              
              <div className="space-y-6 mb-12">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full py-6 bg-brand-charcoal text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-brand-rose transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={18} /> Add to Bag
                </button>
                <Link 
                  to="/book-consultation"
                  className="w-full py-6 border border-brand-charcoal/10 text-brand-charcoal text-center rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-brand-charcoal hover:text-white transition-all"
                >
                  Inquire Custom Fitting
                </Link>
              </div>

              {/* Tabs Section */}
              <div className="border-t border-brand-charcoal/5 pt-10">
                <div className="flex gap-8 mb-8 overflow-x-auto no-scrollbar">
                  {['description', 'details', 'shipping'].map((tab) => (
                    <button
                      key={`info-tab-${tab}`}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] uppercase tracking-[0.2em] font-black transition-all whitespace-nowrap pb-2 border-b-2 ${
                        activeTab === tab ? 'border-brand-charcoal text-brand-charcoal' : 'border-transparent text-brand-charcoal/30'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="min-h-[150px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm leading-relaxed text-brand-charcoal/60 italic font-light"
                    >
                      {activeTab === 'description' && (
                        <p>{product.description}</p>
                      )}
                      {activeTab === 'details' && (
                        <ul className="space-y-3">
                          <li className="flex items-center gap-3"><Ruler size={14} className="text-brand-rose" /> Bespoke tailoring available</li>
                          <li className="flex items-center gap-3"><Info size={14} className="text-brand-rose" /> Authentic European fabrics</li>
                          <li className="flex items-center gap-3"><ShieldCheck size={14} className="text-brand-rose" /> Hand-finished embellishments</li>
                        </ul>
                      )}
                      {activeTab === 'shipping' && (
                        <p>Standard delivery within Nigeria takes 4–6 weeks for custom orders. Express options are available for selected silhouettes. International shipping is calculated at checkout.</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
