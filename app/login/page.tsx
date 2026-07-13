"use client";

import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast.error('Invalid credentials. Please check your email and password.');
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="blob w-[500px] h-[500px] bg-primary-blue rounded-full -top-20 -left-20 opacity-20" />
        <div className="blob w-[600px] h-[600px] bg-primary-purple rounded-full bottom-0 right-0 opacity-20" style={{ animationDelay: '-5s' }} />
        <div className="blob w-[400px] h-[400px] bg-primary-indigo rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" style={{ animationDelay: '-10s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="shadow-2xl">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-blue via-primary-indigo to-primary-purple text-white shadow-primary mb-6"
            >
              <Lock size={32} />
            </motion.div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">EasyPass</h1>
            <p className="text-slate-500 font-medium">Enterprise Service Request Tracker</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-blue">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white/50 focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-blue">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white/50 focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <GradientButton
              type="submit"
              isLoading={loading}
              className="w-full py-4 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </GradientButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Secure Enterprise Access Only. Unauthorized access is prohibited.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
