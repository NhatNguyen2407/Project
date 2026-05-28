import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';

const pricingData = [
  {
    title: 'PLUSHIE 2 MẢNH',
    sizes: ['5x5cm', '10x10cm', '20x20cm', '30x30cm', '40x40cm'],
    rows: [
      { qty: '1-10', prices: ['20k', '40k', '70k', '125k', '150k'] },
      { qty: '10-100', prices: ['18.5k', '35k', '65k', '120k', '145k'] },
      { qty: '100-1000', prices: ['16.5k', '33k', '60k', '110k', '135k'] },
      { qty: '>1000', prices: ['15.5k', '30k', '50k', '90k', '110k'] },
    ],
    addons: [
      { name: 'Thêm tai đuôi', prices: ['X', '10k', '10k', '25k', '35k'] },
      { name: 'Thêm chíp chíp', prices: ['5k', '5k', '5k', '5k', '5k'] },
    ],
    note: 'In vải velboa 2 chiều.'
  },
  {
    title: 'PLUSHIE 3 MẢNH & DOLL 2D (IN)',
    sizes: ['10cm', '15cm', '20cm', '30cm', '40cm'],
    rows: [
      { qty: '1-10', prices: ['65k', '83k', '100k', '145k', '190k'] },
      { qty: '10-100', prices: ['61.5k', '78k', '93k', '135k', '176k'] },
      { qty: '>100', prices: ['55k', '68k', '80k', '120k', '160k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['5k', '5k', '7k', '10k', '15k'] },
    ],
    note: 'Mặc định nhồi căng bông.\nKhông thể may các nét chia nhọn, vụn, gấp khúc, tia nhiều.\nCheck file với shop trước khi đặt.'
  },
  {
    title: 'DOLL 2D THÊU',
    sizes: ['10cm', '15cm', '20cm'],
    rows: [
      { qty: '1-10', prices: ['135k', '144k', '153k'] },
      { qty: '10-100', prices: ['91.5k', '99.75k', '108k'] },
      { qty: '>100', prices: ['70k', '76.5k', '83k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['5k', '5k', '7k'] },
    ],
    note: 'Thêu vải lông nhung 1mm, max 3 màu chỉ.\nInbox shop chọn màu vải nền. Mặc định nhồi căng bông.\nKhông thể may các nét chia nhọn, vụn, gấp khúc, tia nhiều.\nCheck file với shop trước khi đặt. Chưa gồm phụ phí chi tiết thêu.'
  }
];

export function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-5xl md:text-7xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">
            BẢNG GIÁ
          </h1>
          <p className="text-lg text-[var(--primary)] font-semibold uppercase tracking-widest">
            Bảng giá tham khảo các hạng mục
          </p>
        </motion.div>

        <div className="space-y-20">
          {pricingData.map((table, tIndex) => (
            <motion.div 
              key={tIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: tIndex * 0.1 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] relative overflow-hidden"
            >
              {/* Header của từng bảng */}
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl md:text-4xl text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.5)] bg-[var(--cyber-black)] inline-block px-8 py-3 rounded-full border border-[var(--border)]">
                  {table.title}
                </h2>
              </div>

              {/* Bảng giá chính */}
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-[var(--primary)]/50 text-[var(--silver-gray)] font-bold">Số lượng</th>
                      {table.sizes.map((size, sIndex) => (
                        <th key={sIndex} className="p-4 border-b-2 border-[var(--primary)]/50 text-white font-bold">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rIndex) => (
                      <tr key={rIndex} className="hover:bg-[var(--primary)]/10 transition-colors">
                        <td className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)] font-medium">{row.qty}</td>
                        {row.prices.map((price, pIndex) => (
                          <td key={pIndex} className="p-4 border-b border-[var(--border)] text-white">{price}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bảng giá Phụ kiện */}
              <div className="mt-8 overflow-x-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-heading text-xl text-[var(--primary)] tracking-wide">Phụ kiện</h3>
                  <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <table className="w-full text-center border-collapse">
                  <tbody>
                    {table.addons.map((addon, aIndex) => (
                      <tr key={aIndex} className="bg-[var(--cyber-black)]/50">
                        <td className="p-4 border-b border-[var(--border)] text-[var(--primary)] font-semibold w-1/4 sm:w-auto text-left pl-6">{addon.name}</td>
                        {addon.prices.map((price, pIndex) => (
                          <td key={pIndex} className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)]">{price}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lưu ý (Note) */}
              <div className="mt-8 bg-[var(--cyber-black)] rounded-2xl p-6 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2 justify-center text-[var(--primary)]">
                  <Info className="w-5 h-5" />
                  <h4 className="font-heading text-xl">Lưu ý</h4>
                </div>
                <p className="text-sm text-[var(--silver-gray)] text-center whitespace-pre-line leading-relaxed">
                  {table.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}