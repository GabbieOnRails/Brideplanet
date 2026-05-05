import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, CreditCard, CheckCircle, ChevronRight, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Product } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { usePaystackPayment } from 'react-paystack';

interface CheckoutPageProps {
  cart: Product[];
  clearCart: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, clearCart }) => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ... (measurements and address state same as before)
  const [measurements, setMeasurements] = useState({
    bust: '', waist: '', hip: '', shoulder: '', fullLength: '',
    nippleToNipple: '', bustPoint: '', underBust: '', halfLength: '',
    underBustRound: '', kneeLength: '', sleeveLength: '',
    roundArm: '', roundElbow: '', wrist: '', additionalNotes: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', country: 'Nigeria', postalCode: ''
  });

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const isMeasurementsComplete = [
    'bust', 'waist', 'hip', 'shoulder', 'fullLength', 'nippleToNipple', 
    'bustPoint', 'underBust', 'halfLength', 'underBustRound', 
    'kneeLength', 'sleeveLength', 'roundArm', 'roundElbow', 'wrist'
  ].every((field) => measurements[field as keyof typeof measurements].trim() !== '');

  const isAddressComplete = [
    'street', 'city', 'state', 'country'
  ].every((field) => shippingAddress[field as keyof typeof shippingAddress].trim() !== '');
  
  const subtotal = cart.reduce((acc, item) => acc + item.priceValue, 0);
  const total = subtotal;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "",
    amount: total * 100, // Paystack works in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const onPaymentSuccess = async (reference: any) => {
    setIsProcessing(true);
    setLoadingMessage('Verifying Transaction with Paystack...');
    setPaymentError(null);

    try {
      // 1. Verify Payment on Server
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.reference })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || verifyData.status !== "success") {
        throw new Error(verifyData.message || "Payment verification failed. Please contact support.");
      }

      setLoadingMessage('Securing Your Bespoke Reservation...');

      // 2. Clear to generate actual orders in DB
      for (const product of cart) {
        const orderData = {
          userId: user?.uid,
          userEmail: user?.email,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          totalAmount: product.priceValue,
          status: 'pending',
          measurements: measurements,
          shippingAddress: shippingAddress,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          shippingPaid: false,
          paystackReference: reference.reference
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        // Log payment record
        await addDoc(collection(db, 'payments'), {
          userId: user?.uid,
          userEmail: user?.email,
          orderId: docRef.id,
          amount: product.priceValue,
          reference: reference.reference,
          status: 'success',
          type: 'Product Reservation',
          createdAt: serverTimestamp()
        });

        // Trigger order confirmation email
        setLoadingMessage(`Sending Confirmation for ${product.name}...`);
        try {
          await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: {
                name: userData?.displayName || user?.displayName || 'Valued Client',
                email: user?.email,
                phone: measurements.wrist ? 'Provided' : 'N/A',
                address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}`
              },
              order: {
                id: docRef.id,
                productName: product.name,
                totalAmount: product.priceValue,
              },
              measurements: measurements
            })
          });
        } catch (emailErr) {
          console.error("Order confirmation email failed:", emailErr);
        }
      }

      setLoadingMessage('Finalizing Experience...');
      setTimeout(() => {
        setIsProcessing(false);
        setIsFinished(true);
        clearCart();
      }, 1000);
    } catch (error: any) {
      console.error("Payment finalization error:", error);
      setPaymentError(error instanceof Error ? error.message : "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  const onPaymentClose = () => {
    console.log('Payment dialog closed');
    setIsProcessing(false);
  };

  const startCheckout = () => {
    if (!user) return;
    setIsProcessing(true);
    setLoadingMessage('Opening Secure Payment Gateway...');
    initializePayment({onSuccess: onPaymentSuccess, onClose: () => {
      setIsProcessing(false);
      setLoadingMessage('');
    }});
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-8 text-brand-charcoal/20">
          <LogIn size={40} />
        </div>
        <h2 className="editorial-heading text-3xl mb-4 text-brand-charcoal">Atelier Credentials</h2>
        <p className="text-brand-charcoal/40 text-[10px] uppercase tracking-widest font-black mb-12 max-w-xs">
          To provide bespoke tracking and personalized metrics, please sign in to your bridal profile.
        </p>
        <Link 
          to="/login" 
          state={{ from: { pathname: '/checkout' } }}
          className="btn-editorial"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full bg-white p-12 md:p-20 text-center shadow-2xl border border-brand-charcoal/5 rounded-[3rem]"
        >
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-brand-charcoal mb-6 leading-tight">Order <span className="italic font-light text-brand-charcoal/40">Successful</span></h2>
          <p className="text-brand-charcoal/50 leading-relaxed mb-12 italic text-lg">
            Your journey with Bridexx Planet has officially begun. You can track your dress progress in your dashboard.
          </p>
          <Link 
            to="/dashboard" 
            className="inline-block bg-brand-charcoal text-white px-12 py-5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-rose transition-all shadow-xl"
          >
            Go to Your Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="editorial-heading text-2xl text-brand-charcoal/20 mb-8 font-black uppercase">Your bag is currently empty</p>
        <Link to="/shop" className="btn-outline-editorial">Explore Boutique</Link>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-32 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto relative">
      {/* Cinematic Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-charcoal/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-28 h-28 mb-10">
              <div className="absolute inset-0 border-[3px] border-brand-rose/10 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-brand-rose border-t-transparent rounded-full"
              />
              <div className="absolute inset-6 flex items-center justify-center">
                <ShieldCheck size={40} className="text-brand-rose animate-pulse" />
              </div>
            </div>
            <h2 className="editorial-heading text-white text-3xl mb-4 tracking-tight">Crafting Excellence</h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-brand-beige/60 text-xs uppercase tracking-[0.4em] font-black animate-pulse">{loadingMessage || 'Authenticating Experience...'}</p>
              <div className="w-12 h-[1px] bg-brand-rose/40 mt-4" />
            </div>
            <p className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Please avoid refreshing during the secure handshake</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Checkout Steps */}
        <div className="flex-grow space-y-12">
          <div className="flex items-center gap-6 mb-12">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={`checkout-step-${s}`}>
                <div className={`flex items-center gap-3 ${step >= s ? 'text-brand-charcoal' : 'text-brand-charcoal/20'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-black ${step >= s ? 'border-brand-charcoal bg-brand-charcoal text-white' : 'border-brand-charcoal/10'}`}>
                    {s}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black hidden sm:block">
                    {s === 1 ? 'Metrics' : s === 2 ? 'Delivery' : 'Review'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-grow h-px ${step > s ? 'bg-brand-charcoal' : 'bg-brand-charcoal/10'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                  <h3 className="text-3xl font-sans font-bold text-brand-charcoal">Atelier Metrics</h3>
                  <span className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 italic">15 Professional Measurements (Inches)</span>
                </div>
                
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Full Length', name: 'fullLength' },
                        { label: 'Bust', name: 'bust' },
                        { label: 'Waist', name: 'waist' },
                        { label: 'Hip', name: 'hip' },
                        { label: 'Shoulder', name: 'shoulder' },
                        { label: 'Nipple to Nipple', name: 'nippleToNipple' },
                        { label: 'Bust Point', name: 'bustPoint' },
                        { label: 'Under Bust', name: 'underBust' },
                        { label: 'Half Length', name: 'halfLength' },
                        { label: 'Under Bust Round', name: 'underBustRound' },
                        { label: 'Knee Length', name: 'kneeLength' },
                        { label: 'Sleeve Length', name: 'sleeveLength' },
                        { label: 'Round Arm', name: 'roundArm' },
                        { label: 'Round Elbow', name: 'roundElbow' },
                        { label: 'Wrist', name: 'wrist' },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">
                            {field.label}
                          </label>
                          <input 
                            type="text" 
                            name={field.name}
                            value={measurements[field.name as keyof typeof measurements]}
                            onChange={handleMeasurementChange}
                            className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal font-serif italic text-sm transition-all" 
                            placeholder="Value" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40">Additional Notes</label>
                    <textarea 
                      name="additionalNotes"
                      rows={4}
                      value={measurements.additionalNotes}
                      onChange={handleMeasurementChange}
                      className="w-full bg-white border border-brand-charcoal/10 p-5 rounded-xl focus:outline-none focus:border-brand-charcoal font-serif italic" 
                      placeholder="Special instructions or preferences..."
                    />
                  </div>
                </div>

                <div className="flex pt-4">
                  <button 
                    disabled={!isMeasurementsComplete}
                    onClick={() => setStep(2)}
                    className={`flex-grow md:flex-none px-12 py-5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-3 ${isMeasurementsComplete ? 'bg-brand-charcoal text-white hover:bg-brand-rose' : 'bg-brand-charcoal/10 text-brand-charcoal/30 cursor-not-allowed'}`}
                  >
                    Continue to Delivery <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                  <h3 className="text-3xl font-sans font-bold text-brand-charcoal">Delivery Details</h3>
                  <span className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 italic">Where shall we send your creation?</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">Street Address</label>
                      <input 
                        type="text" 
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleAddressChange}
                        className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal text-sm" 
                        placeholder="e.g. 123 Atelier Way" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal text-sm" 
                        placeholder="City" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal text-sm" 
                        placeholder="State" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">Country</label>
                      <input 
                        type="text" 
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal text-sm" 
                        placeholder="Country" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-brand-charcoal/40 block">Postal Code</label>
                      <input 
                        type="text" 
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleAddressChange}
                        className="w-full bg-white border border-brand-charcoal/10 p-4 rounded-xl focus:outline-none focus:border-brand-charcoal text-sm" 
                        placeholder="Optional" 
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="px-12 py-5 border border-brand-charcoal/10 text-brand-charcoal rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-brand-charcoal hover:text-white transition-all">
                    Back
                  </button>
                  <button 
                    disabled={!isAddressComplete}
                    onClick={() => setStep(3)}
                    className={`flex-grow md:flex-none px-12 py-5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-3 ${isAddressComplete ? 'bg-brand-charcoal text-white hover:bg-brand-rose' : 'bg-brand-charcoal/10 text-brand-charcoal/30 cursor-not-allowed'}`}
                  >
                    Continue to Review <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="bg-brand-charcoal text-white p-10 md:p-14 rounded-3xl space-y-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-rose/10 rounded-full blur-[80px]" />
                  <h3 className="text-3xl md:text-4xl font-sans font-bold leading-tight">Finalize <span className="italic font-light text-brand-beige">Reservation</span></h3>
                  <p className="text-white/40 italic font-light max-w-md mx-auto">By completing this reservation, you agree to our bespoke atelier terms.</p>
                  
                  {paymentError && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs text-left">
                      <AlertCircle size={16} className="shrink-0" />
                      <p>{paymentError}</p>
                    </div>
                  )}

                  <button 
                    onClick={startCheckout}
                    disabled={isProcessing}
                    className={`w-full py-6 rounded-2xl text-[11px] uppercase tracking-widest font-black transition-all shadow-2xl relative ${isProcessing ? 'bg-brand-charcoal/50 cursor-not-allowed' : 'bg-brand-rose text-white hover:bg-white hover:text-brand-charcoal'}`}
                  >
                    {isProcessing ? 'Authenticating...' : 'Secure Authorization with Paystack'}
                  </button>
                </div>
                <button onClick={() => setStep(2)} className="text-[10px] uppercase tracking-widest font-black text-brand-charcoal/40 hover:text-brand-charcoal transition-colors mx-auto block">
                  Back to Delivery
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <aside className="lg:w-96">
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] border border-brand-charcoal/5 shadow-xl space-y-10 sticky top-32">
            <h4 className="text-xl font-sans font-bold text-brand-charcoal">Dress Bag</h4>
            
            <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
              {cart.map((item, index) => (
                <div key={`checkout-cart-${item.id}-${index}`} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-neutral-50 rounded-lg overflow-hidden shrink-0 border border-brand-charcoal/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="max-w-[120px]">
                      <p className="text-xs font-bold leading-tight truncate">{item.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-brand-charcoal/5 space-y-4">
              <div className="flex justify-between items-end pt-4">
                <span className="text-[10px] uppercase tracking-widest font-black">Subtotal</span>
                <span className="text-2xl font-black">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3 text-brand-charcoal/40">
                <ShieldCheck size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold italic text-brand-charcoal/60">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3 text-brand-charcoal/40">
                <Truck size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold italic text-brand-charcoal/60">Bespoke Handling</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
