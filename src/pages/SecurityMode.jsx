import React, { useState } from 'react';
import SecurityInterface from '@/components/memory-mirror/SecurityInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';
import MemoryGallery from '@/components/memory-mirror/MemoryGallery';

export default function SecurityMode({ onModeSwitch }) {
  const [showMemoryGallery, setShowMemoryGallery] = useState(false);

  return (
    <>
      <SecurityInterface 
        onModeSwitch={onModeSwitch}
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />
      
      <MemoryGallery
        isOpen={showMemoryGallery}
        onClose={() => setShowMemoryGallery(false)}
      />

      <VoiceCommandListener 
        currentMode="security"
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />
    </>
  );
}