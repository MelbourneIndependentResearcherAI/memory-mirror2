import React, { useState } from 'react';
import { Heart, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Paywall() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processingSubscription, setProcessingSubscription] = useState(false);

  const subscriptionMutation = useMutation({
   mutationFn: async () => {
     try {
       const user = await base44.auth.me();
       if (!user) {
         throw new Error('Not authenticated');
       }

       const paymentRef = `SUB-${user.email.split('@')[0].toUpperCase()}-${Date.now()}`;
       const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

       const subData = {
         user_email: user.email,
         plan_name: 'premium',
         plan_price: 9.99,
         status: 'pending',
         payment_method: 'manual_bank_transfer',
         payment_reference: paymentRef,
         start_date: new Date().toISOString(),
         next_billing_date: nextBillingDate.toISOString()
       };

       // Cache locally for offline support
       try {
         localStorage.setItem('mm_pending_subscription', JSON.stringify(subData));
       } catch (e) {
         console.error('Failed to cache subscription:', e);
       }

       // Create subscription record with pending status
       try {
         await base44.entities.Subscription.create(subData);
       } catch (createError) {
         console.error('Subscription create error:', createError);
         // Continue anyway - user has initiated subscription
       }

       return user;
     } catch (error) {
       console.error('Subscription mutation error:', error);
       // If offline but have local cache, still proceed
       const cached = localStorage.getItem('mm_pending_subscription');
       if (cached) {
         return JSON.parse(cached);
       }
       throw error;
     }
   },
   onSuccess: () => {
     setProcessingSubscription(false);
     queryClient.invalidateQueries({ queryKey: ['subscription'] });
     toast.success('Subscription initiated! Redirecting to checkout...');
     // Navigate to pricing/checkout page
     setTimeout(() => {
       navigate('/pricing');
     }, 500);
   },
   onError: (error) => {
     setProcessingSubscription(false);
     toast.error('Failed to initiate subscription: ' + (error.message || 'Unknown error'));
   }
  });

  const handleSubscribe = async () => {
    setProcessingSubscription(true);
    subscriptionMutation.mutate();
  };

  const features = [
    'Full access to AI companion',
    'Advanced chat with memory recall',
    'Music therapy with playlists',
    'Night watch monitoring',
    'Health & mood tracking',
    'Family portal access',
    'Caregiver dashboard',
    'Offline capabilities',
    '24/7 availability'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-200 dark:border-slate-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Memory Mirror</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">AI Companion for Dementia Care</p>
            <div className="mt-4 inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-semibold">
              🎉 Your 3-Day Free Trial Has Ended
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <p className="text-slate-600 dark:text-slate-400 mb-2">Continue with Premium</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">$9.99</span>
              <span className="text-slate-600 dark:text-slate-400">/month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Full access to all Memory Mirror features</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={processingSubscription}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl mb-4 min-h-[56px]"
          >
            {processingSubscription ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>

          {/* View All Plans */}
          <button
            onClick={() => navigate('/pricing')}
            className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium py-3 transition-colors underline"
          >
            View all plans (including individual tools from $2.99/month)
          </button>

          {/* Restore Purchase */}
          <button
            onClick={() => {
              navigate('/pricing');
            }}
            className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-3 transition-colors underline"
          >
            View all plans
          </button>

          {/* Terms */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
            By subscribing, you agree to our automatic billing and cancellation policy.
            Manage your subscription anytime in settings.
          </p>
        </div>
      </div>
    </div>
  );
}