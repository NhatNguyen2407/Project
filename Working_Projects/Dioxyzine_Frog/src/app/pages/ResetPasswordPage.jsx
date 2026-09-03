import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../service/supabase';

const AuthInput = ({ label, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-semibold text-white/90">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-500'}`} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-11 pr-12 py-3.5 bg-[#1A1528] border ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
              : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/10'
          } rounded-xl text-white placeholder-gray-500 transition-all outline-none focus:ring-4`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs font-medium pl-1 mt-1">{error}</p>}
    </div>
  );
};

const AuthButton = ({ children, isLoading, ...props }) => (
  <button
    disabled={isLoading}
    type="submit"
    className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : children}
  </button>
);

// 3 trạng thái của trang: đang chờ xác định link có hợp lệ không, link hợp
// lệ (cho nhập mật khẩu mới), hoặc link hỏng/hết hạn.
const STATUS = { CHECKING: 'checking', READY: 'ready', INVALID: 'invalid', DONE: 'done' };

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.CHECKING);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Supabase gửi link kèm token qua URL. supabase-js tự đọc URL này khi
    // trang tải và bắn ra sự kiện PASSWORD_RECOVERY nếu token hợp lệ. Nếu
    // link đã hết hạn/bị dùng rồi, Supabase redirect kèm "error" trong URL
    // thay vì token — ta kiểm tra cả 2 trường hợp.
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    if (hashParams.get('error') || hashParams.get('error_code')) {
      setStatus(STATUS.INVALID);
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus(STATUS.READY);
      }
    });

    // Phòng trường hợp sự kiện đã bắn ra trước khi listener kịp gắn vào
    // (race condition hiếm gặp) — kiểm tra lại session hiện có sau 1 nhịp.
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setStatus((prev) => (prev === STATUS.CHECKING ? (session ? STATUS.READY : STATUS.INVALID) : prev));
    }, 1500);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!password || password.length < 6) newErrors.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus(STATUS.DONE);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Lỗi khi đặt lại mật khẩu:', err);
      setErrors({ form: 'Không thể đặt lại mật khẩu. Vui lòng thử lại hoặc yêu cầu link mới.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-6 relative overflow-hidden z-10">
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-20"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(139,114,190,0.3)]">
            Reset Password
          </h1>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(139,114,190,0.12)]">
          {status === STATUS.CHECKING && (
            <div className="flex flex-col items-center py-8 gap-3 text-[var(--silver-gray)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
              <p>Verifying your reset link...</p>
            </div>
          )}

          {status === STATUS.INVALID && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Link expired or invalid</h2>
              <p className="text-[var(--silver-gray)] mb-6">
                This password reset link is no longer valid — reset links only work once and expire after a while. Request a new one below.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--primary)] text-white font-bold shadow-[0_0_20px_rgba(139,114,190,0.4)] hover:scale-[1.02] transition-all"
              >
                Request a new link
              </Link>
            </div>
          )}

          {status === STATUS.READY && (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {errors.form && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-center text-red-400 text-sm font-medium">
                  {errors.form}
                </div>
              )}
              <AuthInput
                label="New Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                error={errors.password}
              />
              <AuthInput
                label="Confirm New Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                error={errors.confirmPassword}
              />
              <AuthButton isLoading={isLoading}>Update password</AuthButton>
            </form>
          )}

          {status === STATUS.DONE && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password updated!</h2>
              <p className="text-[var(--silver-gray)]">Redirecting you to login...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}