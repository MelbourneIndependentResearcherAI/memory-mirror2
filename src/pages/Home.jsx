import React, { useState, useEffect } from 'react';
import ModeHeader from '@/components/memory-mirror/ModeHeader';
import ChatInterface from '@/components/memory-mirror/ChatInterface';
import PhoneInterface from '@/components/memory-mirror/PhoneInterface';
import SecurityInterface from '@/components/memory-mirror/SecurityInterface';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import { loadVoices } from '@/utils/voiceUtils';

export default function Home() {
  const [currentMode, setCurrentMode] = useState('chat');
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, setWakeWordActive] = useState(false);

  useEffect(() => {
    // Load voices on component mount
    loadVoices();
  }, []);

  const handleWakeWord = () => {
    setCurrentMode('chat');
    setWakeWordActive(true);
    setTimeout(() => setWakeWordActive(false), 2000);
  };

  const handleModeSwitch = (mode) => {
    setCurrentMode(mode);
  };

  const getBackgroundClass = () => {
    const backgrounds = {
      chat: {
        '1940s': 'from-amber-50 to-amber-100',
        '1960s': 'from-orange-50 to-orange-100',
        '1980s': 'from-purple-50 to-purple-100',
        'present': 'from-blue-50 to-slate-100',
      },
      phone: 'from-slate-800 to-slate-900',
      security: 'from-emerald-950 to-slate-900',
    };

    if (currentMode === 'chat') {
      return backgrounds.chat[detectedEra] || backgrounds.chat.present;
    }
    return backgrounds[currentMode];
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} p-4 md:p-8 transition-all duration-1000`}>
      <div className={`max-w-lg mx-auto ${currentMode !== 'chat' ? 'max-w-md' : ''}`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
          <ModeHeader
            currentMode={currentMode}
            onModeChange={setCurrentMode}
            detectedEra={detectedEra}
          />

          <div className="transition-all duration-300">
            {currentMode === 'chat' && (
              <ChatInterface 
                onEraChange={setDetectedEra}
                onModeSwitch={handleModeSwitch}
              />
            )}
            {currentMode === 'phone' && (
              <PhoneInterface />
            )}
            {currentMode === 'security' && (
              <SecurityInterface onModeSwitch={handleModeSwitch} />
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6 px-4">
          Memory Mirror — Compassionate AI companion for dementia care
        </p>
      </div>

      <WakeWordListener 
        onWakeWordDetected={handleWakeWord}
        isActive={wakeWordActive}
      />
    </div>
  );
}