import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info, ChevronRight, AlertCircle } from 'lucide-react';
import { SEO } from '../components/common_components/SEO';

const pricingData = [
  {
    id: '2-piece-margin',
    title: '2-Piece Plushie (With Margin)',
    notes: [
      'Uses 2-way stretch velboa fabric.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$2.30', '$4.53', '$6.23', '$7.92', '$11.04', '$14.15'] },
      { qty: '11-50', prices: ['$1.43', '$2.80', '$5.90', '$6.57', '$7.81', '$9.06'] },
      { qty: '51-100', prices: ['$1.36', '$2.64', '$5.51', '$6.11', '$7.40', '$8.70'] },
      { qty: '101-500', prices: ['$1.28', '$2.50', '$5.13', '$5.74', '$7.02', '$8.30'] },
      { qty: '501-1000', prices: ['$1.21', '$2.42', '$4.91', '$5.43', '$6.49', '$7.55'] },
      { qty: '>1000', prices: ['$1.13', '$2.26', '$4.53', '$4.91', '$5.85', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'] }]
  },
  {
    id: '2-piece-edge',
    title: '2-Piece Plushie (Edge-to-Edge)',
    notes: [
      'Uses 2-way stretch velboa fabric.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Available addons: ears, tail, arms, legs, horns, wings, etc.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$2.83', '$5.10', '$6.80', '$8.50', '$11.60', '$14.72'] },
      { qty: '11-50', prices: ['$1.81', '$3.17', '$6.26', '$6.87', '$7.43', '$9.43'] },
      { qty: '51-100', prices: ['$1.74', '$3.02', '$5.89', '$6.50', '$7.17', '$9.06'] },
      { qty: '101-500', prices: ['$1.66', '$2.87', '$5.51', '$6.11', '$6.79', '$8.68'] },
      { qty: '501-1000', prices: ['$1.58', '$2.80', '$5.28', '$5.74', '$6.23', '$7.92'] },
      { qty: '>1000', prices: ['$1.51', '$2.64', '$4.91', '$5.30', '$5.66', '$7.17'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['N/A', '$0.75', '$1.13', '$1.51', '$1.90', '$2.26'] }]
  },
  {
    id: '2-piece-embroidered',
    title: '2-Piece Plushie (Embroidered)',
    notes: [
      'Default material is 1mm pile fabric (Upgrading to 3mm, 5mm, or 7mm hair length incurs a surcharge).',
      'Unlimited embroidery thread colors. Color blocking (fur splicing) incurs an additional surcharge.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Available addons: ears, tail, arms, legs, horns, wings, etc.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$5.66', '$7.92', '$9.62', '$11.32', '$14.43', '$17.55'] },
      { qty: '11-50', prices: ['$2.94', '$4.30', '$7.40', '$7.85', '$8.57', '$10.57'] },
      { qty: '51-100', prices: ['$2.49', '$3.77', '$6.64', '$7.32', '$7.92', '$9.81'] },
      { qty: '101-500', prices: ['$2.42', '$3.62', '$6.26', '$6.87', '$7.55', '$9.43'] },
      { qty: '501-1000', prices: ['$2.34', '$3.55', '$6.04', '$6.57', '$6.98', '$8.68'] },
      { qty: '>1000', prices: ['$2.26', '$3.40', '$5.66', '$6.04', '$6.42', '$7.92'] }
    ],
    addons: [{ name: 'Custom Accessories', contactOnly: true }]
  },
  {
    id: '3-piece-printed',
    title: '3-Piece Plushie (Printed)',
    notes: [
      'Uses 2-way stretch velboa fabric.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Base price already includes 1 pair of ears and 1 tail.',
      'Available addons: arms, legs, horns, tail, wings, etc.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$7.36', '$9.40', '$11.32', '$13.87', '$16.42'] },
      { qty: '11-50', prices: ['$4.68', '$5.90', '$7.02', '$8.60', '$10.20'] },
      { qty: '51-100', prices: ['$4.45', '$5.51', '$6.57', '$8.11', '$9.66'] },
      { qty: '101-500', prices: ['$4.15', '$5.13', '$6.04', '$7.55', '$9.06'] },
      { qty: '501-1000', prices: ['$4.00', '$4.91', '$5.66', '$7.17', '$8.68'] },
      { qty: '>1000', prices: ['$3.77', '$4.53', '$5.28', '$6.80', '$8.30'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.40', '$0.50', '$0.80', '$0.80'] }]
  },
  {
    id: '3-piece-embroidered',
    title: '3-Piece Plushie (Embroidered)',
    notes: [
      'Default material is 1mm pile fabric (Upgrading to 3mm, 5mm, or 7mm hair length incurs a surcharge).',
      'Unlimited embroidery thread colors. Color blocking (fur splicing) incurs an additional surcharge.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Available addons: arms, legs, horns, tail, wings, etc.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$28.30', '$29.43', '$30.57', '$33.40', '$36.23'] },
      { qty: '11-50', prices: ['$11.32', '$13.21', '$15.10', '$17.00', '$18.87'] },
      { qty: '51-100', prices: ['$8.30', '$9.81', '$11.32', '$12.08', '$12.83'] },
      { qty: '101-500', prices: ['$5.28', '$6.42', '$7.55', '$8.30', '$9.06'] },
      { qty: '501-1000', prices: ['$4.53', '$5.28', '$6.04', '$6.80', '$7.55'] },
      { qty: '>1000', prices: ['$3.77', '$4.53', '$5.28', '$6.04', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', contactOnly: true }]
  },
  {
    id: 'doll-printed',
    title: '2D Printed Doll',
    notes: [
      'Uses 2-way stretch velboa fabric.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Base price already includes 1 pair of ears and 1 tail.',
      'Available addons: arms, legs, horns, tail, wings, etc.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$7.36', '$9.40', '$11.32', '$13.87', '$16.42'] },
      { qty: '11-50', prices: ['$4.68', '$5.90', '$7.02', '$8.60', '$10.20'] },
      { qty: '51-100', prices: ['$4.45', '$5.51', '$6.57', '$8.11', '$9.66'] },
      { qty: '101-500', prices: ['$4.15', '$5.13', '$6.04', '$7.55', '$9.06'] },
      { qty: '501-1000', prices: ['$4.00', '$4.91', '$5.66', '$7.17', '$8.68'] },
      { qty: '>1000', prices: ['$3.77', '$4.53', '$5.28', '$6.80', '$8.30'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.40', '$0.50', '$0.80', '$0.80'] }]
  },
  {
    id: 'doll-embroidered',
    title: '2D Embroidered Doll',
    notes: [
      'Default material is 1mm pile fabric (Upgrading to 3mm, 5mm, or 7mm hair length incurs a surcharge).',
      'Unlimited embroidery thread colors. Color blocking (fur splicing) incurs an additional surcharge.',
      'Sizes under 20cm include a white elastic keychain loop by default.',
      'Sizes 20cm and above cannot include a squeaker inside.',
      'Please double-check the design file with Frog before placing an order.',
      
    ],
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '1-10', prices: ['$28.30', '$29.43', '$30.57', '$33.40', '$36.23'] },
      { qty: '11-50', prices: ['$11.32', '$13.21', '$15.10', '$16.98', '$18.87'] },
      { qty: '51-100', prices: ['$8.30', '$9.81', '$11.32', '$12.08', '$12.83'] },
      { qty: '101-500', prices: ['$5.28', '$6.42', '$7.55', '$8.30', '$9.06'] },
      { qty: '501-1000', prices: ['$4.53', '$5.28', '$6.04', '$6.80', '$7.55'] },
      { qty: '>1000', prices: ['$3.77', '$4.53', '$5.28', '$6.04', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', contactOnly: true }]
  }
];

export function PricingPage() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = pricingData.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(pricingData[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-transparent relative z-10">
      <SEO 
        title="Pricing Matrix | Dioxyzine Frog" 
        description="View our estimated wholesale price brackets, sizing options, and production notes for custom plushies and 2D dolls." 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-7xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.6)]">
            PRICING MATRIX
          </h1>
          <div className="inline-flex items-center gap-3 bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-6 py-3 rounded-full backdrop-blur-sm">
            <Info className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-white font-medium text-sm md:text-base">
              This is an estimated wholesale price list. Please contact us for the most accurate quote.
            </span>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <div className="w-full lg:w-1/4 shrink-0">
            <div className="lg:sticky lg:top-32 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl hidden md:block">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider font-heading border-b border-[var(--border)] pb-4">
                Categories
              </h3>
              <ul className="space-y-2">
                {pricingData.map((item) => (
                  <li key={`toc-${item.id}`}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                        activeSection === item.id 
                          ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' 
                          : 'text-[var(--silver-gray)] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === item.id ? 'translate-x-1' : ''}`} />
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:hidden flex overflow-x-auto gap-2 pb-4 snap-x custom-scrollbar">
              {pricingData.map((item) => (
                <a
                  key={`mobile-toc-${item.id}`}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`shrink-0 snap-center px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                    activeSection === item.id 
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white' 
                      : 'bg-[#1A1528] border-[var(--border)] text-[var(--silver-gray)]'
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-3/4 space-y-16">
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 text-[var(--primary)] bg-[var(--primary)]/10 p-4 rounded-xl border border-[var(--primary)]/20 md:hidden">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs font-medium leading-relaxed italic">
                If you are accessing the website on a mobile phone, please scroll horizontally to view the full pricing table.
              </p>
            </motion.div>

            {pricingData.map((table) => (
              <motion.div 
                key={table.id} 
                id={table.id}
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(139,114,190,0.15)] overflow-hidden scroll-mt-28"
              >
                <div className="mb-8 border-b border-[var(--border)] pb-6">
                  <h2 className="font-heading text-2xl md:text-3xl text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.5)] flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[var(--primary)]" />
                    {table.title}
                  </h2>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar mb-8">
                  <table className="w-full text-center border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="p-4 border-b-2 border-[var(--primary)]/50 text-[var(--silver-gray)] font-bold text-left bg-[#1A1528] rounded-tl-xl">Quantity</th>
                        {table.sizes?.map((size, sIndex) => (
                          <th key={sIndex} className={`p-4 border-b-2 border-[var(--primary)]/50 text-white font-bold bg-[#1A1528] ${sIndex === table.sizes.length - 1 ? 'rounded-tr-xl' : ''}`}>
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows?.map((row, rIndex) => (
                        <tr key={rIndex} className="hover:bg-[var(--primary)]/10 transition-colors">
                          <td className="p-4 border-b border-[var(--border)] text-[var(--silver-gray)] font-medium whitespace-nowrap text-left">{row.qty}</td>
                          {row.prices?.map((price, pIndex) => (
                            <td key={pIndex} className="p-4 border-b border-[var(--border)] text-white font-mono whitespace-nowrap">{price}</td>
                          ))}
                        </tr>
                      ))}
                      
                      {table.addons && (
                        <>
                          <tr><td colSpan={table.sizes.length + 1} className="h-4 border-none"></td></tr>
                          {table.addons.map((addon, aIndex) => (
                            <tr key={`addon-${aIndex}`} className="bg-[#1A1528]/80">
                              <td className="p-4 border border-[var(--border)] border-l-0 text-[var(--primary)] font-semibold whitespace-nowrap text-left rounded-l-xl">
                                + {addon.name}
                              </td>
                              
                              {addon.contactOnly ? (
                                <td colSpan={table.sizes.length} className="p-4 border border-[var(--border)] border-r-0 text-[var(--silver-gray)] italic text-sm rounded-r-xl">
                                  Please submit an inquiry for custom accessory quotes.
                                </td>
                              ) : (
                                addon.prices?.map((price, pIndex) => (
                                  <td key={pIndex} className={`p-4 border border-[var(--border)] text-[var(--silver-gray)] font-mono whitespace-nowrap ${pIndex === table.sizes.length - 1 ? 'border-r-0 rounded-r-xl' : ''}`}>
                                    {price}
                                  </td>
                                ))
                              )}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* bullet point notes */}
                <div className="bg-black/30 border border-[var(--border)] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="p-3 rounded-full bg-yellow-500/10 shrink-0 hidden sm:block">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 sm:hidden" /> Production Notes
                    </h4>
                    <ul className="space-y-2 text-sm text-[var(--silver-gray)]">
                      {table.notes?.map((noteLine, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-[1px] shrink-0">✔</span>
                          <span className="leading-relaxed">{noteLine}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            ))}

            <div className="mt-8 bg-[var(--cyber-black)] rounded-3xl p-8 border border-[var(--primary)]/30 text-center shadow-[0_0_30px_rgba(139,114,190,0.2)]">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to bring your idea to life?</h3>
              <p className="text-[var(--silver-gray)] mb-6 max-w-lg mx-auto">
                Submit an inquiry today. Our team will review your requirements and provide a detailed, accurate quote.
              </p>
              <a href="/inquiry" className="inline-block px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-full hover:bg-purple-600 transition-colors shadow-lg">
                Start Custom Inquiry
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}