import { customList } from 'country-codes-list';

const rawCountryData = customList('countryCode', '{countryCode}|{countryNameEn}|{countryCallingCode}|{flag}');

// 2. Biến đổi dữ liệu thành mảng Object và sắp xếp theo bảng chữ cái ABC
export const COUNTRY_LIST = Object.values(rawCountryData).map(item => {
  const [code, name, dial, flag] = item.split('|');
  return {
    code: code,
    name: name,
    dialCode: `+${dial.split(',')[0]}`, // Lấy mã vùng đầu tiên nếu 1 nước có nhiều mã
    flag: flag
  };
}).sort((a, b) => a.name.localeCompare(b.name));

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
    description: 'Limited prototype crafted from premium 2-way Velboa fabric. In-stock item, packed and dispatched within 24 hours.',
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
    description: 'Ultra-stylish reflective neon keychain set designed for cyberpunk art collectors and enthusiasts.',
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
    description: 'Premium hard enamel pin featuring an exclusive custom design layout and polished metallic finish.',
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
    description: 'Premium velvet storage bag decorated with sharp 2D embroidered patterns and a sturdy structural layout.',
    image: 'https://res.cloudinary.com/dghydqkka/image/upload/q_auto,f_auto,w_800/DioxyzineFrog_Database/Products/Custom/Plushies_2/P2_04.jpg' 
  },
];