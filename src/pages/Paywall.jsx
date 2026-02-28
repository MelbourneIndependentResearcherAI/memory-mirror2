import React, { useState, useEffect } from 'react';
import { Heart, Check, Loader2, Copy, CheckCircle2, Clock, Gift, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isFreeTrial, hasTrialExpired, getTrialUser } from '@/components/subscription/FreeTrialManager';
import FreeTrialRegistration from '@/components/subscription/FreeTrialRegistration';
import { createPageUrl } from '@/utils';

export default function Paywall() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // processing is derived from mutation state
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Determine trial state from localStorage
  const hadTrial = !!getTrialUser();
  const trialExpired = hasTrialExpired();
  const onActiveTrial = isFreeTrial();

  // If somehow they have an active trial, redirect home
  useEffect(() => {
    if (onActiveTrial) {
      navigate(createPageUrl('Home'));
    }
  }, [onActiveTrial, navigate]);

  const bankDetails = {
    bsb: '633123',
    account: '166572719',
    payid: 'mcnamaram86@gmail.com',
    accountName: 'Memory Mirror Operations',
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) throw new Error('Please sign in to subscribe');

      // Check for existing pending subscription to prevent duplicates
      const existingSubs = await base44.entities.Subscription.filter({ user_email: user.email });
      const existingPending = existingSubs.find(s => s.status === 'pending' && s.plan_name === 'premium');
      if (existingPending) {
        // Return existing pending subscription instead of creating a new one
        return existingPending;
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
        next_billing_date: nextBillingDate.toISOString(),
        notes: 'Awaiting bank transfer confirmation.'
      };

      localStorage.setItem('mm_pending_subscription', JSON.stringify(subData));
      await base44.entities.Subscription.create(subData);
      return subData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowBankDetails(true);
      toast.success('Subscription registered! Complete your bank transfer to activate.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register subscription');
    }
  });

  const handleSubscribe = () => {
    subscriptionMutation.mutate();
  };

  const handleFreeTier = () => {
    localStorage.setItem('mm_free_tier_user', 'true');
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    navigate(createPageUrl('Home'));
  };

  const handleTrialSuccess = () => {
    setShowTrialModal(false);
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    navigate(createPageUrl('Home'));
  };

  const features = [
    'Unlimited AI companion conversations',
    'Music therapy with personalised playlists',
    'Night watch monitoring & alerts',
    'Family portal & caregiver dashboard',
    'Offline mode with sync',
    'Advanced mood & memory analytics',
    'GPS safety & geofence alerts',
    '24/7 availability'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Memory Mirror</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">AI Companion for Dementia Care</p>

            {hadTrial && trialExpired ? (
              <div className="mt-3 inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-semibold">
                🎉 Your 3-Day Free Trial Has Ended
              </div>
            ) : !hadTrial ? (
              <div className="mt-3 inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Try Free for 3 Days — No Card Required
              </div>
            ) : null}
          </div>

          {/* === Option 1: Start Free Trial (only if never started one) === */}
          {!hadTrial && (
            <>
              <Button
                onClick={() => setShowTrialModal(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl min-h-[56px] mb-1"
              >
                <Gift className="w-5 h-5 mr-2" />
                Start 3-Day Free Trial
              </Button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-5">
                Full access. No credit card needed.
              </p>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-slate-900 text-sm text-slate-400">or subscribe directly</span>
                </div>
              </div>
            </>
          )}

          {/* === Option 2: Subscribe — Premium === */}
          <div className="text-center mb-5">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Premium Plan</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$9.99</span>
              <span className="text-slate-500 dark:text-slate-400">/month AUD</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">🔥 Founder's Price — locked in forever</p>
          </div>

          {/* Features List */}
          <div className="space-y-2 mb-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          {!showBankDetails ? (
            <Button
              onClick={handleSubscribe}
              disabled={subscriptionMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 text-base rounded-xl mb-3 min-h-[52px]"
            >
              {subscriptionMutation.isPending
                ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                : 'Subscribe Now — $9.99/month'}
            </Button>
          ) : (
            /* Bank Payment Details — shown after subscription registered */
            <div className="mb-4 space-y-3">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-green-800 dark:text-green-400 font-semibold flex items-center gap-2 mb-3 text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Subscription registered! Send your payment:
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'BSB', value: bankDetails.bsb },
                    { label: 'Account Number', value: bankDetails.account },
                    { label: 'Account Name', value: bankDetails.accountName },
                    { label: 'PayID', value: bankDetails.payid },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{value}</p>
                      </div>
                      <button onClick={() => copyToClipboard(value, label)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg min-h-[36px] min-w-[36px]">
                        {copied === label
                          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                          : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg">
                  ⚠️ Use your email as the payment reference. Account activates within 24 hours of payment receipt.
                </p>
              </div>
            </div>
          )}

          {/* View All Plans */}
          <button
            onClick={() => navigate(createPageUrl('Pricing'))}
            className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium py-2 transition-colors underline text-sm"
          >
            View all plans (individual tools from $2.99/month)
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-slate-900 text-sm text-slate-400">or use the free tier</span>
            </div>
          </div>

          {/* === Option 3: Free Tier === */}
          <Button
            onClick={handleFreeTier}
            variant="outline"
            className="w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-xl min-h-[48px]"
          >
            <Clock className="w-4 h-4 mr-2" />
            Continue with Free Tier
          </Button>
          <div className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400 space-y-0.5">
            <p>5 AI chats/day • 10 memory views/day • 15 voice minutes/day</p>
            <p>Limits reset automatically at midnight each day</p>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-5">
            Bank transfer payments. Subscription activates within 24 hours of payment.
          </p>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 mx-auto mt-4 text-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>

      {showTrialModal && (
        <FreeTrialRegistration
          onSuccess={handleTrialSuccess}
          onClose={() => setShowTrialModal(false)}
        />
      )}
    </div>
  );
}