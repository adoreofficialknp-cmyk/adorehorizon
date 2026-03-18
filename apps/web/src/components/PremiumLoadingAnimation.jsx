
import React, { useState, useEffect } from 'react';

const PremiumLoadingAnimation = () => {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out at 1.7s (to complete by 2.0s)
    const fadeOutTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1700);

    // Remove from DOM completely at 2.0s
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 backdrop-blur-sm ${
        fadingOut ? 'animate-[fadeOut_0.3s_ease-out_forwards]' : 'animate-[fadeIn_0.3s_ease-in_forwards]'
      }`}
    >
      <div 
        className="relative flex items-center justify-center animate-[shimmer_1.5s_ease-in-out_infinite]"
        style={{ width: 70, height: 70 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-[rotate_2.5s_linear_infinite]"
        >
          <defs>
            {/* Metallic Gold Gradient matching #D4AF37 */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BF953F" />
              <stop offset="25%" stopColor="#FCF6BA" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="75%" stopColor="#FBF5B7" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
          </defs>

          {/* Elegant Crescent Moon Path */}
          <path
            d="M50 10 A40 40 0 1 1 10 50 A30 30 0 1 0 50 10 Z"
            fill="url(#goldGradient)"
          />
        </svg>
      </div>
    </div>
  );
};

export default PremiumLoadingAnimation;
