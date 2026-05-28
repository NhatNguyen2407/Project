// Database tập trung cho toàn bộ sản phẩm của Dioxyzine Frog
export const productsData = [
  {
    id: 'plushie-2-manh',
    title: 'Custom Plushie 2 Mảnh',
    category: ['Plushie', 'Customize'],
    moq: 1,
    description: 'Sản phẩm gấu bông gối ôm in vải Velboa 2 chiều cao cấp, mặc định nhồi bông căng tròn mập mạp. Thích hợp làm quà tặng, merchandise độc quyền.',
    image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=800&h=1000&fit=crop',
    pricingType: '2-manh',
    sizes: [
      { key: '5x5', label: '5x5cm' },
      { key: '10x10', label: '10x10cm' },
      { key: '20x20', label: '20x20cm' },
      { key: '30x30', label: '30x30cm' },
      { key: '40x40', label: '40x40cm' }
    ],
    // Ma trận giá dựa trên mốc số lượng và index của kích thước tương ứng [5x5, 10x10, 20x20, 30x30, 40x40]
    priceBrackets: [
      { min: 1, max: 9, prices: [20, 40, 70, 125, 150] },
      { min: 10, max: 99, prices: [18.5, 35, 65, 120, 145] },
      { min: 100, max: 999, prices: [16.5, 33, 60, 110, 135] },
      { min: 1000, max: Infinity, prices: [15.5, 30, 50, 90, 110] }
    ],
    // Cấu trúc giá phụ kiện đi kèm theo index kích thước
    addons: {
      taiDuoi: [0, 10, 10, 25, 35], // 'X' coi như bằng 0k
      chipChip: [5, 5, 5, 5, 5]
    },
    note: 'In vải velboa 2 chiều. Mặc định nhồi căng bông béo ú.'
  },
  {
    id: 'plushie-3-manh',
    title: 'Custom Plushie 3 Mảnh / Doll 2D In',
    category: ['Plushie', 'Doll', 'Customize'],
    moq: 1,
    description: 'Dòng plushie cấu trúc khối lập thể 3 mảnh phức tạp hoặc búp bê Doll 2D in nhiệt sắc nét. Form dáng đứng chuẩn, ôm tay.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop',
    pricingType: '3-manh-in',
    sizes: [
      { key: '10', label: '10cm' },
      { key: '15', label: '15cm' },
      { key: '20', label: '20cm' },
      { key: '30', label: '30cm' },
      { key: '40', label: '40cm' }
    ],
    priceBrackets: [
      { min: 1, max: 9, prices: [65, 83, 100, 145, 190] },
      { min: 10, max: 99, prices: [61.5, 78, 93, 135, 176] },
      { min: 100, max: Infinity, prices: [55, 68, 80, 120, 160] }
    ],
    addons: {
      phuKien: [5, 5, 7, 10, 15]
    },
    note: 'Mặc định nhồi căng bông. Không thể may các nét chia quá nhọn, vụn hoặc gấp khúc nhiều tia. Vui lòng gửi file duyệt trước.'
  },
  {
    id: 'doll-2d-theu',
    title: 'Custom Doll 2D Thêu Cao Cấp',
    category: ['Doll', 'Customize'],
    moq: 1,
    description: 'Sản phẩm Doll thêu máy kĩ thuật cao trên nền vải lông nhung 1mm siêu mịn mượt. Tối đa 3 màu chỉ thêu tinh xảo, biểu cảm sống động.',
    image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&h=1000&fit=crop',
    pricingType: 'doll-theu',
    sizes: [
      { key: '10', label: '10cm' },
      { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }
    ],
    priceBrackets: [
      { min: 1, max: 9, prices: [135, 144, 153] },
      { min: 10, max: 99, prices: [91.5, 99.75, 108] },
      { min: 100, max: Infinity, prices: [70, 76.5, 83] }
    ],
    addons: {
      phuKien: [5, 5, 7]
    },
    note: 'Thêu vải lông nhung 1mm, max 3 màu chỉ. Chưa bao gồm phụ phí chi tiết thêu quá phức tạp. Inbox shop để chọn màu vải nền.'
  }
];