// src/app/data/storeData.js

export const COUNTRY_LIST = [
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
];

export const MOCK_PRODUCTS = [
  { 
    id: 'RDY-01', 
    name: 'Cyber Frog Plushie (Ready to ship)', 
    price: 35.00, 
    category: 'Plushies', 
    stock: 50,
    rating: 5.0,
    sold: '1.2k',
    sizes: [{ label: '10cm', key: '10cm' }, { label: '20cm', key: '20cm' }],
    description: 'Bản nguyên mẫu giới hạn được làm từ vải Velboa 2 chiều cao cấp. Sản phẩm có sẵn, đóng gói và giao hàng ngay trong ngày.',
    image: 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto,w_800/DioxyzineFrog_Database/Products/Custom/Plushies_2/P2_01.jpg' 
  },
  { 
    id: 'RDY-02', 
    name: 'Neon Keychain Set', 
    price: 12.00, 
    category: 'Accessories', 
    stock: 100, 
    rating: 4.8,
    sold: '850',
    sizes: [{ label: 'Free Size', key: 'free' }],
    description: 'Bộ keychain Neon phản quang cực chất dành cho dân mê Cyberpunk.',
    image: 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto,w_800/DioxyzineFrog_Database/Products/Custom/Plushies_2/P2_02.jpg' 
  },
  { 
    id: 'RDY-03', 
    name: 'Dark Theme Enamel Pin', 
    price: 8.50, 
    category: 'Accessories', 
    stock: 0,
    rating: 4.9,
    sold: '3k+',
    sizes: [{ label: 'Standard', key: 'std' }],
    description: 'Ghim cài áo tráng men cao cấp, thiết kế độc quyền.',
    image: 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto,w_800/DioxyzineFrog_Database/Products/Custom/Plushies_2/P2_03.jpg' 
  },
  { 
    id: 'RDY-04', 
    name: 'Limited Velvet Bag', 
    price: 45.00, 
    category: 'Bags', 
    stock: 15, 
    rating: 5.0,
    sold: '124',
    sizes: [{ label: 'Small', key: 's' }, { label: 'Large', key: 'l' }],
    description: 'Túi nhung cao cấp thêu họa tiết 2D sắc nét, form túi cứng cáp.',
    image: 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto,w_800/DioxyzineFrog_Database/Products/Custom/Plushies_2/P2_04.jpg' 
  },
];