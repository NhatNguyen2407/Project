import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function PixelTracker() {
  const location = useLocation();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Chỉ khởi tạo Pixel 1 lần duy nhất khi web vừa load
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
    // Mỗi khi URL thay đổi (khách chuyển trang), bắn tín hiệu View trang mới
    if (hasInitialized.current) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.pageView();
        });
    }
  }, [location.pathname]); // Theo dõi sự thay đổi của đường dẫn URL

  return null; // Component này chạy ngầm, không hiển thị gì lên giao diện
}