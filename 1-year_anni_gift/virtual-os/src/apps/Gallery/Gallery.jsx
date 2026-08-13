import React, { useState } from 'react';
import styles from './Gallery.module.css';

// 1. Import toàn bộ ảnh từ thư mục assets
import us1 from '../../assets/images/us1.jpg';
import us2 from '../../assets/images/us2.jpg';
import us3 from '../../assets/images/us3.jpg';
import us4 from '../../assets/images/us4.jpg';
import her1 from '../../assets/images/her1.jpg';
import her2 from '../../assets/images/her2.jpg';
import her3 from '../../assets/images/her3.jpg';
import her4 from '../../assets/images/her4.jpg';

import pia1 from '../../assets/images/pia1.jpg';
import pia2 from '../../assets/images/pia2.jpg';
import nya1 from '../../assets/images/nyabati1.jpg';
import nya2 from '../../assets/images/nyabati2.jpg';
import pNya1 from '../../assets/images/pyabati.jpg';
import pNya2 from '../../assets/images/pyabati2.jpg';

// 2. Data Ảnh lấy từ project 6 tháng của bro
const MOMENTS_DATA = [
  { id: 'u1', src: us1, caption: 'Biếc hun nhau he' },
  { id: 'u2', src: us2, caption: 'Cũn gọi là cóa đi chộp ảnh Tết he' },
  { id: 'u3', src: us3, caption: 'Trông như đang cầu hôn ý nhể?' },
  { id: 'u4', src: us4, caption: 'Ể, mìn cưới thật á???' },
  { id: 'h1', src: her1, caption: 'Đòi xoa đầu cơ, làm như là Pía í, hứ' },
  { id: 'h2', src: her2, caption: 'Chụp giấu mặt tui đồ' },
  { id: 'h3', src: her3, caption: 'Trông nhây phết xDD' },
  { id: 'h4', src: her4, caption: 'Tấm này trông okay đấy, hớ hớ' }
];

const PETS_DATA = [
  { id: 'p1', src: pia1, caption: 'Pía sao dị tròi?', tag: 'Pía' },
  { id: 'p2', src: pia2, caption: 'Ô chu choa em Pía iuu.', tag: 'Pía' },
  { id: 'n1', src: nya1, caption: 'Nyabati ngáo lém.', tag: 'Nyabati' },
  { id: 'n2', src: nya2, caption: 'Ô chu choa em Nyabati', tag: 'Nyabati' },
  { id: 'pn1', src: pNya1, caption: 'Làm cái gì đâyy?', tag: '2 Đứa' },
  { id: 'pn2', src: pNya2, caption: '2 em này Loafu Loafu.', tag: '2 Đứa' }
];

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('moments');
  const [selectedImg, setSelectedImg] = useState(null); // Để phóng to ảnh

  return (
    <div className={styles.container}>
      
      {/* Cột trái: Sidebar điều hướng (Giống File Explorer) */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>📁 THƯ MỤC</div>
        <button 
          className={`${styles.navBtn} ${activeTab === 'moments' ? styles.active : ''}`}
          onClick={() => setActiveTab('moments')}
        >
          <span>📸</span> Our Moments
        </button>
        <button 
          className={`${styles.navBtn} ${activeTab === 'pets' ? styles.active : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          <span>🐾</span> Our Pets
        </button>
      </div>

      {/* Cột phải: Khung hiển thị ảnh */}
      <div className={styles.content}>
        <div className={styles.topBar}>
          C:\Users\Bibi\Pictures\{activeTab === 'moments' ? 'Our_Moments' : 'Our_Pets'}
        </div>

        <div className={styles.imageGrid}>
          {activeTab === 'moments' && MOMENTS_DATA.map((img) => (
            <div key={img.id} className={styles.imageCard} onClick={() => setSelectedImg(img)}>
              <div className={styles.imgWrapper}>
                <img src={img.src} alt="Kỷ niệm" />
              </div>
              <p className={styles.caption}>{img.caption}</p>
            </div>
          ))}

          {activeTab === 'pets' && PETS_DATA.map((img) => (
            <div key={img.id} className={styles.imageCard} onClick={() => setSelectedImg(img)}>
              <div className={styles.imgWrapper}>
                <img src={img.src} alt="Pet" />
              </div>
              <div className={styles.tag}>{img.tag}</div>
              <p className={styles.caption}>{img.caption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Phóng to Ảnh (Photo Viewer) */}
      {selectedImg && (
        <div className={styles.modalOverlay} onClick={() => setSelectedImg(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImg(null)}>✕</button>
            <img src={selectedImg.src} alt="Phóng to" className={styles.fullImg} />
            <p className={styles.fullCaption}>{selectedImg.caption}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;