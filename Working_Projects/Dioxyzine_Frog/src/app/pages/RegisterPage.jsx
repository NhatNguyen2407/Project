import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Chrome, Facebook, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../service/supabase';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { TermsOfServiceModal } from '../components/common_components/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../components/common_components/PrivacyPolicyModal';


const AuthInput = ({ label, icon: Icon, type, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2 w-full">
      <label className="block text-sm font-semibold text-white/90">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-500'}`} />
        </div>
        <input
          type={inputType}
          className={`w-full pl-11 pr-12 py-3.5 bg-[#1A1528] border ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
              : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/10'
          } rounded-xl text-white placeholder-gray-500 transition-all outline-none focus:ring-4`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-xs font-medium pl-1 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthButton = ({ children, isLoading, ...props }) => {
  return (
    <button
      disabled={isLoading}
      type="submit"
      className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {isLoading ? <Loader2 className="h-6 h-6 animate-spin" /> : children}
    </button>
  );
};

const SocialButton = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 py-3.5 bg-[#1A1528] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[#221B34] rounded-xl text-gray-300 font-semibold transition-all cursor-pointer"
    >
      <Icon className="h-5 w-5 text-[var(--primary)]" />
      <span className="text-sm">{label}</span>
    </button>
  );
};

// MAIN PAGE COMPONENT: REGISTER
export function RegisterPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    acceptedTerms: false 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name] || errors.form) setErrors(prev => ({ ...prev, [name]: '', form: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptedTerms) {
      newErrors.form = 'You must agree to the Terms of Service & Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!executeRecaptcha) {
      setErrors({ form: 'Hệ thống bảo mật chưa sẵn sàng, vui lòng tải lại trang!' });
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha('register_submit');
      
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });

      if (verifyError || !verifyData?.success) {
        setErrors({ form: 'Xác thực bảo mật thất bại, phát hiện dấu hiệu Spam!' });
        setIsLoading(false);
        return; 
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;
      
      console.log('Tạo tài khoản thành công:', data);
      navigate('/profile');
      
    } catch (error) {
      console.error(error);
      setErrors({ form: error.message || 'Đăng ký thất bại. Vui lòng thử lại!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'https://dioxyzinefrog.vercel.app' 
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Lỗi đăng nhập ${provider}:`, error.message);
      setErrors({ form: `Không thể kết nối với ${provider}. Vui lòng thử lại!` });
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 sm:p-6 relative overflow-hidden z-10 pt-24 pb-16">
      
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative z-20"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(139,114,190,0.3)]">
            Create an Account
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2 font-medium">
            Join Dioxyzine Frog to track orders, earn rewards & receive the latest news and offers!
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(139,114,190,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {errors.form && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-center text-red-400 text-sm font-medium">
                {errors.form}
              </div>
            )}

            <AuthInput
              label="Full Name / Username"
              name="fullName"
              type="text"
              placeholder="John Doe"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />

            <AuthInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="froggy@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AuthInput
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <AuthInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            <div className="flex items-start gap-3 mt-4 bg-[#1A1528] p-4 rounded-xl border border-[var(--border)]">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-[var(--border)] bg-[#1A1528] accent-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)]/30 cursor-pointer flex-shrink-0"
              />
              <label className="text-sm text-[var(--silver-gray)] leading-relaxed">
                I agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)} 
                  className="text-[var(--primary)] font-bold hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button 
                  type="button" 
                  onClick={() => setIsPrivacyOpen(true)} 
                  className="text-[var(--primary)] font-bold hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <AuthButton isLoading={isLoading} className="mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[var(--primary)] text-white font-bold text-lg shadow-[0_0_20px_rgba(139,114,190,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlus className="w-5 h-5" /> Sign Up
            </AuthButton>

          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500 font-medium bg-[var(--card)]">
                  Or sign up with
                </span>
              </div>
            </div>

            {/*Social Logins*/}
            <div className="mt-6 flex gap-4">
              <SocialButton 
                icon={Chrome} 
                label="Google" 
                onClick={() => handleSocialLogin('google')} 
              />
              <SocialButton 
                icon={Facebook} 
                label="Facebook" 
                onClick={() => handleSocialLogin('facebook')} 
              />
            </div>
          </div>
        </div>

        <p className="text-center text-[var(--silver-gray)] mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--primary)] hover:text-white underline ml-1 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>

      {/*TermsModal */}
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}