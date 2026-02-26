import React, { useState, useEffect } from 'react';
import { MessageCircle, Settings, HeartCrack, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { motion } from 'framer-motion';
import ChatMode from './ChatMode';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import BadDayMode from '@/components/memory-mirror/BadDayMode';
import MemoryReflectionSession from '@/components/memory-mirror/MemoryReflectionSession';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import PageLoadTip from '@/components/tips/PageLoadTip';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from 'sonner';
import SingAlongPlayer from '@/components/music/SingAlongPlayer';

export default function Home() {
  const [detectedEra, setDetectedEra] = useState('present');
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [showBadDayMode, setShowBadDayMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showOfflineDownload, setShowOfflineDownload] = useState(false);
  const [showSingAlong, setShowSingAlong] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  const handleRefresh = async () => {
    toast.info('Refreshing...');
    await queryClient.invalidateQueries();
    toast.success('Refreshed!');
  };

  useEffect(() => {
    // Check authentication on mount - but allow guest access too
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Allow guest access for patient use - don't force redirect
          console.log('Guest mode - limited features available');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
    <PullToRefresh onRefresh={handleRefresh}>
      <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} transition-all duration-1000 pb-24`}>
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <header 
            className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 dark:from-blue-600 dark:via-cyan-600 dark:to-sky-600 text-white p-6 rounded-t-2xl shadow-lg"
            role="banner"
          >
            <div className="flex justify-between items-center mb-4">
              <LanguageSwitcher />
              <div className="flex gap-2">
                <Link to={createPageUrl('CaregiverPortal')}>
                  <button 
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Go to caregiver portal"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="sr-only">Settings</span>
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
        </header>

        {/* Language Selector */}
        <div className="p-4 mb-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('chat')} Language:</label>
          <LanguageSelector />
        </div>

        {/* Quick Access Buttons - Premium Design */}
        <div className="p-4 space-y-3">
          <Link to={createPageUrl('GeofenceTracking')}>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center gap-3 text-xl font-bold select-none border border-white/20"
            >
              <MapPin className="w-8 h-8 drop-shadow-lg" />
              Location Safety
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBadDayMode(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center gap-3 text-xl font-bold select-none border border-white/20"
          >
            <HeartCrack className="w-8 h-8 drop-shadow-lg" />
            {t('havingBadDay')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReflection(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center gap-3 text-lg font-bold select-none border border-white/20"
          >
            <MessageCircle className="w-7 h-7 drop-shadow-lg" />
            Memory Reflection
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSingAlong(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-5 rounded-2xl shadow-premium transition-all duration-300 flex items-center justify-center gap-3 text-lg font-bold select-none border border-white/20"
          >
            <span className="text-3xl">🎤</span>
            Sing Along
          </motion.button>
        </div>

        {/* Main Content - Premium Shadow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-premium-lg rounded-2xl transition-all duration-500 border-2 border-purple-200 dark:border-purple-800 overflow-hidden"
        >
          <ChatMode 
            onEraChange={setDetectedEra} 
            onBadDayActivated={() => setShowBadDayMode(true)}
          />
        </motion.div>

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

        {showSingAlong && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🎤 Sing Along</h2>
                <button
                  onClick={() => setShowSingAlong(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <SingAlongPlayer />
              </div>
            </div>
          </div>
        )}

        <PageLoadTip pageName="Home" />
      </div>
    </PullToRefresh>
  );
}