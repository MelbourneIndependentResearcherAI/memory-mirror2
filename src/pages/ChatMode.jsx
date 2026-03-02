import React, { useState } from 'react';
import ChatInterface from '@/components/memory-mirror/ChatInterface';
import MemoryGallery from '@/components/memory-mirror/MemoryGallery';
import { useFeatureLock } from '@/components/FeatureLockManager';
import FeatureLockModal from '@/components/FeatureLockModal';
import { toast } from 'sonner';

export default function ChatMode({ onEraChange, onModeSwitch, onBadDayActivated: _onBadDayActivated }) {
  const [showMemoryGallery, setShowMemoryGallery] = useState(false);
  const [detectedEra, setDetectedEra] = useState('present');
  const [_wakeWordActive, _setWakeWordActive] = useState(true);
  const { isFeatureLocked, unlockFeature, hasNightGuardLock } = useFeatureLock();
  const [showLockModal, setShowLockModal] = useState(false);

  const locked = isFeatureLocked('ChatMode');
  const nightGuardLocked = hasNightGuardLock('ChatMode');

  const handleEraChange = (era) => {
    setDetectedEra(era);
    if (onEraChange) onEraChange(era);
  };

  const _handleWakeWord = () => {
    console.log('🔊 Wake word detected!');
    toast.success('Hey Mirror activated!');
  };

  const handleUnlock = async (pin) => {
    const success = await unlockFeature('ChatMode', pin);
    if (success) {
      setShowLockModal(false);
    }
    return success;
  };

  if (locked) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="bg-blue-100 dark:bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chat Mode Locked</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs">
              {nightGuardLocked ? 'Night Guard mode is active.' : 'A caregiver has locked this feature.'}
            </p>
          </div>
        </div>
        <FeatureLockModal
          isOpen={showLockModal}
          onClose={() => setShowLockModal(false)}
          onUnlock={handleUnlock}
          featureName="ChatMode"
          isNightGuard={nightGuardLocked}
        />
      </>
    );
  }

  return (
    <>
      <ChatInterface 
        onEraChange={handleEraChange}
        onModeSwitch={onModeSwitch}
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />
      
      {showMemoryGallery && (
        <MemoryGallery
          isOpen={showMemoryGallery}
          onClose={() => setShowMemoryGallery(false)}
          filterEra={detectedEra}
        />
      )}
    </>
  );
}