"use client";

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Shield,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'User');
    }
    const { data: memberships } = await supabase
      .from('company_members')
      .select('company_id, role, companies(name)')
      .eq('user_id', user?.id);
    setMemberships(memberships || []);
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <GlassCard className="p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-blue/10 text-primary-blue">
              <User size={20} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">Profile Information</h3>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm font-bold text-primary-blue hover:text-primary-indigo transition-colors"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-bold hover:bg-primary-indigo transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-white/50 rounded-2xl border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-blue via-primary-indigo to-primary-purple flex items-center justify-center text-white shadow-primary">
              <User size={40} />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 bg-white focus:border-primary-blue outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-2xl font-display font-bold text-slate-900">{displayName}</h4>
                  <p className="text-slate-500 font-medium">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-white text-slate-400 shadow-sm">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-bold text-slate-700">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-white text-slate-400 shadow-sm">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Companies</p>
                <p className="text-sm font-bold text-slate-700">{memberships.length}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Company Memberships */}
      <GlassCard className="p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-blue/10 text-primary-blue">
            <Building2 size={20} />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900">Your Organizations</h3>
        </div>

        <div className="space-y-3">
          {memberships.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No memberships found.</p>
          ) : (
            memberships.map((membership: any) => (
              <div key={membership.company_id} className="flex items-center justify-between p-4 bg-white/40 border border-slate-100 rounded-2xl hover:bg-white/60 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-primary-blue/10 group-hover:text-primary-blue transition-colors">
                    <Building2 size={18} />
                  </div>
                  <p className="font-bold text-slate-700 group-hover:text-primary-blue transition-colors">
                    {membership.companies?.name || 'Unknown Company'}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                  membership.role === 'admin'
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {membership.role === 'admin' ? <Shield size={12} /> : <ShieldCheck size={12} />}
                  {membership.role}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Account Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Admin Access', value: memberships.filter((m: any) => m.role === 'admin').length, icon: Shield, color: 'text-amber-600' },
          { label: 'Viewer Access', value: memberships.filter((m: any) => m.role === 'viewer').length, icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'Total Companies', value: memberships.length, icon: Building2, color: 'text-primary-blue' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-6 text-center hover:translate-y-[-4px] transition-transform duration-300">
            <div className={`mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
