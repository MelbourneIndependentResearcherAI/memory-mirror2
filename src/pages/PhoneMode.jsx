import React from 'react';
import PhoneInterface from '@/components/memory-mirror/PhoneInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';

export default function PhoneMode() {
  return (
    <>
      <PhoneInterface />
      <VoiceCommandListener currentMode="phone" />
    </>
  );
}