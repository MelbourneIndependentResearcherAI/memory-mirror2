import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscriptionStatus } from '@/components/SubscriptionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionStatusPage() {
  const { data: subscriptionData, isLoading, refetch } = useSubscriptionStatus();
  const [detailedSubs, setDetailedSubs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (subscriptionData?.user?.email) {
      loadSubscriptions();
    }
  }, [subscriptionData?.user?.email]);

  const loadSubscriptions = async () => {
    try {
      setRefreshing(true);
      const response = await base44.functions.invoke('getSubscriptionDetails', {});
      setDetailedSubs(response.data?.subscriptions || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await refetch();
    await loadSubscriptions();
    toast.success('Subscription status refreshed');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">Loading subscription status...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subscription Status</h1>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Status */}
        {subscriptionData && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Plan Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                    {subscriptionData.plan || 'Free'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
                  <Badge className={getStatusColor(subscriptionData.subscription?.status || 'none')}>
                    {subscriptionData.subscription?.status || 'None'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Subscribed</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {subscriptionData.isSubscribed ? 'Yes ✓' : 'No'}
                  </p>
                </div>
              </div>
              {subscriptionData.subscribedTools?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Active Individual Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {subscriptionData.subscribedTools.map(tool => (
                      <Badge key={tool} className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 capitalize">
                        {tool.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Subscriptions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">All Subscriptions</h2>
          {detailedSubs.length > 0 ? (
            <div className="space-y-4">
              {detailedSubs.map((sub) => (
                <Card key={sub.id} className="border-l-4 border-l-slate-300 dark:border-l-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(sub.status)}
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg capitalize">
                            {sub.plan_name} Plan
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            ID: {sub.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Price</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          A${sub.plan_price}/month
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Started</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(sub.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Next Billing</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(sub.next_billing_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Last Payment</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {sub.last_payment_date 
                            ? new Date(sub.last_payment_date).toLocaleDateString()
                            : 'Not yet paid'}
                        </p>
                      </div>
                      {sub.payment_reference && (
                        <div className="md:col-span-2">
                          <p className="text-slate-600 dark:text-slate-400 mb-1">Payment Reference</p>
                          <p className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            {sub.payment_reference}
                          </p>
                        </div>
                      )}
                      {sub.plan_name === 'tool_subscription' && sub.subscribed_tools?.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-slate-600 dark:text-slate-400 mb-1">Subscribed Tools</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.subscribed_tools.map(tool => (
                              <Badge key={tool} className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 capitalize">
                                {tool.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">No subscriptions found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}