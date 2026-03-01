import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isFreeTrial, hasTrialExpired } from '@/components/subscription/FreeTrialManager';

function getFreeTierUser() {
  try {
    return localStorage.getItem('mm_free_tier_user') === 'true';
  } catch {
    return false;
  }
}

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
        
        // Check free trial + free tier status
        const isFreeTierUser = getFreeTierUser();
        const trialStatus = {
          isOnFreeTrial: isFreeTrial(),
          trialExpired: hasTrialExpired()
        };

        if (!user) {
          // Not authenticated - try cache first
          const cached = offlineHelper.getCachedSubscription();
          return cached || { 
            isSubscribed: (trialStatus.isOnFreeTrial && !trialStatus.trialExpired) || isFreeTierUser, 
            isFreeTier: isFreeTierUser,
            subscription: null, 
            user: null,
            ...trialStatus
          };
        }

        // User is authenticated - fetch fresh subscription data
        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email
        });

        // Check for active or pending premium subscription
        const validSubscription = subscriptions.find(
          (sub) => sub.plan_name === 'premium' && (sub.status === 'active' || sub.status === 'pending')
        );

        // Check for active or pending tool subscriptions
        const validToolSubscriptions = subscriptions.filter(
          (sub) => sub.plan_name === 'tool_subscription' && (sub.status === 'active' || sub.status === 'pending')
        );

        // Collect all subscribed tools across tool subscriptions
        const subscribedTools = validToolSubscriptions.flatMap(sub => sub.subscribed_tools || []);

        // Also check for pending (to show payment required)
        const pendingSubscription = subscriptions.find(
          (sub) => (sub.plan_name === 'premium' || sub.plan_name === 'tool_subscription') && sub.status === 'pending'
        );

        // Admin users bypass paywall entirely
        const isAdmin = user.role === 'admin';

        // User is subscribed if: admin OR has active/pending subscription OR on active free trial OR chose free tier
        const isSubscribed = isAdmin || !!validSubscription || validToolSubscriptions.length > 0 || (trialStatus.isOnFreeTrial && !trialStatus.trialExpired) || isFreeTierUser;

        const result = {
          isSubscribed,
          isPremium: isAdmin || !!validSubscription,
          isAdmin,
          isPending: !!pendingSubscription,
          isFreeTier: isFreeTierUser,
          subscription: validSubscription || pendingSubscription || null,
          subscribedTools,
          user,
          isOnline: true,
          ...trialStatus
        };

        // Save serializable result (functions can't be cached)
        offlineHelper.saveSubscription(result);
        return { ...result, hasToolAccess: (toolId) => !!validSubscription || subscribedTools.includes(toolId) };
      } catch (error) {
        console.error('Subscription check error:', error);
        const cached = offlineHelper.getCachedSubscription();
        if (cached) {
          const cachedTools = cached.subscribedTools || [];
          return { 
            ...cached, 
            isOnline: false, 
            offline: true,
            hasToolAccess: (toolId) => cached.isPremium || cachedTools.includes(toolId)
          };
        }
        // Return default state that won't block rendering
        return { isSubscribed: false, subscription: null, user: null, error: true, isOnFreeTrial: false, trialExpired: false };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: () => {
      const trialActive = isFreeTrial() && !hasTrialExpired();
      const freeTier = getFreeTierUser();
      const cached = offlineHelper.getCachedSubscription();
      return {
        isSubscribed: trialActive || freeTier || cached?.isSubscribed || false,
        isOnFreeTrial: trialActive,
        trialExpired: hasTrialExpired(),
        isFreeTier: freeTier,
        isAdmin: cached?.isAdmin || false,
        isPremium: cached?.isPremium || false,
        subscription: cached?.subscription || null,
        subscribedTools: cached?.subscribedTools || [],
        hasToolAccess: (toolId) => (cached?.isPremium) || (cached?.subscribedTools || []).includes(toolId),
        user: null
      };
    }
  });
}