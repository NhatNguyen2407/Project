import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';

const pricingData = [
  {
    title: 'PLUSHIE 2 MẢNH',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '1-10', prices: ['20k', '40k', '55k', '70k', '98k', '125k', '150k', '250k', '350k'] },
      { qty: '11-50', prices: ['19k', '37k', '78k', '67k', '94k', '120k', '145k', '245k', '340k'] },
      { qty: '51-100', prices: ['18k', '35k', '73k', '65k', '90k', '115k', '140k', '240k', '330k'] },
      { qty: '101-500', prices: ['17k', '33k', '68k', '60k', '85k', '110k', '130k', '230k', '310k'] },
      { qty: '501-1000', prices: ['16k', '32k', '65k', '55k', '78k', '100k', '120k', '220k', '290k'] },
      { qty: '>1000', prices: ['15k', '30k', '60k', '50k', '70k', '90k', '110k', '200k', '270k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['X', '5k', '5k', '7k', '10k', '10k', '15k', '25k', '35k'] },
    ],
    note: 'In vải velboa 2 chiều.\nThêm phụ kiện: bao gồm tai đuôi, chíp chíp,...'
  },
  {
    title: 'PLUSHIE 3 MẢNH',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm'],
    rows: [
      { qty: '1-10', prices: ['65k', '83k', '100k', '123k', '145k', '190k'] },
      { qty: '11-50', prices: ['62k', '78k', '93k', '114k', '135k', '176k'] },
      { qty: '51-100', prices: ['59k', '73k', '87k', '108k', '128k', '168k'] },
      { qty: '101-500', prices: ['55k', '68k', '80k', '100k', '120k', '160k'] },
      { qty: '501-1000', prices: ['53k', '65k', '75k', '95k', '115k', '155k'] },
      { qty: '>1000', prices: ['50k', '60k', '70k', '90k', '110k', '150k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['5k', '5k', '7k', '10k', '10k', '15k'] },
    ],
    note: 'Mặc định nhồi căng bông.\nKhông thể may các nét chia nhọn, vụn, gấp khúc, tia nhiều.\nCheck file với shop trước khi đặt.'
  },
  {
    title: 'DOLL 2D (IN)',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '1-10', prices: ['65k', '83k', '100k', '123k', '145k', '190k', '280k', '400k'] },
      { qty: '11-50', prices: ['62k', '78k', '93k', '114k', '135k', '176k', '270k', '380k'] },
      { qty: '51-100', prices: ['59k', '73k', '87k', '108k', '128k', '168k', '260k', '360k'] },
      { qty: '101-500', prices: ['55k', '68k', '80k', '100k', '120k', '160k', '250k', '340k'] },
      { qty: '501-1000', prices: ['53k', '65k', '75k', '95k', '115k', '155k', '240k', '320k'] },
      { qty: '>1000', prices: ['50k', '60k', '70k', '90k', '110k', '150k', '230k', '300k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['5k', '5k', '7k', '10k', '10k', '15k', '25k', '35k'] },
    ],
    note: 'Mặc định nhồi căng bông.\nKhông thể may các nét chia nhọn, vụn, gấp khúc, tia nhiều.\nCheck file với shop trước khi đặt.'
  },
  {
    title: 'DOLL 2D THÊU',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['250k', '260k', '270k', '295k', '320k'] },
      { qty: '11-50', prices: ['150k', '175k', '200k', '225k', '250k'] },
      { qty: '51-100', prices: ['110k', '130k', '150k', '160k', '170k'] },
      { qty: '101-500', prices: ['70k', '85k', '100k', '110k', '120k'] },
      { qty: '501-1000', prices: ['60k', '70k', '80k', '90k', '100k'] },
      { qty: '>1000', prices: ['50k', '60k', '70k', '80k', '90k'] },
    ],
    addons: [
      { name: 'Phụ kiện', prices: ['5k', '10k', '15k', '20k', '25k'] },
    ],
    note: 'Thêu vải lông nhung 1mm, max 3 màu chỉ.\nInbox shop chọn màu vải nền. Mặc định nhồi căng bông.\nKhông thể may các nét chia nhọn, vụn, gấp khúc, tia nhiều.\nCheck file với shop trước khi đặt. Chưa gồm phụ phí chi tiết thêu.'
  },
  {
    title: 'DAKIMAKURA',
    sizes: ['150x40', '160x50', '180x50'],
    rows: [
      { qty: '1-10', prices: ['120k', '140k', '160k'] },
      { qty: '11-50', prices: ['115k', '135k', '150k'] },
      { qty: '51-100', prices: ['110k', '130k', '140k'] },
      { qty: '101-500', prices: ['100k', '120k', '130k'] },
      { qty: '501-1000', prices: ['90k', '110k', '120k'] },
      { qty: '>1000', prices: ['80k', '100k', '110k'] },
    ],
    addons: [
      { name: 'Ruột gối', prices: ['100k', '100k', '100k'] },
    ],
    note: 'In sắc nét, bền màu.'
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
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl md:text-4xl text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.5)] bg-[var(--cyber-black)] inline-block px-8 py-3 rounded-full border border-[var(--border)]">
                  {table.title}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                {/* Đưa toàn bộ vào chung 1 thẻ table để khóa cứng cột */}
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-[var(--primary)]/50 text-[var(--silver-gray)] font-bold whitespace-nowrap">Số lượng</th>
                      {table.sizes.map((size, sIndex) => (
                        <th key={sIndex} className="p-4 border-b-2 border-[var(--primary)]/50 text-white font-bold whitespace-nowrap">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render các hàng giá chính */}
                    {table.rows.map((row, rIndex) => (
                      <tr key={rIndex} className="hover:bg-[var(--primary)]/10 transition-colors">
                        <td className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)] font-medium whitespace-nowrap">{row.qty}</td>
                        {row.prices.map((price, pIndex) => (
                          <td key={pIndex} className="p-4 border-b border-[var(--border)] text-white whitespace-nowrap">{price}</td>
                        ))}
                      </tr>
                    ))}

                    {/* Render phụ kiện NẰM CHUNG BẢNG để đồng bộ chiều rộng cột */}
                    {table.addons && table.addons.length > 0 && (
                      <>
                        {/* Hàng Tiêu đề Phụ kiện (Gộp cột) */}
                        <tr>
                          <td colSpan={table.sizes.length + 1} className="pt-10 pb-4 border-none">
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                              <h3 className="font-heading text-xl text-[var(--primary)] tracking-wide">Phụ kiện & Tuỳ chọn</h3>
                              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                          </td>
                        </tr>
                        {/* Các hàng giá phụ kiện (Vẫn dùng chung cột với bảng chính) */}
                        {table.addons.map((addon, aIndex) => (
                          <tr key={`addon-${aIndex}`} className="bg-[#1A1528]">
                            <td className="p-4 border-y border-[var(--border)] text-[var(--primary)] font-semibold whitespace-nowrap">{addon.name}</td>
                            {addon.prices.map((price, pIndex) => (
                              <td key={pIndex} className="p-4 border-y border-[var(--border)] text-[var(--silver-gray)] whitespace-nowrap">{price}</td>
                            ))}
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

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