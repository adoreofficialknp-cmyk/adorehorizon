
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

const metrics = {};

/**
 * Initialize Core Web Vitals monitoring
 */
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  const logMetric = (metric) => {
    metrics[metric.name] = metric.value;
    
    // In development, log to console
    if (import.meta.env.MODE === 'development') {
      // Only log if it exceeds recommended thresholds to avoid console spam
      const thresholds = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        FCP: 1800,
        TTFB: 600
      };
      
      if (metric.value > thresholds[metric.name]) {
        console.warn(`[Web Vitals] ⚠️ ${metric.name} is poor: ${metric.value.toFixed(2)}`);
      }
    }
    
    // In production, you would send this to your analytics endpoint
    // if (import.meta.env.MODE === 'production') {
    //   sendToAnalytics(metric);
    // }
  };

  try {
    onCLS(logMetric);
    onFID(logMetric);
    onLCP(logMetric);
    onFCP(logMetric);
    onTTFB(logMetric);
  } catch (e) {
    console.error('Failed to initialize web vitals', e);
  }

  // Monitor Memory Usage if available
  if (performance && performance.memory) {
    setInterval(() => {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const usageRatio = usedJSHeapSize / jsHeapSizeLimit;
      if (usageRatio > 0.9 && import.meta.env.MODE === 'development') {
        console.warn(`[Performance] High memory usage: ${(usageRatio * 100).toFixed(1)}%`);
      }
    }, 10000);
  }
};

/**
 * Track page load time
 * @param {string} pageName 
 * @returns {Function} Call this function when page is fully rendered
 */
export const trackPageLoad = (pageName) => {
  if (typeof window === 'undefined') return () => {};
  
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    if (import.meta.env.MODE === 'development' && duration > 1000) {
      console.warn(`[Performance] 🐢 ${pageName} took ${duration.toFixed(2)}ms to render`);
    }
  };
};

/**
 * Track individual component render time
 */
export const trackComponentRender = (componentName, duration) => {
  if (import.meta.env.MODE === 'development' && duration > 50) {
    console.warn(`[Performance] Component ${componentName} render took ${duration.toFixed(2)}ms`);
  }
};

/**
 * Get aggregated performance metrics
 */
export const reportMetrics = () => {
  return { ...metrics };
};
