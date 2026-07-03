import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useLocation, Navigate } from 'react-router';
import { Printer, Truck, RotateCcw, Crown, ChevronRight, Construction } from 'lucide-react';

export function TermsPage() {
  const location = useLocation();
  
  // Lấy phần cuối của URL để xác định tab hiện tại
  const currentPath = location.pathname.split('/').pop();

  const tabs = [
    { id: 'printing', label: 'Terms of Printing', icon: Printer, path: '/about/terms/printing' },
    { id: 'shipping', label: 'Terms of Shipping', icon: Truck, path: '/about/terms/shipping' },
    { id: 'refund', label: 'Return & Refund Policy', icon: RotateCcw, path: '/about/terms/refund' },
    { id: 'membership', label: 'Terms of Membership', icon: Crown, path: '/about/terms/membership' },
  ];

  // Giao diện trạng thái chờ cập nhật (Coming Soon)
  const ComingSoon = ({ title }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-[400px] flex flex-col items-center justify-center text-center space-y-4"
    >
      <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
        <Construction className="w-10 h-10 text-[var(--primary)]" />
      </div>
      <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
      <p className="text-[var(--silver-gray)] max-w-md">
        The "{title}" section is under construction. We are working hard to bring you the best experience!
      </p>
    </motion.div>
  );

  const renderContent = () => {
    switch (currentPath) {
      case 'printing':
        return (
          <motion.div 
            key="printing" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Terms of Printing</h2>
            
            {/* 1. Technical Notes */}
            <div className="bg-[#1A1528] p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">1. Technical Notes</h3>
              <ul className="space-y-3 text-[var(--silver-gray)] list-disc list-inside">
                <li>Printed colors may differ by 5-10% from the original file. Cold and dark tones tend to have more color shift than warm tones.</li>
                <li>We only accept CMYK color mode for printing. If you use RGB files, please be aware of potential color discrepancies. If you design using mobile apps like IbisPaint X, you must convert the color mode before sending the file for printing, as most mobile drawing apps default to RGB.</li>
                <li>If you do not convert the color mode and adjust it yourself, note that colors like cobalt blue can easily shift to purple or have a purple tint. To avoid this, choose colors closer to cyan blue (Miku blue).</li>
                <li>We offer color mode conversion and adjustment service for a fee of 2k/file.</li>
                <li>Fabric may shrink, shift, or stretch during printing, which can affect the printed design. If the distortion is severe, we will reprint for free.</li>
                <li>Common fabric defects include: creased fabric, folded fabric, and white dust spots. If these defects affect less than 10% of the print or are not on important/noticeable details, we reserve the right not to reprint.</li>
                <li>We will reprint for free in the following cases: missing print, incorrect print, color deviation over 10%, or fabric creases on important/noticeable areas.</li>
              </ul>
            </div>

            {/* 2. Production Notes */}
            <div className="bg-[#1A1528] p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">2. Production Notes</h3>
              <ul className="space-y-3 text-[var(--silver-gray)] list-disc list-inside">
                <li>After sewing is completed, the final product may shrink by approximately 1-3cm compared to the printed pattern. Please take this into account and make your design slightly larger than the desired final size.</li>
                <li>3D products cannot be 100% identical to the 2D design due to the fabric puffing up from the stuffing. Some shapes may change (e.g., round becomes square, pointed becomes blunt, etc.).</li>
                <li>Please accept a standard production defect rate of 1-5%, such as: excess threads, details off by less than 5mm, slight seam exposure, etc.</li>
                <li>We do not have a factory production line; all items are handmade by our team of tailors. If you need any corrections, please inform us immediately when we send you the product photos.</li>
              </ul>
            </div>
          </motion.div>
        );
      
      case 'shipping':
        return <ComingSoon key="shipping" title="Terms of Shipping" />;
      
      case 'refund':
        return (
          <motion.div 
            key="refund" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Return & Refund Policy</h2>
            
            <div className="bg-[#1A1528] p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">Policy Details</h3>
              <ul className="space-y-3 text-[var(--silver-gray)] list-disc list-inside">
                <li>We will issue a partial refund based on the percentage of defects if the issues fall outside the categories listed above.</li>
                <li>Complaints about the product will not be accepted after 48 hours from the time of receipt.</li>
                <li>If you request modifications exceeding 50% of the original approved design (e.g., changing the pattern, altering already printed details, etc.), we will charge it as a new production.</li>
                <li>If you do not provide feedback or request edits during the production process when we send update photos, we will not accept any modification requests after you have received the final product. During production, we will do our best to adjust according to your preferences until you are satisfied.</li>
              </ul>
            </div>
          </motion.div>
        );

      case 'membership':
        return (
          <motion.div 
            key="membership" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Terms of Membership</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Milestone 5 - BRONZE TIER */}
              <div className="bg-gradient-to-br from-[#2D1B54] via-[#1C1236] to-[#0A0614] p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:border-[var(--primary)]/50 transition-colors">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="text-5xl font-black text-[var(--primary)] mb-2 relative z-10">05</div>
                <h4 className="text-[var(--primary)] font-bold mb-2 uppercase tracking-widest text-sm opacity-90 relative z-10">
                  Bronze Tier
                </h4>
                <div className="space-y-1 relative z-10">
                  <p className="text-[var(--primary)] font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-[var(--primary)] opacity-70">Unlock free shipping for all orders from your 5th order onwards.</p>
                </div>
              </div>

              {/* Milestone 7 - SILVER TIER */}
              <div className="bg-gradient-to-br from-[#3A1C6E] via-[#211343] to-[#100A21] p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:border-[var(--primary)]/50 transition-colors">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="text-5xl font-black text-[var(--primary)] mb-2 relative z-10">07</div>
                <h4 className="text-[var(--primary)] font-bold mb-2 uppercase tracking-widest text-sm opacity-90 relative z-10">
                  Silver Tier
                </h4>
                <div className="space-y-1 relative z-10">
                  <p className="text-[var(--primary)] font-semibold text-sm">-5% OFF + Freeship</p>
                  <p className="text-xs text-[var(--primary)] opacity-70">Get 5% discount on total bills plus permanent free shipping.</p>
                </div>
              </div>

              {/* Milestone 10 - GOLD VIP */}
              <div className="bg-gradient-to-br from-[#4A154B] via-[#2C1654] to-[#120C1F] p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:border-[var(--primary)]/50 transition-colors">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="text-5xl font-black text-[var(--primary)] mb-2 relative z-10">10</div>
                <h4 className="text-[var(--primary)] font-bold mb-2 uppercase tracking-widest text-sm opacity-90 relative z-10">
                  Gold VIP
                </h4>
                <div className="space-y-1 relative z-10">
                  <p className="text-[var(--primary)] font-semibold text-sm">-10% OFF + Freeship</p>
                  <p className="text-xs text-[var(--primary)] opacity-70">Gold VIP status: 10% off permanently for all future orders.</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 italic">*Note: The system counts your milestones based on successfully completed orders within your account.</p>
          </motion.div>
        );
      default:
        return <Navigate to="/about/terms/printing" replace />;
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-transparent relative z-10">
      <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.3)]">
            Terms & Conditions
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-[#1A1528] rounded-3xl p-4 border border-[var(--border)] shadow-lg sticky top-28 flex flex-col gap-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 w-full p-4 rounded-2xl transition-all duration-300 text-left
                    ${isActive 
                      ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(139,114,190,0.1)]' 
                      : 'text-[var(--silver-gray)] hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm md:text-base flex-1">{tab.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50 hidden md:block" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}