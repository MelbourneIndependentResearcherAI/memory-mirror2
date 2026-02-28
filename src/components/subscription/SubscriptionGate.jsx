import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSubscriptionStatus } from '@/components/SubscriptionGuard';

/**
 * SubscriptionGate - wraps premium content.
 * Uses the centralized useSubscriptionStatus hook so free trial,
 * free tier, and paid users all get correct access.
 *
 * required='premium' (default) — blocks free-tier users
 * required='any' — allows any logged-in/trial/free-tier user
 */
export default function SubscriptionGate({ 
  feature, 
  required = 'premium',
  children 
}) {
  const navigate = useNavigate();
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500 text-sm">Checking access...</div>;
  }

  // Admin & premium subscribers always have full access
  const isPremium = subscriptionData?.isPremium || subscriptionData?.isAdmin;
  // Has any valid access (trial, free tier, or paid)
  const hasAnyAccess = subscriptionData?.isSubscribed;

  // required='any' — just needs to be past the paywall
  if (required === 'any') {
    if (!hasAnyAccess) {
      return (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-4">
            <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">Sign Up to Access</h3>
            <Button onClick={() => navigate(createPageUrl('Paywall'))} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      );
    }
    return <>{children}</>;
  }

  // required='premium' — needs paid subscription (trial & free-tier see upgrade prompt)
  if (required === 'premium' && !isPremium) {
    // Show free-tier limit notice with upgrade CTA
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">Premium Feature</h3>
            <p className="text-sm text-purple-800 dark:text-purple-300 mt-2">
              {subscriptionData?.isOnFreeTrial
                ? 'This feature requires a Premium subscription. Your trial gives you limited access.'
                : 'Upgrade to Premium for unlimited access to all Memory Mirror features.'}
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade Now — $9.99/month
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}