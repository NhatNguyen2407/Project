import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// 🚀 ĐÃ SỬA: Import thẳng PackageCheck từ lucide-react luôn
import { Search, Package, Truck, CheckCircle2, Factory, PenTool, FileText, AlertCircle, Calendar, Hash, PackageCheck } from 'lucide-react';
import { supabase } from '../service/supabase';
import { SEO } from '../components/common_components/SEO';

// Cấu hình các bước tracking
const TRACKING_STEPS = [
  { id: 'pending', label: 'Order Placed', desc: 'We have received your order.', icon: FileText },
  { id: 'prototyping', label: 'Prototyping', desc: 'Creating & revising your 3D sample.', icon: PenTool },
  { id: 'production', label: 'Mass Production', desc: 'Manufacturing your items.', icon: Factory },
  { id: 'shipping', label: 'Shipping', desc: 'Package is on the way.', icon: Truck },
  { id: 'delivered', label: 'Delivered', desc: 'Package has arrived safely.', icon: PackageCheck }
];

export function OrderTrackingPage() {
  const [searchId, setSearchId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', searchId.trim())
        .single();

      if (fetchError) {
        throw new Error('Order not found. Please check your Order ID.');
      }

      setOrderData(data);
    } catch (err) {
      setError(err.message || 'Could not find your order.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!orderData) return -1;
    const status = (orderData.status || 'pending').toLowerCase();
    const index = TRACKING_STEPS.findIndex(step => step.id === status);
    return index !== -1 ? index : 0; 
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <SEO title="Track Your Order" description="Check the live status of your custom plush and merch orders." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề & Ô tìm kiếm */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-4 drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
            Track Your Order
          </h1>
          <p className="text-[var(--silver-gray)] text-lg mb-8">
            Enter your Order ID below to see the real-time production status.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Enter your Order ID (e.g., 123e4567-...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-6 pr-16 py-4 bg-[#1A1528] border border-[var(--border)] rounded-full text-white focus:outline-none focus:border-[var(--primary)] shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-[var(--primary)] hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </form>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kết quả Tracking */}
        <AnimatePresence>
          {orderData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 border-b border-white/10 pb-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[var(--primary)]" />
                    {orderData.product_name || 'Custom Merchandise'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--silver-gray)]">
                    <span className="flex items-center gap-1.5"><Hash className="w-4 h-4" /> {orderData.id.slice(0, 8).toUpperCase()}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(orderData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {orderData.tracking_code && (
                  <div className="bg-[#1A1528] px-5 py-3 rounded-xl border border-[var(--primary)]/30 text-right">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-1">Tracking Code</p>
                    <p className="text-[var(--primary)] font-mono font-bold text-lg">{orderData.tracking_code}</p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-6 md:left-10 top-0 bottom-0 w-0.5 md:w-auto md:h-0.5 md:top-6 md:bottom-auto md:left-[10%] md:right-[10%] bg-white/10 -z-10"></div>
                <div 
                  className="absolute left-6 md:left-10 top-0 w-0.5 md:w-auto md:h-0.5 md:top-6 md:left-[10%] bg-[var(--primary)] transition-all duration-1000 -z-10 shadow-[0_0_10px_var(--primary)]"
                  style={{ 
                    height: window.innerWidth < 768 ? `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` : 'auto',
                    width: window.innerWidth >= 768 ? `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` : 'auto'
                  }}
                ></div>

                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-0">
                  {TRACKING_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 flex-shrink-0 ${
                          isCompleted ? 'bg-[var(--primary)] border-[var(--card)] text-white' : 
                          isCurrent ? 'bg-[var(--card)] border-[var(--primary)] text-[var(--primary)] shadow-[0_0_15px_rgba(139,114,190,0.5)]' : 
                          'bg-[#1A1528] border-[var(--card)] text-gray-600'
                        }`}>
                          <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h4 className={`font-bold mb-1 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}`}>
                            {step.label}
                          </h4>
                          <p className={`text-xs md:text-sm ${isCurrent ? 'text-[var(--primary)]' : 'text-gray-500'} hidden md:block max-w-[120px] mx-auto`}>
                            {step.desc}
                          </p>
                          <p className={`text-xs md:hidden ${isCurrent ? 'text-[var(--primary)]' : 'text-gray-500'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}