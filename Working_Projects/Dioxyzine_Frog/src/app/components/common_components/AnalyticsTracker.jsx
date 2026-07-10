import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Báo cáo cho Google Analytics mỗi khi URL thay đổi
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: location.pathname + location.search,
      });
    }

    // Báo cáo cho Meta Pixel mỗi khi URL thay đổi
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null; // Component này tàng hình, không hiển thị gì ra màn hình cả
}