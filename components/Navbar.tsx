"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Briefcase
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GradientButton } from './ui/GradientButton';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto h-18 flex items-center justify-between glass-card px-6 py-3 rounded-2xl border-b-2 border-primary-blue/20">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-blue to-primary-purple rounded-xl flex items-center justify-center text-white shadow-primary"
          >
            <Briefcase size={20} />
          </motion.div>
          <span className="text-xl font-display font-bold gradient-text tracking-tight">
            EasyPass <span className="text-slate-400 font-normal text-sm ml-1">Enterprise</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-blue transition-colors flex items-center gap-2">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white">
              <User size={18} className="text-slate-500" />
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute right-0 mt-3 w-56 glass-card rounded-2xl py-2 shadow-2xl border-slate-200/50"
              >
                <div className="px-4 py-2 mb-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Account Settings</p>
                </div>
                <div className="flex flex-col p-1 gap-1">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};
