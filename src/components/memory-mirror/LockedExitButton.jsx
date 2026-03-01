import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Lock } from 'lucide-react';
import { useFeatureLock } from '@/components/FeatureLockManager';
import FeatureLockModal from '@/components/FeatureLockModal';

/**
 * Exit button that respects feature locks
 * If feature is locked, prompts for PIN before allowing navigation
 */
export default function LockedExitButton({ 
  featureName, 
  onExit, 
  children = 'Back',
  variant = 'outline',
  className = ''
}) {
  const { isFeatureLocked, unlockFeature, hasNightGuardLock } = useFeatureLock();
  const [showLockModal, setShowLockModal] = useState(false);

  const locked = isFeatureLocked(featureName);
  const nightGuardLocked = hasNightGuardLock(featureName);

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (locked) {
      setShowLockModal(true);
    } else if (onExit) {
      onExit();
    }
  };

  const handleUnlock = async (pin) => {
    const success = await unlockFeature(featureName, pin);
    if (success && onExit) {
      onExit();
      setShowLockModal(false);
    }
    return success;
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={handleClick}
        className={`gap-2 ${className}`}
      >
        <ChevronLeft className="w-4 h-4" />
        {locked && <Lock className="w-4 h-4" />}
        {children}
      </Button>
      
      <FeatureLockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onUnlock={handleUnlock}
        featureName={featureName}
        isNightGuard={nightGuardLocked}
      />
    </>
  );
}