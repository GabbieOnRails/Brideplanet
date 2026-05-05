import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageCircle, Ruler, Pencil, Sparkles, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: "01",
    icon: <Mail className="text-gold" size={32} />,
    title: "Consultation",
    description: "The journey begins with an intimate conversation. We explore your inspirations, silhouette preferences, and the unique story you want your gown to tell."
  },
  {
    number: "02",
    icon: <MessageCircle className="text-gold" size={32} />,
    title: "Design Development",
    description: "Translating ideas into art. We curate sketches and source premium fabrics that align with your vision, ensuring every detail reflects your personality."
  },
  {
    number: "03",
    icon: <Pencil className="text-gold" size={32} />,
    title: "Precision Measurements",
    description: "The foundation of perfection. We capture detailed anatomical measurements to create a bespoke pattern unique to your body's geometry."
  },
  {
    number: "04",
    icon: <Ruler className="text-gold" size={32} />,
    title: "Crafting & Production",
    description: "Where magic takes form. Our master artisans begin the meticulous process of cutting, sewing, and hand-finishing your masterpiece in our atelier."
  },
  {
    number: "05",
    icon: <Sparkles className="text-gold" size={32} />,
    title: "Fittings & Refinement",
    description: "Ensuring a second-skin fit. Through structured fitting sessions, we sculpt and refine the garment until it feels like it was born of you."
  },
  {
    number: "06",
    icon: <ShoppingBag className="text-gold" size={32} />,
    title: "Final Delivery",
    description: "The moment of revelation. Your finished look is pressed, packaged, and delivered, ready to grace your most defining life moment."
  }
];

const ProcessPage = () => {
  return (
    <div className="py-16 md:py-32 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-20 md:mb-24 max-w-4xl mx-auto">
        <span className="text-brand-rose uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">The Journey</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-charcoal mb-6 md:mb-8 italic leading-tight">Mastering Your Perfect Look</h1>
        <p className="text-brand-charcoal/40 tracking-[0.2em] uppercase text-[10px] italic font-medium block mb-8 md:mb-12">A step-by-step guide to your bespoke creation.</p>
        <p className="text-brand-charcoal/60 leading-relaxed text-lg md:text-xl font-light italic max-w-2xl mx-auto">
          Your Bridexx experience is designed to be seamless, personal, and memorable. From your first idea to your final fitting.
        </p>
      </div>

      {/* Timeline Section */}
      <div className="relative mb-40">
        {/* Center Line (desktop only) */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-rose/20 via-brand-rose/40 to-transparent -translate-x-1/2" />

        <div className="space-y-24 lg:space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={`process-step-${step.number}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''} lg:mb-32 last:mb-0`}
            >
              {/* Content Card */}
              <div className="w-full lg:w-1/2 flex justify-center px-0 sm:px-4 lg:px-20 mb-12 lg:mb-0">
                <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-brand-rose/10 relative group hover:shadow-2xl transition-all">
                  <span className="absolute top-8 right-10 text-6xl md:text-8xl font-serif font-black text-brand-rose/5 group-hover:text-brand-rose/10 transition-colors pointer-events-none select-none italic">
                    {step.number}
                  </span>
                  <div className="mb-6 md:mb-8 text-brand-rose opacity-60">
                    {React.cloneElement(step.icon as React.ReactElement, { size: 32, className: "text-brand-rose" })}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-brand-charcoal mb-4">{step.title}</h3>
                  <p className="text-brand-charcoal/60 leading-relaxed text-sm font-light italic">{step.description}</p>
                </div>
              </div>

              {/* Center Dot (desktop only) */}
              <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-brand-rose/30 bg-white items-center justify-center z-10 shadow-xl group-hover:scale-110 transition-all">
                <div className="w-2 h-2 bg-brand-rose rounded-full" />
              </div>

              {/* Spacer for other side (desktop only) */}
              <div className="hidden lg:block w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 md:py-32 bg-brand-charcoal text-white text-center rounded-3xl overflow-hidden shadow-2xl px-6 md:px-10 group">
        <div className="absolute inset-0 bg-brand-rose/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <h2 className="text-4xl md:text-6xl font-serif italic mb-6 md:mb-8 leading-tight text-brand-beige">Ready to start?</h2>
        <p className="text-white/50 italic font-light text-lg md:text-xl mb-12 md:mb-16 max-w-2xl mx-auto">Every vision deserves a stage. Every bride deserves a masterpiece. Your journey begins with a single step toward perfection.</p>
        <Link 
          to="/book-consultation"
          className="inline-flex items-center space-x-6 bg-white text-brand-charcoal hover:bg-brand-rose hover:text-white px-10 py-5 md:px-12 md:py-6 rounded-full text-xs uppercase tracking-[0.4em] font-black transition-all shadow-xl group/btn"
        >
          <span>Reserve My Session</span>
          <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
        </Link>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 pointer-events-none opacity-20">
          <Star className="text-brand-rose animate-spin-slow" size={48} />
        </div>
        <div className="absolute bottom-10 right-10 pointer-events-none opacity-20">
          <Star className="text-brand-rose animate-spin-slow-reverse" size={64} />
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProcessPage;
