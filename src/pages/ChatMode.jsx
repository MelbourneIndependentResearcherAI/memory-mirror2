import React, { useState } from 'react';
import ChatInterface from '@/components/memory-mirror/ChatInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import MemoryGallery from '@/components/memory-mirror/MemoryGallery';
import PageLoadTip from '@/components/tips/PageLoadTip';
import { toast } from 'sonner';

export default function ChatMode({ onEraChange, onModeSwitch, onBadDayActivated: _onBadDayActivated }) {
  const [showMemoryGallery, setShowMemoryGallery] = useState(false);
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, _setWakeWordActive] = useState(true);

  const handleEraChange = (era) => {
    setDetectedEra(era);
    if (onEraChange) onEraChange(era);
  };

  const handleWakeWord = () => {
    console.log('🔊 Wake word detected!');
    toast.success('Hey Mirror activated!');
    // Wake word was detected - can be extended for other actions
  };

  return (
    <>
      <ChatInterface 
        onEraChange={handleEraChange}
        onModeSwitch={onModeSwitch}
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />
      
      <MemoryGallery
        isOpen={showMemoryGallery}
        onClose={() => setShowMemoryGallery(false)}
        filterEra={detectedEra}
      />

      <WakeWordListener 
        onWakeWordDetected={handleWakeWord}
        isActive={wakeWordActive}
      />

      <VoiceCommandListener 
        currentMode="chat"
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />

      <PageLoadTip pageName="ChatMode" />
    </>
  );
}