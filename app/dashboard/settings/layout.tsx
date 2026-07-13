"use client";

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Key,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

const tabs = [
  { name: 'Profile', href: '/dashboard/settings', icon: User },
  { name: 'Password', href: '/dashboard/settings/password', icon: Key },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen relative">
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="blob w-[500px] h-[500px] bg-primary-indigo rounded-full -top-20 right-0 opacity-10" />
        <div className="blob w-[400px] h-[400px] bg-primary-blue rounded-full bottom-20 left-0 opacity-10" style={{ animationDelay: '-8s' }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-xl bg-white/50 border border-slate-200 text-slate-500 hover:text-primary-blue hover:bg-white transition-all duration-200 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your account and personal preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mb-8">
        <div className="flex gap-2 p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href ||
              (tab.href === '/dashboard/settings' && pathname === '/dashboard/settings');
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={`relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all duration-200 rounded-xl ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-blue via-primary-indigo to-primary-purple rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Sign Out Section */}
      <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
        <p className="text-xs text-slate-400 font-medium">Enterprise Account Management v1.0</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
