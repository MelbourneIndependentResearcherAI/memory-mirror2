import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Users, 
  Music, 
  Calendar, 
  Shield,
  Building2,
  Copy,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function Pricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [copied, setCopied] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Banking details
  const bankDetails = {
    bsb: '633123',
    account: '166572719',
    payid: 'mcnamaram86@gmail.com',
    account_name: 'Memory Mirror Operations'
  };

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  // Fetch user's subscription
  const { data: subscription } = useQuery({
    queryKey: ['userSubscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs.find(s => s.status === 'active' || s.status === 'pending');
    },
    enabled: !!user?.email
  });

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billing: 'Forever Free',
      description: 'Essential features for getting started',
      features: [
        '10 conversations per day',
        '5 memory stories',
        'Basic voice interactions',
        'Community support',
        'Standard AI companion'
      ],
      highlight: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      billing: 'AUD $9.99/month',
      description: 'Full access to all Memory Mirror features',
      features: [
        'Unlimited conversations',
        'Unlimited memory storage',
        'Advanced voice cloning',
        'Family sharing (up to 5 members)',
        'Custom music & playlists',
        'Priority 24/7 support',
        'Offline mode with sync',
        'Advanced mood analytics',
        'Night watch monitoring',
        'Smart home integration',
        'Personalized care plans',
        'Early access to new features'
      ],
      highlight: true,
      popular: true
    }
  ];

  const createSubscriptionMutation = useMutation({
   mutationFn: async (data) => {
     return await base44.entities.Subscription.create(data);
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
     toast.success('Subscription request created!');
     setProcessing(false);
     setShowPaymentInfo(true);
   },
   onError: (error) => {
     console.error('Subscription error:', error);
     toast.error('Failed to create subscription: ' + (error.message || 'Unknown error'));
     setProcessing(false);
   }
  });

  const handleSelectPlan = (plan) => {
   if (plan.id === 'free') {
     toast.info('Free plan is already active');
     return;
   }
   setSelectedPlan(plan);
   setShowPaymentInfo(false);
  };

  const handleSubscribe = async () => {
   if (!selectedPlan) return;

   const email = user?.email || userEmail;
   if (!email) {
     toast.error('Please enter your email address');
     return;
   }

   if (!email.includes('@')) {
     toast.error('Please enter a valid email address');
     return;
   }

   setProcessing(true);

   const nextBillingDate = new Date();
   nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

   // Create unique payment reference - use email in reference for easy tracking
   const paymentRef = `SUB-${email.split('@')[0].toUpperCase()}-${Date.now()}`;

   const subscriptionData = {
     user_email: email,
     plan_name: selectedPlan.id,
     plan_price: selectedPlan.price,
     status: 'pending',
     payment_method: 'manual_bank_transfer',
     start_date: new Date().toISOString(),
     next_billing_date: nextBillingDate.toISOString(),
     payment_reference: paymentRef,
     notes: 'Payment awaiting bank transfer verification. Include payment reference in transfer.'
   };

   // Cache subscription locally for offline support
   try {
     localStorage.setItem('mm_pending_subscription', JSON.stringify(subscriptionData));
   } catch (e) {
     console.error('Failed to cache subscription:', e);
   }

   createSubscriptionMutation.mutate(subscriptionData);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 mr-1" />
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start with our free plan or unlock premium features to support your loved one's memory journey
          </p>
          <div className="mt-4 max-w-3xl mx-auto bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Payment Notice:</strong> Payments are processed externally via bank transfer. This is a subscription to our healthcare companion service, not an in-app digital purchase. You are subscribing to access our AI dementia care platform and related services.
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Current Plan: {subscription.plan_name.charAt(0).toUpperCase() + subscription.plan_name.slice(1)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Status: <Badge className="ml-1">{subscription.status}</Badge>
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(subscription.plan_price)}/mo
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.highlight 
                  ? 'border-purple-500 dark:border-purple-600 shadow-2xl scale-105' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                   <span className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                     {formatCurrency(plan.price)}
                   </span>
                   <span className="text-slate-600 dark:text-slate-400 text-lg">
                     {plan.price === 0 ? 'Always' : '/month'}
                   </span>
                 </div>
                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                   {plan.billing}
                 </p>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full min-h-[48px] ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  }`}
                  disabled={subscription?.plan_name === plan.id}
                >
                  {subscription?.plan_name === plan.id ? 'Current Plan' : 
                   plan.id === 'free' ? 'Get Started Free' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Plan Payment Info */}
        {selectedPlan && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Complete Your Payment
              </CardTitle>
              <CardDescription>
                Make a bank transfer of {formatCurrency(selectedPlan.price)} to activate your {selectedPlan.name} subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!user && (
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email Address *</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">BSB</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bsb, 'BSB')}
                      className="h-8"
                    >
                      {copied === 'BSB' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{bankDetails.bsb}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Account</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.account, 'Account')}
                      className="h-8"
                    >
                      {copied === 'Account' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{bankDetails.account}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">PayID</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.payid, 'PayID')}
                      className="h-8"
                    >
                      {copied === 'PayID' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{bankDetails.payid}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-2">
                    <strong>⚠️ Important Payment Instructions:</strong>
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1 list-disc list-inside">
                    <li>Use your registered email as the payment reference</li>
                    <li>Transfer the exact amount shown above</li>
                    <li>Your subscription will activate within 24 hours of payment</li>
                    <li>Keep your payment confirmation for records</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>External Payment Service:</strong> This payment is processed outside the app via direct bank transfer. You are purchasing a subscription service for healthcare companion features, not in-app digital content. All transactions are handled externally in compliance with app store policies.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-h-[48px] font-semibold text-white"
                disabled={processing || (!user && !userEmail) || !selectedPlan}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Complete Subscription - ${formatCurrency(selectedPlan.price)}/month`
                )}
              </Button>

              {showPaymentInfo && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Subscription created! Your account will be activated once we receive your payment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Compassionate Care
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI designed specifically for dementia care and memory support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Secure & Private
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your data is encrypted and never shared with third parties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Family Collaboration
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect with family members and caregivers for better support
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Memory Mirror is a healthcare companion service. Subscriptions are managed externally via bank transfer and provide access to our dementia care platform. 
            This is not an in-app purchase. By subscribing, you agree to our Terms of Service and understand that payments are processed outside the application.
          </p>
        </div>
      </div>
    </div>
  );
}