import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, RefreshCw, Users, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'mcnamaram86@gmail.com';

function getTrialStatus(trialUsers, email) {
  const trial = trialUsers.find(t => t.email?.toLowerCase() === email?.toLowerCase());
  if (!trial) return null;
  return trial;
}

function getSubscriptionStatus(subscriptions, email) {
  return subscriptions.find(s => s.user_email?.toLowerCase() === email?.toLowerCase());
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAccessDenied(true);
        toast.error('Access denied.');
        navigate(createPageUrl('Landing'));
      } else {
        setCurrentUser(user);
      }
    }).catch(() => {
      setAccessDenied(true);
      navigate(createPageUrl('Landing'));
    });
  }, [navigate]);

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminAllUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!currentUser
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['adminAllSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    enabled: !!currentUser
  });

  const { data: trialUsers = [] } = useQuery({
    queryKey: ['adminAllTrials'],
    queryFn: () => base44.entities.FreeTrialUser.list(),
    enabled: !!currentUser
  });

  if (accessDenied || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <Shield className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500">This page is restricted to the system administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const enriched = filtered.map(user => {
    const trial = getTrialStatus(trialUsers, user.email);
    const sub = getSubscriptionStatus(subscriptions, user.email);
    return { ...user, trial, sub };
  });

  const totalPaid = users.filter(u => {
    const sub = getSubscriptionStatus(subscriptions, u.email);
    return sub?.status === 'active';
  }).length;

  const totalTrial = users.filter(u => {
    const trial = getTrialStatus(trialUsers, u.email);
    return trial?.trial_active;
  }).length;

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Signed Up', 'Plan', 'Sub Status', 'Trial Active', 'Trial Expiry', 'Last Updated'],
      ...enriched.map(u => [
        u.full_name || '',
        u.email || '',
        u.created_date ? new Date(u.created_date).toLocaleDateString('en-AU') : '',
        u.sub?.plan_name || (u.trial ? 'free_trial' : 'free'),
        u.sub?.status || '',
        u.trial?.trial_active ? 'Yes' : 'No',
        u.trial?.trial_end_date ? new Date(u.trial.trial_end_date).toLocaleDateString('en-AU') : '',
        u.updated_date ? new Date(u.updated_date).toLocaleDateString('en-AU') : ''
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `memory-mirror-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getPlanBadge = (user) => {
    if (user.sub?.status === 'active') {
      return <Badge className="bg-green-100 text-green-800">💳 {user.sub.plan_name?.replace('_', ' ')}</Badge>;
    }
    if (user.sub?.status === 'pending') {
      return <Badge className="bg-amber-100 text-amber-800">⏳ Pending Payment</Badge>;
    }
    if (user.trial?.trial_active) {
      return <Badge className="bg-blue-100 text-blue-800">🎁 Free Trial</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-600">Free</Badge>;
  };

  const getTrialExpiry = (user) => {
    if (!user.trial?.trial_end_date) return '—';
    const d = new Date(user.trial.trial_end_date);
    const expired = d < new Date();
    return (
      <span className={expired ? 'text-red-500' : 'text-green-600'}>
        {d.toLocaleDateString('en-AU')}
        {expired ? ' (expired)' : ''}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white min-h-[44px]">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Memory Mirror • {ADMIN_EMAIL}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchUsers()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Paid Subscribers</p>
              <p className="text-3xl font-bold text-green-600">{totalPaid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">On Free Trial</p>
              <p className="text-3xl font-bold text-blue-600">{totalTrial}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Free / Other</p>
              <p className="text-3xl font-bold text-slate-500">{users.length - totalPaid - totalTrial}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5" />
              All Registered Users ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-center text-slate-500 py-12">Loading users...</p>
            ) : enriched.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No users found</p>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Name / Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Signed Up</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Trial Expiry</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Last Active</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900 dark:text-white">{user.full_name || '—'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                          {user.role === 'admin' && <Badge className="text-xs bg-purple-100 text-purple-700 mt-1">admin</Badge>}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {user.created_date ? new Date(user.created_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3 px-4">{getPlanBadge(user)}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm">{getTrialExpiry(user)}</td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {user.updated_date ? new Date(user.updated_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {user.country || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}