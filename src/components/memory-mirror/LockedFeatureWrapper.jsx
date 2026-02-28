import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureLock } from '@/components/FeatureLockManager';
import FeatureLockModal from '@/components/FeatureLockModal';
import { Lock, AlertCircle } from 'lucide-react';

/**
 * Wraps a feature component to enforce feature lock restrictions
 */
export default function LockedFeatureWrapper({ 
  featureName, 
  children, 
  currentScreen = 'main',
  onExitAttempt = null 
}) {
  const { isFeatureLocked, isScreenAccessibleInLock, unlockFeature, hasNightGuardLock } = useFeatureLock();
  const navigate = useNavigate();
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockModalMode, setLockModalMode] = useState('unlock'); // 'unlock' or 'nightguard'

  const locked = isFeatureLocked(featureName);
  const nightGuardLocked = hasNightGuardLock(featureName);
  const screenAccessible = locked ? isScreenAccessibleInLock(featureName, currentScreen) : true;

  // If locked but current screen is not whitelisted, block access
  useEffect(() => {
    if (locked && !screenAccessible) {
      setShowLockModal(true);
      setLockModalMode(nightGuardLocked ? 'nightguard' : 'unlock');
    }
  }, [locked, screenAccessible, nightGuardLocked]);

  const handleUnlockAttempt = async (pin) => {
    const success = await unlockFeature(featureName, pin);
    if (success) {
      setShowLockModal(false);
    }
    return success;
  };

  const handleExitAttempt = () => {
    if (locked) {
      if (onExitAttempt) {
        onExitAttempt();
      } else {
        setShowLockModal(true);
        setLockModalMode(nightGuardLocked ? 'nightguard' : 'unlock');
      }
      return false;
    }
    return true;
  };

  // If screen not accessible, show blocked UI
  if (locked && !screenAccessible) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {featureName} is Locked
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs">
              A caregiver has restricted access to this feature. 
              {nightGuardLocked ? ' Night Guard mode is active.' : ' Enter the caregiver PIN to unlock.'}
            </p>
          </div>
        </div>
        <FeatureLockModal
          isOpen={showLockModal}
          onClose={() => setShowLockModal(false)}
          onUnlock={handleUnlockAttempt}
          featureName={featureName}
          isNightGuard={nightGuardLocked}
        />
      </>
    );
  }

  // Render children with lock enforcement
  return (
    <>
      {children(handleExitAttempt)}
      <FeatureLockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onUnlock={handleUnlockAttempt}
        featureName={featureName}
        isNightGuard={nightGuardLocked}
      />
    </>
  );
}