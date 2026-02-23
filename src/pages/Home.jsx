import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Shield, Settings, HeartCrack } from 'lucide-react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import ChatMode from './ChatMode';
import PhoneMode from './PhoneMode';
import SecurityMode from './SecurityMode';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import BadDayMode from '@/components/memory-mirror/BadDayMode';
import MemoryReflectionSession from '@/components/memory-mirror/MemoryReflectionSession';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [currentMode, setCurrentMode] = useState('chat');
  const [showBadDayMode, setShowBadDayMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  // Detect mode from URL
  React.useEffect(() => {
    const mode = location.pathname.includes('PhoneMode') || location.pathname === '/phone' ? 'phone' 
      : location.pathname.includes('Security') || location.pathname === '/security' ? 'security' 
      : 'chat';
    setCurrentMode(mode);
  }, [location.pathname]);

  useEffect(() => {
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
    
    // Redirect root to chat
    if (location.pathname === '/' || location.pathname === '/Home') {
      navigate(createPageUrl('ChatMode'), { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleWakeWord = () => {
    navigate(createPageUrl('ChatMode'));
    setWakeWordActive(true);
    setTimeout(() => setWakeWordActive(false), 2000);
  };

  const handleModeSwitch = (mode) => {
    navigate(`/${mode}`);
    
    const modeNames = { chat: 'chat mode', phone: 'phone mode', security: 'security mode' };
    const utterance = new SpeechSynthesisUtterance(`Switching to ${modeNames[mode]}`);
    utterance.rate = 1.0;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const getBackgroundClass = () => {
    const backgrounds = {
      chat: {
        '1940s': 'from-amber-100 via-orange-100 to-yellow-100 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900',
        '1960s': 'from-orange-100 via-pink-100 to-rose-100 dark:from-orange-900 dark:via-pink-900 dark:to-rose-900',
        '1980s': 'from-purple-100 via-pink-100 to-fuchsia-100 dark:from-purple-900 dark:via-pink-900 dark:to-fuchsia-900',
        'present': 'from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900',
      },
      phone: 'from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900',
      security: 'from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900',
    };

    if (currentMode === 'chat') {
      return backgrounds.chat[detectedEra] || backgrounds.chat.present;
    }
    return backgrounds[currentMode];
  };

  const getEraLabel = () => {
    const labels = {
      '1940s': '1940s Era',
      '1960s': '1960s Era',
      '1980s': '1980s Era',
      'present': 'Present Day'
    };
    return labels[detectedEra] || 'Present Day';
  };

  const modes = [
    { id: 'chat', label: t('chat'), icon: MessageCircle, path: createPageUrl('ChatMode') },
    { id: 'phone', label: t('phone'), icon: Phone, path: createPageUrl('PhoneMode') },
    { id: 'security', label: t('security'), icon: Shield, path: createPageUrl('Security') },
  ];

  const handleButtonClick = (mode) => {
    navigate(mode.path);
    
    const utterance = new SpeechSynthesisUtterance(`${mode.label} mode`);
    utterance.rate = 1.0;
    utterance.volume = 0.6;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} transition-all duration-1000 pb-24`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 dark:from-blue-600 dark:via-cyan-600 dark:to-sky-600 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <LanguageSwitcher />
            <div className="flex gap-2">
              <Link to={createPageUrl('CaregiverPortal')}>
                <button className="text-white hover:bg-white/20 rounded-full p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </button>
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-wide mb-1">{t('memoryMirror')}</h1>
            <p className="text-white/70 text-xs mb-2">{t('tagline')}</p>
            <p className="text-white/80 italic text-sm">{t('subtitle')}</p>
            
            {currentMode === 'chat' && (
              <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm">
                {getEraLabel()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowBadDayMode(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-xl font-semibold select-none"
          >
            <HeartCrack className="w-8 h-8" />
            {t('havingBadDay')}
          </button>
          
          <button
            onClick={() => setShowReflection(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg font-semibold select-none"
          >
            <MessageCircle className="w-7 h-7" />
            Memory Reflection
          </button>
        </div>

        {/* Main Content - Hidden/Visible Pattern for State Preservation */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl transition-all duration-500 border-4 border-blue-200 dark:border-blue-800">
          <div style={{ display: currentMode === 'chat' ? 'block' : 'none' }}>
            <ChatMode 
              onEraChange={setDetectedEra} 
              onModeSwitch={handleModeSwitch}
              onBadDayActivated={() => setShowBadDayMode(true)}
            />
          </div>
          <div style={{ display: currentMode === 'phone' ? 'block' : 'none' }}>
            <PhoneMode />
          </div>
          <div style={{ display: currentMode === 'security' ? 'block' : 'none' }}>
            <SecurityMode onModeSwitch={handleModeSwitch} />
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6 px-4 mb-24">
          {t('memoryMirror')} — {t('aiCompanion')}
        </p>
      </div>

      {/* Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950 border-t-4 border-blue-300 dark:border-blue-700 shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleButtonClick(mode)}
                className={`flex flex-col items-center justify-center py-2 px-4 flex-1 transition-all duration-300 min-h-[60px] ${
                  isActive 
                    ? 'text-slate-700 dark:text-slate-100' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <WakeWordListener 
        onWakeWordDetected={handleWakeWord}
        isActive={wakeWordActive}
      />

      {showBadDayMode && (
        <BadDayMode 
          onClose={() => setShowBadDayMode(false)}
          userProfile={userProfiles[0]}
        />
      )}

      {showReflection && (
        <MemoryReflectionSession onClose={() => setShowReflection(false)} />
      )}
    </div>
  );
}