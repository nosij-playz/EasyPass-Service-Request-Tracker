"use client";

import { createClient } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Clock,
  Calendar,
  ChevronRight,
  Building2,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

interface Props {
  params: { companyId: string }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function CompanyPage({ params }: Props) {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', params.companyId)
        .single();

      if (!companyData) {
        router.push('/dashboard');
        return;
      }
      setCompany(companyData);

      const { data: membershipData } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', params.companyId)
        .eq('user_id', user.id)
        .single();

      setMembership(membershipData);
      setIsAdmin(membershipData?.role === 'admin');

      const { data: requestsData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);
      setLoading(false);
    };

    fetchData();
  }, [params.companyId, router]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('service_requests')
      .insert({
        company_id: params.companyId,
        title: newTitle.trim(),
        status: 'submitted'
      });

    if (!error) {
      toast.success('Request created successfully!');
      setNewTitle('');
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false });
      setRequests(data || []);
    } else {
      toast.error('Failed to create request.');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (!error) {
      toast.success('Status updated!');
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('company_id', params.companyId)
        .order('created_at', { ascending: false });
      setRequests(data || []);
    } else {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <LoadingSkeleton className="h-12 w-12 rounded-xl" />
          <LoadingSkeleton className="h-8 w-64" />
        </div>
        <LoadingSkeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto px-6 py-12 min-h-screen">
      {/* Background Ambient Blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="blob w-[600px] h-[600px] bg-primary-indigo rounded-full -top-20 left-0 opacity-10" />
        <div className="blob w-[500px] h-[500px] bg-primary-blue rounded-full bottom-0 right-0 opacity-10" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-blue transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center text-white shadow-primary">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-1">
              {company?.name}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={membership?.role} />
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <UserCheck size={12} />
                Verified Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <GlassCard className="p-8 shadow-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center text-white">
                <Plus size={18} />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-800">Create New Service Request</h3>
            </div>
            <form onSubmit={handleCreateRequest} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-blue">
                  <Clock size={18} />
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe the request (e.g., Network Connectivity Issue)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white/50 focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
              <GradientButton
                type="submit"
                className="md:w-auto px-8"
              >
                Add Request
              </GradientButton>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-slate-800">
            Service Requests <span className="text-slate-400 font-normal text-lg ml-2">({requests.length})</span>
          </h2>
        </div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Clock size={40} />
            </div>
            <p className="text-slate-500 font-medium">No active service requests for this company.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {requests.map((req) => (
                <motion.div
                  key={req.id}
                  variants={itemVariants}
                  layout
                >
                  <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-primary-blue group-hover:scale-150 transition-transform" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary-blue transition-colors">
                          {req.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Created {new Date(req.created_at).toLocaleDateString()}
                          </span>
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 rounded-lg border-2 border-slate-100 bg-white/50 text-xs font-bold text-slate-600 focus:border-primary-blue outline-none transition-all cursor-pointer"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronRight size={12} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
