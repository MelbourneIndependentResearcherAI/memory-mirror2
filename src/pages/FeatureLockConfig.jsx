import React from 'react';
import FeatureLockSettings from '@/components/caregiver/FeatureLockSettings';

export default function FeatureLockConfig() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Feature Lock Control</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure which features are locked for patients and set caregiver PIN for authorized access.
          </p>
        </div>

        <FeatureLockSettings />
      </div>
    </div>
  );
}