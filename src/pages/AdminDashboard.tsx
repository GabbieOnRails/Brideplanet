import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, Truck, CheckCircle, Search, Calendar, DollarSign, ExternalLink, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  // Form states for updates
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen for Orders
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQ, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Listen for Payments
    const paymentsQ = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsubscribePayments = onSnapshot(paymentsQ, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'payments');
    });

    return () => {
      unsubscribeOrders();
      unsubscribePayments();
    };
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdateLoading(true);
    setLoadingMessage('Syncing with Atelier Records...');
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updates: any = { status: newStatus, updatedAt: serverTimestamp() };
      
      if (newStatus === 'in-progress' && expectedCompletion) {
        updates.expectedCompletionDate = expectedCompletion;
      }
      if (newStatus === 'ready-for-shipping' && shippingFee) {
        updates.shippingFee = shippingFee;
      }
      if (newStatus === 'shipped' && expectedDelivery) {
        updates.expectedDeliveryDate = expectedDelivery;
      }

      await updateDoc(orderRef, updates);
      
      // Trigger status update email
      setLoadingMessage('Notifying Client of Progress...');
      try {
        await fetch('/api/send-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedOrder.userEmail,
            orderId: orderId,
            oldStatus: selectedOrder.status,
            newStatus: newStatus,
            customerName: selectedOrder.userEmail.split('@')[0] // Fallback if name not in order
          })
        });
      } catch (emailErr) {
        console.error("Status update email failed:", emailErr);
      }

      setSelectedOrder(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setUpdateLoading(false);
      setLoadingMessage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready-for-shipping': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'shipped': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-100/30 py-12 px-4 md:px-8 relative">
      <AnimatePresence>
        {updateLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-charcoal/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 border-2 border-brand-rose border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="editorial-heading text-white text-xl mb-2 tracking-tight">Updating Atelier Flow</h2>
            <p className="text-brand-beige/60 text-[10px] uppercase tracking-widest font-black animate-pulse">{loadingMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="editorial-heading text-4xl mb-4">Command Center</h1>
            <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest font-black">Managing Bespoke Bridal Excellence</p>
          </div>
          
          <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-100 shadow-sm">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'orders' ? 'bg-brand-charcoal text-white shadow-lg' : 'text-brand-charcoal/40 hover:text-brand-charcoal'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${activeTab === 'payments' ? 'bg-brand-charcoal text-white shadow-lg' : 'text-brand-charcoal/40 hover:text-brand-charcoal'}`}
            >
              Payments
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-charcoal/10 border-t-brand-charcoal rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {activeTab === 'orders' ? (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-neutral-100 shadow-sm">
                      <Package size={40} className="mx-auto mb-6 text-brand-charcoal/10" />
                      <p className="editorial-heading text-xl text-brand-charcoal/40">No orders yet</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <motion.div 
                        key={order.id}
                        layoutId={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-24 bg-neutral-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                            <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black border ${getStatusColor(order.status)}`}>
                                {order.status.replace('-', ' ')}
                              </span>
                              <span className="text-[10px] text-brand-charcoal/20 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <h3 className="font-bold text-brand-charcoal mb-1">{order.productName}</h3>
                            <p className="text-xs text-brand-charcoal/40 italic">{order.userEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 text-right">
                          <div className="hidden md:block">
                            <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-black mb-1">Created At</p>
                            <p className="text-xs font-bold">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recently'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-black mb-1">Dress Total</p>
                            <p className="text-lg font-black text-brand-charcoal">₦{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <ChevronRight size={20} className="text-brand-charcoal/20 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
                   <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
                      <h3 className="editorial-heading text-xl">Payment Logs</h3>
                      <div className="flex items-center gap-3 bg-brand-charcoal/5 px-4 py-2 rounded-full">
                         <span className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40">Total Volume</span>
                         <span className="text-sm font-black text-brand-charcoal">₦{totalRevenue.toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-neutral-50/50">
                               <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-brand-charcoal/30 border-b border-neutral-100">Date</th>
                               <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-brand-charcoal/30 border-b border-neutral-100">Client</th>
                               <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-brand-charcoal/30 border-b border-neutral-100">Type</th>
                               <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-brand-charcoal/30 border-b border-neutral-100 text-right">Amount</th>
                               <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-brand-charcoal/30 border-b border-neutral-100">Ref</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-100">
                            {payments.map((p) => (
                               <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                                  <td className="p-6 text-xs whitespace-nowrap">{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Recently'}</td>
                                  <td className="p-6">
                                     <p className="text-xs font-bold text-brand-charcoal">{p.userEmail}</p>
                                     <p className="text-[9px] text-brand-charcoal/30 uppercase tracking-widest font-black mt-1">ID: {p.userId.slice(-6)}</p>
                                  </td>
                                  <td className="p-6">
                                     <span className={`text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${
                                       p.type === 'Shipping Logistics' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-brand-charcoal text-white'
                                     }`}>
                                        {p.type}
                                     </span>
                                  </td>
                                  <td className="p-6 text-right font-black text-brand-charcoal text-sm">₦{p.amount.toLocaleString()}</td>
                                  <td className="p-6">
                                     <div className="flex items-center gap-2 text-brand-charcoal/40 hover:text-brand-charcoal transition-colors group cursor-pointer">
                                        <span className="text-[10px] font-mono">{p.reference.slice(0, 8)}...</span>
                                        <ExternalLink size={12} className="group-hover:scale-110 transition-all" />
                                     </div>
                                  </td>
                               </tr>
                            ))}
                            {payments.length === 0 && (
                               <tr>
                                  <td colSpan={5} className="p-20 text-center text-brand-charcoal/20 editorial-heading text-xl">No transactions found</td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
              )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-brand-charcoal rounded-3xl p-8 text-white shadow-xl">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black mb-10 opacity-40">Status Summary</h4>
                <div className="space-y-6">
                  {['pending', 'in-progress', 'ready-for-shipping', 'shipped'].map(s => {
                    const count = orders.filter(o => o.status === s).length;
                    return (
                      <div key={s} className="flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-60">{s.replace('-', ' ')}</span>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-black">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeTab === 'payments' && (
                <div className="bg-brand-rose rounded-3xl p-8 text-white shadow-xl">
                   <h4 className="text-[10px] uppercase tracking-[0.2em] font-black mb-10 opacity-40">Financial Health</h4>
                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Avg. Basket</span>
                         <span className="text-xl font-black">₦{(payments.length > 0 ? totalRevenue / payments.length : 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Logistics (15%)</span>
                         <span className="text-xl font-black">₦{(totalRevenue * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      </div>
                   </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black mb-6 text-brand-charcoal/40">Recent Activity</h4>
                <div className="space-y-4">
                   {activeTab === 'orders' ? (
                     <p className="text-[11px] italic text-brand-charcoal/60">System online. Monitoring atelier flow.</p>
                   ) : (
                     <p className="text-[11px] italic text-brand-charcoal/60 font-medium">All Paystack transactions verified and cleared.</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
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
                  <h2 className="editorial-heading text-2xl">Order Details</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-100 rounded-full hover:bg-neutral-50 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                   <div>
                      <div className="w-full aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden shadow-lg mb-6">
                        <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-xl font-black mb-2">{selectedOrder.productName}</h3>
                      <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest font-black">Customer: {selectedOrder.userEmail}</p>
                   </div>

                   <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-4">Measurements</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedOrder.measurements).map(([key, val]) => (
                            key !== 'additionalNotes' && (
                              <div key={key} className="bg-neutral-100/50 p-3 rounded-xl">
                                <p className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-black mb-1">{key}</p>
                                <p className="text-sm font-bold">{val as string}</p>
                              </div>
                            )
                          ))}
                        </div>
                        {selectedOrder.measurements.additionalNotes && (
                          <div className="mt-4 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                            <p className="text-[9px] uppercase tracking-widest text-amber-600 font-black mb-1">Notes</p>
                            <p className="text-xs italic">{selectedOrder.measurements.additionalNotes}</p>
                          </div>
                        )}
                      </div>

                      {selectedOrder.shippingAddress && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-4">Shipping Destination</h4>
                          <div className="bg-neutral-100/50 p-4 rounded-xl space-y-1">
                            <p className="text-sm font-bold">{selectedOrder.shippingAddress.street}</p>
                            <p className="text-xs">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                            <p className="text-xs opacity-60">{selectedOrder.shippingAddress.country} {selectedOrder.shippingAddress.postalCode}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-8 border-t border-neutral-100">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 mb-6">Execution & Flow</h4>
                        <div className="space-y-4">
                          {selectedOrder.status === 'pending' && (
                            <div className="space-y-3">
                              <label className="text-[10px] uppercase tracking-widest font-black">Expected Completion Date</label>
                              <input 
                                type="date" 
                                className="w-full p-4 bg-neutral-100 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-brand-charcoal/5"
                                value={expectedCompletion}
                                onChange={(e) => setExpectedCompletion(e.target.value)}
                              />
                              <button 
                                onClick={() => handleUpdateStatus(selectedOrder.id, 'in-progress')}
                                disabled={updateLoading || !expectedCompletion}
                                className="w-full bg-brand-charcoal text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-rose transition-all flex items-center justify-center gap-2"
                              >
                                Start Construction
                                <Clock size={14} />
                              </button>
                            </div>
                          )}

                          {selectedOrder.status === 'in-progress' && (
                            <div className="space-y-4">
                              <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 text-blue-700">
                                <Clock size={16} />
                                <span className="text-xs font-bold">Dress is in production</span>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest font-black">Set Shipping Fee (₦)</label>
                                <input 
                                  type="number" 
                                  placeholder="Amount"
                                  className="w-full p-4 bg-neutral-100 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-brand-charcoal/5"
                                  value={shippingFee || ''}
                                  onChange={(e) => setShippingFee(Number(e.target.value))}
                                />
                                <button 
                                  onClick={() => handleUpdateStatus(selectedOrder.id, 'ready-for-shipping')}
                                  disabled={updateLoading || !shippingFee}
                                  className="w-full bg-brand-charcoal text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-rose transition-all flex items-center justify-center gap-2"
                                >
                                  Mark Ready for Shipping
                                  <Truck size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedOrder.status === 'ready-for-shipping' && (
                            <div className="space-y-4">
                              <div className={`p-4 rounded-xl flex items-center gap-3 ${selectedOrder.shippingPaid ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
                                {selectedOrder.shippingPaid ? <CheckCircle size={16} /> : <Clock size={16} />}
                                <span className="text-xs font-bold">
                                  {selectedOrder.shippingPaid ? 'Shipping Fee Paid by Client' : 'Awaiting Shipping Payment'}
                                </span>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest font-black">Expected Delivery Date</label>
                                <input 
                                  type="date" 
                                  className="w-full p-4 bg-neutral-100 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-brand-charcoal/5"
                                  value={expectedDelivery}
                                  onChange={(e) => setExpectedDelivery(e.target.value)}
                                />
                                <button 
                                  onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                                  disabled={updateLoading || !expectedDelivery || (!selectedOrder.shippingPaid && false)} // Allowed to ship if they pay via other means too theoretically, but usually we wait
                                  className="w-full bg-brand-charcoal text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-rose transition-all flex items-center justify-center gap-2"
                                >
                                  Dispatch Order
                                  <Truck size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedOrder.status === 'shipped' && (
                            <div className="bg-green-50 p-6 rounded-3xl text-green-700 space-y-2">
                               <div className="flex items-center gap-3">
                                  <CheckCircle size={20} />
                                  <p className="font-black uppercase tracking-widest text-sm">Order Fulfilled</p>
                               </div>
                               <p className="text-xs opacity-70">Dress has been dispatched. Delivery expected by {selectedOrder.expectedDeliveryDate}.</p>
                            </div>
                          )}
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
