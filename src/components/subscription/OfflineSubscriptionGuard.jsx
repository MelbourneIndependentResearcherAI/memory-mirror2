import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { offlineSubscriptionManager } from './OfflineSubscriptionManager';

/**
 * Enhanced useSubscriptionStatus with offline support
 * Falls back to cached data when offline
 */
export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        // Try to fetch from API first
        const user = await base44.auth.me();
        if (!user) {
          // Check for cached offline subscription
          const cached = offlineSubscriptionManager.getCachedSubscription();
          return cached || { isSubscribed: false, subscription: null };
        }

        // Fetch fresh subscription data
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

        // Cache successful result
        offlineSubscriptionManager.saveSubscription(result);

        return result;
      } catch (error) {
        console.error('Subscription check error:', error);
        
        // Fall back to cached data
        const cached = offlineSubscriptionManager.getCachedSubscription();
        if (cached) {
          return {
            ...cached,
            isOnline: false,
            offline: true
          };
        }

        // No cache, return default
        return { isSubscribed: false, subscription: null };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}