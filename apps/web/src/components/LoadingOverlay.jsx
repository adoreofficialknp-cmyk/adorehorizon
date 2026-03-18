
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLoadingAnimation from './PremiumLoadingAnimation';

const LoadingOverlay = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <PremiumLoadingAnimation size={80} />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 text-[#D4AF37] font-serif tracking-widest text-sm uppercase"
          >
            Curating Elegance
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
