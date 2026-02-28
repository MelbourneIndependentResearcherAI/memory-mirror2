import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NightWatch from '@/components/memory-mirror/NightWatch';
import PageLoadTip from '@/components/tips/PageLoadTip';
import { useFeatureLock } from '@/components/FeatureLockManager';
import FeatureLockModal from '@/components/FeatureLockModal';

export default function NightWatchPage() {
  const navigate = useNavigate();
  const { isFeatureLocked, unlockFeature, hasNightGuardLock } = useFeatureLock();
  const [showLockModal, setShowLockModal] = useState(false);

  const locked = isFeatureLocked('NightWatch');
  const nightGuardLocked = hasNightGuardLock('NightWatch');

  const handleClose = async () => {
    if (locked) {
      setShowLockModal(true);
    } else {
      navigate('/');
    }
  };

  const handleUnlock = async (pin) => {
    const success = await unlockFeature('NightWatch', pin);
    if (success) {
      setShowLockModal(false);
      navigate('/');
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950">
      <NightWatch onClose={handleClose} />
      <PageLoadTip pageName="NightWatch" />
      
      <FeatureLockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onUnlock={handleUnlock}
        featureName="NightWatch"
        isNightGuard={nightGuardLocked}
      />
    </div>
  );
}