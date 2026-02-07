import React from 'react';
import SecurityInterface from '@/components/memory-mirror/SecurityInterface';
import VoiceCommandListener from '@/components/voice/VoiceCommandListener';

export default function SecurityMode({ onModeSwitch }) {
  return (
    <>
      <SecurityInterface onModeSwitch={onModeSwitch} />
      <VoiceCommandListener currentMode="security" />
    </>
  );
}