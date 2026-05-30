import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const pricingData = [
  {
    title: 'PLUSHIE 2 MẢNH',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      // { qty: '1-10', prices: { vi: ['20k', '40k', '55k', '70k', '98k', '125k', '150k', '250k', '350k'], en: ['$1.5', '$3.0', '$4.2', '$5.3', '$7.4', '$9.4', '$11.3', '$18.9', '$26.4'] } },
      { qty: '11-50', prices: { vi: ['19k', '37k', '78k', '67k', '94k', '120k', '145k', '245k', '340k'], en: ['$1.4', '$2.8', '$5.9', '$5.1', '$7.1', '$9.1', '$10.9', '$18.5', '$25.7'] } },
      { qty: '51-100', prices: { vi: ['18k', '35k', '73k', '65k', '90k', '115k', '140k', '240k', '330k'], en: ['$1.4', '$2.6', '$5.5', '$4.9', '$6.8', '$8.7', '$10.6', '$18.1', '$24.9'] } },
      { qty: '101-500', prices: { vi: ['17k', '33k', '68k', '60k', '85k', '110k', '130k', '230k', '310k'], en: ['$1.3', '$2.5', '$5.1', '$4.5', '$6.4', '$8.3', '$9.8', '$17.4', '$23.4'] } },
      { qty: '501-1000', prices: { vi: ['16k', '32k', '65k', '55k', '78k', '100k', '120k', '220k', '290k'], en: ['$1.2', '$2.4', '$4.9', '$4.2', '$5.8', '$7.5', '$9.1', '$16.6', '$21.9'] } },
      { qty: '>1000', prices: { vi: ['15k', '30k', '60k', '50k', '70k', '90k', '110k', '200k', '270k'], en: ['$1.1', '$2.3', '$4.5', '$3.8', '$5.3', '$6.8', '$8.3', '$15.1', '$20.4'] } }
    ],
    addons: [
      { name: 'Phụ kiện', prices: { vi: ['X', '5k', '5k', '7k', '10k', '10k', '15k', '25k', '35k'], en: ['X', '$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1', '$1.9', '$2.6'] } }
    ],
    note: { vi: 'In vải velboa 2 chiều.\nThêm phụ kiện: bao gồm tai đuôi, chíp chíp,...', en: 'Printed on 2-way velboa fabric.\nAddons include ears, tails, squeakers...' }
  },
  {
    title: 'PLUSHIE 3 MẢNH',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm'],
    rows: [
      // { qty: '1-10', prices: { vi: ['65k', '83k', '100k', '123k', '145k', '190k'], en: ['$4.9', '$6.3', '$7.5', '$9.2', '$10.9', '$14.3'] } },
      { qty: '11-50', prices: { vi: ['62k', '78k', '93k', '114k', '135k', '176k'], en: ['$4.7', '$5.9', '$7.0', '$8.6', '$10.2', '$13.3'] } },
      { qty: '51-100', prices: { vi: ['59k', '73k', '87k', '108k', '128k', '168k'], en: ['$4.5', '$5.5', '$6.6', '$8.1', '$9.7', '$12.7'] } },
      { qty: '101-500', prices: { vi: ['55k', '68k', '80k', '100k', '120k', '160k'], en: ['$4.2', '$5.1', '$6.0', '$7.5', '$9.1', '$12.1'] } },
      { qty: '501-1000', prices: { vi: ['53k', '65k', '75k', '95k', '115k', '155k'], en: ['$4.0', '$4.9', '$5.7', '$7.2', '$8.7', '$11.7'] } },
      { qty: '>1000', prices: { vi: ['50k', '60k', '70k', '90k', '110k', '150k'], en: ['$3.8', '$4.5', '$5.3', '$6.8', '$8.3', '$11.3'] } }
    ],
    addons: [
      { name: 'Phụ kiện', prices: { vi: ['5k', '5k', '7k', '10k', '10k', '15k'], en: ['$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1'] } }
    ],
    note: { vi: 'Mặc định nhồi căng bông.\nKhông may nét vụn.\nCheck file với shop trước.', en: 'Fully stuffed by default.\nCannot sew highly intricate fragments.\nCheck file before order.' }
  },
  {
    title: 'DOLL 2D (IN)',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      // { qty: '1-10', prices: { vi: ['65k', '83k', '100k', '123k', '145k', '190k', '280k', '400k'], en: ['$4.9', '$6.3', '$7.5', '$9.2', '$10.9', '$14.3', '$21.1', '$30.2'] } },
      { qty: '11-50', prices: { vi: ['62k', '78k', '93k', '114k', '135k', '176k', '270k', '380k'], en: ['$4.7', '$5.9', '$7.0', '$8.6', '$10.2', '$13.3', '$20.4', '$28.7'] } },
      { qty: '51-100', prices: { vi: ['59k', '73k', '87k', '108k', '128k', '168k', '260k', '360k'], en: ['$4.5', '$5.5', '$6.6', '$8.1', '$9.7', '$12.7', '$19.6', '$27.2'] } },
      { qty: '101-500', prices: { vi: ['55k', '68k', '80k', '100k', '120k', '160k', '250k', '340k'], en: ['$4.2', '$5.1', '$6.0', '$7.5', '$9.1', '$12.1', '$18.9', '$25.7'] } },
      { qty: '501-1000', prices: { vi: ['53k', '65k', '75k', '95k', '115k', '155k', '240k', '320k'], en: ['$4.0', '$4.9', '$5.7', '$7.2', '$8.7', '$11.7', '$18.1', '$24.2'] } },
      { qty: '>1000', prices: { vi: ['50k', '60k', '70k', '90k', '110k', '150k', '230k', '300k'], en: ['$3.8', '$4.5', '$5.3', '$6.8', '$8.3', '$11.3', '$17.4', '$22.6'] } }
    ],
    addons: [
      { name: 'Phụ kiện', prices: { vi: ['5k', '5k', '7k', '10k', '10k', '15k', '25k', '35k'], en: ['$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1', '$1.9', '$2.6'] } }
    ],
    note: { vi: 'Mặc định nhồi căng bông.\nKhông may nét vụn.\nCheck file với shop trước.', en: 'Fully stuffed by default.\nCannot sew highly intricate fragments.\nCheck file before order.' }
  },
  {
    title: 'DOLL 2D THÊU',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      // { qty: '1-10', prices: { vi: ['250k', '260k', '270k', '295k', '320k'], en: ['$18.9', '$19.6', '$20.4', '$22.3', '$24.2'] } },
      { qty: '11-50', prices: { vi: ['150k', '175k', '200k', '225k', '250k'], en: ['$11.3', '$13.2', '$15.1', '$17.0', '$18.9'] } },
      { qty: '51-100', prices: { vi: ['110k', '130k', '150k', '160k', '170k'], en: ['$8.3', '$9.8', '$11.3', '$12.1', '$12.8'] } },
      { qty: '101-500', prices: { vi: ['70k', '85k', '100k', '110k', '120k'], en: ['$5.3', '$6.4', '$7.5', '$8.3', '$9.1'] } },
      { qty: '501-1000', prices: { vi: ['60k', '70k', '80k', '90k', '100k'], en: ['$4.5', '$5.3', '$6.0', '$6.8', '$7.5'] } },
      { qty: '>1000', prices: { vi: ['50k', '60k', '70k', '80k', '90k'], en: ['$3.8', '$4.5', '$5.3', '$6.0', '$6.8'] } }
    ],
    addons: [
      { name: 'Phụ kiện', prices: { vi: ['5k', '10k', '15k', '20k', '25k'], en: ['$0.4', '$0.8', '$1.1', '$1.5', '$1.9'] } }
    ],
    note: { vi: 'Thêu nhung 1mm, max 3 màu chỉ.\nMặc định nhồi bông.', en: 'Embroidery on 1mm velvet, max 3 colors.\nFully stuffed by default.' }
  }
];

export function PricingPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-20 bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-7xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">
            {lang === 'vi' ? 'BẢNG GIÁ' : 'PRICING'}
          </h1>
          <p className="text-lg text-[var(--primary)] font-semibold uppercase tracking-widest mb-6">
            {lang === 'vi' ? 'Bảng giá tham khảo các hạng mục' : 'Reference pricing for categories'}
          </p>
          <div className="inline-flex items-center gap-3 bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-6 py-3 rounded-full backdrop-blur-sm">
            <Info className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-white font-medium">
              {lang === 'vi' ? 'Lưu ý: Bảng giá dưới đây là giá ước tính. Vui lòng trao đổi với chúng tôi để nhận báo giá chính xác nhất' : 'Note: The pricing table below is an estimate. Please contact us for most accurate prices'}
            </span>
          </div>
        </motion.div>

        <div className="space-y-20">
          {pricingData.map((table, tIndex) => (
            <motion.div key={tIndex} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] overflow-hidden">
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl md:text-4xl text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.5)] bg-[var(--cyber-black)] inline-block px-8 py-3 rounded-full border border-[var(--border)]">{table.title}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-[var(--primary)]/50 text-[var(--silver-gray)] font-bold">{lang === 'vi' ? 'Số lượng' : 'Qty'}</th>
                      {table.sizes.map((size, sIndex) => <th key={sIndex} className="p-4 border-b-2 border-[var(--primary)]/50 text-white font-bold">{size}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rIndex) => (
                      <tr key={rIndex} className="hover:bg-[var(--primary)]/10">
                        <td className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)] font-medium whitespace-nowrap">{row.qty}</td>
                        {row.prices[lang].map((price, pIndex) => <td key={pIndex} className="p-4 border-b border-[var(--border)] text-white whitespace-nowrap">{price}</td>)}
                      </tr>
                    ))}
                    {table.addons && (
                      <>
                        <tr>
                          <td colSpan={table.sizes.length + 1} className="pt-10 pb-4 border-none">
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                              <h3 className="font-heading text-xl text-[var(--primary)] tracking-wide">{lang === 'vi' ? 'Phụ kiện' : 'Addons'}</h3>
                            </div>
                          </td>
                        </tr>
                        {table.addons.map((addon, aIndex) => (
                          <tr key={`addon-${aIndex}`} className="bg-[#1A1528]">
                            <td className="p-4 border-y border-[var(--border)] text-[var(--primary)] font-semibold whitespace-nowrap">{lang === 'vi' ? addon.name : 'Accessory'}</td>
                            {addon.prices[lang].map((price, pIndex) => <td key={pIndex} className="p-4 border-y border-[var(--border)] text-[var(--silver-gray)] whitespace-nowrap">{price}</td>)}
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 bg-[var(--cyber-black)] rounded-2xl p-6 border border-[var(--border)]">
                <p className="text-sm text-[var(--silver-gray)] text-center whitespace-pre-line">{table.note[lang]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}