import React, { useState } from 'react';
import { Calculator, Ruler, Package, Star, ArrowRight, Zap, Coffee, Backpack, Sparkles, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/common_components/SEO';

// ---------------------------------------------------------
// 1. DỮ LIỆU CALCULATOR (ƯỚC TÍNH NHANH)
// ---------------------------------------------------------
const COMPLEXITY_LEVELS = [
  { id: 'simple', name: 'Simple (Basic)', multiplier: 1, desc: 'Basic shape, max 2 colors, no clothes.' },
  { id: 'detailed', name: 'Detailed (Standard)', multiplier: 1.5, desc: 'Humanoid/Animal, clothes included, 3-5 colors.' },
  { id: 'complex', name: 'Complex (Premium)', multiplier: 2.2, desc: 'Intricate details, custom accessories, 5+ colors.' }
];

const QUANTITY_TIERS = [
  { min: 1, max: 49, discount: 1 },       
  { min: 50, max: 199, discount: 0.85 },  
  { min: 200, max: 499, discount: 0.75 }, 
  { min: 500, max: 999, discount: 0.65 }, 
  { min: 1000, max: 99999, discount: 0.5} 
];

// ---------------------------------------------------------
// 2. DỮ LIỆU BẢNG GIÁ SỈ CHI TIẾT (WHOLESALE MATRIX)
// ---------------------------------------------------------
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

export function PricingCalculatorPage() {
  const navigate = useNavigate();

  // STATE: Calculator
  const [size, setSize] = useState(15); 
  const [complexity, setComplexity] = useState(COMPLEXITY_LEVELS[1]); 
  const [quantity, setQuantity] = useState(50);

  // STATE: Accordion (Thẻ đóng mở của Bảng Giá)
  const [openAccordion, setOpenAccordion] = useState(pricingData[0].id);

  // Hàm tính giá cho Calculator
  const calculatePrice = () => {
    const basePrice = 5; 
    const sizeFactor = size * 0.4; 
    const currentTier = QUANTITY_TIERS.find(t => quantity >= t.min && quantity <= t.max) || QUANTITY_TIERS[0];
    
    const unitPrice = (basePrice + sizeFactor) * complexity.multiplier * currentTier.discount;
    const totalPrice = unitPrice * quantity;

    return {
      unitPrice: unitPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      discount: Math.round((1 - currentTier.discount) * 100)
    };
  };

  const pricing = calculatePrice();

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <SEO title="Pricing & Size Guide | Dioxyzine Frog" description="Interactive size guide and wholesale price matrix for custom plushies." />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4 flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-[var(--primary)]" />
            Pricing & Size Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Use the interactive slider for a quick estimate, or browse our detailed wholesale price matrix below for exact costs.
          </p>
        </div>

        {/* PHẦN 1: CALCULATOR & VISUAL GUIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* CỘT TRÁI: CALCULATOR */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">Quick Estimate</h2>
              
              {/* Size Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[var(--primary)]" /> Target Size
                  </label>
                  <span className="text-2xl font-black text-[var(--primary)]">{size} cm</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="50" step="1" 
                  value={size} 
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono font-bold">
                  <span>5 cm</span>
                  <span>50 cm</span>
                </div>
              </div>

              {/* Complexity */}
              <div className="mb-8">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-[var(--primary)]" /> Design Complexity
                </label>
                <div className="flex flex-col gap-3">
                  {COMPLEXITY_LEVELS.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setComplexity(level)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${complexity.id === level.id ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-sm' : 'bg-muted border-border hover:border-gray-400'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${complexity.id === level.id ? 'text-foreground' : 'text-muted-foreground'}`}>{level.name}</span>
                        {complexity.id === level.id && <Zap className="w-4 h-4 text-[var(--primary)]" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium opacity-80">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-[var(--primary)]" /> Quantity
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" min="1" max="10000" value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground font-bold outline-none focus:border-[var(--primary)]"
                  />
                  <div className="shrink-0 text-sm font-bold text-muted-foreground">pieces</div>
                </div>
                {pricing.discount > 0 && (
                  <p className="text-xs text-[var(--primary)] font-bold mt-2">
                    ✨ Bulk discount applied: {pricing.discount}% OFF!
                  </p>
                )}
              </div>
            </div>

            {/* QUOTE BANNER */}
            <div className="bg-card border border-[var(--primary)]/50 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-3xl rounded-full"></div>
              <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">Estimated Unit Price</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-black text-foreground">${pricing.unitPrice}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-4 mb-6">
                <span className="text-muted-foreground font-bold">Total for {quantity} pcs:</span>
                <span className="text-xl font-bold text-[var(--primary)]">${pricing.totalPrice}</span>
              </div>
              <button 
                onClick={() => navigate('/tools/prototype-generator')}
                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md cursor-pointer"
              >
                Design Your Prototype <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: VISUAL SIZE GUIDE */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 lg:p-10 shadow-md flex flex-col justify-between relative overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">Visual Size Reference</h2>
              <p className="text-sm font-medium text-muted-foreground">See how your {size}cm plushie compares to everyday objects.</p>
            </div>

            <div className="flex-1 flex items-end justify-center gap-4 sm:gap-8 lg:gap-12 relative z-10 min-h-[400px] pb-4 border-b-2 border-[var(--primary)]/30">
              <div className="flex flex-col items-center opacity-50">
                <span className="text-[10px] font-mono text-muted-foreground font-bold mb-2 border-b border-border w-full text-center pb-1">15 cm</span>
                <div className="w-16 flex justify-center text-muted-foreground" style={{ height: '150px' }}>
                  <Coffee className="w-12 h-12 mt-auto" />
                </div>
                <span className="text-xs font-bold text-muted-foreground mt-2">Cup</span>
              </div>

              <div className="flex flex-col items-center relative z-20">
                <span className="text-xs font-mono text-[var(--primary)] font-bold mb-2 border-b border-[var(--primary)] w-full text-center pb-1 transition-all">{size} cm</span>
                <div 
                  className="flex justify-center items-end bg-gradient-to-t from-[var(--primary)]/20 to-transparent rounded-t-full border-x border-t border-[var(--primary)]/40 transition-all duration-500 ease-out relative"
                  style={{ height: `${size * 10}px`, width: `${Math.max(80, size * 6)}px` }}
                >
                   <svg viewBox="0 0 24 24" className="w-full h-full text-[var(--primary)] opacity-90 p-2 transition-all duration-500" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.65 3.33 1.71 4.54C6.26 14.54 6 15.74 6 17c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4 0-1.26-.26-2.46-.71-3.46C18.35 12.33 19 10.74 19 9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.25-.47 2.4-1.24 3.28-.2.23-.33.53-.33.84 0 1.25.4 2.45 1.13 3.44C15.86 18.23 14.04 19 12 19s-3.86-.77-4.56-2.44c.73-.99 1.13-2.19 1.13-3.44 0-.31-.13-.61-.33-.84C7.47 11.4 7 10.25 7 9c0-2.76 2.24-5 5-5z"/>
                      <circle cx="9.5" cy="9.5" r="1.5"/><circle cx="14.5" cy="9.5" r="1.5"/><path d="M12 13c-.83 0-1.5-.67-1.5-1.5h3c0 .83-.67 1.5-1.5 1.5z"/>
                   </svg>
                </div>
                <span className="text-sm font-black text-foreground mt-2 drop-shadow-sm">Your Plushie</span>
              </div>

              <div className="flex flex-col items-center opacity-50 hidden sm:flex">
                <span className="text-[10px] font-mono text-muted-foreground font-bold mb-2 border-b border-border w-full text-center pb-1">40 cm</span>
                <div className="w-20 flex justify-center text-muted-foreground" style={{ height: '400px' }}>
                  <Backpack className="w-16 h-16 mt-auto" />
                </div>
                <span className="text-xs font-bold text-muted-foreground mt-2">Backpack</span>
              </div>
            </div>
            
            <div className="absolute left-0 bottom-10 w-full h-[500px] pointer-events-none flex flex-col justify-between opacity-10">
              {[50, 40, 30, 20, 10].map(mark => (
                <div key={mark} className="w-full border-t border-dashed border-foreground flex items-start">
                  <span className="text-[10px] font-mono font-bold text-foreground ml-2 -mt-2">{mark} cm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PHẦN 2: BẢNG GIÁ CHI TIẾT (ACCORDION) */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">Detailed Wholesale Matrix</h2>
            <p className="text-muted-foreground font-medium">Exact pricing based on quantity, size, and material details.</p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {pricingData.map((table) => {
              const isOpen = openAccordion === table.id;

              return (
                <div 
                  key={table.id} 
                  className={`bg-card border rounded-2xl overflow-hidden transition-colors duration-300 shadow-sm ${isOpen ? 'border-[var(--primary)]' : 'border-border'}`}
                >
                  <button 
                    onClick={() => toggleAccordion(table.id)}
                    className="w-full p-5 flex items-center justify-between bg-muted hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-3">
                      <Sparkles className={`w-5 h-5 transition-colors ${isOpen ? 'text-[var(--primary)]' : 'text-muted-foreground'}`} />
                      {table.title}
                    </h3>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 md:p-8 bg-background border-t border-border">
                          
                          <div className="overflow-x-auto custom-scrollbar mb-6 bg-card border border-border rounded-2xl shadow-sm">
                            <table className="w-full text-center border-collapse min-w-[600px]">
                              <thead>
                                <tr>
                                  <th className="p-4 border-b-2 border-[var(--primary)]/50 text-muted-foreground font-bold text-left bg-muted">Quantity</th>
                                  {table.sizes?.map((size, sIndex) => (
                                    <th key={sIndex} className="p-4 border-b-2 border-[var(--primary)]/50 text-foreground font-bold bg-muted">
                                      {size}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows?.map((row, rIndex) => (
                                  <tr key={rIndex} className="hover:bg-muted transition-colors">
                                    <td className="p-4 border-b border-border text-muted-foreground font-bold whitespace-nowrap text-left">{row.qty}</td>
                                    {row.prices?.map((price, pIndex) => (
                                      <td key={pIndex} className="p-4 border-b border-border text-foreground font-mono font-bold whitespace-nowrap">{price}</td>
                                    ))}
                                  </tr>
                                ))}
                                
                                {table.addons && (
                                  <>
                                    {table.addons.map((addon, aIndex) => (
                                      <tr key={`addon-${aIndex}`} className="bg-muted/80">
                                        <td className="p-4 text-[var(--primary)] font-bold whitespace-nowrap text-left">
                                          + {addon.name}
                                        </td>
                                        {addon.contactOnly ? (
                                          <td colSpan={table.sizes.length} className="p-4 text-muted-foreground italic text-sm font-medium">
                                            Please submit an inquiry for custom accessory quotes.
                                          </td>
                                        ) : (
                                          addon.prices?.map((price, pIndex) => (
                                            <td key={pIndex} className="p-4 text-muted-foreground font-mono font-bold whitespace-nowrap">
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

                          <div className="bg-muted border border-border rounded-xl p-5 flex gap-4 items-start">
                            <div className="p-2 rounded-full bg-yellow-500/10 shrink-0">
                              <AlertCircle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Production Notes</h4>
                              <ul className="space-y-1.5 text-sm text-muted-foreground font-medium">
                                {table.notes?.map((noteLine, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-[var(--primary)] mt-[1px] shrink-0 text-xs">✔</span>
                                    <span className="leading-relaxed">{noteLine}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}