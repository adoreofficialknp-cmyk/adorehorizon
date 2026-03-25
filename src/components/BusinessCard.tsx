import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, User, Phone, Mail, Sparkles, Gem } from 'lucide-react';

const JEWELRY_ICONS = [Gem, Sparkles];

export default function BusinessCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [fallingJewels, setFallingJewels] = useState<{ id: number; x: number; Icon: any }[]>([]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // Trigger jewelry drop
      const newJewels = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        Icon: JEWELRY_ICONS[Math.floor(Math.random() * JEWELRY_ICONS.length)]
      }));
      setFallingJewels(prev => [...prev, ...newJewels]);
      
      // Cleanup jewels after animation
      setTimeout(() => {
        setFallingJewels(prev => prev.filter(j => !newJewels.find(nj => nj.id === j.id)));
      }, 2000);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-4 overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif italic mb-2 text-text-primary-light dark:text-text-primary-dark font-bold">Connect With Us</h2>
        <p className="text-sm uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark font-bold">Tap to reveal our details</p>
      </div>

      {/* Falling Jewels Animation Layer */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {fallingJewels.map((jewel) => (
            <motion.div
              key={jewel.id}
              initial={{ y: -50, opacity: 0, rotate: 0 }}
              animate={{ 
                y: 800, 
                opacity: [0, 1, 1, 0],
                rotate: 360 
              }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="absolute text-dusty-rose"
              style={{ left: `${jewel.x}%` }}
            >
              <jewel.Icon size={24} strokeWidth={1.5} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div 
        className="relative w-80 h-48 perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <motion.div
          className="w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-surface-light dark:bg-dark-surface rounded-2xl p-6 flex flex-col justify-between border border-border-light dark:border-border-dark shadow-xl overflow-hidden">
            {/* Embossed Jewellery Design Background */}
            <div className="absolute -right-10 -bottom-10 opacity-[0.05] dark:opacity-[0.1] rotate-12 pointer-events-none">
              <Gem size={200} strokeWidth={0.5} className="text-text-primary-light dark:text-text-primary-dark" />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 border border-dusty-rose dark:border-primary-pink-dark rounded-full flex items-center justify-center">
                <span className="text-dusty-rose dark:text-primary-pink-dark font-serif text-xl">A</span>
              </div>
              <div className="text-right">
                <h3 className="text-dusty-rose dark:text-primary-pink-dark font-serif text-2xl tracking-tighter font-bold">ADORE</h3>
                <p className="text-[10px] text-text-secondary-light dark:text-primary-pink-dark tracking-[0.3em] uppercase font-bold">Jewellery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-text-secondary-light dark:text-primary-pink-dark relative z-10">
              <Sparkles size={12} />
              <div className="h-[1px] flex-1 bg-border-light dark:bg-border-dark"></div>
              <Sparkles size={12} />
            </div>
            
            <p className="text-[10px] text-text-secondary-light dark:text-primary-pink-dark text-center tracking-widest uppercase font-bold relative z-10">Luxury Defined</p>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-blush dark:bg-dark-bg rounded-2xl p-6 flex flex-col justify-between border border-border-light dark:border-border-dark shadow-xl rotate-y-180">
            <div>
              <h3 className="text-text-primary-light dark:text-text-primary-dark font-serif text-xl mb-1 font-bold">Shivam</h3>
              <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark tracking-widest uppercase mb-4 font-bold">Owner & Curator</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-text-primary-light dark:text-text-primary-dark font-bold">
                  <MapPin size={14} className="text-dusty-rose dark:text-primary-pink-dark" />
                  <span>Birhana Road, Kanpur</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-primary-light dark:text-text-primary-dark font-bold">
                  <Phone size={14} className="text-dusty-rose dark:text-primary-pink-dark" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-primary-light dark:text-text-primary-dark font-bold">
                  <Mail size={14} className="text-dusty-rose dark:text-primary-pink-dark" />
                  <span>contact@adorejewels.com</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-[8px] text-text-secondary-light dark:text-text-secondary-dark tracking-widest uppercase font-bold">Adore Jewellery</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
