
const CONSENT_KEY = 'adore_analytics_consent';

export const getConsent = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONSENT_KEY);
};

export const setConsent = (granted) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  
  // If denied, we could potentially clear cookies here, 
  // but GA4 handles 'denied' state if configured via consent mode.
  if (!granted && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  } else if (granted && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
};

export const withdrawConsent = () => {
  setConsent(false);
};

export const hasAnsweredConsent = () => {
  return getConsent() !== null;
};

export const isConsentGranted = () => {
  return getConsent() === 'granted';
};

// Check for Do Not Track browser setting
export const isDoNotTrackEnabled = () => {
  if (typeof window === 'undefined') return false;
  const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
};
