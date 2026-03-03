import React, { useState, useEffect } from 'react';
import { User, Mail, ArrowRight, Clock, CheckCircle2, Star, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STORAGE_KEY = 'mm_app_trial';
const TRIAL_DAYS = 3;

export function getAppTrialData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAppTrialActive() {
  const data = getAppTrialData();
  if (!data?.registeredAt) return false;
  const daysSince = (Date.now() - data.registeredAt) / (1000 * 60 * 60 * 24);
  return daysSince < TRIAL_DAYS;
}

export function hasAppTrialExpired() {
  const data = getAppTrialData();
  if (!data?.registeredAt) return false;
  const daysSince = (Date.now() - data.registeredAt) / (1000 * 60 * 60 * 24);
  return daysSince >= TRIAL_DAYS;
}

function getDaysRemaining() {
  const data = getAppTrialData();
  if (!data?.registeredAt) return 0;
  const daysSince = (Date.now() - data.registeredAt) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));
}

// Pages that don't require trial registration
const OPEN_PAGES = [
  'Landing', 'Paywall', 'Pricing', 'FAQ', 'PrivacyPolicy',
  'TermsOfService', 'Resources', 'AccessibilityStatement',
  'DiagnosticTest', 'Registration'
];

export default function AppTrialGate({ children, currentPageName, isAdmin }) {
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Also check legacy free trial key for backwards compat
    const legacyKeys = Object.keys(localStorage);
    const legacyKey = legacyKeys.find(k => k.startsWith('freeTrialUser_'));
    if (legacyKey) {
      try {
        const legacyData = JSON.parse(localStorage.getItem(legacyKey));
        if (legacyData) {
          // Migrate legacy trial to new key
          const migrated = {
            name: legacyData.name || 'User',
            email: legacyData.email || '',
            registeredAt: new Date(legacyData.trial_start_date || Date.now()).getTime()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } catch {}
    }
    const oldKey = localStorage.getItem('freeTrialUser');
    if (oldKey) {
      try {
        const legacyData = JSON.parse(oldKey);
        if (legacyData && !localStorage.getItem(STORAGE_KEY)) {
          const migrated = {
            name: legacyData.name || 'User',
            email: legacyData.email || '',
            registeredAt: new Date(legacyData.trial_start_date || Date.now()).getTime()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } catch {}
    }

    setTrialData(getAppTrialData());
    setLoading(false);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    // Save to DB (non-blocking)
    try {
      await base44.entities.CollectedEmail.create({
        email: form.email.trim(),
        name: form.name.trim(),
        source: 'free_trial',
        notes: 'App-wide 3-day trial registration',
      });
    } catch {}

    // Also save in legacy format for SubscriptionGuard compatibility
    const trialEndDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const legacyData = {
      name: form.name.trim(),
      email: form.email.trim(),
      trial_end_date: trialEndDate.toISOString(),
      trial_start_date: new Date().toISOString(),
      trial_active: true
    };
    const legacyKey = `freeTrialUser_${form.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    localStorage.setItem(legacyKey, JSON.stringify(legacyData));
    localStorage.setItem('freeTrialUser', JSON.stringify(legacyData));

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      registeredAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTrialData(data);
    toast.success(`Welcome ${form.name}! Your 3-day free trial has started.`);
    setSubmitting(false);
  };

  // Always allow open pages, admin users, free tier users, and subscribed users
  const isOpenPage = OPEN_PAGES.includes(currentPageName);
  const isFreeTierUser = localStorage.getItem('mm_free_tier_user') === 'true';
  if (isOpenPage || isAdmin || isFreeTierUser) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Active trial — show content with days-remaining banner
  if (trialData && isAppTrialActive()) {
    const daysLeft = getDaysRemaining();
    return (
      <div>
        {daysLeft <= 3 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-700 px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800 dark:text-amber-300">
                <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</strong> on your free trial.
              </span>
            </div>
            <a href="/Pricing" className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline whitespace-nowrap">Subscribe →</a>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Trial has expired — redirect to paywall
  if (trialData && hasAppTrialExpired()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-6xl">⏰</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your free trial has ended</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your 3-day free trial for <strong>{trialData?.name}</strong> has expired.
            Subscribe to keep full access or continue with the free tier (limited daily usage).
          </p>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-700 text-left">
            <p className="font-semibold text-slate-800 dark:text-white mb-2">Full access from $9.99/month</p>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mb-4">
              {['Unlimited AI conversations', 'Music therapy & memory tools', 'Caregiver dashboard & insights', 'Family collaboration & alerts'].map(f => (
                <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-3"
              onClick={() => navigate(createPageUrl('Pricing'))}
            >
              <Star className="w-4 h-4 mr-2" /> View Subscription Plans
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                localStorage.setItem('mm_free_tier_user', 'true');
                window.location.reload();
              }}
            >
              <Clock className="w-4 h-4 mr-2" /> Continue with Free Tier (5 chats/day)
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // No trial — show registration
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Memory Mirror</h1>
          <p className="text-slate-500 dark:text-slate-400">Register for your free 3-day trial to access all features</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🧠', label: 'AI Companion' },
            { icon: '❤️', label: 'Health Monitoring' },
            { icon: '🎵', label: 'Music Therapy' },
            { icon: '👨‍⚕️', label: 'Caregiver Tools' },
            { icon: '🌙', label: 'Night Watch' },
            { icon: '👥', label: 'Family Portal' },
          ].map(f => (
            <div key={f.label} className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-2 shadow-sm">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
            </div>
          ))}
        </div>

        <Card className="p-6 shadow-xl border-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-slate-800 dark:text-white">Start your free 3-day trial</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-base font-semibold rounded-xl"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting trial...</>
                : <><ArrowRight className="w-4 h-4 mr-2" />Start Free 3-Day Trial</>}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            No credit card required · 3 days full access · Cancel anytime
          </p>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-4">
          After your trial,{' '}
          <a href="/Pricing" className="text-purple-600 dark:text-purple-400 underline">subscribe for full access</a>
          {' '}or use the free tier
        </p>
      </div>
    </div>
  );
}