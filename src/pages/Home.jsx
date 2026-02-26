import React, { useState, useEffect } from 'react';
import { MessageCircle, Settings, HeartCrack, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import ChatMode from './ChatMode';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import BadDayMode from '@/components/memory-mirror/BadDayMode';
import MemoryReflectionSession from '@/components/memory-mirror/MemoryReflectionSession';
import PageLoadTip from '@/components/tips/PageLoadTip';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [showBadDayMode, setShowBadDayMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Redirect to login
          base44.auth.redirectToLogin();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        base44.auth.redirectToLogin();
      }
    };
    
    checkAuth();
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  }, []);

  const handleWakeWord = () => {
    setWakeWordActive(true);
    setTimeout(() => setWakeWordActive(false), 2000);
  };

  const getBackgroundClass = () => {
    const backgrounds = {
      '1940s': 'from-amber-100 via-orange-100 to-yellow-100 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900',
      '1960s': 'from-orange-100 via-pink-100 to-rose-100 dark:from-orange-900 dark:via-pink-900 dark:to-rose-900',
      '1980s': 'from-purple-100 via-pink-100 to-fuchsia-100 dark:from-purple-900 dark:via-pink-900 dark:to-fuchsia-900',
      'present': 'from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900',
    };
    return backgrounds[detectedEra] || backgrounds.present;
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
            
            <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm">
              {getEraLabel()}
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="p-4 mb-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('chat')} Language:</label>
          <LanguageSelector />
        </div>

        {/* Quick Access Buttons */}
        <div className="p-4 space-y-3">
          <Link to={createPageUrl('GeofenceTracking')}>
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-xl font-semibold select-none">
              <MapPin className="w-8 h-8" />
              Location Safety
            </button>
          </Link>

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

        {/* Main Content */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl transition-all duration-500 border-4 border-blue-200 dark:border-blue-800">
          <ChatMode 
            onEraChange={setDetectedEra} 
            onBadDayActivated={() => setShowBadDayMode(true)}
          />
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6 px-4 mb-24">
          {t('memoryMirror')} — {t('aiCompanion')}
        </p>
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

      <PageLoadTip pageName="Home" />
    </div>
  );
}