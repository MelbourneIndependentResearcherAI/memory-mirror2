import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowLeft, CheckCircle2, Clock, XCircle, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          toast.error('Access denied. Admin only.');
          navigate(createPageUrl('Landing'));
        } else {
          setAdminUser(currentUser);
        }
      } catch {
        toast.error('Authentication required');
        navigate(createPageUrl('Landing'));
      }
    };
    checkAdmin();
  }, [navigate]);

  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.list();
      return subs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    },
    enabled: adminUser?.role === 'admin'
  });

  const activateMutation = useMutation({
    mutationFn: async (subscriptionId) => {
      return await base44.entities.Subscription.update(subscriptionId, { status: 'active' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription activated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to activate subscription: ' + (error.message || 'Unknown error'));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId) => {
      return await base44.entities.Subscription.update(subscriptionId, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
      toast.success('Subscription cancelled.');
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription: ' + (error.message || 'Unknown error'));
    }
  });

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-slate-600 dark:text-slate-400">This page is restricted to administrators only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subscription Management</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Activate pending bank transfer subscriptions</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{subscriptions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Payment</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
              <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending subscriptions first */}
        {pendingCount > 0 && (
          <Card className="mb-6 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <Clock className="w-5 h-5" />
                Pending Bank Transfers ({pendingCount})
              </CardTitle>
              <CardDescription>These users have initiated a subscription. Activate once you confirm payment received.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.filter(s => s.status === 'pending').map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{sub.user_email}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {sub.plan_name} — ${sub.plan_price}/mo
                      </p>
                      {sub.payment_reference && (
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                          Ref: {sub.payment_reference}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Registered: {new Date(sub.start_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => activateMutation.mutate(sub.id)}
                        disabled={activateMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelMutation.mutate(sub.id)}
                        disabled={cancelMutation.isPending}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>Complete subscription history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-slate-500 py-8">Loading subscriptions...</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No subscriptions found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Plan</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Price</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-3 text-slate-900 dark:text-white max-w-[200px] truncate">{sub.user_email}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 capitalize">{sub.plan_name}</td>
                        <td className="py-3 px-3">{getStatusBadge(sub.status)}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">${sub.plan_price}/mo</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{new Date(sub.start_date).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          {sub.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => activateMutation.mutate(sub.id)}
                              disabled={activateMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                            >
                              Activate
                            </Button>
                          )}
                          {sub.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelMutation.mutate(sub.id)}
                              disabled={cancelMutation.isPending}
                              className="border-red-300 text-red-700 hover:bg-red-50 h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          )}
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
