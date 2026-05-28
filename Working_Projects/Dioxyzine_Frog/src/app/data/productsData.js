// --- IMPORT ẢNH NHÓM PLUSHIES 2 MẢNH ---
import p2_01 from '../../assets/Products/Plushies_2/P2_01.jpg';
import p2_02 from '../../assets/Products/Plushies_2/P2_02.jpg';
import p2_03 from '../../assets/Products/Plushies_2/P2_03.jpg';
import p2_04 from '../../assets/Products/Plushies_2/P2_04.jpg';
import p2_05 from '../../assets/Products/Plushies_2/P2_05.jpg';
import p2_06 from '../../assets/Products/Plushies_2/P2_06.jpg';
import p2_c01 from '../../assets/Products/Plushies_2/P2_Collection_01.jpg';
import p2_c02 from '../../assets/Products/Plushies_2/P2_Collection_02.jpg';
import p2_c03 from '../../assets/Products/Plushies_2/P2_Collection_03.jpg';

// --- IMPORT ẢNH NHÓM PLUSHIES 3 MẢNH ---
import p3_01 from '../../assets/Products/Plushies_3/P3_01.jpg';
import p3_02 from '../../assets/Products/Plushies_3/P3_02.jpg';
import p3_03 from '../../assets/Products/Plushies_3/P3_03.jpg';
import p3_04 from '../../assets/Products/Plushies_3/P3_04.jpg';
import p3_05 from '../../assets/Products/Plushies_3/P3_05.jpg';

// --- IMPORT ẢNH NHÓM DOLL 2D (IN) ---
import doll_in_01 from '../../assets/Products/Doll2D_In/DollIn_01.jpg';
import doll_in_02 from '../../assets/Products/Doll2D_In/DollIn_02.jpg';
import doll_in_03 from '../../assets/Products/Doll2D_In/DollIn_03.jpg';
import doll_in_04 from '../../assets/Products/Doll2D_In/DollIn_04.jpg';
import doll_in_05 from '../../assets/Products/Doll2D_In/DollIn_05.jpg';
import doll_in_06 from '../../assets/Products/Doll2D_In/DollIn_06.jpg';
import doll_in_07 from '../../assets/Products/Doll2D_In/DollIn_07.jpg';

// --- IMPORT ẢNH NHÓM DOLL 2D (THÊU) ---
import doll_theu_01 from '../../assets/Products/Doll2D_Thêu/DollTheu_01.jpg';
import doll_theu_02 from '../../assets/Products/Doll2D_Thêu/DollTheu_02.jpg';
import doll_theu_03 from '../../assets/Products/Doll2D_Thêu/DollTheu_03.jpg';
import doll_theu_04 from '../../assets/Products/Doll2D_Thêu/DollTheu_04.jpg';
import doll_theu_05 from '../../assets/Products/Doll2D_Thêu/DollTheu_05.jpg';
import doll_theu_06 from '../../assets/Products/Doll2D_Thêu/DollTheu_06.jpg';
import doll_theu_07 from '../../assets/Products/Doll2D_Thêu/DollTheu_07.jpg';

export const productsData = [
  {
    id: 'plushie-2-manh',
    title: { vi: 'Custom Plushie 2 Mảnh', en: 'Custom 2-Piece Plushie' },
    category: ['Plushie', 'Customize'],
    moq: 1,
    description: { 
      vi: 'Sản phẩm gấu bông gối ôm in vải Velboa 2 chiều cao cấp, mặc định nhồi bông căng tròn mập mạp.',
      en: 'Premium 2-way Velboa printed plushie, fully stuffed. Perfect for gifts and exclusive merch.' 
    },
    image: p2_01, 
    images: [p2_01, p2_02, p2_03, p2_04, p2_05, p2_06, p2_c01, p2_c02, p2_c03], 
    sizes: [
      { key: '5', label: '5cm' }, { key: '10', label: '10cm' }, { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }, { key: '25', label: '25cm' }, { key: '30', label: '30cm' },
      { key: '40', label: '40cm' }, { key: '50', label: '50cm' }, { key: '60', label: '60cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [20, 40, 55, 70, 98, 125, 150, 250, 350] },
      { min: 11, max: 50, prices: [19, 37, 78, 67, 94, 120, 145, 245, 340] },
      { min: 51, max: 100, prices: [18, 35, 73, 65, 90, 115, 140, 240, 330] },
      { min: 101, max: 500, prices: [17, 33, 68, 60, 85, 110, 130, 230, 310] },
      { min: 501, max: 1000, prices: [16, 32, 65, 55, 78, 100, 120, 220, 290] },
      { min: 1001, max: Infinity, prices: [15, 30, 60, 50, 70, 90, 110, 200, 270] }
    ],
    addons: { phuKien: [0, 5, 5, 7, 10, 10, 15, 25, 35] }, // X -> 0
    note: { vi: 'In vải velboa 2 chiều.', en: 'Printed on 2-way velboa fabric.' }
  },
  {
    id: 'plushie-3-manh',
    title: { vi: 'Custom Plushie 3 Mảnh', en: 'Custom 3-Piece Plushie' },
    category: ['Plushie', 'Customize'],
    moq: 1,
    description: {
      vi: 'Dòng plushie cấu trúc khối lập thể 3 mảnh phức tạp. Form dáng đứng chuẩn, ôm tay.',
      en: '3D structured plushie, carefully sewn for character accuracy and great hugging form.'
    },
    image: p3_01,
    images: [p3_01, p3_02, p3_03, p3_04, p3_05],
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }, { key: '40', label: '40cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [65, 83, 100, 123, 145, 190] },
      { min: 11, max: 50, prices: [62, 78, 93, 114, 135, 176] },
      { min: 51, max: 100, prices: [59, 73, 87, 108, 128, 168] },
      { min: 101, max: 500, prices: [55, 68, 80, 100, 120, 160] },
      { min: 501, max: 1000, prices: [53, 65, 75, 95, 115, 155] },
      { min: 1001, max: Infinity, prices: [50, 60, 70, 90, 110, 150] }
    ],
    addons: { phuKien: [5, 5, 7, 10, 10, 15] },
    note: { vi: 'Mặc định nhồi căng bông.', en: 'Fully stuffed by default.' }
  },
  {
    id: 'doll-2d-in',
    title: { vi: 'Custom Doll 2D In', en: 'Custom 2D Printed Doll' },
    category: ['Doll', 'Customize'],
    moq: 1,
    description: {
      vi: 'Búp bê Doll 2D in nhiệt sắc nét, thể hiện chi tiết màu sắc rực rỡ và chính xác nhất với bản vẽ gốc.',
      en: 'High-definition heat-printed 2D doll, reproducing vibrant colors perfectly from the original art.'
    },
    image: doll_in_01,
    images: [doll_in_01, doll_in_02, doll_in_03, doll_in_04, doll_in_05, doll_in_06, doll_in_07],
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }, { key: '40', label: '40cm' },
      { key: '50', label: '50cm' }, { key: '60', label: '60cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [65, 83, 100, 123, 145, 190, 280, 400] },
      { min: 11, max: 50, prices: [62, 78, 93, 114, 135, 176, 270, 380] },
      { min: 51, max: 100, prices: [59, 73, 87, 108, 128, 168, 260, 360] },
      { min: 101, max: 500, prices: [55, 68, 80, 100, 120, 160, 250, 340] },
      { min: 501, max: 1000, prices: [53, 65, 75, 95, 115, 155, 240, 320] },
      { min: 1001, max: Infinity, prices: [50, 60, 70, 90, 110, 150, 230, 300] }
    ],
    addons: { phuKien: [5, 5, 7, 10, 10, 15, 25, 35] },
    note: { vi: 'Mặc định nhồi căng bông.', en: 'Fully stuffed by default.' }
  },
  {
    id: 'doll-2d-theu',
    title: { vi: 'Custom Doll 2D Thêu', en: 'Custom 2D Embroidered Doll' },
    category: ['Doll', 'Customize'],
    moq: 1,
    description: {
      vi: 'Sản phẩm Doll thêu máy kĩ thuật cao trên nền vải lông nhung 1mm siêu mịn mượt. Tối đa 3 màu chỉ thêu tinh xảo.',
      en: 'High-tech machine embroidered doll on 1mm super soft velvet fabric. Max 3 thread colors.'
    },
    image: doll_theu_02, 
    images: [doll_theu_01, doll_theu_02, doll_theu_03, doll_theu_04, doll_theu_05, doll_theu_06, doll_theu_07],
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [250, 260, 270, 295, 320] },
      { min: 11, max: 50, prices: [150, 175, 200, 225, 250] },
      { min: 51, max: 100, prices: [110, 130, 150, 160, 170] },
      { min: 101, max: 500, prices: [70, 85, 100, 110, 120] },
      { min: 501, max: 1000, prices: [60, 70, 80, 90, 100] },
      { min: 1001, max: Infinity, prices: [50, 60, 70, 80, 90] }
    ],
    addons: { phuKien: [5, 10, 15, 20, 25] },
    note: { vi: 'Thêu vải lông nhung 1mm, max 3 màu chỉ.', en: 'Embroidery on 1mm velvet, max 3 colors.' }
  },
  {
    id: 'dakimakura',
    title: { vi: 'Gối ôm Dakimakura', en: 'Dakimakura Body Pillow' },
    category: ['Customize'],
    moq: 1,
    description: {
      vi: 'Gối ôm dài Anime Dakimakura in sắc nét 2 mặt, mực in bền màu không phai.',
      en: 'Anime long body pillow Dakimakura, 2-sided crisp print, fade-resistant ink.'
    },
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b355040?w=800&h=1000&fit=crop', 
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b355040?w=800&h=1000&fit=crop'],
    sizes: [
      { key: '150', label: '150x40cm' }, { key: '160', label: '160x50cm' }, { key: '180', label: '180x50cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [120, 140, 160] },
      { min: 11, max: 50, prices: [115, 135, 150] },
      { min: 51, max: 100, prices: [110, 130, 140] },
      { min: 101, max: 500, prices: [100, 120, 130] },
      { min: 501, max: 1000, prices: [90, 110, 120] },
      { min: 1001, max: Infinity, prices: [80, 100, 110] }
    ],
    addons: { phuKien: [100, 100, 100] },
    note: { vi: 'Phụ kiện: Ruột gối căng phồng.', en: 'Add-on: Inner fluffy pillow core.' }
  }
];