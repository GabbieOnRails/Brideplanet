import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, Truck, CheckCircle, Ruler, CreditCard, ChevronRight, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  // Paystack config for shipping
  const paystackConfig = {
    reference: `ship_${new Date().getTime().toString()}`,
    email: user?.email || "",
    amount: (selectedOrder?.shippingFee || 0) * 100, // Kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async (reference: any) => {
    setPayLoading(true);
    setLoadingMessage('Verifying Shipping Transaction...');
    setPayError(null);
    
    try {
      // 1. Verify on Server
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.reference })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || verifyData.status !== "success") {
        throw new Error(verifyData.message || "Payment verification failed.");
      }

      setLoadingMessage('Updating Logistics Records...');
      // 2. Update Order
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        shippingPaid: true,
        updatedAt: serverTimestamp(),
        shippingPaystackRef: reference.reference
      });

      // Log payment record
      await addDoc(collection(db, 'payments'), {
        userId: user?.uid,
        userEmail: user?.email,
        orderId: selectedOrder.id,
        amount: selectedOrder.shippingFee,
        reference: reference.reference,
        status: 'success',
        type: 'Shipping Logistics',
        createdAt: serverTimestamp()
      });

      setLoadingMessage('Notifying Atelier Dispatch...');
      // 3. Send Email
      try {
        await fetch('/api/send-payment-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            orderId: selectedOrder.id,
            amount: selectedOrder.shippingFee,
            customerName: user?.displayName || user?.email?.split('@')[0],
            type: 'Shipping Logistics'
          })
        });
      } catch (err) {
        console.error("Payment email failed:", err);
      }

      setSelectedOrder(prev => ({ ...prev, shippingPaid: true }));
    } catch (error: any) {
      setPayError(error.message);
    } finally {
      setPayLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePayShipping = () => {
    if (!selectedOrder) return;
    setPayLoading(true);
    setLoadingMessage('Initializing Payment Terminal...');
    initializePayment({
      onSuccess: handlePaymentSuccess,
      onClose: () => {
        setPayLoading(false);
        setLoadingMessage('');
      }
    });
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const getStepStatus = (orderStatus: string, step: string) => {
    const steps = ['pending', 'in-progress', 'ready-for-shipping', 'shipped'];
    const currentIndex = steps.indexOf(orderStatus);
    const stepIndex = steps.indexOf(step);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-neutral-100/30 py-12 px-4 md:px-8 relative">
      <AnimatePresence>
        {payLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-charcoal/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 border-2 border-brand-rose border-t-transparent rounded-full animate-spin mb-8" />
            <h2 className="editorial-heading text-white text-2xl mb-4 tracking-tight">Escort Your Creation</h2>
            <p className="text-brand-beige/60 text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">
              {loadingMessage || 'Securing Logistics Authorization...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="editorial-heading text-4xl mb-4 text-brand-charcoal">Your Atelier</h1>
          <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest font-black">Tracking your journey to the perfect dress</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-charcoal/10 border-t-brand-charcoal rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Orders Feed */}
            <div className="lg:col-span-8 space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-neutral-100 shadow-sm">
                  <Package size={40} className="mx-auto mb-6 text-brand-charcoal/10" />
                  <p className="editorial-heading text-xl text-brand-charcoal/40 mb-8">No collections yet</p>
                  <Link to="/shop" className="btn-editorial inline-block">Browse Boutique</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className="w-full md:w-32 h-44 bg-neutral-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                          <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                       </div>
                       
                       <div className="flex-grow flex flex-col justify-between">
                          <div>
                             <div className="flex justify-between items-start mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                                  order.status === 'shipped' ? 'bg-green-100 text-green-700 border-green-200' : 
                                  order.status === 'ready-for-shipping' ? 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse' :
                                  'bg-brand-charcoal/5 text-brand-charcoal border-brand-charcoal/10'
                                }`}>
                                   {order.status.replace('-', ' ')}
                                </span>
                                <span className="text-[10px] text-brand-charcoal/20 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                             </div>
                             <h3 className="text-xl font-bold text-brand-charcoal mb-2">{order.productName}</h3>
                             <p className="text-xs text-brand-charcoal/40 italic">Ordered on {order.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}</p>
                          </div>

                          <div className="mt-8 flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className="flex -space-x-2">
                                   {[1,2,3,4].map(step => {
                                      const status = getStepStatus(order.status, ['pending', 'in-progress', 'ready-for-shipping', 'shipped'][step-1]);
                                      return (
                                        <div key={step} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black ${
                                          status === 'completed' ? 'bg-green-500 text-white' :
                                          status === 'current' ? 'bg-brand-charcoal text-white' :
                                          'bg-neutral-100 text-neutral-300'
                                        }`}>
                                          {status === 'completed' ? <CheckCircle size={12} /> : step}
                                        </div>
                                      );
                                   })}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40">Journey Progress</span>
                             </div>
                             <div className="flex items-center gap-2 text-brand-charcoal group-hover:gap-4 transition-all">
                                <span className="text-[10px] uppercase tracking-widest font-black">View Journey</span>
                                <ChevronRight size={16} />
                             </div>
                          </div>
                       </div>
                    </div>

                    {order.status === 'ready-for-shipping' && !order.shippingPaid && (
                      <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600">
                               <Truck size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-purple-900 mb-1">Your dress is ready for the voyage!</p>
                               <p className="text-xs text-purple-700/60">Finalize the delivery by paying the shipping fee of ₦{order.shippingFee?.toLocaleString()}</p>
                            </div>
                         </div>
                         <button className="btn-editorial scale-90 md:scale-100 whitespace-nowrap bg-purple-600 hover:bg-purple-700">Pay Shipping Fee</button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-brand-charcoal">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40">Profile Standards</h4>
                    <p className="text-sm font-bold">Your Metrics</p>
                  </div>
                </div>
                <p className="text-xs text-brand-charcoal/60 leading-relaxed italic mb-8">
                  "Measurements are the poetry of tailoring. We keep yours secure for every bespoke creation."
                </p>
                <div className="space-y-4">
                   <div className="flex justify-between p-3 bg-neutral-100/50 rounded-xl">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Saved Sets</span>
                      <span className="text-[10px] font-black">1 Profile</span>
                   </div>
                </div>
              </div>

              <div className="bg-brand-charcoal rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
                 <div className="relative z-10">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-black mb-8 opacity-40">Support</h4>
                    <p className="text-sm font-bold mb-4">Have Questions?</p>
                    <p className="text-xs opacity-60 leading-relaxed mb-10">Our concierge is available during atelier hours (9AM - 6PM WAT).</p>
                    <a href="https://wa.me/2349000000000" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-brand-rose transition-colors">
                       Contact Concierge <ArrowRight size={14} />
                    </a>
                 </div>
                 <Package size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white z-[160] overflow-y-auto no-scrollbar"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="editorial-heading text-2xl">Journey of {selectedOrder.productName}</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-100 rounded-full hover:bg-neutral-50 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Progress Visual */}
                <div className="mb-12 grid grid-cols-4 gap-2">
                  {['pending', 'in-progress', 'ready-for-shipping', 'shipped'].map((s, idx) => {
                    const status = getStepStatus(selectedOrder.status, s);
                    return (
                      <div key={s} className="space-y-3">
                         <div className={`h-1.5 rounded-full transition-all duration-1000 ${
                           status === 'completed' ? 'bg-green-500' : status === 'current' ? 'bg-brand-charcoal' : 'bg-neutral-100'
                         }`} />
                         <p className={`text-[8px] uppercase tracking-widest font-black text-center ${
                           status === 'upcoming' ? 'opacity-20' : 'opacity-100'
                         }`}>
                           {s.replace('-', ' ')}
                         </p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-xl mb-6">
                        <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="space-y-6">
                         <div className="bg-neutral-100/50 p-6 rounded-3xl">
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-4 flex items-center gap-2">
                               <Package size={14} /> Tracking Info
                            </h5>
                            <div className="space-y-4">
                               {selectedOrder.expectedCompletionDate && (
                                  <div className="flex justify-between text-xs">
                                     <span className="opacity-40">Target Completion</span>
                                     <span className="font-bold">{new Date(selectedOrder.expectedCompletionDate).toLocaleDateString()}</span>
                                  </div>
                               )}
                               {selectedOrder.expectedDeliveryDate && (
                                  <div className="flex justify-between text-xs">
                                     <span className="opacity-40">Est. Delivery</span>
                                     <span className="font-bold text-green-600">{new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}</span>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      {/* Interaction Card */}
                      <div className="bg-white border-2 border-neutral-100 p-8 rounded-3xl shadow-sm">
                         {selectedOrder.status === 'ready-for-shipping' && !selectedOrder.shippingPaid ? (
                           <div className="text-center py-6">
                              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                 <CreditCard size={32} />
                              </div>
                              <h4 className="text-lg font-black mb-2">Final Action Required</h4>
                              <p className="text-xs text-brand-charcoal/40 mb-8 px-4">Your masterpiece is packaged and awaiting dispatch to {selectedOrder.shippingAddress?.city || 'your destination'}. Please fulfill the shipping fee.</p>
                              
                              <div className="bg-neutral-100 p-4 rounded-xl mb-8 flex justify-between items-center">
                                 <span className="text-[10px] uppercase tracking-widest font-black">Shipping Fee</span>
                                 <span className="text-xl font-black">₦{selectedOrder.shippingFee?.toLocaleString()}</span>
                              </div>

                              <button 
                                onClick={handlePayShipping}
                                disabled={payLoading}
                                className="w-full bg-brand-charcoal text-white py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand-rose transition-all shadow-xl disabled:opacity-50"
                              >
                                {payLoading ? 'Processing...' : 'Pay with Paystack'}
                              </button>
                              {payError && (
                                <p className="mt-4 text-[10px] text-red-500 font-bold uppercase tracking-widest">{payError}</p>
                              )}
                           </div>
                         ) : selectedOrder.status === 'shipped' ? (
                           <div className="text-center py-6">
                              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                 <Truck size={32} />
                              </div>
                              <h4 className="text-lg font-black mb-2">In Transit</h4>
                              <p className="text-xs text-brand-charcoal/40 mb-2">Your dress is on its way to {selectedOrder.shippingAddress?.street || 'your address'}.</p>
                              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Est. Delivery: {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}</p>
                           </div>
                         ) : (
                           <div className="text-center py-6">
                              <div className="w-16 h-16 bg-brand-charcoal/5 text-brand-charcoal/40 rounded-full flex items-center justify-center mx-auto mb-6">
                                 <Clock size={32} />
                              </div>
                              <h4 className="text-lg font-black mb-2 italic">Atelier Care</h4>
                              <p className="text-xs text-brand-charcoal/40 leading-relaxed">
                                 {selectedOrder.status === 'pending' 
                                   ? 'The creative director is reviewing your order and measurements.' 
                                   : 'Our master tailors are currently crafting your bespoke garment with meticulous precision.'}
                              </p>
                           </div>
                         )}
                      </div>

                      {/* Destination Recap */}
                      {selectedOrder.shippingAddress && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-6 flex items-center gap-2">
                             <Truck size={14} /> Destination
                          </h4>
                          <div className="bg-neutral-50 p-6 rounded-3xl">
                             <p className="text-xs font-bold mb-1">{selectedOrder.shippingAddress.street}</p>
                             <p className="text-[10px] opacity-60 uppercase tracking-widest">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}</p>
                          </div>
                        </div>
                      )}

                      {/* Measurements Recap */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-6 flex items-center gap-2">
                           <Ruler size={14} /> Measurements Recap
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           {Object.entries(selectedOrder.measurements).map(([key, val]) => (
                             key !== 'additionalNotes' && (
                               <div key={key} className="bg-neutral-50 p-4 rounded-2xl">
                                  <p className="text-[8px] uppercase tracking-widest text-brand-charcoal/20 font-black mb-1">{key}</p>
                                  <p className="text-xs font-bold">{val as string}</p>
                               </div>
                             )
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 16} 
      height={size || 16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
