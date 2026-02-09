import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Shield, Settings } from 'lucide-react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ChatMode from './ChatMode';
import PhoneMode from './PhoneMode';
import SecurityMode from './SecurityMode';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import { loadVoices } from '../components/utils/voiceUtils';

export default function Home() {
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = location.pathname === '/phone' ? 'phone' 
    : location.pathname === '/security' ? 'security' 
    : 'chat';

  useEffect(() => {
    loadVoices();
    if (location.pathname === '/') {
      navigate('/chat', { replace: true });
    }
  }, []);

  const handleWakeWord = () => {
    navigate('/chat');
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
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
    { id: 'phone', label: 'Phone', icon: Phone, path: '/phone' },
    { id: 'security', label: 'Security', icon: Shield, path: '/security' },
  ];

  const handleButtonClick = (mode) => {
    navigate(mode.path);
    
    const utterance = new SpeechSynthesisUtterance(`${mode.label} mode`);
    utterance.rate = 1.0;
    utterance.volume = 0.6;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} transition-all duration-1000 pb-20`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 dark:from-blue-600 dark:via-cyan-600 dark:to-sky-600 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <Link to={createPageUrl('CaregiverPortal')}>
              <button className="text-white hover:bg-white/20 rounded-full p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-wide mb-2">Memory Mirror</h1>
            <p className="text-white/80 italic text-sm">Your companion, meeting you where you are</p>
            
            {currentMode === 'chat' && (
              <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm">
                {getEraLabel()}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl transition-all duration-500 border-4 border-blue-200 dark:border-blue-800">
          <div className="transition-all duration-300">
            <Routes>
              <Route path="/chat" element={<ChatMode onEraChange={setDetectedEra} onModeSwitch={handleModeSwitch} />} />
              <Route path="/phone" element={<PhoneMode />} />
              <Route path="/security" element={<SecurityMode onModeSwitch={handleModeSwitch} />} />
              <Route path="/" element={<ChatMode onEraChange={setDetectedEra} onModeSwitch={handleModeSwitch} />} />
            </Routes>
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6 px-4 mb-20">
          Memory Mirror — Compassionate AI companion for dementia care
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
    </div>
  );
}