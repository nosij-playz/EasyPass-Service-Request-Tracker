"use client";

import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Users,
  ArrowRight,
  Loader2,
  Briefcase,
  Settings as SettingsIcon
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

const STATS = [
  { label: 'Total Companies', value: '12', icon: Building2, color: 'text-primary-blue' },
  { label: 'Admin Access', value: '4', icon: ShieldCheck, color: 'text-primary-indigo' },
  { label: 'Team Members', value: '84', icon: Users, color: 'text-primary-purple' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: memberships } = await supabase
        .from('company_members')
        .select('company_id, role, companies(*)')
        .eq('user_id', authUser.id);

      setCompanies(memberships || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* Background Ambient Blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="blob w-[600px] h-[600px] bg-primary-blue rounded-full -top-20 -right-20 opacity-10" />
        <div className="blob w-[500px] h-[500px] bg-primary-purple rounded-full bottom-20 -left-20 opacity-10" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2"
            >
              Your <span className="gradient-text">Companies</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 font-medium"
            >
              Manage your corporate service requests and memberships.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {STATS.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <GlassCard className="flex items-center gap-5 py-6 px-8 group cursor-default">
              <div className={`w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Companies Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {companies.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="col-span-full flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Building2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Companies Found</h3>
            <p className="text-slate-500 max-w-xs">You are not currently a member of any organization. Please contact your administrator.</p>
          </motion.div>
        ) : (
          companies.map((membership: any) => (
            <motion.div key={membership.company_id} variants={itemVariants}>
              <GlassCard className="group h-full flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue to-primary-indigo flex items-center justify-center text-white shadow-primary group-hover:rotate-3 transition-transform">
                      <Briefcase size={24} />
                    </div>
                    <StatusBadge status={membership.role} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 mb-2 group-hover:text-primary-blue transition-colors">
                    {membership.companies.name}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
                    <Users size={14} />
                    Member of Enterprise Network
                  </p>
                </div>

                <Link
                  href={`/dashboard/${membership.company_id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-primary-blue hover:text-white transition-all duration-300 group-hover:shadow-lg"
                >
                  Manage Requests <ArrowRight size={16} />
                </Link>
              </GlassCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
