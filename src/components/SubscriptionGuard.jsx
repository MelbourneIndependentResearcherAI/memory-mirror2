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
        if (!user) {
          const cached = offlineHelper.getCachedSubscription();
          return cached || { isSubscribed: false, subscription: null };
        }

        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email
        });

        const activeSubscription = subscriptions.find(
          (sub) => sub.plan_name === 'premium' && sub.status === 'active'
        );

        const result = {
          isSubscribed: !!activeSubscription,
          subscription: activeSubscription || null,
          user,
          isOnline: true
        };

        offlineHelper.saveSubscription(result);
        return result;
      } catch (error) {
        console.error('Subscription check error:', error);
        const cached = offlineHelper.getCachedSubscription();
        if (cached) {
          return { ...cached, isOnline: false, offline: true };
        }
        return { isSubscribed: false, subscription: null };
      }
    },
    retry: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
}