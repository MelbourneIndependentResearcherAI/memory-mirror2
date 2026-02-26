import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export const useSubscriptionStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          return { isSubscribed: false, isPremium: false, plan: 'free' };
        }

        const subs = await base44.entities.Subscription.filter({
          user_email: user.email,
          status: 'active'
        });

        return {
          isSubscribed: subs.length > 0,
          isPremium: subs.length > 0 && subs[0].plan_name === 'premium',
          plan: subs.length > 0 ? subs[0].plan_name : 'free',
          subscription: subs[0] || null
        };
      } catch (err) {
        console.error('Subscription check error:', err);
        return { isSubscribed: false, isPremium: false, plan: 'free' };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  return { data, isLoading, error };
};

export const ProtectedFeature = ({ children, requirePremium = false, fallback = null }) => {
  const { data, isLoading } = useSubscriptionStatus();

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500">Loading...</div>;
  }

  if (requirePremium && !data?.isPremium) {
    return fallback || (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">This feature requires a premium subscription</p>
      </div>
    );
  }

  return children;
};