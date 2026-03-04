import React, { useState, useEffect } from 'react';
import { Heart, User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const STORAGE_KEY = 'mm_registered_user';

export function useIsRegistered() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function UserRegistrationGate() {
  const [isRegistered, setIsRegistered] = useState(true); // start true to avoid flash
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsRegistered(!!stored);
    } catch {
      setIsRegistered(true);
    }
    setChecked(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) return toast.error('Please enter a valid email address');

    setLoading(true);
    try {
      await base44.entities.CollectedEmail.create({
        email: email.trim().toLowerCase(),
        source: 'registration',
        name: name.trim(),
      });
    } catch {
      // Non-blocking — still allow through
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), registered_at: new Date().toISOString() }));
    setIsRegistered(true);
    setLoading(false);
    toast.success(`Welcome, ${name.trim()}! 💙`);
  };

  if (!checked || isRegistered) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Memory Mirror</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Compassionate AI companion for dementia care — completely free, forever.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
            Please introduce yourself so we can personalise your experience.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="e.g. Sarah Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 min-h-[48px]"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 min-h-[48px]"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base rounded-xl mt-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>
            ) : (
              <>Get Started Free <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Your email is used only to keep you updated. We never share it. No spam.
        </p>
      </div>
    </div>
  );
}