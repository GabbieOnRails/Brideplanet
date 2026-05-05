import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: "Essential",
    price: "₦500,000 – ₦950,000",
    description: "Perfect for minimalist brides seeking elegance and simplicity.",
    features: [
      "Fabric consultation",
      "1 design concept",
      "2 fitting sessions",
      "Standard delivery (4–6 weeks)"
    ],
    highlight: false,
    color: "bg-white"
  },
  {
    name: "Signature",
    price: "₦1,200,000 – ₦2,800,000",
    description: "Our most popular choice for bespoke detail and intricate craftsmanship.",
    features: [
      "Premium fabric sourcing",
      "3 design concepts",
      "3 fitting sessions",
      "Beading/embellishment options",
      "Priority delivery (3–4 weeks)"
    ],
    highlight: true,
    color: "bg-blush"
  },
  {
    name: "Luxury",
    price: "₦3,500,000 & above",
    description: "The ultimate bridal experience. Unlimited possibilities and exclusive luxury.",
    features: [
      "Exclusive designer fabrics",
      "Unlimited design revisions",
      "5 fitting sessions",
      "Custom accessories",
      "Express delivery (2–3 weeks)",
      "Personal stylist assigned"
    ],
    highlight: false,
    color: "bg-charcoal text-white"
  }
];

const PricingPage = () => {
  return (
    <div className="py-16 md:py-32 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
      <div className="text-center mb-16 md:mb-24">
        <span className="text-brand-rose uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Investment</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-charcoal mb-4 italic leading-tight">Tailored To Your Vision</h1>
        <p className="text-brand-charcoal/60 text-lg md:text-xl font-light italic max-w-3xl mx-auto mb-8">
          At Bridexx, every piece is crafted with precision, detail, and intention. Our pricing reflects the level of craftsmanship, fabric quality, and personalization that goes into creating your perfect bridal look.
        </p>
        <p className="text-brand-charcoal/40 tracking-[0.2em] uppercase text-[10px] italic font-medium">Transparent pricing for premium craftsmanship.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-32">
        {tiers.map((tier, i) => (
          <motion.div
            key={`tier-${tier.name}-${i}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className={`flex flex-col h-full rounded-2xl md:rounded-3xl shadow-sm p-8 md:p-12 border transition-all relative overflow-hidden ${
              tier.highlight 
                ? 'bg-brand-charcoal text-white border-brand-rose/20 shadow-2xl lg:scale-105 z-10' 
                : 'bg-white text-brand-charcoal border-brand-rose/10'
            }`}
          >
            {tier.highlight && (
              <div className="absolute top-0 right-0 bg-brand-rose text-white px-8 py-2 text-[8px] uppercase tracking-[0.3em] font-black translate-x-[20%] translate-y-[120%] rotate-45 shadow-sm">
                Most Popular
              </div>
            )}
            
            <div className="mb-10">
               <h3 className={`text-3xl font-serif italic mb-4 ${tier.highlight ? 'text-brand-beige' : 'text-brand-charcoal'}`}>{tier.name}</h3>
               <div className="flex items-baseline gap-2 mb-6">
                 <span className={`text-4xl font-serif italic ${tier.highlight ? 'text-white' : 'text-brand-rose'}`}>{tier.price}</span>
               </div>
               <p className={`text-sm italic font-light leading-relaxed ${tier.highlight ? 'text-white/60' : 'text-brand-charcoal/60'}`}>{tier.description}</p>
            </div>

            <ul className="space-y-6 mb-16 flex-grow">
              {tier.features.map((feature, j) => (
                <li key={`tier-feature-${i}-${j}`} className="flex items-start space-x-4">
                  <Check size={16} className="text-brand-rose shrink-0 mt-0.5" />
                  <span className={`text-xs font-bold tracking-wide italic ${tier.highlight ? 'text-white/80' : 'text-brand-charcoal/80'}`}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              to="/book-consultation"
              className={`w-full py-5 text-center text-[10px] uppercase tracking-[0.3em] font-black transition-all rounded-xl ${
                tier.highlight 
                  ? 'bg-brand-rose text-white hover:bg-white hover:text-brand-charcoal' 
                  : 'bg-brand-charcoal text-white hover:bg-brand-rose'
              }`}
            >
              Get Started
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="bg-brand-blush/20 p-8 md:p-12 rounded-3xl border border-brand-rose/10 mb-32 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8 md:gap-12">
         <Info size={32} className="text-brand-rose shrink-0" />
         <div>
            <h4 className="text-2xl md:text-3xl font-serif italic text-brand-charcoal mb-4">Important Note</h4>
            <p className="text-brand-charcoal/60 leading-relaxed max-w-4xl italic font-light text-sm md:text-base">
              All prices listed are estimates intended to serve as a guide. The complexity of your design, the specific fabric choices, and your timeline will influence the final cost. A comprehensive, fixed quote will be provided after your initial consultation.
            </p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
        <div className="text-center">
           <span className="text-[10px] uppercase tracking-[0.4em] text-brand-rose font-bold mb-4 block">Process</span>
           <h2 className="text-4xl md:text-5xl font-serif text-brand-charcoal italic">What's included?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {[
            { q: "Design Consultation", a: "Expert advice from our lead stylist on what suits your body type and vision." },
            { q: "Fabric Sourcing", a: "We find and procure high-quality fabrics appropriate for your chosen tier." },
            { q: "Construction & Sewing", a: "Full tailored construction of your gown or traditional look." },
            { q: "Fitting Sessions", a: "Multiple sessions to ensure the garment fits like a second skin." }
          ].map((item, i) => (
            <div key={`faq-item-${i}`} className="flex space-x-6">
              <HelpCircle size={28} className="text-brand-rose shrink-0 mt-1 opacity-40 hidden sm:block" />
              <div>
                <h5 className="font-serif italic text-xl md:text-2xl text-brand-charcoal mb-3">{item.q}</h5>
                <p className="text-sm font-light text-brand-charcoal/60 leading-relaxed italic">{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-charcoal text-white p-8 md:p-16 text-center rounded-3xl space-y-8 md:space-y-12 mt-32 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-rose/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-700" />
          <h3 className="text-3xl md:text-5xl font-serif italic text-brand-beige">Not sure which to pick?</h3>
          <p className="text-white/50 font-light italic text-lg md:text-xl max-w-2xl mx-auto">Every bride is unique. Let's find your perfect tier together.</p>
          <Link 
            to="/book-consultation"
            className="inline-block bg-white text-brand-charcoal hover:bg-brand-rose hover:text-white px-10 py-5 md:px-12 md:py-6 text-xs uppercase tracking-[0.4em] font-black transition-all shadow-xl rounded-full"
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
