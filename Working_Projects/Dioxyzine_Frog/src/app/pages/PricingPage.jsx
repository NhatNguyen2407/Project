import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info, ChevronRight, AlertCircle } from 'lucide-react';
import { SEO } from '../components/common_components/SEO';

const pricingData = [
  {
    id: '2-piece-margin',
    title: '2-Piece Plushie (With White Margin)',
    note: 'Details are 2D printed on white minky fabric, leaving a ~3mm white border. Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs based on the addon price.',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '11-50', prices: ['$1.40', '$2.80', '$5.90', '$5.10', '$7.10', '$9.10', '$10.90', '$18.50', '$25.70'] },
      { qty: '51-100', prices: ['$1.40', '$2.60', '$5.50', '$4.90', '$6.80', '$8.70', '$10.60', '$18.10', '$24.90'] },
      { qty: '101-500', prices: ['$1.30', '$2.50', '$5.10', '$4.50', '$6.40', '$8.30', '$9.80', '$17.40', '$23.40'] },
      { qty: '501-1000', prices: ['$1.20', '$2.40', '$4.90', '$4.20', '$5.80', '$7.50', '$9.10', '$16.60', '$21.90'] },
      { qty: '>1000', prices: ['$1.10', '$2.30', '$4.50', '$3.80', '$5.30', '$6.80', '$8.30', '$15.10', '$20.40'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['N/A', '$0.40', '$0.40', '$0.50', '$0.80', '$0.80', '$1.10', '$1.90', '$2.60'] }]
  },
  {
    id: '2-piece-edge',
    title: '2-Piece Plushie (Edge-to-Edge)',
    note: 'Details are 2D printed on white minky fabric, sewn close to the edge (borderless). Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs based on the addon price.',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '11-50', prices: ['$1.90', '$3.80', '$7.90', '$6.80', '$9.40', '$12.10', '$14.30', '$24.50', '$34.30'] },
      { qty: '51-100', prices: ['$1.90', '$3.60', '$7.50', '$6.40', '$8.70', '$11.30', '$13.60', '$23.40', '$33.20'] },
      { qty: '101-500', prices: ['$1.80', '$3.40', '$6.80', '$6.00', '$8.30', '$10.90', '$13.20', '$23.00', '$31.30'] },
      { qty: '501-1000', prices: ['$1.70', '$3.20', '$6.40', '$5.70', '$7.90', '$10.20', '$12.10', '$22.30', '$29.40'] },
      { qty: '>1000', prices: ['$1.60', '$3.00', '$6.00', '$5.30', '$7.20', '$9.10', '$10.90', '$20.40', '$27.20'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['N/A', '$0.40', '$0.40', '$0.50', '$0.80', '$0.80', '$1.10', '$1.90', '$2.60'] }]
  },
  {
    id: '2-piece-embroidered',
    title: '2-Piece Plushie (Embroidered)',
    note: 'Details are embroidered (outline or full) on white minky fabric or pre-dyed fabric (chosen by the workshop for optimal results), sewn close to the edge (borderless). Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs.',
    sizes: ['5cm', '10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '11-50', prices: ['$5.70', '$11.30', '$13.20', '$15.10', '$17.00', '$18.90'] },
      { qty: '51-100', prices: ['$5.30', '$8.30', '$9.80', '$11.30', '$12.10', '$12.80'] },
      { qty: '101-500', prices: ['$4.90', '$5.30', '$6.40', '$7.50', '$8.30', '$9.10'] },
      { qty: '501-1000', prices: ['$4.50', '$4.50', '$5.30', '$6.00', '$6.80', '$7.50'] },
      { qty: '>1000', prices: ['$4.20', '$3.80', '$4.50', '$5.30', '$6.00', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.40', '$0.80', '$1.10', '$1.50', '$1.90'] }]
  },
  {
    id: '3-piece-printed',
    title: '3-Piece Plushie (Printed)',
    note: 'Details are 2D printed on white minky fabric. Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs based on the addon price.',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm'],
    rows: [
      { qty: '11-50', prices: ['$4.70', '$5.90', '$7.00', '$8.60', '$10.20', '$13.30'] },
      { qty: '51-100', prices: ['$4.50', '$5.50', '$6.60', '$8.10', '$9.70', '$12.70'] },
      { qty: '101-500', prices: ['$4.20', '$5.10', '$6.00', '$7.50', '$9.10', '$12.10'] },
      { qty: '501-1000', prices: ['$4.00', '$4.90', '$5.70', '$7.20', '$8.70', '$11.70'] },
      { qty: '>1000', prices: ['$3.80', '$4.50', '$5.30', '$6.80', '$8.30', '$11.30'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.40', '$0.50', '$0.80', '$0.80', '$1.10'] }]
  },
  {
    id: '3-piece-embroidered',
    title: '3-Piece Plushie (Embroidered)',
    note: 'Details are embroidered (outline or full) on white minky fabric or pre-dyed fabric (chosen by the workshop for optimal results). Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs.',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '11-50', prices: ['$11.30', '$13.20', '$15.10', '$17.00', '$18.90'] },
      { qty: '51-100', prices: ['$8.30', '$9.80', '$11.30', '$12.10', '$12.80'] },
      { qty: '101-500', prices: ['$5.30', '$6.40', '$7.50', '$8.30', '$9.10'] },
      { qty: '501-1000', prices: ['$4.50', '$5.30', '$6.00', '$6.80', '$7.50'] },
      { qty: '>1000', prices: ['$3.80', '$4.50', '$5.30', '$6.00', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.80', '$1.10', '$1.50', '$1.90'] }]
  },
  {
    id: 'doll-printed',
    title: '2D Printed Doll',
    note: '1 doll includes 1 base + 1 single-sided printed clothing item. Details are 2D printed on white minky fabric. Adding extra custom sewn accessories (clothing, hats, etc.) will incur additional costs.',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm', '40cm', '50cm', '60cm'],
    rows: [
      { qty: '11-50', prices: ['$4.70', '$5.90', '$7.00', '$8.60', '$10.20', '$13.30', '$20.40', '$28.70'] },
      { qty: '51-100', prices: ['$4.50', '$5.50', '$6.60', '$8.10', '$9.70', '$12.70', '$19.60', '$27.20'] },
      { qty: '101-500', prices: ['$4.20', '$5.10', '$6.00', '$7.50', '$9.10', '$12.10', '$18.90', '$25.70'] },
      { qty: '501-1000', prices: ['$4.00', '$4.90', '$5.70', '$7.20', '$8.70', '$11.70', '$18.10', '$24.20'] },
      { qty: '>1000', prices: ['$3.80', '$4.50', '$5.30', '$6.80', '$8.30', '$11.30', '$17.40', '$22.60'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.40', '$0.50', '$0.80', '$0.80', '$1.10', '$1.90', '$2.60'] }]
  },
  {
    id: 'doll-embroidered',
    title: '2D Embroidered Doll',
    note: '1 doll includes 1 base + 1 single-sided printed clothing item. Details are embroidered on white minky fabric or pre-dyed fabric (optimized by workshop). Adding extra custom sewn accessories will incur additional costs.',
    sizes: ['10cm', '15cm', '20cm', '25cm', '30cm'],
    rows: [
      { qty: '11-50', prices: ['$11.30', '$13.20', '$15.10', '$17.00', '$18.90'] },
      { qty: '51-100', prices: ['$8.30', '$9.80', '$11.30', '$12.10', '$12.80'] },
      { qty: '101-500', prices: ['$5.30', '$6.40', '$7.50', '$8.30', '$9.10'] },
      { qty: '501-1000', prices: ['$4.50', '$5.30', '$6.00', '$6.80', '$7.50'] },
      { qty: '>1000', prices: ['$3.80', '$4.50', '$5.30', '$6.00', '$6.80'] }
    ],
    addons: [{ name: 'Custom Accessories', prices: ['$0.40', '$0.80', '$1.10', '$1.50', '$1.90'] }]
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
        
        {/* Banner */}
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
          
          {/* Table of Contents */}
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
            
            {/* mobile table of contents */}
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
                          {table.addons?.map((addon, aIndex) => (
                            <tr key={`addon-${aIndex}`} className="bg-[#1A1528]/80">
                              <td className="p-4 border border-[var(--border)] border-l-0 text-[var(--primary)] font-semibold whitespace-nowrap text-left rounded-l-xl">
                                + {addon.name}
                              </td>
                              {addon.prices.map((price, pIndex) => (
                                <td key={pIndex} className={`p-4 border border-[var(--border)] text-[var(--silver-gray)] font-mono whitespace-nowrap ${pIndex === table.sizes.length - 1 ? 'border-r-0 rounded-r-xl' : ''}`}>
                                  {price}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* category note */}
                <div className="bg-black/30 border border-[var(--border)] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="p-3 rounded-full bg-yellow-500/10 shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Production Notes</h4>
                    <ul className="space-y-2 text-sm text-[var(--silver-gray)]">
                      {table.notes?.map((noteLine, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-0.5 shrink-0">✔</span>
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