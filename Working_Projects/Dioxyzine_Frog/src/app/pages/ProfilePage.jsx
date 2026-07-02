import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../service/supabase';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  //logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-transparent relative z-10">
        <p className="text-white text-lg font-medium">Please login to view this page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.3)]">
            My Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* dashboard */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 h-fit shadow-[0_0_30px_rgba(139,114,190,0.1)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1A1528] rounded-full flex items-center justify-center border-2 border-[var(--primary)] mb-4">
                <User className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-bold text-white truncate w-full">
                {user.user_metadata?.full_name || 'Froggy Member'}
              </h2>
              <div className="flex items-center gap-2 text-[var(--silver-gray)] mt-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              
              <div className="w-full border-t border-[var(--border)] my-6"></div>
              
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* history/quote */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(139,114,190,0.1)]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Package className="text-[var(--primary)]" />
                My Orders
              </h3>
              <div className="bg-[#1A1528] rounded-2xl p-8 text-center border border-[var(--border)] border-dashed">
                <p className="text-[var(--muted-foreground)]">You don't have any orders yet.</p>
                <button className="mt-4 px-6 py-2 rounded-full bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity">
                  Start an Inquiry
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}