import React, { useState, useEffect } from 'react';
import PhoneInterface from '@/components/memory-mirror/PhoneInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';
import { useLockMode } from '@/components/LockModeManager';
import UnlockModal from '@/components/UnlockModal';
import { Button } from '@/components/ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PhoneMode() {
  const { lockMode, unlockMode, isLocked } = useLockMode();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const navigate = useNavigate();
  const locked = isLocked('phone');

  useEffect(() => {
    // Prevent browser back button when locked
    if (locked) {
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      };

      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [locked]);

  const handleLockToggle = () => {
    if (locked) {
      setShowUnlockModal(true);
    } else {
      lockMode('phone');
    }
  };

  const handleUnlock = (pin) => {
    const success = unlockMode(pin);
    if (success) {
      setShowUnlockModal(false);
      navigate('/chat');
    }
    return success;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Lock/Unlock Button - Always visible for caregivers */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={handleLockToggle}
          variant={locked ? "destructive" : "outline"}
          size="sm"
          className="shadow-lg"
        >
          {locked ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked Mode
            </>
          ) : (
            <>
              <LockOpen className="w-4 h-4 mr-2" />
              Lock Mode
            </>
          )}
        </Button>
      </div>

      <PhoneInterface />
      <VoiceCommandListener currentMode="phone" />

      <UnlockModal
        isOpen={showUnlockModal}
        onUnlock={handleUnlock}
        onCancel={() => {}}
        modeName="Phone Mode"
      />
    </div>
  );
}