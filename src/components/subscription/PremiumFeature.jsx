import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumFeature({ 
  children, 
  featureId = 'generic_premium',
  fallback = null 
}) {
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      try {
        const result = await base44.functions.invoke('checkSubscriptionStatus', {});
        return result.data;
      } catch {
        return { plan: 'free' };
      }
    }
  });

  const isPremium = subscription?.plan === 'premium';

  if (!isPremium) {
    return fallback || (
      <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700 text-center">
        <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-3">
          Premium feature - upgrade to access
        </p>
        <Button
          onClick={() => navigate(createPageUrl('Pricing'))}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          Upgrade Now
        </Button>
      </div>
    );
  }

  return children;
}