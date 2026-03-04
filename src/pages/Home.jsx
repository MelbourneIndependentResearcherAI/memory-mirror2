import React, { useState, useEffect, Suspense } from 'react';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ChatMode from './ChatMode';
import BadDayMode from '@/components/memory-mirror/BadDayMode';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [showBadDayMode, setShowBadDayMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if ('speechSynthesis' in window) {
      try { speechSynthesis.getVoices(); } catch {}
    }
    base44.entities.UserProfile.list().then(profiles => {
      if (profiles.length > 0) setUserProfile(profiles[0]);
    }).catch(() => {});

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // If chat is open, show full chat interface
  if (showChat) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
        {/* Simple back bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="text-white font-bold text-lg flex items-center gap-2 min-h-[44px]"
          >
            ← Back
          </button>
          <span className="text-lg font-semibold">Talking with Your Companion</span>
        </div>
        <div className="flex-1">
          <ChatMode onBadDayActivated={() => setShowBadDayMode(true)} />
        </div>

        {showBadDayMode && (
          <Suspense fallback={null}>
            <BadDayMode onClose={() => setShowBadDayMode(false)} userProfile={userProfile} />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 flex flex-col">

      {/* Top bar - caregiver access only */}
      <div className="flex justify-end px-4 pt-4">
        <Link to={createPageUrl('CaregiverPortal')}>
          <button className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm opacity-60">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
        </Link>
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">

        {/* Greeting */}
        <p className="text-2xl text-blue-600 dark:text-blue-400 font-medium mb-2">
          {greeting} 😊
        </p>

        {/* App name - large and clear */}
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-3">
          Memory Mirror
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-xs">
          Your friendly companion is here to chat and help
        </p>

        {/* BIG TALK BUTTON */}
        <button
          onClick={() => setShowChat(true)}
          className="w-64 h-64 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-2xl flex flex-col items-center justify-center gap-4 transition-all duration-200 border-8 border-white dark:border-slate-700"
          style={{ boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5)' }}
        >
          <span className="text-7xl">💬</span>
          <span className="text-3xl font-bold">Let's Talk</span>
        </button>

        {/* Having a bad day - secondary, gentle */}
        <button
          onClick={() => setShowBadDayMode(true)}
          className="mt-10 px-8 py-4 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-2xl text-xl font-semibold shadow-sm active:scale-95 transition-all"
        >
          💜 Having a tough day?
        </button>
      </div>

      {showBadDayMode && (
        <Suspense fallback={null}>
          <BadDayMode onClose={() => setShowBadDayMode(false)} userProfile={userProfile} />
        </Suspense>
      )}
    </div>
  );
}