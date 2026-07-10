import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, image, url }) {
  // Tên mặc định của website sếp
  const siteName = "Dioxyzine Frog";
  
  // Tự động ghép tên sản phẩm với tên Shop. Nếu không có tên SP thì hiện tên Shop.
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  
  // Mô tả mặc định nếu trang đó không truyền mô tả vào
  const finalDesc = description || "Transforming your creative layouts and art concepts into premium high-quality handmade plush items.";
  
  // Ảnh mặc định lúc chia sẻ link Trang chủ (Sếp thay link ảnh Logo/Banner xưởng của sếp vào đây nhé)
  const finalImage = image || "https://res.cloudinary.com/dghydqkka/image/upload/DioxyzineFrog_Database/Avatar.jpg"; 
  
  // Tự động lấy đường link hiện tại khách đang xem
  const finalUrl = url || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* 🚀 Thẻ chuẩn cho Trình duyệt (Đổi tên trên Tab) */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />

      {/* 🚀 Thẻ Open Graph (Dành cho Facebook, Zalo, Discord...) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />

      {/* 🚀 Thẻ Twitter Card (Dành riêng cho X/Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}