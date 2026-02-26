import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return { isSubscribed: false, subscription: null };

        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email
        });

        const activeSubscription = subscriptions.find(
          (sub) => sub.plan_name === 'premium' && sub.status === 'active'
        );

        return {
          isSubscribed: !!activeSubscription,
          subscription: activeSubscription || null,
          user
        };
      } catch (error) {
        console.error('Subscription check error:', error);
        return { isSubscribed: false, subscription: null };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}