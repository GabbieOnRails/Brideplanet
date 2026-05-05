import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, CheckCircle, Info, Star } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BookingPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    lookType: 'White Wedding Gown',
    consultationDate: '',
    preferredTime: 'Morning 9am-12pm',
    source: 'Instagram',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingData = {
        ...formData,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'bookings'), bookingData);
      
      // Trigger confirmation email
      try {
        await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking: formData })
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }

      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 text-center shadow-2xl border border-blush rounded-sm"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-serif text-charcoal mb-4">Reservation Confirmed</h2>
          <p className="text-charcoal/70 leading-relaxed mb-8">
            Thank you, <span className="font-bold text-gold">{formData.name}</span>! Your consultation request has been received. 
            We'll be in touch within 24 hours to confirm your appointment.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-gold uppercase tracking-widest text-xs font-bold border-b border-gold pb-1 hover:text-charcoal hover:border-charcoal transition-all"
          >
            Make another booking
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-40 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 md:mb-28"
      >
        <span className="text-brand-rose uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Consultation</span>
        <h1 className="text-5xl md:text-8xl font-sans font-bold text-brand-charcoal mb-4 leading-none tracking-tight">Reserve <br className="hidden md:block" /> <span className="text-brand-charcoal/40 font-light italic">Your Slot</span></h1>
        <p className="text-brand-charcoal/40 tracking-[0.4em] uppercase text-[10px] italic font-black mt-8">Take the first step toward your dream look.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Booking Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-grow"
        >
          <form onSubmit={handleSubmit} className="bg-white p-10 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-brand-charcoal/5 space-y-12 md:space-y-16 rounded-[2.5rem] md:rounded-[3.5rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors font-serif italic text-lg" 
                  placeholder="e.g. Ama Okafor"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors font-serif italic text-lg" 
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors font-serif italic text-lg" 
                  placeholder="+234 000 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Event Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors font-serif italic text-lg"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Type of Look</label>
                <select 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors appearance-none font-serif italic text-lg"
                  value={formData.lookType}
                  onChange={(e) => setFormData({...formData, lookType: e.target.value})}
                >
                  <option>White Wedding Gown</option>
                  <option>Traditional Attire</option>
                  <option>Prom</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Consultation Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors font-serif italic text-lg"
                  value={formData.consultationDate}
                  onChange={(e) => setFormData({...formData, consultationDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal/40">Additional Notes</label>
              <textarea 
                rows={4}
                className="w-full bg-brand-cream/30 border-b border-brand-rose/20 p-4 focus:outline-none focus:border-brand-rose transition-colors resize-none font-serif italic text-lg" 
                placeholder="Share your vision or any special requests..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-charcoal hover:bg-brand-rose text-white p-6 rounded-xl text-xs uppercase tracking-[0.3em] font-black transition-all shadow-xl"
              id="submit-booking-btn"
            >
              Confirm Consultation
            </button>
          </form>
        </motion.div>

        {/* Sidebar Panel */}
        <aside className="lg:w-96 space-y-8 md:space-y-12 text-center lg:text-left">
          <div className="bg-brand-blush/20 p-8 md:p-12 rounded-3xl border border-brand-rose/10 space-y-8 md:space-y-10">
            <h3 className="text-2xl md:text-3xl font-serif italic text-brand-charcoal">The Experience</h3>
            <ul className="space-y-6 md:space-y-8">
              {[
                "Personal one-on-one time with our head designer.",
                "Expert body-type analysis and aesthetic curation.",
                "Exclusive access to premium fabric galleries.",
                "Custom design sketching tailored to your vision.",
                "Initial measurement and price estimation."
              ].map((text, i) => (
                <li key={`exp-item-${i}`} className="flex items-start space-x-4">
                  <div className="w-5 h-5 rounded-full bg-brand-rose text-white flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle size={10} />
                  </div>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed italic">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-brand-charcoal text-white p-8 md:p-12 rounded-3xl space-y-8 md:space-y-10 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose/10 rounded-full blur-[60px]" />
            <h3 className="text-2xl md:text-3xl font-serif italic text-brand-beige">Studio Visit</h3>
            <div className="space-y-8 text-white/50">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-brand-rose font-bold">Showroom</p>
                <p className="text-sm italic">Lagos Atelier — Strictly by Appointment</p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-brand-rose font-bold">Atelier Hours</p>
                <div className="text-sm italic space-y-2">
                  <p>Mon–Fri: 9:00 AM – 6:00 PM</p>
                  <p>Sat: 10:00 AM – 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
