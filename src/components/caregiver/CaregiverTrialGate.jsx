import React, { useState, useEffect } from 'react';
import { User, Mail, ArrowRight, Clock, CheckCircle2, Star, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'caregiver_trial_registration';
const TRIAL_DAYS = 3;

function getTrialData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function isTrialActive(trialData) {
  if (!trialData?.registeredAt) return false;
  const daysSince = (Date.now() - trialData.registeredAt) / (1000 * 60 * 60 * 24);
  return daysSince < TRIAL_DAYS;
}

function getDaysRemaining(trialData) {
  if (!trialData?.registeredAt) return 0;
  const daysSince = (Date.now() - trialData.registeredAt) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));
}

export default function CaregiverTrialGate({ children, isAdmin }) {
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    // Admin users bypass gate entirely
    if (isAdmin) { setLoading(false); return; }

    const data = getTrialData();
    setTrialData(data);

    if (data && !isTrialActive(data)) {
      setTrialExpired(true);
    }

    setLoading(false);
  }, [isAdmin]);

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
    try {
      // Save to CollectedEmail entity for tracking
      await base44.entities.CollectedEmail.create({
        email: form.email.trim(),
        name: form.name.trim(),
        source: 'free_trial',
        notes: 'Caregiver Portal 3-day trial registration',
      });
    } catch {
      // Non-blocking — still grant access even if entity save fails
    }

    const data = { name: form.name.trim(), email: form.email.trim(), registeredAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTrialData(data);
    setTrialExpired(false);
    toast.success(`Welcome ${form.name}! Your 3-day free trial has started.`);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Admin or active trial — show portal
  if (isAdmin || (trialData && isTrialActive(trialData))) {
    const daysLeft = getDaysRemaining(trialData);
    return (
      <div>
        {!isAdmin && trialData && daysLeft <= 3 && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-amber-800 dark:text-amber-300">
              <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</strong> on your free trial.{' '}
              To subscribe visit <a href="https://memory-mirror.app" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-900">memory-mirror.app</a> — Founder pricing $9.99/month
            </span>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Trial expired
  if (trialExpired) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-6 px-4">
        <div className="text-6xl">⏰</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your free trial has ended</h2>
        <p className="text-slate-500">Your 3-day free trial for <strong>{trialData?.name || 'the Caregiver Portal'}</strong> has expired.</p>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-700">
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mb-4 text-left">
            {['Full Caregiver Portal access', 'AI Care Insights', 'Family collaboration tools', 'Voice cloning & memory tools'].map(f => (
              <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{f}</li>
            ))}
          </ul>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">To subscribe visit</p>
            <a href="https://memory-mirror.app" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-purple-600 dark:text-purple-400 underline">memory-mirror.app</a>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Founder pricing — $9.99/month</p>
          </div>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Caregiver Portal</h1>
          <p className="text-slate-500 dark:text-slate-400">Start your free 3-day trial to access all caregiver tools</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '❤️', label: 'Health Monitoring' },
            { icon: '✨', label: 'AI Insights' },
            { icon: '📖', label: 'Care Journal' },
            { icon: '👥', label: 'Family Tools' },
          ].map(f => (
            <div key={f.label} className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-2 shadow-sm">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Registration Card */}
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
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting trial...</>
                : <><ArrowRight className="w-4 h-4 mr-2" /> Start Free 3-Day Trial</>}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            No credit card required · Cancel anytime · Trial lasts 3 days
          </p>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-4">
          After your trial,{' '}
          <a href="/Pricing" className="text-purple-600 dark:text-purple-400 underline">subscribe for full access</a>
        </p>
      </div>
    </div>
  );
}