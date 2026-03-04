import React, { useState, useEffect, Suspense } from 'react';
import { Settings, HeartCrack, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ChatMode from './ChatMode';
import WakeWordListener from '@/components/memory-mirror/WakeWordListener';
import BadDayMode from '@/components/memory-mirror/BadDayMode';
import MemoryReflectionSession from '@/components/memory-mirror/MemoryReflectionSession';
import SingAlongPlayer from '@/components/music/SingAlongPlayer';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function Home() {
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [showBadDayMode, setShowBadDayMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showSingAlong, setShowSingAlong] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
      } catch {}
    }
    // Load user profile
    base44.entities.UserProfile.list().then(profiles => {
      if (profiles.length > 0) setUserProfile(profiles[0]);
    }).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    toast.info('Refreshing...');
    await queryClient.invalidateQueries();
    toast.success('Refreshed!');
  };

  const quickActions = [
    { icon: <MapPin className="w-6 h-6" />, label: 'Location Safety', color: 'from-green-500 to-emerald-500', page: 'GeofenceTracking', isLink: true },
    { icon: <HeartCrack className="w-6 h-6" />, label: 'Having a Bad Day?', color: 'from-purple-500 to-pink-500', action: () => setShowBadDayMode(true) },
    { icon: <MessageCircle className="w-6 h-6" />, label: 'Memory Reflection', color: 'from-blue-500 to-purple-500', action: () => setShowReflection(true) },
    { icon: <span className="text-2xl">🎤</span>, label: 'Sing Along', color: 'from-amber-500 to-orange-500', action: () => setShowSingAlong(true) },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
        <div className="max-w-lg mx-auto px-4 pt-5">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Memory Mirror</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your AI Companion</p>
            </div>
            <Link to={createPageUrl('CaregiverPortal')}>
              <button className="w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {quickActions.map(({ icon, label, color, page, isLink, action }) =>
              isLink ? (
                <Link key={label} to={createPageUrl(page)}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className={`w-full bg-gradient-to-r ${color} text-white py-4 rounded-2xl shadow-md flex flex-col items-center justify-center gap-1.5 text-sm font-semibold`}
                  >
                    {icon}
                    <span>{label}</span>
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.96 }}
                  onClick={action}
                  className={`bg-gradient-to-r ${color} text-white py-4 rounded-2xl shadow-md flex flex-col items-center justify-center gap-1.5 text-sm font-semibold`}
                >
                  {icon}
                  <span>{label}</span>
                </motion.button>
              )
            )}
          </div>

          {/* Chat - Main Interface */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <ChatMode onBadDayActivated={() => setShowBadDayMode(true)} />
          </div>

        </div>

        <WakeWordListener onWakeWordDetected={() => setWakeWordActive(true)} isActive={wakeWordActive} />

        {showBadDayMode && (
          <Suspense fallback={null}>
            <BadDayMode onClose={() => setShowBadDayMode(false)} userProfile={userProfile} />
          </Suspense>
        )}

        {showReflection && (
          <Suspense fallback={null}>
            <MemoryReflectionSession onClose={() => setShowReflection(false)} />
          </Suspense>
        )}

        {showSingAlong && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">🎤 Sing Along</h2>
                <button onClick={() => setShowSingAlong(false)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold">✕</button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
                  <SingAlongPlayer />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}