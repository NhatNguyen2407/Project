import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, image, url }) {
  const siteTitle = title ? `${title} | Dioxyzine Frog` : 'Dioxyzine Frog | Custom Plushies & Merch';
  
  // description
  const defaultDesc = 'Transforming all your creative layouts and art concepts into premium high-quality handmade plush items.';
  const siteDesc = description || defaultDesc;
  
  // banner
  const defaultImage = 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto/DioxyzineFrog_Database/Products/Custom/Doll2D_In/DollIn_39.jpg';
  const siteImage = image || defaultImage;

  return (
    <Helmet>
      {/*browser seo*/}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />

      {/*media content */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || 'https://dioxyzinefrog.com'} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:image" content={siteImage} />

      {/* =======================================================
        [FUTURE UPGRADE: TIKTOK INTEGRATION]
        Hiện tại TikTok khi copy link vẫn đọc thẻ "og:" ở trên.
        Nhưng tương lai nếu chạy Ads Tiktok hoặc gắn giỏ hàng Tiktok Shop, 
        thì sẽ bỏ comment đoạn dưới đây và điền mã của TikTok cung cấp:
        =======================================================
        
        <meta name="tiktok-verify-page" content="TIKTOK_VERIFY_CODE" />
        <meta property="tiktok:app_id" content="YOUR_APP_ID" />
      */}
    </Helmet>
  );
}