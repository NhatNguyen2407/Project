import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';

import { SEO } from '../components/common_components/SEO';

const pricingData = [
  {
    title: '2-PIECE PLUSHIE',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '11-50', prices: ['$1.4', '$2.8', '$5.9', '$5.1', '$7.1', '$9.1', '$10.9', '$18.5', '$25.7'] },
      { qty: '51-100', prices: ['$1.4', '$2.6', '$5.5', '$4.9', '$6.8', '$8.7', '$10.6', '$18.1', '$24.9'] },
      { qty: '101-500', prices: ['$1.3', '$2.5', '$5.1', '$4.5', '$6.4', '$8.3', '$9.8', '$17.4', '$23.4'] },
      { qty: '501-1000', prices: ['$1.2', '$2.4', '$4.9', '$4.2', '$5.8', '$7.5', '$9.1', '$16.6', '$21.9'] },
      { qty: '>1000', prices: ['$1.1', '$2.3', '$4.5', '$3.8', '$5.3', '$6.8', '$8.3', '$15.1', '$20.4'] }
    ],
    addons: [
      { name: 'Addons', prices: ['X', '$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1', '$1.9', '$2.6'] }
    ]
  },
  {
    title: '3-PIECE PLUSHIE',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm'],
    rows: [
      { qty: '11-50', prices: ['$4.7', '$5.9', '$7.0', '$8.6', '$10.2', '$13.3'] },
      { qty: '51-100', prices: ['$4.5', '$5.5', '$6.6', '$8.1', '$9.7', '$12.7'] },
      { qty: '101-500', prices: ['$4.2', '$5.1', '$6.0', '$7.5', '$9.1', '$12.1'] },
      { qty: '501-1000', prices: ['$4.0', '$4.9', '$5.7', '$7.2', '$8.7', '$11.7'] },
      { qty: '>1000', prices: ['$3.8', '$4.5', '$5.3', '$6.8', '$8.3', '$11.3'] }
    ],
    addons: [
      { name: 'Addons', prices: ['$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1'] }
    ]
  },
  {
    title: '2D PRINTED DOLL',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '11-50', prices: ['$4.7', '$5.9', '$7.0', '$8.6', '$10.2', '$13.3', '$20.4', '$28.7'] },
      { qty: '51-100', prices: ['$4.5', '$5.5', '$6.6', '$8.1', '$9.7', '$12.7', '$19.6', '$27.2'] },
      { qty: '101-500', prices: ['$4.2', '$5.1', '$6.0', '$7.5', '$9.1', '$12.1', '$18.9', '$25.7'] },
      { qty: '501-1000', prices: ['$4.0', '$4.9', '$5.7', '$7.2', '$8.7', '$11.7', '$18.1', '$24.2'] },
      { qty: '>1000', prices: ['$3.8', '$4.5', '$5.3', '$6.8', '$8.3', '$11.3', '$17.4', '$22.6'] }
    ],
    addons: [
      { name: 'Addons', prices: ['$0.4', '$0.4', '$0.5', '$0.8', '$0.8', '$1.1', '$1.9', '$2.6'] }
    ]
  },
  {
    title: '2D EMBROIDERED DOLL',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '11-50', prices: ['$11.3', '$13.2', '$15.1', '$17.0', '$18.9'] },
      { qty: '51-100', prices: ['$8.3', '$9.8', '$11.3', '$12.1', '$12.8'] },
      { qty: '101-500', prices: ['$5.3', '$6.4', '$7.5', '$8.3', '$9.1'] },
      { qty: '501-1000', prices: ['$4.5', '$5.3', '$6.0', '$6.8', '$7.5'] },
      { qty: '>1000', prices: ['$3.8', '$4.5', '$5.3', '$6.0', '$6.8'] }
    ],
    addons: [
      { name: 'Addons', prices: ['$0.4', '$0.8', '$1.1', '$1.5', '$1.9'] }
    ]
  }
];

export function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-transparent relative z-10">
      <SEO 
        title="Pricing Matrix" 
        description="View our estimated wholesale price brackets and sizing options for custom plushies and 2D dolls." 
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-7xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">
            PRICING
          </h1>
          
          <div className="inline-flex items-center gap-3 bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-6 py-3 rounded-full backdrop-blur-sm">
            <Info className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-white font-medium">
              This is an estimated price list, please contact us for the most accurate quote.
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 mb-6 text-[var(--primary)] bg-[var(--primary)]/10 p-4 rounded-xl border border-[var(--primary)]/20"
        >
          <span className="text-lg shrink-0">💡</span>
          <p className="text-sm font-medium leading-relaxed italic">
            If you are accessing the website on a mobile phone, please scroll horizontally to view the full pricing table.
          </p>
        </motion.div>

        <div className="space-y-20">
          {pricingData.map((table, tIndex) => (
            <motion.div key={tIndex} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] overflow-hidden">
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl md:text-4xl text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.5)] bg-[var(--cyber-black)] inline-block px-8 py-3 rounded-full border border-[var(--border)]">
                  {table.title}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-[var(--primary)]/50 text-[var(--silver-gray)] font-bold">Qty</th>
                      {table.sizes.map((size, sIndex) => <th key={sIndex} className="p-4 border-b-2 border-[var(--primary)]/50 text-white font-bold">{size}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rIndex) => (
                      <tr key={rIndex} className="hover:bg-[var(--primary)]/10">
                        <td className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)] font-medium whitespace-nowrap">{row.qty}</td>
                        {row.prices.map((price, pIndex) => <td key={pIndex} className="p-4 border-b border-[var(--border)] text-white whitespace-nowrap">{price}</td>)}
                      </tr>
                    ))}
                    {table.addons && (
                      <>
                        <tr>
                          <td colSpan={table.sizes.length + 1} className="pt-10 pb-4 border-none">
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                              <h3 className="font-heading text-xl text-[var(--primary)] tracking-wide">Addons</h3>
                            </div>
                          </td>
                        </tr>
                        {table.addons.map((addon, aIndex) => (
                          <tr key={`addon-${aIndex}`} className="bg-[#1A1528]">
                            <td className="p-4 border-y border-[var(--border)] text-[var(--primary)] font-semibold whitespace-nowrap">{addon.name}</td>
                            {addon.prices.map((price, pIndex) => <td key={pIndex} className="p-4 border-y border-[var(--border)] text-[var(--silver-gray)] whitespace-nowrap">{price}</td>)}
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 bg-[var(--cyber-black)] rounded-2xl p-6 border border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--primary)] text-center tracking-wide uppercase">
                  Contact us now to get the most accurate quote
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}