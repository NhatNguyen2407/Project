import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Loader2, Chrome, Facebook, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router'; 
import { supabase } from '../service/supabase';

//COMPONENTS

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

// MAIN PAGE COMPONENT: LOGIN

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      console.log('Đăng nhập thành công:', data);
      
      if (data.user) {
        setTimeout(() => {
          if (formData.email === 'dioxyzinefrog@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/profile');
          }
        }, 500);
      }
      
    } catch (error) {
      console.error(error);
      setErrors({ form: 'Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'http://localhost:5173/profile' 
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Lỗi đăng nhập ${provider}:`, error.message);
      setErrors({ form: `Không thể kết nối với ${provider}. Vui lòng thử lại!` });
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
            Welcome Back
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2 font-medium">
            Sign in to continue to Dioxyzine Frog
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(139,114,190,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {errors.form && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-center text-red-400 text-sm font-medium">
                {errors.form}
              </div>
            )}

            <div className="space-y-5">
              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="froggy@dioxyzine.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              
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
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-[var(--border)] bg-[#1A1528] text-[var(--primary)] focus:ring-[var(--primary)]/30 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-[var(--silver-gray)] cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-bold text-[var(--primary)] hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <AuthButton isLoading={isLoading}>
              Sign In <ArrowRight className="w-5 h-5" />
            </AuthButton>

          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#161224] text-gray-500 font-medium bg-[var(--card)]">
                  Or continue with
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
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[var(--primary)] hover:text-white underline ml-1 transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}