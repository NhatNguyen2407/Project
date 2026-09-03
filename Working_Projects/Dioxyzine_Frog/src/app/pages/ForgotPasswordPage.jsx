import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../service/supabase';

const AuthInput = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2 w-full">
    <label className="block text-sm font-semibold text-white/90">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-500'}`} />
      </div>
      <input
        className={`w-full pl-11 pr-4 py-3.5 bg-[#1A1528] border ${
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
            : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/10'
        } rounded-xl text-white placeholder-gray-500 transition-all outline-none focus:ring-4`}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-xs font-medium pl-1 mt-1">{error}</p>}
  </div>
);

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

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // redirectTo trỏ về trang đặt mật khẩu mới. Supabase sẽ tự thêm
      // access_token vào URL khi khách bấm link trong email.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Không tiết lộ email có tồn tại trong hệ thống hay không — luôn báo
      // "đã gửi" dù email có thật hay không, tránh lộ danh sách user cho
      // kẻ dò email hàng loạt. Supabase mặc định cũng hoạt động theo cách
      // này (không báo lỗi nếu email không tồn tại).
      if (resetError && resetError.status !== 400) {
        throw resetError;
      }
      setSent(true);
    } catch (err) {
      console.error('Lỗi khi gửi email đặt lại mật khẩu:', err);
      setError('Có lỗi xảy ra, vui lòng thử lại sau.');
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
            Forgot Password?
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2 font-medium">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(139,114,190,0.12)]">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-[var(--silver-gray)] mb-6">
                If an account exists for <span className="text-white font-semibold">{email}</span>, a password reset link has been sent. It may take a minute to arrive — check your spam folder too.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[var(--primary)] font-bold hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-center text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}
              <AuthInput
                label="Email Address"
                type="email"
                placeholder="froggy@dioxyzine.com"
                icon={Mail}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              />
              <AuthButton isLoading={isLoading}>Send reset link</AuthButton>
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-[var(--silver-gray)] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}