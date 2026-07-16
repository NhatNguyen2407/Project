import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PackageSearch, PackagePlus, Edit, Trash2, X, PlusCircle, Save, Ticket, ToggleLeft, ToggleRight, UploadCloud, MessageSquare, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

import { ToastNotification } from '../components/common_components/ToastNotification';

export function AdminPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [toastNotif, setToastNotif] = useState({ show: false, msg: '', type: '' });
  const showToast = (msg, type) => {
    if(type === 'success') toast.success(msg);
    else if(type === 'error') toast.error(msg);
    else toast(msg);
  };

  // 🚀 ĐÃ BỔ SUNG: Tab 'reviews'
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // 🚀 ĐÃ BỔ SUNG: Quản lý Textbox trả lời Review
  const [replyInputs, setReplyInputs] = useState({});

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: '', title: '', description: '', category: 'Customize', type: 'custom',
    price: 0, stock: 0, moq: 11, image_cover: '', images_gallery: '', cut_style: 'borderless'
  });

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [hasExpiration, setHasExpiration] = useState(false);
  
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
        supabase.from('vouchers').select('*').order('created_at', { ascending: false }) 
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
              import.meta.env.VITE_EMAILJS_SERVICE_ID, 
              import.meta.env.VITE_EMAILJS_TEMPLATE_TRACKING_ID,
              {
                to_email: customerEmail, 
                customer_name: order.customer_name || 'Quý khách',
                order_id: order.id.substring(0, 8), 
                product_name: order.product_name,
                tracking_code: trackingCode, 
                tracking_link: 'https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/'
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            toast.success("✅ Đã lưu mã vận đơn và gửi Email tự động!");
          } catch (emailErr) {
            console.error("Lỗi EmailJS:", emailErr);
            toast.error("⚠️ Lưu thành công, nhưng gửi Email thất bại.");
          }
        }
      } else {
        toast.success("✅ Cập nhật trạng thái thành công!");
      }
    } catch (err) { toast.error("Lỗi khi cập nhật trạng thái!"); } finally { setUpdatingId(null); }
  };

  const handleUpdateShippingDate = async (orderId, newDate) => {
    try {
      await supabase.from('inquiries').update({ estimated_shipping_date: newDate }).eq('id', orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, estimated_shipping_date: newDate } : o));
      toast.success("Cập nhật ngày giao hàng thành công!");
    } catch (err) { console.error(err); toast.error("Lỗi cập nhật ngày giao!"); }
  };

  // 🚀 ĐÃ BỔ SUNG: Tính năng Admin Reply Review
  const handleSaveReply = async (id) => {
    const replyText = replyInputs[id];
    if (!replyText) return toast.error("Vui lòng nhập câu trả lời!");
    try {
      const { error } = await supabase.from('inquiries').update({ admin_reply: replyText }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? { ...o, admin_reply: replyText } : o));
      toast.success("Đã phản hồi đánh giá!");
    } catch (err) { toast.error(err.message); }
  };

  // 🚀 ĐÃ BỔ SUNG: Tính năng Ẩn/Hiện Review
  const handleToggleReviewVisibility = async (id, isHidden) => {
    try {
      const { error } = await supabase.from('inquiries').update({ is_hidden: !isHidden }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? { ...o, is_hidden: !isHidden } : o));
      toast.success(!isHidden ? "Đã ẨN đánh giá này!" : "Đã HIỆN đánh giá này!");
    } catch (err) { toast.error(err.message); }
  };

  const openProductModal = (product = null) => {
    setCoverFile(null); setCoverPreview(null); setGalleryFiles([]); setGalleryPreviews([]);
    if (product) {
      setEditingProduct(product); setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({
        id: `NEW-${Math.floor(Math.random()*1000)}`, title: '', description: '', 
        category: 'Customize', type: 'custom', price: 0, stock: 0, moq: 11, 
        image_cover: '', images_gallery: '', cut_style: 'borderless'
      });
    }
    setIsModalOpen(true);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles([...galleryFiles, ...files]);
      setGalleryPreviews([...galleryPreviews, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleClearGallery = () => {
    setGalleryFiles([]); setGalleryPreviews([]);
    setProductForm({ ...productForm, images_gallery: '' });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      let finalCoverUrl = productForm.image_cover;
      let finalGalleryUrls = productForm.images_gallery ? productForm.images_gallery.split('|').filter(Boolean) : [];

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, coverFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        finalCoverUrl = publicUrl;
      }

      if (galleryFiles.length > 0) {
        const uploadedUrls = [];
        for (const file of galleryFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        }
        finalGalleryUrls = [...finalGalleryUrls, ...uploadedUrls];
      }

      const dataToSave = { ...productForm, image_cover: finalCoverUrl, images_gallery: finalGalleryUrls.join('|') };
      const { error } = await supabase.from('products').upsert(dataToSave);
      if (error) throw error;
      
      await fetchData();
      setIsModalOpen(false);
      toast.success("Lưu sản phẩm thành công! 🎉");
    } catch (err) {
      toast.error("Lỗi lưu sản phẩm: " + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Đã xóa sản phẩm");
    } catch (err) { toast.error(err.message); }
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    if (!voucherForm.code.trim()) return toast.error("Please enter a Promo Code! 🎟️");
    if (hasExpiration && !voucherForm.expires_at) return toast.error("Please completely fill out the Expiration Date and Time! ⏰");

    try {
      const finalData = { ...voucherForm };
      if (!finalData.usage_limit) finalData.usage_limit = null;
      if (!hasExpiration || !finalData.expires_at) finalData.expires_at = null; 
      else finalData.expires_at = new Date(finalData.expires_at).toISOString();
      finalData.code = finalData.code.toUpperCase();

      const { error } = await supabase.from('vouchers').insert([finalData]);
      if (error) throw error;
      
      await fetchData();
      setIsVoucherModalOpen(false);
      setVoucherForm({ code: '', discount_type: 'percent', discount_value: 10, usage_limit: null, expires_at: '' });
      setHasExpiration(false); 
      toast.success("Tạo mã giảm giá thành công! 🎉");
    } catch (err) { toast.error("Lỗi tạo mã: " + err.message); }
  };

  const handleToggleVoucher = async (id, currentStatus) => {
    try {
      await supabase.from('vouchers').update({ is_active: !currentStatus }).eq('id', id);
      setVouchers(vouchers.map(v => v.id === id ? { ...v, is_active: !currentStatus } : v));
      toast.success("Đã cập nhật trạng thái mã!");
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteVoucher = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này vĩnh viễn?")) return;
    try {
      await supabase.from('vouchers').delete().eq('id', id);
      setVouchers(vouchers.filter(v => v.id !== id));
      toast.success("Đã xóa mã giảm giá!");
    } catch (err) { toast.error(err.message); }
  };

  if (!user || role !== 'admin') return <div className="min-h-screen pt-28 text-center text-white">Checking Auth...</div>;

  // Lọc ra các đơn hàng có đánh giá
  const reviewsList = orders.filter(o => o.rating != null);

  return (
    <>
      <ToastNotification toast={toastNotif} />

      <div className="min-h-screen pt-28 pb-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Navigate */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/10 pb-6 relative z-0">
            <div className="flex flex-wrap gap-2 bg-[#1A1528] p-1.5 rounded-xl border border-[var(--border)]">
              <button onClick={() => setActiveTab('orders')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'orders' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
                Orders ({orders.length})
              </button>
              <button onClick={() => setActiveTab('products')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
                CMS Products ({products.length})
              </button>
              <button onClick={() => setActiveTab('vouchers')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'vouchers' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:text-white cursor-pointer'}`}>
                Promo Codes
              </button>
              {/* 🚀 ĐÃ BỔ SUNG: Nút Tab Reviews */}
              <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'reviews' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-yellow-500 cursor-pointer'}`}>
                Reviews ({reviewsList.length})
              </button>
            </div>
            
            {activeTab === 'products' && (
              <button onClick={() => openProductModal()} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg">
                <PlusCircle className="w-5 h-5" /> Add Product
              </button>
            )}
            {activeTab === 'vouchers' && (
              <button onClick={() => { setIsVoucherModalOpen(true); setHasExpiration(false); }} className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg">
                <Ticket className="w-5 h-5" /> Create Code
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-[var(--primary)]">Loading database...</div>
          ) : activeTab === 'orders' ? (
            <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl relative z-0">
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
          ) : activeTab === 'reviews' ? (
            /* 🚀 ĐÃ BỔ SUNG: BẢNG QUẢN LÝ REVIEWS DÀNH CHO ADMIN */
            <div className="space-y-6 max-w-4xl mx-auto">
              {reviewsList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Chưa có đánh giá nào từ khách hàng.</div>
              ) : (
                reviewsList.map(review => (
                  <div key={review.id} className={`bg-[var(--card)] border ${review.is_hidden ? 'border-red-500/30 opacity-60' : 'border-[var(--border)]'} rounded-3xl p-6 shadow-xl transition-all`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">{review.product_name}</h4>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Bởi <strong className="text-white">{review.customer_name || review.customer_email}</strong> • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex mt-2">
                          {[1,2,3,4,5].map(star => <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />)}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleReviewVisibility(review.id, review.is_hidden)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${review.is_hidden ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                      >
                        {review.is_hidden ? <><Eye className="w-4 h-4"/> Đang Ẩn (Bấm để Hiện)</> : <><EyeOff className="w-4 h-4"/> Đang Hiện (Bấm để Ẩn)</>}
                      </button>
                    </div>
                    
                    <p className="text-sm text-white italic mb-6 bg-black/20 p-4 rounded-xl border border-white/5">"{review.review_comment}"</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <input 
                        type="text" 
                        placeholder="Trả lời bình luận với tư cách Dioxyzine Frog..." 
                        value={replyInputs[review.id] ?? (review.admin_reply || '')}
                        onChange={(e) => setReplyInputs({...replyInputs, [review.id]: e.target.value})}
                        className="flex-1 bg-black/40 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                      />
                      <button 
                        onClick={() => handleSaveReply(review.id)} 
                        className="px-6 py-3 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> Lưu Câu Trả Lời
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'products' ? (
            /* BẢNG PRODUCTS GIỮ NGUYÊN */
            <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl relative z-0">
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
            /* BẢNG VOUCHERS GIỮ NGUYÊN */
            <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl relative z-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[var(--silver-gray)] text-sm uppercase">
                      <th className="p-5 font-semibold">Promo Code</th>
                      <th className="p-5 font-semibold">Discount</th>
                      <th className="p-5 font-semibold">Usage Limits</th>
                      <th className="p-5 font-semibold text-center">Expires At</th>
                      <th className="p-5 font-semibold text-center">Active</th>
                      <th className="p-5 font-semibold text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vouchers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào được tạo.</td></tr>}
                    {vouchers.map((v) => {
                      const isExpired = v.expires_at && new Date() > new Date(v.expires_at);
                      return (
                        <tr key={v.id} className={`hover:bg-white/5 ${!v.is_active || isExpired ? 'opacity-50' : ''}`}>
                          <td className="p-5 font-bold font-mono text-xl text-yellow-500">{v.code}</td>
                          <td className="p-5 text-white font-bold text-sm">
                            {v.discount_type === 'percent' ? `${v.discount_value}% OFF` : `-$${v.discount_value}`}
                          </td>
                          <td className="p-5 text-sm text-gray-300">
                            Đã dùng: <strong className="text-white">{v.used_count}</strong> {v.usage_limit ? `/ ${v.usage_limit}` : '(Không giới hạn)'}
                          </td>
                          <td className="p-5 text-center text-sm text-gray-300">
                            {v.expires_at ? (
                              <span className={isExpired ? 'text-red-400 font-bold' : ''}>
                                {new Date(v.expires_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {isExpired && ' (Hết hạn)'}
                              </span>
                            ) : (
                              <span className="text-[var(--primary)]">Vĩnh viễn</span>
                            )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL SẢN PHẨM & VOUCHER GIỮ NGUYÊN (TRÁNH LÀM RỐI CODE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-[var(--border)] rounded-3xl p-8 max-w-2xl w-full my-auto max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1A1528] pt-2 pb-4 z-10 border-b border-white/5">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><PackagePlus className="text-[var(--primary)]" /> {editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Product ID *</label>
                    <input value={productForm.id || ''} onChange={e => setProductForm({...productForm, id: e.target.value})} disabled={!!editingProduct} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none mt-1 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Product Title *</label>
                    <input value={productForm.title || ''} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--primary)] outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Category *</label>
                    <select value={productForm.category || 'Customize'} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1 cursor-pointer">
                      <option value="Plushie">Plushie</option><option value="Doll">Doll</option><option value="Customize">Customize</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Type *</label>
                    <select value={productForm.type || 'custom'} onChange={e => setProductForm({...productForm, type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1 cursor-pointer">
                      <option value="custom">Custom Order</option><option value="readyuse">Ready-made</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Price ($)</label>
                    <input type="number" step="0.01" value={productForm.price || 0} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">Stock</label>
                    <input type="number" value={productForm.stock || 0} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">MOQ</label>
                    <input type="number" value={productForm.moq || 11} onChange={e => setProductForm({...productForm, moq: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1" />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 font-bold mb-2 block">Cover Image *</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-black/40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[var(--primary)] transition-colors">
                        {coverPreview || productForm.image_cover ? (
                          <img src={coverPreview || productForm.image_cover} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-[var(--primary)]" />
                        )}
                        <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Click the box to upload cover image.</p>
                        <p>Format: JPG, PNG. Max size: 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 font-bold mb-2 flex justify-between">
                      <span>Gallery Images (Optional)</span>
                      {(galleryPreviews.length > 0 || productForm.images_gallery) && (
                        <button type="button" onClick={handleClearGallery} className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer">
                          <Trash2 className="w-3 h-3" /> Clear All
                        </button>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {productForm.images_gallery && productForm.images_gallery.split('|').filter(Boolean).map((img, i) => (
                        <img key={`db-${i}`} src={img} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                      ))}
                      {galleryPreviews.map((img, i) => (
                        <img key={`new-${i}`} src={img} className="w-16 h-16 object-cover rounded-lg border border-[var(--primary)]" />
                      ))}
                      <div className="w-16 h-16 bg-black/40 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center relative cursor-pointer hover:border-[var(--primary)] transition-colors">
                        <PlusCircle className="w-6 h-6 text-gray-500" />
                        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold">Cut Style (Plushie Only)</label>
                  <select value={productForm.cut_style || 'borderless'} onChange={e => setProductForm({...productForm, cut_style: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1 cursor-pointer">
                    <option value="borderless">Không sát viền (Borderless)</option>
                    <option value="bordered">Sát viền (Bordered)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isSavingProduct} className="flex-1 py-3 bg-[var(--primary)] hover:bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50">
                    {isSavingProduct ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVoucherModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1A1528] border border-yellow-500/30 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Ticket className="text-yellow-500" /> New Promo Code</h3>
                <button onClick={() => setIsVoucherModalOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveVoucher} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold">CODE NAME (VD: FROGGY10) *</label>
                  <input type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-lg font-mono text-yellow-500 uppercase focus:border-yellow-500 outline-none mt-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold">DISCOUNT TYPE *</label>
                    <select value={voucherForm.discount_type} onChange={e => setVoucherForm({...voucherForm, discount_type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none mt-1 cursor-pointer">
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold">VALUE *</label>
                    <input type="number" step="0.01" value={voucherForm.discount_value} onChange={e => setVoucherForm({...voucherForm, discount_value: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold">USAGE LIMIT (Bỏ trống = Vô hạn)</label>
                  <input type="number" value={voucherForm.usage_limit || ''} onChange={e => { const val = e.target.value; setVoucherForm({...voucherForm, usage_limit: val === '' ? null : parseInt(val)}); }} placeholder="E.g. 50" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none mt-1" />
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Set Expiration Date</label>
                    <button type="button" onClick={() => setHasExpiration(!hasExpiration)} className="cursor-pointer transition-transform hover:scale-110">
                      {hasExpiration ? <ToggleRight className="w-8 h-8 text-yellow-500" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                    </button>
                  </div>
                  {hasExpiration && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 font-bold ml-1 mb-1 block">DATE</label>
                        <input 
                          type="date" 
                          value={voucherForm.expires_at ? voucherForm.expires_at.split('T')[0] : ''} 
                          onChange={e => {
                            const newDate = e.target.value;
                            const currentTime = voucherForm.expires_at ? voucherForm.expires_at.split('T')[1].substring(0,5) : '23:59';
                            setVoucherForm({...voucherForm, expires_at: `${newDate}T${currentTime}`});
                          }} 
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          className="w-full bg-[#1A1528] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer hover:border-yellow-500/50 transition-colors" 
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 font-bold ml-1 mb-1 block">TIME</label>
                        <input 
                          type="time" 
                          value={voucherForm.expires_at ? voucherForm.expires_at.split('T')[1]?.substring(0,5) : ''} 
                          onChange={e => {
                            const newTime = e.target.value;
                            const currentDate = voucherForm.expires_at ? voucherForm.expires_at.split('T')[0] : new Date().toISOString().split('T')[0];
                            setVoucherForm({...voucherForm, expires_at: `${currentDate}T${newTime}`});
                          }} 
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          className="w-full bg-[#1A1528] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none cursor-pointer hover:border-yellow-500/50 transition-colors" 
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer">Create Code</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}