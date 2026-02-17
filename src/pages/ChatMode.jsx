import React, { useState } from 'react';
import ChatInterface from '@/components/memory-mirror/ChatInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';
import MemoryGallery from '@/components/memory-mirror/MemoryGallery';

export default function ChatMode({ onEraChange, onModeSwitch, onBadDayActivated }) {
  const [showMemoryGallery, setShowMemoryGallery] = useState(false);
  const [detectedEra, setDetectedEra] = useState('present');

  const handleEraChange = (era) => {
    setDetectedEra(era);
    if (onEraChange) onEraChange(era);
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

      <VoiceCommandListener 
        currentMode="chat"
        onMemoryGalleryOpen={() => setShowMemoryGallery(true)}
      />
    </>
  );
}