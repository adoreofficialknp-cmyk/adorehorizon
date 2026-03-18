
import { useEffect, useRef } from 'react';
import { trackEvent } from './analytics';

/**
 * Hook to track user behavior on a specific page
 * Includes scroll depth and time on page
 */
export const useBehaviorTracking = (pageName) => {
  const maxScrollRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const trackedDepths = useRef(new Set());

  useEffect(() => {
    startTimeRef.current = Date.now();
    trackedDepths.current.clear();
    maxScrollRef.current = 0;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = Math.round((scrollPosition / documentHeight) * 100);

      if (scrollPercentage > maxScrollRef.current) {
        maxScrollRef.current = scrollPercentage;
      }

      const depthsToTrack = [25, 50, 75, 90, 100];
      
      depthsToTrack.forEach(depth => {
        if (scrollPercentage >= depth && !trackedDepths.current.has(depth)) {
          trackedDepths.current.add(depth);
          trackEvent('scroll_depth', {
            page_name: pageName,
            depth_percentage: depth
          });
        }
      });
    };

    // Throttle scroll event
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      
      // Track time on page when component unmounts
      const timeSpentMs = Date.now() - startTimeRef.current;
      const timeSpentSeconds = Math.round(timeSpentMs / 1000);
      
      if (timeSpentSeconds > 2) { // Only track if they stayed more than 2 seconds
        trackEvent('time_on_page', {
          page_name: pageName,
          duration_seconds: timeSpentSeconds,
          max_scroll_percentage: maxScrollRef.current
        });
      }
    };
  }, [pageName]);
};

/**
 * Utility to track specific button/link clicks
 */
export const trackClick = (elementName, elementCategory = 'engagement') => {
  trackEvent('element_click', {
    element_name: elementName,
    element_category: elementCategory
  });
};

/**
 * Utility to track form interactions
 */
export const trackFormInteraction = (formName, action = 'submit') => {
  trackEvent('form_interaction', {
    form_name: formName,
    action: action
  });
};
