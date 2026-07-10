import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-CWWCJTSHQX', {
        page_path: location.pathname + location.search,
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null; 
}