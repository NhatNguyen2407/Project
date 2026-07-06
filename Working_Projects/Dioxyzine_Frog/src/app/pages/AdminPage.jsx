import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PackageSearch, Calendar, Clock } from 'lucide-react';
import { supabase } from '../service/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function AdminPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // const ADMIN_EMAIL = 'dioxyzinefrog@gmail.com';

  useEffect(() => {
    if (user === null) {
      navigate('/login');
    } else if (user && role !== 'admin') {
      navigate('/profile');
    }
  }, [user, role, navigate]);

  const STATUS_FLOW = [
    { value: 'Pending', label: 'Pending (Chờ xác nhận)', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'Confirmed', label: 'Confirmed (Đã chốt đơn)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { value: 'Processing', label: 'Processing (Đang sản xuất)', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { value: 'Shipping', label: 'Shipping (Đang vận chuyển)', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { value: 'Completed', label: 'Completed (Đã hoàn thành)', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { value: 'Returned', label: 'Returned (Đã hoàn trả)', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  ];

  const fetchAllOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchAllOrders();
    }
  }, [user]);

  // Hàm cập nhật trạng thái
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      alert('Lỗi cập nhật trạng thái: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 📅 HÀM CẬP NHẬT NGÀY GIAO HÀNG DỰ KIẾN
  const handleUpdateShippingDate = async (orderId, newDate) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ estimated_shipping_date: newDate })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, estimated_shipping_date: newDate } : order
      ));
    } catch (error) {
      console.error('Lỗi cập nhật ngày dự kiến:', error.message);
    }
  };

  const getStatusColor = (status) => {
    const found = STATUS_FLOW.find(s => s.value.toLowerCase() === (status || '').toLowerCase());
    return found ? found.color : 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen pt-28 flex justify-center items-center">
        <div className="text-[var(--primary)] animate-pulse font-bold text-xl">Đang kiểm tra phân quyền...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
              <PackageSearch className="w-8 h-8 text-[var(--primary)]" />
              Order Management
            </h1>
            <p className="text-[var(--silver-gray)] mt-2">Control center for all Dioxyzine Frog orders.</p>
          </div>
          <div className="bg-[#1A1528] px-6 py-3 rounded-2xl border border-[var(--primary)]/30 text-[var(--primary)] font-bold shadow-[0_0_15px_rgba(139,114,190,0.15)]">
            Total Orders: {orders.length}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--primary)]">Loading orders map...</div>
        ) : (
          <div className="bg-[#1A1528] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[var(--silver-gray)] text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold border-b border-white/5">Order ID</th>
                    <th className="p-5 font-semibold border-b border-white/5">Customer</th>
                    <th className="p-5 font-semibold border-b border-white/5">Product Info</th>
                    <th className="p-5 font-semibold border-b border-white/5">Dates</th>
                    <th className="p-5 font-semibold border-b border-white/5">Est. Shipping Date</th>
                    <th className="p-5 font-semibold border-b border-white/5">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={order.id} className="hover:bg-white/5 transition-colors">
                      
                      <td className="p-5 font-mono text-[var(--primary)] text-sm">
                        #{order.id.substring(0, 8)}
                      </td>
                      
                      <td className="p-5 text-gray-300 text-sm truncate max-w-[150px]">
                        {order.customer_email || 'Unknown'}
                      </td>
                      
                      <td className="p-5">
                        <div className="font-bold text-white text-sm">{order.product_name}</div>
                        <div className="text-xs text-[var(--silver-gray)] mt-1">Qty: {order.quantity} | {order.product_type}</div>
                      </td>
                      
                      <td className="p-5 text-[var(--silver-gray)] text-xs space-y-1">
                        <div>Sub: {new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
                      </td>

                      {/* 📅 CỘT CHỌN NGÀY GIAO HÀNG DỰ KIẾN */}
                      <td className="p-5">
                        <input 
                          type="date"
                          value={order.estimated_shipping_date || ''}
                          onChange={(e) => handleUpdateShippingDate(order.id, e.target.value)}
                          // Thêm dòng onClick thần thánh này vào:
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          className="bg-black/40 border border-white/10 text-[var(--primary)] text-xs rounded-xl p-2 outline-none focus:border-[var(--primary)] transition-colors cursor-pointer w-full"
                        />
                      </td>
                      
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold whitespace-nowrap min-w-[100px] text-center ${getStatusColor(order.status)}`}>
                            {updatingId === order.id ? 'Updating...' : (order.status || 'Pending')}
                          </div>
                          <select 
                            value={order.status || 'Pending'}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="bg-black/50 border border-white/10 text-white text-xs rounded-lg p-2 outline-none cursor-pointer"
                          >
                            {STATUS_FLOW.map(step => (
                              <option key={step.value} value={step.value}>
                                {step.value}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}