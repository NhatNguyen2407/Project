import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { useCart } from '../../context/CartContext';
import { COUNTRY_LIST } from '../../data/storeData';
import { ToastNotification } from '../common_components/ToastNotification';
import { TermsOfServiceModal } from '../common_components/TermsOfServiceModal';
import { supabase } from '../../service/supabase';
import { useAuth } from '../../context/AuthContext';

const PAYPAL_CLIENT_ID = "AQ13HgNvoGjg75Qjftly9tG4aTYywjNbUyG4YW5MxBY567O2cTajzDfVEWQLoUGKq_kfD8N5IVm4SMRK";

export function CheckoutModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [shippingForm, setShippingForm] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', postalCode: '',
    countryCode: 'VN', phoneCode: '+84', phoneNumber: ''
  });
  
  const [acceptedStoreTerms, setAcceptedStoreTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const finalPrice = (cartTotal + 15).toFixed(2);

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

  const validateCheckoutForm = () => {
    const { email, firstName, lastName, address, city, phoneNumber } = shippingForm;
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !phoneNumber.trim()) {
      showToast('Please fill out all required information columns! 📝', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Invalid email structural layout! ✉️', 'error');
      return false;
    }
    if (!acceptedStoreTerms) {
      showToast('You must agree to the Terms of Service before checkout! ⚠️', 'error');
      return false;
    }
    return true;
  };

  const saveOrderToDatabase = async (transactionId) => {
    try {
      const { email, firstName, lastName, address, city, postalCode, countryCode, phoneCode, phoneNumber } = shippingForm;
      const orderSummary = cart.map(item => `${item.qty}x ${item.name}`).join(' | ');
      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      const fullAddress = `${firstName} ${lastName} - ${address}, ${city}, ${postalCode} (${countryCode})`;
      const fullPhone = `${phoneCode} ${phoneNumber}`;

      const { error } = await supabase.from('inquiries').insert([{
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
        total_amount: parseFloat(finalPrice),
        payment_method: 'paypal',
        payment_status: 'paid',
        transaction_id: transactionId,
        total_paid: parseFloat(finalPrice)
      }]);

      if (error) throw error;

      setOrderComplete(true);
      setTimeout(() => {
        setOrderComplete(false);
        setAcceptedStoreTerms(false);
        clearCart();
        onClose(); 
        setShippingForm({
          email: '', firstName: '', lastName: '', address: '', city: '', postalCode: '', countryCode: 'VN', phoneCode: '+84', phoneNumber: ''
        });
      }, 4000);

    } catch (error) {
      console.error('Lỗi khi chốt đơn:', error);
      showToast('Database Error! Please contact support with your Transaction ID.', 'error');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative z-10">
            
            <button type="button" onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/80 rounded-full hover:bg-[var(--primary)] text-white cursor-pointer transition-colors shadow-lg">
              <X className="w-6 h-6" />
            </button>

            <ToastNotification toast={toast} />
            <TermsOfServiceModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

            {orderComplete ? (
              <div className="w-full p-16 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-full" />
                <h2 className="text-4xl font-bold text-white mb-4 font-heading">Order Confirmed!</h2>
                <p className="text-[var(--silver-gray)] text-lg max-w-md mb-8">Thank you for your purchase. We have received your payment and will send a tracking link to your email shortly.</p>
              </div>
            ) : (
              <>
                <div className="w-full md:w-3/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--border)] space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-[var(--primary)]" /> Delivery Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">Email Contact *</label>
                        <input required type="email" name="email" value={shippingForm.email} onChange={handleInputChange} placeholder="example@gmail.com" className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--silver-gray)] font-semibold">Country / Region *</label>
                        <div className="relative">
                          <select name="countryCode" value={shippingForm.countryCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1A1528] border border-[var(--border)] rounded-xl text-white focus:border-[var(--primary)] outline-none appearance-none cursor-pointer font-medium">
                            {COUNTRY_LIST.map(country => (
                              <option key={country.code} value={country.code} className="bg-[#1A1528] text-white">{country.name} ({country.dialCode})</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
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
                          <span className="bg-white/5 px-4 flex items-center text-[var(--silver-gray)] text-sm font-bold border-r border-[var(--border)] select-none">{shippingForm.phoneCode}</span>
                          <input required type="tel" name="phoneNumber" value={shippingForm.phoneNumber} onChange={handleInputChange} placeholder="987654321" className="w-full px-4 py-3 bg-transparent text-white outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--primary)]" /> Payment Gateways</h3>
                    <div className="p-4 bg-[#1A1528] border border-[var(--primary)]/50 rounded-xl shadow-[0_0_15px_rgba(139,114,190,0.15)]">
                      <div className="flex items-center gap-3 text-[var(--silver-gray)]">
                        <input type="radio" checked readOnly className="w-4 h-4 accent-[var(--primary)]" />
                        <span className="font-bold text-white flex items-center gap-2">PayPal / Credit Card</span>
                      </div>
                      <p className="text-sm mt-2 opacity-70">Secured and encrypted by PayPal. You don't need a PayPal account to pay with your credit card.</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/5 p-8 md:p-12 bg-[#1A1528] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 font-heading">Order Summary</h3>
                    <div className="space-y-4 max-h-[25vh] overflow-y-auto mb-6 pr-2 border-b border-[var(--border)] pb-6 custom-scrollbar">
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
                    <div className="space-y-3 text-sm text-[var(--silver-gray)] border-b border-[var(--border)] pb-6 mb-6">
                      <div className="flex justify-between"><span>Subtotal</span> <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Shipping Fee</span> <span className="font-semibold text-white">$15.00</span></div>
                      <div className="flex justify-between"><span>Taxes</span> <span className="font-semibold text-white">Calculated at payment</span></div>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold text-white">Total Amount</span>
                      <span className="text-3xl font-bold text-[var(--primary)]">${finalPrice}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mt-auto">
                    <div className="flex items-center gap-3 bg-[var(--cyber-black)] p-4 rounded-xl border border-[var(--border)]">
                      <input type="checkbox" id="storeTermsCheck" checked={acceptedStoreTerms} onChange={(e) => setAcceptedStoreTerms(e.target.checked)} className="w-5 h-5 accent-[var(--primary)] cursor-pointer flex-shrink-0" />
                      <label htmlFor="storeTermsCheck" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                        I have read and agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-[var(--primary)] font-bold underline ml-1 hover:text-white transition-colors">Terms of Service</span> *
                      </label>
                    </div>

                    <div className="w-full relative z-0">
                      <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
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
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [{
                                amount: {
                                  value: finalPrice
                                },
                                description: "Dioxyzine Frog Store Order"
                              }]
                            });
                          }}
                          onApprove={async (data, actions) => {
                            try {
                              const details = await actions.order.capture();
                              const transactionId = details.id;
                              await saveOrderToDatabase(transactionId);
                            } catch (error) {
                              showToast("Transaction failed or was canceled.", "error");
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal Error:", err);
                            showToast("Payment Gateway encountered an error.", "error");
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}