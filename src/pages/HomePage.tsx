import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Instagram, 
  Search, 
  Menu, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight,
  CalendarCheck,
  Tag,
  ClipboardList,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: 'https://i.ibb.co/WpRLGrXZ/bridexx-planet-1755326736-3700271314891728724-34446236868.jpg',
    title: 'YOUR FOREVER BEGINS IN STYLE',
  },
  {
    image: 'https://i.ibb.co/RTrtPPjJ/bridexx-planet-1774425458-3860480842653322676-34446236868.jpg',
    title: 'YOUR FOREVER BEGINS IN STYLE',
  },
  {
    image: 'https://i.ibb.co/XkMGC8qJ/bridexx-planet-1751702956-3669872848198311952-34446236868.jpg',
    title: 'YOUR FOREVER BEGINS IN STYLE',
  }
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeLook, setActiveLook] = useState(2);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const looks = [
    "https://i.ibb.co/84x1zKwJ/bridexx-planet-1752308816-3674955167204595438-34446236868.jpg",
    "https://i.ibb.co/pr34znPy/m-a-shoots-1765909076-3789042414892599543-47704222456.jpg",
    "https://i.ibb.co/vRRRqyJ/bridexx-planet-1751702956-3669872848156280881-34446236868.jpg",
    "https://i.ibb.co/9mJnQLJP/bridexx-planet-1776151269-3874957998657760085-34446236868.jpg",
    "https://i.ibb.co/bjVtWZJV/bridexx-planet-1749461625-3651071196435581659-34446236868.jpg",
    "https://i.ibb.co/VYskd4tR/bridexx-planet-1749746089-3653457453774237263-34446236868.jpg",
  ];

  const testimonials = [
    {
      name: "ADAEZE OKONKWO",
      role: "BRIDE",
      text: "My wedding gown was absolutely stunning. The fitting was so precise, I cried happy tears when I put it on. Bridexx Planet made me feel like a queen.",
      rating: 5
    },
    {
      name: "NGOZI EZE",
      role: "BRIDE",
      text: "From the consultation to the final fitting, every step was smooth. They understood my vision better than I could explain it. 10/10!",
      rating: 5
    },
    {
      name: "CHIAMAKA UCHE",
      role: "BRIDE",
      text: "My traditional attire was delivered a week before the wedding perfectly done. The fabric quality was top-tier. I will be back for my sister's wedding!",
      rating: 5
    },
    {
      name: "IFEOMA NWOSU",
      role: "BRIDE",
      text: "I was nervous about getting a custom gown but the team was so patient and professional. My guests couldn't stop talking about my look all night.",
      rating: 5
    },
    {
      name: "TEMILADE OGUNDIMU",
      role: "BRIDE",
      text: "Best decision I made for my wedding was choosing Bridexx Planet. Elegant, affordable, and delivered on time. I felt like royalty!",
      rating: 5
    }
  ];

  const instagramImages = [
    "https://i.ibb.co/scHWg1H/bridexx-planet-1681115191-3077739753160212536-34446236868.jpg",
    "https://i.ibb.co/4nFnfQm0/bridexx-planet-1707067349-3295442237201512141-34446236868.jpg",
    "https://i.ibb.co/5hfNmsBt/ms-morenike-1711713133-3334413896041964054-53384995.jpg",
    "https://i.ibb.co/p6nyvPMd/bridexx-planet-1719479691-3399564511419970199-34446236868.jpg",
    "https://i.ibb.co/NgMyd8Gw/bridexx-planet-1722490900-3424824362941086662-34446236868.jpg",
    "https://i.ibb.co/WWVDH6bt/trad.png",
    "https://i.ibb.co/jktPsRx0/bridexx-planet-1749746089-3653457453774172177-34446236868.jpg",
    "https://i.ibb.co/qM79dwhV/bridexx-planet-1758350269-3725634548773265612-34446236868.jpg",
    "https://i.ibb.co/HT5pKFCk/bridexx-planet-1760555206-3744130902482872147-34446236868.jpg",
    "https://i.ibb.co/KxYGWn1c/m-a-shoots-1765909076-3789042414909390464-47704222456.jpg",
    "https://i.ibb.co/pr34znPy/m-a-shoots-1765909076-3789042414892599543-47704222456.jpg",
  ];

  const nextLook = () => setActiveLook((prev) => (prev + 1) % looks.length);
  const prevLook = () => setActiveLook((prev) => (prev - 1 + looks.length) % looks.length);

  // Hero Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Our Looks Slider Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      nextLook();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Testimonials Slider Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-brand-offwhite selection:bg-brand-charcoal selection:text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen lg:h-[125vh] overflow-hidden flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        </AnimatePresence>


        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 z-10">
          <motion.h2 
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-[32px] md:text-[45px] font-sans font-bold uppercase tracking-tight mb-12 text-center"
          >
            {slides[currentSlide].title}
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/shop"
              className="px-12 py-4 bg-transparent border border-white text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-brand-charcoal transition-all duration-500 rounded-sm flex items-center gap-3 group"
            >
              Explore Collection <ArrowRight size={16} className="lg:group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* QUICK LINK CARDS SECTION */}
      <section className="py-32 bg-[#F8F8F8] border-b border-brand-charcoal/5 px-6 md:px-12 lg:px-16 w-full">
        <div className="w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-24 max-w-4xl"
          >
             <span className="inline-block px-4 py-1.5 bg-white rounded-full text-brand-charcoal text-[10px] uppercase tracking-[0.2em] font-sans font-bold shadow-sm mb-8">Services</span>
             <h2 className="text-brand-charcoal text-5xl md:text-8xl font-sans font-bold tracking-tight leading-[1] md:leading-[0.95]">
                Start Your <br />
                <span className="text-brand-charcoal/40 font-light">Bridal Journey!</span>
             </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/book-consultation" className="group bg-white p-10 md:p-14 rounded-[3rem] border border-brand-charcoal/5 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 relative flex flex-col justify-between h-[450px] overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-14">
                    <span className="text-7xl md:text-8xl font-sans font-bold text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-colors duration-500 italic">01</span>
                    <div className="w-16 h-16 text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-all duration-500 absolute -top-4 -right-4">
                      <CalendarCheck size={80} strokeWidth={1} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-brand-charcoal mb-4 tracking-tight">Book a Consultation</h3>
                  <p className="text-brand-charcoal/50 text-base leading-relaxed max-w-[280px] italic">Schedule a one-on-one session with our expert stylists to find your dream gown.</p>
                </div>
                <div className="flex items-center gap-2 text-brand-charcoal font-bold text-xs uppercase tracking-widest relative z-10 lg:group-hover:gap-4 transition-all duration-300">
                  Book Now <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/price-guide" className="group bg-white p-10 md:p-14 rounded-[3rem] border border-brand-charcoal/5 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 relative flex flex-col justify-between h-[450px] overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-14">
                    <span className="text-7xl md:text-8xl font-sans font-bold text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-colors duration-500 italic">02</span>
                    <div className="w-16 h-16 text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-all duration-500 absolute -top-4 -right-4">
                      <Tag size={80} strokeWidth={1} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-brand-charcoal mb-4 tracking-tight">Price Guide</h3>
                  <p className="text-brand-charcoal/50 text-base leading-relaxed max-w-[280px] italic">Explore transparent pricing designed for every unique bridal vision and budget.</p>
                </div>
                <div className="flex items-center gap-2 text-brand-charcoal font-bold text-xs uppercase tracking-widest relative z-10 lg:group-hover:gap-4 transition-all duration-300">
                  View Prices <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/our-process" className="group bg-white p-10 md:p-14 rounded-[3rem] border border-brand-charcoal/5 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 relative flex flex-col justify-between h-[450px] overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-14">
                    <span className="text-7xl md:text-8xl font-sans font-bold text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-colors duration-500 italic">03</span>
                    <div className="w-16 h-16 text-brand-charcoal/5 lg:group-hover:text-brand-charcoal/10 transition-all duration-500 absolute -top-4 -right-4">
                      <ClipboardList size={80} strokeWidth={1} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-brand-charcoal mb-4 tracking-tight">Our Process</h3>
                  <p className="text-brand-charcoal/50 text-base leading-relaxed max-w-[280px] italic">Learn exactly what to expect from your first visit through to the final fitting.</p>
                </div>
                <div className="flex items-center gap-2 text-brand-charcoal font-bold text-xs uppercase tracking-widest relative z-10 lg:group-hover:gap-4 transition-all duration-300">
                  Learn More <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* OUR LOOKS SECTION */}
      <section className="py-32 bg-white flex flex-col items-center overflow-hidden">
        <div className="text-center mb-16 px-4">
          <h2 className="text-black text-3xl md:text-4xl font-sans font-bold uppercase tracking-[0.2em] mb-2">Our Looks</h2>
          <p className="text-brand-charcoal/60 font-sans text-sm uppercase tracking-[0.3em]">prom, bridal and custom piece</p>
        </div>
        
        <div className="w-full relative flex items-center justify-center h-[500px] md:h-[650px] perspective-[1500px] touch-none">
          <AnimatePresence mode="popLayout">
            {looks.map((look, index) => {
              // Circular distance calculation for infinite loop effect
              let diff = index - activeLook;
              const len = looks.length;
              
              if (diff > len / 2) diff -= len;
              if (diff < -len / 2) diff += len;
              
              const absDiff = Math.abs(diff);
              
              // Only show visible ones for performance
              if (absDiff > 2.5) return null;

              return (
                <motion.div
                  key={`look-item-${look.slice(-15)}-${index}`}
                  style={{
                    perspective: 1000,
                  }}
                  initial={false}
                  animate={{
                    x: diff * (window.innerWidth < 768 ? 160 : 300),
                    scale: 1 - absDiff * 0.18,
                    rotateY: diff * -35,
                    zIndex: 10 - Math.round(absDiff * 2), // Rounding to avoid half-z-indexes
                    opacity: 1 - absDiff * 0.4,
                    filter: `grayscale(${absDiff * 50}%) blur(${absDiff * 2}px)`,
                  }}
                  whileHover={{ 
                    scale: Math.abs(diff) < 0.1 ? 1.02 : 1 - absDiff * 0.15,
                    transition: { duration: 0.3 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 50) prevLook();
                    else if (info.offset.x < -50) nextLook();
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20,
                    mass: 1
                  }}
                  className="absolute w-[260px] md:w-[450px] aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing bg-brand-charcoal"
                  onClick={() => setActiveLook(index)}
                >
                  <img 
                    src={look} 
                    alt={`Look ${index + 1}`} 
                    className="w-full h-full object-cover pointer-events-none" 
                  />
                  {absDiff === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-12 z-20">
           <button 
              onClick={prevLook}
              className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-500 shadow-sm"
              aria-label="Previous look"
           >
              <ChevronLeft size={24} />
           </button>
           <button 
              onClick={nextLook}
              className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all duration-500 shadow-sm"
              aria-label="Next look"
           >
              <ChevronRight size={24} />
           </button>
        </div>

        <div className="mt-16">
          <Link 
            to="/shop" 
            className="px-10 py-4 border border-brand-charcoal/10 text-brand-charcoal text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-brand-charcoal hover:text-white transition-all duration-500 rounded-sm inline-flex items-center gap-2 group"
          >
            Explore the Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-brand-charcoal text-5xl md:text-8xl font-sans font-bold tracking-tight leading-[1] md:leading-[0.95]">
               What Our <br className="md:hidden" />
               <span className="text-brand-charcoal/40 font-light italic">Brides Say</span>
            </h2>
            <p className="text-brand-charcoal/40 text-[10px] tracking-[0.4em] uppercase font-black mt-8">Real stories from real Nigerian brides.</p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden relative rounded-2xl bg-[#F8F8F8] border border-brand-charcoal/5 px-8 md:px-16 pt-12 pb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={`hero-star-${currentTestimonial}-${i}`} size={12} className="fill-brand-charcoal text-brand-charcoal" />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl text-brand-charcoal/70 italic font-light leading-relaxed mb-8 max-w-2xl">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  
                  <div className="mt-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-brand-charcoal mb-1 uppercase">{testimonials[currentTestimonial].name}</h3>
                    <p className="text-[8px] tracking-[0.3em] text-brand-charcoal/30 font-bold uppercase">{testimonials[currentTestimonial].role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4">
                <button 
                  onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2 text-brand-charcoal/20 hover:text-brand-charcoal transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={`test-bullet-${i}`}
                      onClick={() => setCurrentTestimonial(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentTestimonial === i ? 'bg-brand-charcoal w-4' : 'bg-brand-charcoal/10'}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="p-2 text-brand-charcoal/20 hover:text-brand-charcoal transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1800px] mx-auto">
          <div className="px-6 mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="text-brand-charcoal text-3xl md:text-4xl font-sans font-bold tracking-tight mb-2">Follow Our Journey</h2>
              <p className="text-brand-charcoal/40 text-[10px] uppercase tracking-[0.4em] font-medium">@bridexx.planet on Instagram</p>
            </div>
            <a 
              href="https://instagram.com/bridexx.planet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-fit mx-auto lg:mx-0 px-6 py-2.5 bg-brand-charcoal text-white text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-brand-rose transition-colors duration-500 flex items-center gap-2 rounded-full"
            >
              Instagram <Instagram size={12} />
            </a>
          </div>

          <div className="relative group">
            {/* Seamless Auto-sliding Row */}
            <div className="flex overflow-hidden relative">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: 40, 
                  ease: "linear", 
                  repeat: Infinity 
                }}
                className="flex gap-4 px-4 whitespace-nowrap"
              >
                {/* Double the images for seamless looping */}
                {[...instagramImages, ...instagramImages].map((img, i) => (
                  <motion.a
                    key={`insta-slide-${i}-${img.slice(-8)}`}
                    whileTap={{ scale: 0.95 }}
                    href="https://instagram.com/bridexx.planet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-brand-offwhite group/img"
                  >
                    <img 
                      src={img} 
                      alt={`Instagram ${i + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/20 lg:opacity-0 lg:group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <Instagram className="text-white" size={20} />
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </div>
            
            {/* Optional gradient fades on edges */}
            <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
