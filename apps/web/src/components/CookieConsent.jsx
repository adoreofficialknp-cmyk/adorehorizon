
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { hasAnsweredConsent, setConsent } from '@/utils/privacyConsent';
import { initGA } from '@/utils/analytics';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to not block initial render
    const timer = setTimeout(() => {
      if (!hasAnsweredConsent()) {
        setIsVisible(true);
      } else {
        // If already consented previously, initialize GA
        initGA();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setIsVisible(false);
    initGA();
  };

  const handleDecline = () => {
    setConsent(false);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-card border border-border shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-1">We value your privacy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto">
                Decline Optional
              </Button>
              <Button onClick={handleAccept} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                Accept All
              </Button>
            </div>
            
            <button 
              onClick={handleDecline}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
