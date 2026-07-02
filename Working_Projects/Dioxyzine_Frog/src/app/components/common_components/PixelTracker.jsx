import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function PixelTracker() {
  const location = useLocation();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init('1335350432090085', undefined, { autoConfig: true, debug: false });
          hasInitialized.current = true;
          ReactPixel.pageView();
        });
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.pageView();
        });
    }
  }, [location.pathname]);

  return null;
}