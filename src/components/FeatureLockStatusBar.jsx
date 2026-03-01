import React from 'react';
import { useFeatureLock } from '@/components/FeatureLockManager';
import { Lock, AlertTriangle } from 'lucide-react';

/**
 * Displays lock status indicator at top of screen
 */
export default function FeatureLockStatusBar({ featureName }) {
  const { isFeatureLocked, hasNightGuardLock } = useFeatureLock();

  const locked = isFeatureLocked(featureName);
  const nightGuardLocked = hasNightGuardLock(featureName);

  if (!locked) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 ${
      nightGuardLocked 
        ? 'bg-red-500 dark:bg-red-600' 
        : 'bg-purple-500 dark:bg-purple-600'
    } text-white`}>
      <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold">
        {nightGuardLocked ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            Night Guard Lock Active - Caregiver Only
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Feature Locked - PIN Required to Exit
          </>
        )}
      </div>
    </div>
  );
}