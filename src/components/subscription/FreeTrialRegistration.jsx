import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function FreeTrialRegistration({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Set trial data in localStorage immediately (optimistic) so access is granted right away
      const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const trialData = {
        name,
        email,
        trial_end_date: trialEndDate.toISOString(),
        trial_start_date: new Date().toISOString(),
        trial_active: true
      };
      // Use consistent key format (email-based) to prevent multiple trials via incognito
      const trialKey = `freeTrialUser_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      localStorage.setItem(trialKey, JSON.stringify(trialData));
      // Also set legacy key for backward compat
      localStorage.setItem('freeTrialUser', JSON.stringify(trialData));

      // Verify with backend (server-side duplicate check)
      const result = await base44.functions.invoke('registerFreeTrial', { name, email });
      if (result?.data?.expired) {
        // Remove the optimistic localStorage entry
        localStorage.removeItem(trialKey);
        localStorage.removeItem('freeTrialUser');
        throw new Error('Your free trial has already been used. Please subscribe to continue.');
      }

      // Only navigate on success (not if expired)
      onSuccess?.({ name, email });
    } catch (err) {
      setError(err.message || 'Failed to register for free trial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            🎉 3-Day Free Trial
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No credit card needed. Full access to Memory Mirror for 3 days.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !name || !email}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Starting Trial...' : 'Start Free Trial'}
          </Button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            By starting the trial, you agree to our Terms of Service
          </p>
        </form>
      </div>
    </div>
  );
}