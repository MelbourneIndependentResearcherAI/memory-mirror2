import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SUBSCRIPTION_CACHE_KEY = 'mm_subscription_cache';
const SUBSCRIPTION_CACHE_TIME = 'mm_subscription_cache_time';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const offlineHelper = {
  saveSubscription(data) {
    try {
      localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(SUBSCRIPTION_CACHE_TIME, Date.now().toString());
    } catch (e) {
      console.error('Failed to save subscription cache:', e);
    }
  },
  getCachedSubscription() {
    try {
      const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      const cacheTime = localStorage.getItem(SUBSCRIPTION_CACHE_TIME);
      
      if (!cached || !cacheTime) return null;
      const age = Date.now() - parseInt(cacheTime);
      if (age > CACHE_DURATION) return null;

      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
};

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        
        // Check free trial status
        let trialStatus = { isOnFreeTrial: false, trialExpired: false };
        try {
          const { isFreeTrial, hasTrialExpired } = await import('./FreeTrialManager');
          trialStatus = {
            isOnFreeTrial: isFreeTrial(),
            trialExpired: hasTrialExpired()
          };
        } catch (e) {
          console.log('Trial check skipped');
        }

        if (!user) {
          // Not authenticated - try cache first
          const cached = offlineHelper.getCachedSubscription();
          return cached || { 
            isSubscribed: trialStatus.isOnFreeTrial && !trialStatus.trialExpired, 
            subscription: null, 
            user: null,
            ...trialStatus
          };
        }

        // User is authenticated - fetch fresh subscription data
        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email
        });

        // Check for active premium subscription
        const activeSubscription = subscriptions.find(
          (sub) => sub.plan_name === 'premium' && sub.status === 'active'
        );

        // Check for active tool subscriptions
        const activeToolSubscriptions = subscriptions.filter(
          (sub) => sub.plan_name === 'tool_subscription' && sub.status === 'active'
        );

        // Collect all subscribed tools across tool subscriptions
        const subscribedTools = activeToolSubscriptions.flatMap(sub => sub.subscribed_tools || []);

        // Also check for pending (to show payment required)
        const pendingSubscription = subscriptions.find(
          (sub) => (sub.plan_name === 'premium' || sub.plan_name === 'tool_subscription') && sub.status === 'pending'
        );

        // Admin users bypass paywall entirely
        const isAdmin = user.role === 'admin';

        // User is subscribed if: admin OR has active subscription OR on active free trial
        const isSubscribed = isAdmin || !!activeSubscription || activeToolSubscriptions.length > 0 || (trialStatus.isOnFreeTrial && !trialStatus.trialExpired);

        const result = {
          isSubscribed,
          isPremium: isAdmin || !!activeSubscription,
          isAdmin,
          isPending: !!pendingSubscription,
          subscription: activeSubscription || pendingSubscription || null,
          subscribedTools,
          hasToolAccess: (toolId) => !!activeSubscription || subscribedTools.includes(toolId),
          user,
          isOnline: true,
          ...trialStatus
        };

        offlineHelper.saveSubscription(result);
        return result;
      } catch (error) {
        console.error('Subscription check error:', error);
        const cached = offlineHelper.getCachedSubscription();
        if (cached) {
          return { ...cached, isOnline: false, offline: true };
        }
        // Return default state that won't block rendering
        return { isSubscribed: false, subscription: null, user: null, error: true, isOnFreeTrial: false, trialExpired: false };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: { isSubscribed: false, subscription: null, user: null, isLoading: true, isOnFreeTrial: false, trialExpired: false }
  });
}