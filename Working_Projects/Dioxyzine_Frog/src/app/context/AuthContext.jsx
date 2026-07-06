import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../service/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('customer'); // Mặc định ban đầu là khách thường
  const [loading, setLoading] = useState(true);

  // Hàm phụ trợ để lấy role từ database dựa trên ID người dùng
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) setRole(data.role);
    } catch (err) {
      console.error('Không tìm thấy quyền hạn riêng, đặt mặc định customer:', err.message);
      setRole('customer');
    }
  };

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hiện tại khi load trang
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('customer');
      }
      setLoading(false);
    });

    // Lắng nghe sự thay đổi trạng thái đăng nhập (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('customer');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);