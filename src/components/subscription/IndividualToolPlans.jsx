import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const TOOLS = [
  { id: 'ai_chat', emoji: '🧠', name: 'AI Chat Companion', desc: 'Unlimited conversations with your AI companion' },
  { id: 'night_watch', emoji: '🌙', name: 'Night Watch', desc: 'Overnight monitoring and emergency alerts' },
  { id: 'music', emoji: '🎵', name: 'Music Therapy', desc: 'Era-specific music, playlists and sing-alongs' },
  { id: 'banking', emoji: '🏦', name: 'Fake Banking', desc: 'Reassuring bank balance view to reduce anxiety' },
  { id: 'gps_safety', emoji: '📍', name: 'GPS Safety', desc: 'Geofencing and location safety alerts' },
  { id: 'caregiver_tools', emoji: '👨‍⚕️', name: 'Caregiver Tools', desc: 'Dashboard, care journal and insights' },
];

const PRICE_PER_TOOL = 2.99;

const bankDetails = {
  bsb: '633123',
  account: '166572719',
  payid: 'mcnamaram86@gmail.com',
  account_name: 'Memory Mirror Operations'
};

export default function IndividualToolPlans({ user }) {
  const [selectedTools, setSelectedTools] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [copied, setCopied] = useState(null);
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const toggleTool = (id) => {
    setSelectedTools(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setShowPayment(false);
  };

  const totalPrice = (selectedTools.length * PRICE_PER_TOOL).toFixed(2);

  const createMutation = useMutation({
    mutationFn: async () => {
      const email = user?.email || userEmail;
      if (!email) throw new Error('Email required');
      const paymentRef = `TOOL-${email.split('@')[0].toUpperCase()}-${Date.now()}`;
      return await base44.entities.Subscription.create({
        user_email: email,
        plan_name: 'tool_subscription',
        subscribed_tools: selectedTools,
        plan_price: parseFloat(totalPrice),
        status: 'pending',
        payment_method: 'manual_bank_transfer',
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_reference: paymentRef,
        notes: `Individual tools: ${selectedTools.join(', ')}`
      });
    },
    onSuccess: () => {
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription request created! Activate after bank transfer.');
      setShowPayment(true);
    },
    onError: (err) => {
      setProcessing(false);
      toast.error(err.message || 'Failed to create subscription');
    }
  });

  const handleSubscribe = () => {
    if (!selectedTools.length) return toast.error('Select at least one tool');
    const email = user?.email || userEmail;
    if (!email) return toast.error('Email address is required');
    setProcessing(true);
    createMutation.mutate();
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Free notice */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
        <p className="text-green-800 dark:text-green-400 font-semibold">
          🆓 Emergency Resources are always <strong>100% FREE</strong> — no login, no subscription, ever.
        </p>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOOLS.map(tool => {
          const selected = selectedTools.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`text-left rounded-2xl border-2 p-4 transition-all ${
                selected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tool.emoji}</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{tool.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  selected ? 'bg-purple-500 border-purple-500' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {selected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge className={selected ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>
                  $2.99/month
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selectedTools.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{selectedTools.length} tool{selectedTools.length > 1 ? 's' : ''} selected</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Each tool = $2.99/month</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${totalPrice}</p>
              <p className="text-xs text-slate-500">/month total</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-xs text-amber-800 dark:text-amber-400">
            💡 <strong>Tip:</strong> Full access (all features) is just $9.99/month — better value if you need 4+ tools!
          </div>

          {!user && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                Your Email <span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          )}
          {user && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Subscribing as: <strong>{user.email}</strong>
            </p>
          )}

          <Button
            onClick={handleSubscribe}
            disabled={processing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold min-h-[48px]"
          >
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : `Subscribe to ${selectedTools.length} Tool${selectedTools.length > 1 ? 's' : ''} — $${totalPrice}/month`}
          </Button>
        </div>
      )}

      {/* Payment info shown after confirming */}
      {showPayment && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-slate-900 dark:text-white">Complete Your Payment</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Transfer <strong>${totalPrice}/month</strong> to activate your tool subscriptions.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'BSB', value: bankDetails.bsb },
              { label: 'Account', value: bankDetails.account },
              { label: 'PayID', value: bankDetails.payid },
            ].map(item => (
              <div key={item.label} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <button onClick={() => copyToClipboard(item.value, item.label)} className="min-h-0 min-w-0">
                    {copied === item.label ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use your email as the payment reference. Your tools will activate within 24 hours of payment.
          </p>
        </div>
      )}
    </div>
  );
}