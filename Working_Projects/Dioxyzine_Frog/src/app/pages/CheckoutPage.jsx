import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, CreditCard, CheckCircle2, ArrowLeft, Ticket, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import emailjs from '@emailjs/browser';

import { useCart } from '../context/CartContext';
import { COUNTRY_LIST } from '../data/storeData';
import { ToastNotification } from '../components/common_components/ToastNotification';
import { TermsOfServiceModal } from '../components/common_components/TermsOfServiceModal';
import { supabase } from '../service/supabase';
import { useAuth } from '../../app/context/AuthContext';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [shippingForm, setShippingForm] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', postalCode: '',
    countryCode: 'VN', phoneCode: '+84', phoneNumber: ''
  });
  
  const [acceptedStoreTerms, setAcceptedStoreTerms] = useState(false);
  const [showTermsOfServiceModal, setShowTermsOfServiceModal] = useState(false);
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  useEffect(() => {
    const selected = COUNTRY_LIST.find(c => c.code === shippingForm.countryCode);
    if (selected) {
      setShippingForm(prev => ({ ...prev, phoneCode: selected.dialCode }));
    }
  }, [shippingForm.countryCode]);

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500);
  };

  const handleInputChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleApplyVoucher = async () => {
    if (!promoCodeInput.trim()) return;
    setCheckingVoucher(true);

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', promoCodeInput.trim().toUpperCase())
        .single();
      if (error || !data) {
        showToast('Invalid promo code!', 'error');
        setAppliedVoucher(null);
        return;
      }

      if (!data.is_active) {
        showToast('This promo code is currently disabled.', 'error');
        return;
      }
      
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        showToast('This promo code has reached its usage limit.', 'error');
        return;
      }

      if (data.expires_at && new Date() > new Date(data.expires_at)) {
        showToast('This promo code has expired.', 'error');
        return;
      }

      setAppliedVoucher(data);
      showToast('Promo code applied successfully!', 'success');

    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setPromoCodeInput('');
  };

  const SHIPPING_FEE = 15;
  
  const getDiscountAmount = () => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discount_type === 'percent') {
      return cartTotal * (appliedVoucher.discount_value / 100);
    }
    return appliedVoucher.discount_value;
  };

  const discountValue = getDiscountAmount();
  const finalPrice = Math.max(0, cartTotal + SHIPPING_FEE - discountValue);

  // kiểm tra form
  const validateCheckoutForm = () => {
    const { email, firstName, lastName, address, city, phoneNumber } = shippingForm;
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !phoneNumber.trim()) {
      showToast('Please fill out all required information columns!', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Invalid email structural layout!', 'error');
      return false;
    }
    if (!acceptedStoreTerms) {
      showToast('You must agree to the Terms of Service before checkout!', 'error');
      return false;
    }
    return true;
  };

  // lưu database sau khi trả tiền
  const saveOrderToDatabase = async (transactionId) => {
    try {
      const { email, firstName, lastName, address, city, postalCode, countryCode, phoneCode, phoneNumber } = shippingForm;
      const orderSummary = cart.map(item => `${item.qty}x ${item.name}`).join(' | ');
      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      const fullAddress = `${firstName} ${lastName} - ${address}, ${city}, ${postalCode} (${countryCode})`;
      const fullPhone = `${phoneCode} ${phoneNumber}`;

      const { error: orderError } = await supabase.from('inquiries').insert([{
        user_id: user ? user.id : null, 
        customer_email: email,          
        customer_name: `${firstName} ${lastName}`,
        subject: '[READY-MADE] Store Order',
        contact_info: fullPhone,
        image_link: cart[0]?.image || 'N/A', 
        product_name: `[READY-MADE] ${orderSummary}`,
        quantity: totalQty,
        status: 'pending',
        shipping_address: fullAddress,
        phone_number: fullPhone,
        total_amount: finalPrice,
        payment_method: 'paypal',
        payment_status: 'paid',
        transaction_id: transactionId,
        total_paid: finalPrice
      }]);

      if (orderError) throw orderError;

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          'template_qeyzv5c',
          {
            to_email: email,
            customer_name: `${firstName} ${lastName}`,
            order_id: transactionId, 
            product_name: orderSummary,
            total_amount: `$${finalPrice.toFixed(2)}`
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        console.log("Đã gửi email biên lai thành công!");
      } catch (emailError) {
        console.error("Lỗi khi gửi email xác nhận:", emailError);
      }

      // +1 Voucher bảo mật bằng RPC
      if (appliedVoucher) {
        const { error: voucherError } = await supabase
          .rpc('increment_voucher_usage', { voucher_id: appliedVoucher.id });
        
        if (voucherError) {
          console.error('Lỗi khi cập nhật số lượt dùng Voucher:', voucherError);
        }
      }

      setOrderComplete(true);
      setTimeout(() => {
        setOrderComplete(false);
        setAcceptedStoreTerms(false);
        setAppliedVoucher(null);
        clearCart(); 
        setShippingForm({
          email: '', firstName: '', lastName: '', address: '', city: '', postalCode: '', countryCode: 'VN', phoneCode: '+84', phoneNumber: ''
        });
      }, 4000);

    } catch (error) {
      console.error('Lỗi khi chốt đơn:', error);
      showToast('Database Error! Please contact support with your Transaction ID.', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <ToastNotification toast={toast} />
      <TermsOfServiceModal isOpen={showTermsOfServiceModal} onClose={() => setShowTermsOfServiceModal(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center gap-2 text-[var(--silver-gray)] hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Shopping
          </Link>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
          {/* lock mouse when finalizing */}
          <AnimatePresence>
            {isFinalizing && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0a14]/90 backdrop-blur-md"
              >
                <Loader2 className="w-16 h-16 text-[var(--primary)] animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2 font-heading tracking-wider">Processing Your Order...</h2>
                <p className="text-[var(--silver-gray)] text-center max-w-md px-4 animate-pulse">
                  Please do not close or refresh this page. We are finalizing your receipt and updating the system.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {orderComplete ? (
            <div className="w-full p-16 flex flex-col items-center justify-center text-center bg-[var(--card)]">
              <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-full" />
              <h2 className="text-4xl font-bold text-white mb-4 font-heading">Order Confirmed!</h2>
              <p className="text-[var(--silver-gray)] text-lg max-w-md mb-8">Thank you for your purchase. We have received your payment and will process your order shortly.</p>
            </div>
          ) : (
            <>
              <div className="w-full md:w-3/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--border)] space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[var(--primary)]" /> Delivery Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--silver-gray)] font-semibold">Email Contact *</label>
                      <input required type="email" name="email" value={shippingForm.email} onChange={handleInputChange} placeholder="example@gmail.com" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--silver-gray)] font-semibold">Country / Region *</label>
                      <div className="relative">
                        <select 
                          name="countryCode" 
                          value={shippingForm.countryCode} 
                          onChange={handleInputChange} 
                          className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none appearance-none cursor-pointer font-medium"
                        >
                          {COUNTRY_LIST.map(country => (
                            <option key={country.code} value={country.code} className="bg-[#1A1528] text-white">
                              {country.flag} {country.name} ({country.dialCode})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--silver-gray)]">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">First Name *</label>
                        <input required type="text" name="firstName" value={shippingForm.firstName} onChange={handleInputChange} placeholder="John" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">Last Name *</label>
                        <input required type="text" name="lastName" value={shippingForm.lastName} onChange={handleInputChange} placeholder="Doe" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--silver-gray)] font-semibold">Street Address *</label>
                      <input required type="text" name="address" value={shippingForm.address} onChange={handleInputChange} placeholder="House number, Street name..." className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">City *</label>
                        <input required type="text" name="city" value={shippingForm.city} onChange={handleInputChange} placeholder="Hanoi" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">Postal Code (Optional)</label>
                        <input type="text" name="postalCode" value={shippingForm.postalCode} onChange={handleInputChange} placeholder="100000" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--silver-gray)] font-semibold">Phone Number *</label>
                      <div className="flex bg-[#1A1528] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--primary)] transition-colors">
                        <span className="bg-white/5 px-4 flex items-center gap-2 text-[var(--silver-gray)] text-sm font-bold border-r border-[var(--border)] select-none">
                          <span className="text-lg">{COUNTRY_LIST.find(c => c.code === shippingForm.countryCode)?.flag}</span>
                          {shippingForm.phoneCode}
                        </span>
                        <input 
                          required 
                          type="tel" 
                          name="phoneNumber" 
                          value={shippingForm.phoneNumber} 
                          onChange={handleInputChange} 
                          placeholder="987 654 321" 
                          className="w-full px-4 py-3 bg-transparent text-white outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[var(--primary)]" /> Payment Options
                  </h3>
                  <div className="p-4 bg-[#1A1528] border border-[var(--border)] rounded-xl">
                    <div className="flex items-center gap-3 text-[var(--silver-gray)]">
                      <input type="radio" checked readOnly className="w-4 h-4 accent-[var(--primary)]" />
                      <span className="font-semibold text-white">Secure E-Commerce Gateway</span>
                    </div>
                    <p className="text-sm mt-2 opacity-70">Redirects to secure payment validation interface after placement confirmation. Supports PayPal & Credit Cards.</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-12 bg-[#1A1528] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 font-heading">Order Summary</h3>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 pr-2 border-b border-[var(--border)] pb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 relative">
                        <div className="relative flex-shrink-0">
                          <img src={item.image} className="w-16 h-16 rounded-lg object-cover border border-[var(--border)]" alt={item.name} />
                          <span className="absolute -top-2 -right-2 bg-[var(--muted-foreground)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.qty}</span>
                        </div>
                        <p className="text-sm text-white font-semibold flex-grow line-clamp-2">{item.name}</p>
                        <p className="text-sm text-[var(--silver-gray)] font-bold">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 border-b border-[var(--border)] pb-6">
                    <label className="text-xs text-[var(--silver-gray)] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Promo Code</label>
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-3 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-green-500 font-mono uppercase">{appliedVoucher.code}</p>
                          <p className="text-xs text-green-500/80">
                            {appliedVoucher.discount_type === 'percent' ? `${appliedVoucher.discount_value}% discount applied` : `$${appliedVoucher.discount_value} fixed discount applied`}
                          </p>
                        </div>
                        <button onClick={handleRemoveVoucher} className="p-1.5 text-green-500 hover:bg-green-500/20 rounded-lg cursor-pointer transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={promoCodeInput} 
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder="Enter your code" 
                          className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono uppercase focus:border-[var(--primary)] outline-none transition-colors text-sm" 
                        />
                        <button 
                          type="button" 
                          onClick={handleApplyVoucher}
                          disabled={!promoCodeInput.trim() || checkingVoucher}
                          className="px-5 py-3 bg-[var(--card)] hover:bg-[var(--primary)] text-white border border-[var(--border)] hover:border-transparent font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {checkingVoucher ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-[var(--silver-gray)] border-b border-[var(--border)] pb-6 mb-6">
                    <div className="flex justify-between"><span>Subtotal</span> <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping Fee</span> <span className="font-semibold text-white">${SHIPPING_FEE.toFixed(2)}</span></div>
                    
                    <AnimatePresence>
                      {appliedVoucher && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-yellow-500 font-bold overflow-hidden mt-3">
                          <span>Discount ({appliedVoucher.code})</span> 
                          <span>-${discountValue.toFixed(2)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-white">Total Amount</span>
                    <div className="text-right">
                      {appliedVoucher && (
                        <p className="text-sm text-gray-500 line-through">${(cartTotal + SHIPPING_FEE).toFixed(2)}</p>
                      )}
                      <span className="text-3xl font-bold text-[var(--primary)]">${finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)]">
                    <input type="checkbox" id="storeTermsCheck" checked={acceptedStoreTerms} onChange={(e) => setAcceptedStoreTerms(e.target.checked)} className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" />
                    <label htmlFor="storeTermsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                      I have read and agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsOfServiceModal(true); }} className="text-[var(--primary)] font-bold underline ml-1 hover:text-white transition-colors">Terms of Service</span> *
                    </label>
                  </div>

                  <div className="w-full relative z-0 mt-4">
                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", locale: "en_US" }}>
                      <PayPalButtons 
                        style={{ 
                          layout: "vertical", 
                          color: "silver", 
                          shape: "rect", 
                          label: "pay",
                          height: 48 
                        }}
                        onClick={(data, actions) => {
                          const isValid = validateCheckoutForm();
                          if (!isValid) return actions.reject();
                          return actions.resolve();
                        }}
                        // Xóa cái createOrder cũ và thay bằng cái này:
                        createOrder={async () => {
                          try {
                            // 🚀 GỌI BACKEND: Nhờ Supabase Edge Function tạo đơn hàng giúp
                            const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                              body: { amount: finalPrice.toFixed(2) }
                            });

                            if (error || !data || !data.id || data.error) {
                              console.error("Lỗi từ Supabase Function:", error || data);
                              showToast("Server error when connecting to PayPal.", "error");
                              return null;
                            }
                            // data.id chính là mã đơn hàng (Order ID) an toàn tuyệt đối do PayPal cấp
                            return data.id; 
                          } catch (err) {
                            console.error("Lỗi khởi tạo PayPal Order:", err);
                            showToast("Could not initialize payment.", "error");
                            return null;
                          }
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            setIsFinalizing(true);
                            const details = await actions.order.capture();
                            await saveOrderToDatabase(details.id);
                            setIsFinalizing(false);
                          } catch (error) {
                            showToast("Transaction failed or was canceled.", "error");
                            setIsFinalizing(false);
                          }
                        }}
                        onError={(err) => {
                          console.error("PayPal Error:", err);
                          showToast("Payment Gateway encountered an error.", "error");
                          setIsFinalizing(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}