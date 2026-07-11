import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, image, url }) {
  const siteName = "Dioxyzine Frog";
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDesc = description || "Transforming your creative layouts and art concepts into premium high-quality handmade plush items.";// Ảnh mặc định lúc chia sẻ link Trang chủ (Sếp thay link ảnh Logo/Banner xưởng của sếp vào đây nhé)
  const finalImage = image || "https://res.cloudinary.com/dghydqkka/image/upload/DioxyzineFrog_Database/Avatar.jpg"; 
  const finalUrl = url || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />

      {/* Open Graph Facebook, Zalo, Discord*/}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}