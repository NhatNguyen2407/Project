import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// Bổ sung icon Ticket, ToggleLeft, ToggleRight cho phần Vouchers
import { PackageSearch, PackagePlus, Edit, Trash2, X, PlusCircle, Save, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import emailjs from '@emailjs/browser';

export function AdminPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', hoặc 'vouchers'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]); // State cho Vouchers
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Form Sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: '', title: '', description: '', category: 'Customize', type: 'custom',
    price: 0, stock: 0, moq: 11, image_cover: '', images_gallery: ''
  });

  // Form Voucher
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    code: '', discount_type: 'percent', discount_value: 10, usage_limit: null, expires_at: ''
  });

  useEffect(() => {
    if (user === null) navigate('/login');
    else if (user && role !== 'admin') navigate('/profile');
  }, [user, role, navigate]);

  const STATUS_FLOW = [
    { value: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' },
    { value: 'Confirmed', color: 'text-blue-500 bg-blue-500/10' },
    { value: 'Processing', color: 'text-purple-500 bg-purple-500/10' },
    { value: 'Shipping', color: 'text-indigo-500 bg-indigo-500/10' },
    { value: 'Completed', color: 'text-green-500 bg-green-500/10' },
    { value: 'Returned', color: 'text-red-500 bg-red-500/10' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts, resVouchers] = await Promise.all([
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('vouchers').select('*').order('created_at', { ascending: false }) // Tải dữ liệu Vouchers
      ]);
      if (resOrders.data) setOrders(resOrders.data);
      if (resProducts.data) setProducts(resProducts.data);
      if (resVouchers.data) setVouchers(resVouchers.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') fetchData();
  }, [role]);

  // --- LOGIC ĐƠN HÀNG ---
  const handleUpdateStatus = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      let updateData = { status: newStatus };
      let trackingCode = order.tracking_code;

      if (newStatus === 'Shipping') {
        trackingCode = window.prompt("Vui lòng nhập mã vận đơn Viettel Post cho đơn này:");
        if (!trackingCode) {
          setUpdatingId(null);
          return;
        }
        updateData.tracking_code = trackingCode;
      }

      const { error } = await supabase.from('inquiries').update(updateData).eq('id', order.id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === order.id ? { ...o, ...updateData } : o));

      if (newStatus === 'Shipping') {
        const customerEmail = order.customer_email || order.user_email;
        if (customerEmail) {
          try {
            await emailjs.send(
              'service_ief99r9', 'template_1n0wscd',
              {
                to_email: customerEmail,
                customer_name: order.customer_name || 'Quý khách',
                order_id: order.id.substring(0, 8),
                product_name: order.product_name,
                tracking_code: trackingCode,
                tracking_link: 'https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/'
              },
              'XNy24de8QlT536ZQU'
            );
            alert("✅ Đã lưu mã vận đơn và gửi Email tự động cho khách hàng!");
          } catch (emailErr) {
            console.error("Lỗi EmailJS:", emailErr);
            alert("⚠️ Lưu thành công, nhưng gửi Email thất bại. Hãy kiểm tra lại cấu hình EmailJS.");
          }
        }
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateShippingDate = async (orderId, newDate) => {
    try {
      await supabase.from('inquiries').update({ estimated_shipping_date: newDate }).eq('id', orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, estimated_shipping_date: newDate } : o));
    } catch (err) { console.error(err); }
  };

  // --- LOGIC CMS SẢN PHẨM ---
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({
        id: `NEW-${Math.floor(Math.random()*1000)}`, title: '', description: '', 
        category: 'Customize', type: 'custom', price: 0, stock: 0, moq: 11, 
        image_cover: '', images_gallery: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').upsert(productForm);
      if (error) throw error;
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Lỗi lưu sản phẩm: " + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) { alert(err.message); }
  };

  // --- LOGIC VOUCHERS ---
  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    try {
      // Ép kiểu usage_limit về rỗng nếu người dùng không nhập
      const finalData = { ...voucherForm };
      if (!finalData.usage_limit) finalData.usage_limit = null;
      if (!finalData.expires_at) finalData.expires_at = null;
      
      finalData.code = finalData.code.toUpperCase(); // Luôn viết hoa mã giảm giá

      const { error } = await supabase.from('vouchers').insert([finalData]);
      if (error) throw error;
      
      await fetchData();
      setIsVoucherModalOpen(false);
      setVoucherForm({ code: '', discount_type: 'percent', discount_value: 10, usage_limit: null, expires_at: '' });
      alert("Tạo mã thành công!");
    } catch (err) {
      alert("Lỗi tạo mã: " + err.message);
    }
  };

  const handleToggleVoucher = async (id, currentStatus) => {
    try {
      await supabase.from('vouchers').update({ is_active: !currentStatus }).eq('id', id);
      setVouchers(vouchers.map(v => v.id === id ? { ...v, is_active: !currentStatus } : v));
    } catch (err) { alert(err.message); }
  };

  const handleDeleteVoucher = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này vĩnh viễn?")) return;
    try {
      await supabase.from('vouchers').delete().eq('id', id);
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (err) { alert(err.message); }
  };

  if (!user || role !== 'admin') return <div className="min-h-screen pt-28 text-center text-white">Checking Auth...</div>;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TABS ĐIỀU HƯỚNG */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-wrap gap-2 bg-[#1A1528] p-1.5 rounded-xl border border-[var(--border)]">
            <button onClick={() => setActiveTab('orders')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'orders' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
              📦 Orders ({orders.length})
            </button>
            <button onClick={() => setActiveTab('products')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
              🏷️ CMS Products ({products.length})
            </button>
            {/* THÊM TAB VOUCHERS */}
            <button onClick={() => setActiveTab('vouchers')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'vouchers' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
              🎟️ Promo Codes
            </button>
          </div>
          
          {activeTab === 'products' && (
            <button onClick={() => openProductModal()} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg">
              <PlusCircle className="w-5 h-5" /> Add Product
            </button>
          )}
          {activeTab === 'vouchers' && (
            <button onClick={() => setIsVoucherModalOpen(true)} className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg">
              <Ticket className="w-5 h-5" /> Create Code
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--primary)]">Loading database...</div>
        ) : activeTab === 'orders' ? (
          /* BẢNG ORDERS CŨ (GIỮ NGUYÊN) */
          <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[var(--silver-gray)] text-sm uppercase">
                    <th className="p-5 font-semibold">Order ID</th>
                    <th className="p-5 font-semibold">Customer</th>
                    <th className="p-5 font-semibold">Product Info</th>
                    <th className="p-5 font-semibold">Est. Shipping</th>
                    <th className="p-5 font-semibold">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="p-5 font-mono text-[var(--primary)] text-sm">#{order.id.substring(0, 8)}</td>
                      <td className="p-5 text-gray-300 text-sm truncate max-w-[150px]">{order.customer_email || order.user_email || 'Unknown'}</td>
                      <td className="p-5"><div className="font-bold text-white text-sm">{order.product_name}</div><div className="text-xs text-gray-400">Qty: {order.quantity} | {order.product_type}</div></td>
                      <td className="p-5">
                        <input type="date" value={order.estimated_shipping_date || ''} onChange={(e) => handleUpdateShippingDate(order.id, e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="bg-black/40 border border-white/10 text-[var(--primary)] text-xs rounded-xl p-2 outline-none cursor-pointer" />
                      </td>
                      <td className="p-5">
                        <select value={order.status || 'Pending'} onChange={(e) => handleUpdateStatus(order, e.target.value)} disabled={updatingId === order.id} className="bg-black/50 border border-white/10 text-white text-xs rounded-lg p-2 outline-none cursor-pointer">
                          {STATUS_FLOW.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          /* BẢNG CMS PRODUCTS (GIỮ NGUYÊN) */
          <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[var(--silver-gray)] text-sm uppercase">
                    <th className="p-5 font-semibold">Image</th>
                    <th className="p-5 font-semibold">Product Name</th>
                    <th className="p-5 font-semibold">Category / Type</th>
                    <th className="p-5 font-semibold">Price / Stock</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="p-5"><img src={p.image_cover} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-white/10" /></td>
                      <td className="p-5 font-bold text-white text-sm">{p.title} <div className="text-xs text-gray-500 font-normal">{p.id}</div></td>
                      <td className="p-5 text-sm text-[var(--primary)] font-semibold">{p.category} <span className="text-gray-500">({p.type})</span></td>
                      <td className="p-5 text-sm text-gray-300">
                        {p.type === 'readyuse' ? `$${p.price} | Kho: ${p.stock}` : `MOQ: ${p.moq} | ${p.pricing_type}`}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => openProductModal(p)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 cursor-pointer transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* 🚀 BẢNG CMS VOUCHERS MỚI THÊM 🚀 */
          <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[var(--silver-gray)] text-sm uppercase">
                    <th className="p-5 font-semibold">Promo Code</th>
                    <th className="p-5 font-semibold">Discount</th>
                    <th className="p-5 font-semibold">Usage Limits</th>
                    <th className="p-5 font-semibold text-center">Active</th>
                    <th className="p-5 font-semibold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vouchers.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào được tạo.</td></tr>}
                  {vouchers.map((v) => (
                    <tr key={v.id} className={`hover:bg-white/5 ${!v.is_active ? 'opacity-50' : ''}`}>
                      <td className="p-5 font-bold font-mono text-xl text-yellow-500">{v.code}</td>
                      <td className="p-5 text-white font-bold text-sm">
                        {v.discount_type === 'percent' ? `${v.discount_value}% OFF` : `-$${v.discount_value}`}
                      </td>
                      <td className="p-5 text-sm text-gray-300">
                        Đã dùng: <strong className="text-white">{v.used_count}</strong> {v.usage_limit ? `/ ${v.usage_limit}` : '(Không giới hạn)'}
                      </td>
                      <td className="p-5 text-center">
                        <button onClick={() => handleToggleVoucher(v.id, v.is_active)} className="cursor-pointer">
                          {v.is_active ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDeleteVoucher(v.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM (GIỮ NGUYÊN) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-8 max-w-2xl w-full my-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><PackagePlus className="text-[var(--primary)]" /> {editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Product ID</label>
                    <input required value={productForm.id || ''} onChange={e => setProductForm({...productForm, id: e.target.value})} disabled={!!editingProduct} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Product Title</label>
                    <input required value={productForm.title || ''} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Category</label>
                    <select value={productForm.category || 'Customize'} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                      <option value="Plushie">Plushie</option><option value="Doll">Doll</option><option value="Customize">Customize</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Type</label>
                    <select value={productForm.type || 'custom'} onChange={e => setProductForm({...productForm, type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                      <option value="custom">Custom Order</option><option value="readyuse">Ready-made</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <label className="text-xs text-gray-400">Price ($)</label>
                    <input type="number" step="0.01" value={productForm.price || 0} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Stock</label>
                    <input type="number" value={productForm.stock || 0} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">MOQ</label>
                    <input type="number" value={productForm.moq || 11} onChange={e => setProductForm({...productForm, moq: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Cover Image URL</label>
                  <input required value={productForm.image_cover || ''} onChange={e => setProductForm({...productForm, image_cover: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Gallery Images</label>
                  <textarea rows={2} value={productForm.images_gallery || ''} onChange={e => setProductForm({...productForm, images_gallery: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none resize-none" />
                </div>
                <div>
                    <label className="text-xs text-gray-400">Cut Style (Chỉ dành cho Plushie 2D)</label>
                    <select value={productForm.cut_style || 'borderless'} onChange={e => setProductForm({...productForm, cut_style: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer">
                      <option value="borderless">Không sát viền (Borderless)</option>
                      <option value="bordered">Sát viền (Bordered)</option>
                    </select>
                  </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 MODAL TẠO MÃ GIẢM GIÁ 🚀 */}
      <AnimatePresence>
        {isVoucherModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-yellow-500/30 rounded-3xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Ticket className="text-yellow-500" /> New Promo Code</h3>
                <button onClick={() => setIsVoucherModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveVoucher} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold">CODE NAME (VD: FROGGY10)</label>
                  <input required type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-lg font-mono text-yellow-500 uppercase focus:border-yellow-500 outline-none mt-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold">DISCOUNT TYPE</label>
                    <select value={voucherForm.discount_type} onChange={e => setVoucherForm({...voucherForm, discount_type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1 cursor-pointer">
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">VALUE</label>
                    <input required type="number" step="0.01" value={voucherForm.discount_value} onChange={e => setVoucherForm({...voucherForm, discount_value: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold">USAGE LIMIT (Bỏ trống = Vô hạn)</label>
                  <input 
                    type="number" 
                    value={voucherForm.usage_limit || ''} 
                    onChange={e => {
                      const val = e.target.value;
                      setVoucherForm({...voucherForm, usage_limit: val === '' ? null : parseInt(val)});
                    }} 
                    placeholder="E.g. 50" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none mt-1" 
                  />
                  </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer">Create Code</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}