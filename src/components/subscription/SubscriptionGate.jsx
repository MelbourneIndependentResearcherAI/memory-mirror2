import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function SubscriptionGate({ 
  feature, 
  required = 'premium',
  children 
}) {
  const navigate = useNavigate();
  const [usageCount, setUsageCount] = useState(0);

  // Check subscription status
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      try {
        const result = await base44.functions.invoke('checkSubscriptionStatus', {});
        return result.data;
      } catch (error) {
        console.error('Subscription check failed:', error);
        return { plan: 'free', features: {} };
      }
    }
  });

  // Track feature usage for free tier
  useEffect(() => {
    if (subscription?.plan === 'free' && feature) {
      const storageKey = `feature_usage_${feature}`;
      const today = new Date().toDateString();
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const [date, count] = stored.split(':');
        if (date === today) {
          setUsageCount(parseInt(count, 10));
        } else {
          localStorage.setItem(storageKey, `${today}:0`);
          setUsageCount(0);
        }
      }
    }
  }, [subscription, feature]);

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500">Loading...</div>;
  }

  // Check if user has access
  const canAccess = subscription?.plan === 'premium' || subscription?.status === 'active';
  const hasFeature = canAccess || (subscription?.features?.[`${feature}_enabled`] !== false);

  // For free tier, check usage limits
  let isLimitExceeded = false;
  if (!canAccess && feature) {
    const limit = subscription?.features?.conversation_limit;
    if (limit && usageCount >= limit) {
      isLimitExceeded = true;
    }
  }

  if (isLimitExceeded && !canAccess) {
    return (
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto" />
          
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
              Daily Limit Reached
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
              You've used your {usageCount} daily conversations. Upgrade to Premium for unlimited access.
            </p>
          </div>

          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-amber-700 dark:text-amber-300">
            Premium: Unlimited conversations, offline mode, family sharing, and more
          </p>
        </div>
      </Card>
    );
  }

  // Premium feature locked
  if (required === 'premium' && !canAccess) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto" />
          
          <div>
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">
              Premium Feature
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-300 mt-2">
              This feature is only available with a Premium subscription. Unlock full access to all Memory Mirror features.
            </p>
          </div>

          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-purple-700 dark:text-purple-300">
            Only $9.99/month for unlimited access
          </p>
        </div>
      </Card>
    );
  }

  // User has access
  return <>{children}</>;
}