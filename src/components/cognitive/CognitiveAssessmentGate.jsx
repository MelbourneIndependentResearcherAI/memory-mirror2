import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail, CheckCircle } from 'lucide-react';

export default function CognitiveAssessmentGate({ onSubmit, onClose }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Check if already submitted
  useEffect(() => {
    const storedEmail = localStorage.getItem('cognitiveAssessmentEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsSubmitted(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Store email in localStorage
    localStorage.setItem('cognitiveAssessmentEmail', email);
    setIsSubmitted(true);

    // Call onSubmit callback
    if (onSubmit) {
      onSubmit(email);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Thank you!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Confirmation email sent to <strong>{email}</strong>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You now have access to the free cognitive assessment. The test takes about 10-15 minutes and will help us personalize your Memory Mirror experience.
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold min-h-[44px]"
          >
            Start Free Assessment →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Free Assessment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Complete our free cognitive assessment to help us personalize your Memory Mirror experience. Takes just 10-15 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="your.email@example.com"
              className="w-full min-h-[44px] text-base"
              required
            />
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
                {error}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            We'll send you a confirmation email with your results and personalized recommendations.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold min-h-[44px]"
            >
              Continue →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}