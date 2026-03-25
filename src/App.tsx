import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Instagram, Facebook, Twitter, Home, Gem, Hammer, Phone, Menu, X, Moon, Sun } from 'lucide-react';
import BusinessCard from './components/BusinessCard';

const COLLECTIONS = [
  {
    title: "The Royal Heritage",
    description: "Handcrafted rose gold necklaces inspired by ancient dynasties.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    category: "Necklaces"
  },
  {
    title: "Celestial Glow",
    description: "Diamond encrusted rings that capture the essence of starlight.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    category: "Rings"
  },
  {
    title: "Ethereal Grace",
    description: "Delicate platinum earrings for the modern minimalist.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    category: "Earrings"
  }
];

const FallingJewelsMenu = () => {
  const [jewels, setJewels] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJewels(prev => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          x: Math.random() * 100,
          delay: 0,
          duration: 3 + Math.random() * 4,
          size: 12 + Math.random() * 24
        }
      ]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {jewels.map((j) => (
          <motion.div
            key={j.id}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: j.duration, ease: "linear" }}
            style={{ left: `${j.x}%` }}
            className="absolute text-dusty-rose/30 dark:text-primary-pink-dark/20"
          >
            <Gem size={j.size} fill="currentColor" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [droppingJewels, setDroppingJewels] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const triggerJewelDrop = () => {
    const newJewel = { id: Date.now(), x: Math.random() * 80 + 10 };
    setDroppingJewels(prev => [...prev, newJewel]);
    setTimeout(() => {
      setDroppingJewels(prev => prev.filter(j => j.id !== newJewel.id));
    }, 2000);
  };

  const scrollToSection = (id: string, isFromBottomMenu: boolean = false) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    if (isFromBottomMenu) {
      triggerJewelDrop();
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 pb-32 md:pb-0">
      {/* Jewellery Drop Animation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
        <AnimatePresence>
          {droppingJewels.map((jewel) => (
            <motion.div
              key={jewel.id}
              initial={{ y: -100, opacity: 0, rotate: 0 }}
              animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeIn" }}
              style={{ left: `${jewel.x}%` }}
              className="absolute text-dusty-rose drop-shadow-[0_0_10px_rgba(232,169,169,0.8)]"
            >
              <Gem size={48} fill="currentColor" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[110] px-6 py-8 flex justify-between items-center bg-blush dark:bg-dark-bg/90 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-sm">
        <FallingJewelsMenu />
        <div 
          className="text-2xl font-serif tracking-tighter cursor-pointer text-dusty-rose dark:text-primary-pink-dark active:text-rose-gold transition-colors relative z-10" 
          onClick={() => scrollToSection('hero')}
        >
          ADORE
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12 text-[10px] uppercase tracking-[0.3em] font-bold text-text-primary-light dark:text-text-primary-dark">
          <button 
            onClick={() => scrollToSection('collections')} 
            className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors uppercase cursor-pointer"
          >
            Collections
          </button>
          <button 
            onClick={() => scrollToSection('philosophy')} 
            className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors uppercase cursor-pointer"
          >
            Bespoke
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors uppercase cursor-pointer"
          >
            Contact
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-dusty-rose/20 active:bg-dusty-rose/30 transition-colors text-text-primary-light dark:text-primary-pink-dark"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-dusty-rose/20 text-text-primary-light dark:text-primary-pink-dark"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="cursor-pointer text-text-primary-light dark:text-primary-pink-dark" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[120] bg-blush dark:bg-dark-surface p-10 flex flex-col justify-center items-center gap-12"
          >
            <FallingJewelsMenu />
            <button 
              className="absolute top-8 right-8 text-text-primary-light dark:text-primary-pink-dark active:text-dusty-rose transition-colors z-10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>
            <div className="flex flex-col items-center gap-8 text-2xl font-serif italic text-text-primary-light dark:text-text-primary-dark relative z-10">
              <button onClick={() => scrollToSection('hero')} className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors">Home</button>
              <button onClick={() => scrollToSection('collections')} className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors">Collections</button>
              <button onClick={() => scrollToSection('philosophy')} className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors">Bespoke</button>
              <button onClick={() => scrollToSection('contact')} className="active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors">Contact</button>
            </div>
            <div className="flex gap-10 mt-12 relative z-10">
              <Instagram size={32} className="text-[#000000] dark:text-primary-pink-dark" />
              <Facebook size={32} className="text-[#000000] dark:text-primary-pink-dark" />
              <Twitter size={32} className="text-[#000000] dark:text-primary-pink-dark" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&q=80&w=1920" 
            alt="Premium Diamond Jewelry Set" 
            className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] mb-6 block text-text-primary-light dark:text-primary-pink-dark font-bold">Established in Kanpur</span>
            <h1 className="text-6xl md:text-9xl font-serif mb-8 leading-none text-text-primary-light dark:text-text-primary-dark">
              Timeless <br />
              <span className="italic text-dusty-rose dark:text-primary-pink-dark">Elegance</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <button 
                onClick={() => scrollToSection('collections')}
                className="px-10 py-4 rose-gold-gradient text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all duration-500 cursor-pointer rounded-xl shadow-2xl shadow-dusty-rose/40 dark:shadow-primary-pink-dark/20"
              >
                Explore Collection
              </button>
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-text-primary-light dark:text-primary-pink-dark font-bold cursor-pointer group">
                Watch Film <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
          <div className="w-[1px] h-20 bg-dusty-rose"></div>
          <span className="text-[8px] uppercase tracking-[0.3em] text-dusty-rose vertical-rl">Scroll</span>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-4 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[3/4] overflow-hidden rounded-3xl border border-dusty-rose/20 shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800" 
              alt="Professional Jewellery Maker at Work" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rose-gold-gradient rounded-full flex items-center justify-center text-white p-8 text-center text-[10px] uppercase tracking-widest leading-relaxed shadow-2xl z-20">
            Crafted with passion since 1995
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl mb-8 leading-tight text-text-primary-light dark:text-text-primary-dark font-bold">
            The Art of <br />
            <span className="italic font-light text-dusty-rose dark:text-primary-pink-dark">Adornment</span>
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-8 text-lg font-medium">
            At Adore, we believe every piece of jewellery tells a story. Our master craftsmen in Kanpur blend traditional techniques with contemporary design to create masterpieces that transcend generations.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1"><Sparkles size={18} className="text-dusty-rose dark:text-primary-pink-dark" /></div>
              <div>
                <h4 className="font-serif text-xl mb-1 text-text-primary-light dark:text-text-primary-dark font-bold">Ethically Sourced</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-bold">Only the finest conflict-free diamonds and pure gold.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1"><Sparkles size={18} className="text-dusty-rose dark:text-primary-pink-dark" /></div>
              <div>
                <h4 className="font-serif text-xl mb-1 text-text-primary-light dark:text-text-primary-dark font-bold">Bespoke Design</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-bold">Your vision, our craftsmanship. Truly one-of-a-kind.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Collection Gallery */}
      <section id="collections" className="py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div>
              <span className="text-dusty-rose dark:text-primary-pink-dark text-[10px] uppercase tracking-[0.5em] mb-4 block font-bold">Curated Selection</span>
              <h2 className="text-5xl md:text-7xl font-serif text-text-primary-light dark:text-text-primary-dark font-bold">The Collections</h2>
            </div>
            <p className="max-w-md text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed font-bold">
              Discover our signature series, where each collection explores a unique facet of beauty and sophistication.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {COLLECTIONS.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden mb-6 relative rounded-2xl border border-dusty-rose/20 dark:border-border-dark shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-dusty-rose dark:text-primary-pink-dark mb-2 block font-bold">{item.category}</span>
                <h3 className="text-2xl font-serif mb-3 text-text-primary-light dark:text-text-primary-dark active:text-dusty-rose dark:active:text-primary-pink-dark transition-colors font-bold">{item.title}</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-bold leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Card Section */}
      <section id="contact" className="py-4 border-t border-dusty-rose/10">
        <BusinessCard />
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-3xl font-serif tracking-tighter text-dusty-rose dark:text-primary-pink-dark">ADORE</div>
          
          <div className="flex gap-8 relative z-10">
            <a href="#" className="p-4 border-2 border-dusty-rose rounded-full active:bg-dusty-rose dark:active:bg-primary-pink-dark transition-all text-[#000000] dark:text-text-primary-dark group"><Instagram size={24} className="group-active:text-white transition-colors" /></a>
            <a href="#" className="p-4 border-2 border-dusty-rose rounded-full active:bg-dusty-rose dark:active:bg-primary-pink-dark transition-all text-[#000000] dark:text-text-primary-dark group"><Facebook size={24} className="group-active:text-white transition-colors" /></a>
            <a href="#" className="p-4 border-2 border-dusty-rose rounded-full active:bg-dusty-rose dark:active:bg-primary-pink-dark transition-all text-[#000000] dark:text-text-primary-dark group"><Twitter size={24} className="group-active:text-white transition-colors" /></a>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark font-bold">
            &copy; 2026 Adore Jewellery. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Bottom Navigation Menu */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] w-full max-w-md px-4">
        <div className="glass-card rounded-full px-8 py-4 flex justify-between items-center shadow-2xl border-border-light dark:border-border-dark">
          <button 
            onClick={() => scrollToSection('hero', true)}
            className="flex flex-col items-center gap-1 text-black active:text-dusty-rose dark:text-text-secondary-dark dark:active:text-primary-pink-dark transition-all duration-300 group cursor-pointer"
          >
            <Home size={18} className="group-active:scale-110 transition-transform" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Home</span>
          </button>
          <button 
            onClick={() => scrollToSection('collections', true)}
            className="flex flex-col items-center gap-1 text-black active:text-dusty-rose dark:text-text-secondary-dark dark:active:text-primary-pink-dark transition-all duration-300 group cursor-pointer"
          >
            <Gem size={18} className="group-active:scale-110 transition-transform" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Gallery</span>
          </button>
          <button 
            onClick={() => scrollToSection('philosophy', true)}
            className="flex flex-col items-center gap-1 text-black active:text-dusty-rose dark:text-text-secondary-dark dark:active:text-primary-pink-dark transition-all duration-300 group cursor-pointer"
          >
            <Hammer size={18} className="group-active:scale-110 transition-transform" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Bespoke</span>
          </button>
          <button 
            onClick={() => scrollToSection('contact', true)}
            className="flex flex-col items-center gap-1 text-black active:text-dusty-rose dark:text-text-secondary-dark dark:active:text-primary-pink-dark transition-all duration-300 group cursor-pointer"
          >
            <Phone size={18} className="group-active:scale-110 transition-transform" />
            <span className="text-[8px] uppercase tracking-widest font-bold">Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
