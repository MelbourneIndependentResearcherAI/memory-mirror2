import React, { useState } from 'react';
import { MessageCircle, Brain, Heart, Phone, Shield, Moon, Volume2, CreditCard, Music, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import DonationModal from '@/components/DonationModal';
import InstallAppButton from '@/components/InstallAppButton';
import CommunityFeedbackSection from '@/components/community/CommunityFeedbackSection';
import FeatureTutorial from '@/components/landing/FeatureTutorial';
import GlobalLanguageSelector from '@/components/i18n/GlobalLanguageSelector';

export default function Landing() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const navigate = useNavigate();

  const navigateTo = (page) => navigate(createPageUrl(page));
  const handleGetStarted = () => navigate(createPageUrl('Home'));

  const featureCards = [
    { icon: '🔴', title: 'Big Button Mode', desc: 'Extra-large buttons for easy access - inspired by "Be My Eyes"', page: 'BigButtonMode', color: 'from-red-500 to-rose-600' },
    { icon: '🧠', title: 'AI Chat Companion', desc: 'Warm, empathetic conversation that adapts to each person\'s era and memories', page: 'Home', color: 'from-blue-500 to-cyan-500' },
    { icon: '❤️', title: 'Health Monitor', desc: 'Track emotional state, anxiety levels and wellbeing patterns over time', page: 'HealthMonitor', color: 'from-red-500 to-pink-500' },
    { icon: '🎵', title: 'Music Therapy', desc: 'Era-specific songs and playlists to comfort and stimulate memory', page: 'MusicTherapy', color: 'from-purple-500 to-indigo-500' },
    { icon: '🌙', title: 'Night Watch', desc: 'AI-powered overnight monitoring with emergency alert detection', page: 'NightWatch', color: 'from-slate-600 to-indigo-700' },
    { icon: '📸', title: 'Photo Library', desc: 'Cherished photos and memories with voice-activated recall', page: 'PhotoLibrary', color: 'from-amber-500 to-orange-500' },
    { icon: '👨‍⚕️', title: 'Caregiver Portal', desc: 'Full dashboard with insights, care journal and activity reports', page: 'CaregiverPortal', color: 'from-teal-500 to-emerald-500' },
    { icon: '📱', title: 'Phone Mode', desc: 'Simplified large-button phone interface for easy calling', page: 'PhoneMode', color: 'from-green-500 to-teal-500' },
    { icon: '🛡️', title: 'Security Scanner', desc: 'Scam detection and online safety tools to protect your loved one', page: 'Security', color: 'from-blue-600 to-indigo-600' },
    { icon: '🎤', title: 'Always-On Voice', desc: 'Hands-free wake word detection for voice-activated assistance', page: 'VoiceSetup', color: 'from-violet-500 to-purple-600' },
    { icon: '🏦', title: 'Fake Banking', desc: 'A reassuring fake bank balance view to reduce financial anxiety', page: 'MyBank', color: 'from-emerald-500 to-green-600' },
    { icon: '👨‍👩‍👧', title: 'Family Portal', desc: 'Family members can share messages, photos and stay connected', page: 'FamilyConnect', color: 'from-pink-500 to-rose-500' },
    { icon: '📊', title: 'Caregiver Dashboard', desc: 'At-a-glance overview of patient status, tasks and care metrics', page: 'CaregiverDashboard', color: 'from-cyan-500 to-blue-500' },
    { icon: '📺', title: 'Smart TV Mode', desc: 'Large-screen TV interface for comfortable viewing and interaction', page: 'TVMode', color: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 pb-8">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-blue-500" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Memory Mirror</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigateTo('CaregiverPortal')}
              className="min-h-[44px] text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600"
            >
              👨‍⚕️ Caregiver Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm mb-6 border border-blue-200/50 dark:border-blue-700/50">
            <Heart className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Compassionate Care at Home</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-950 dark:text-white mb-4 leading-tight">
            Memory Mirror
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 tracking-wide uppercase font-medium">
            AI Companion for Dementia Care
          </p>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-light">
            Meeting your loved one where they are — with dignity, warmth, and genuine understanding
          </p>
        </div>

        {/* Mirror Button — large one-tap access for dementia patients */}
        <div className="flex justify-center mb-10 px-4">
          <button
            onClick={() => navigateTo('PatientAccess')}
            className="w-full max-w-sm bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-full shadow-2xl transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-3"
            style={{ minHeight: '160px', fontSize: '2rem' }}
            aria-label="Mirror — tap to start"
          >
            <span style={{ fontSize: '3.5rem' }}>🪞</span>
            <span>Mirror</span>
            <span className="text-lg font-normal opacity-90">Tap to start</span>
          </button>
        </div>

        {/* Dual Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 px-4">
          {/* Patient Access */}
          <button
            onClick={() => navigateTo('PatientAccess')}
            className="group bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-700 hover:via-cyan-700 hover:to-sky-700 rounded-3xl shadow-2xl border-4 border-white/20 hover:shadow-3xl transition-all duration-300 p-10 text-left"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:bg-white/30 transition-colors">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Start Companion
                </h3>
                <p className="text-lg text-white/90 leading-relaxed mb-4">
                  For patients - Quick access, no login required
                </p>
                <div className="flex flex-col gap-2 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Instant AI companion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Optional PIN protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Hands-free voice access</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Caregiver Access */}
          <button
            onClick={() => navigateTo('CaregiverPortal')}
            className="group bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 rounded-3xl shadow-2xl border-4 border-white/20 hover:shadow-3xl transition-all duration-300 p-10 text-left"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:bg-white/30 transition-colors">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Caregiver Portal
                </h3>
                <p className="text-lg text-white/90 leading-relaxed mb-4">
                  For caregivers - Full dashboard & controls
                </p>
                <div className="flex flex-col gap-2 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Monitor activity & wellbeing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Configure AI behavior</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Get smart notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Key Features - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 px-4">
          {[
            { icon: '🧠', title: 'AI Chat', page: 'Home' },
            { icon: '🌙', title: 'Night Watch', page: 'NightWatch' },
            { icon: '📱', title: 'Phone Mode', page: 'PhoneMode' },
            { icon: '👨‍⚕️', title: 'Caregiver Tools', page: 'CaregiverPortal' },
            { icon: '📍', title: 'GPS Safety', page: 'GeofenceTracking' },
            { icon: '🎵', title: 'Music', page: 'MusicTherapy' },
            { icon: '📞', title: 'Resources', page: 'Resources' },
            { icon: '🏦', title: 'Banking', page: 'MyBank' },
          ].map((card) => (
            <button
              key={card.title}
              onClick={() => navigateTo(card.page)}
              className="group text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 p-4"
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{card.title}</h3>
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 items-center px-4 max-w-md mx-auto mb-8">
          <InstallAppButton />
          <Button
            size="lg"
            className="px-8 py-5 text-base md:text-xl rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full min-h-[60px] font-bold"
            onClick={handleGetStarted}
          >
            Go to Memory Mirror →
          </Button>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigateTo('Resources')}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              📞 Emergency Resources
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setShowDonationModal(true)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              💙 Support this project
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200/60 dark:border-slate-700/50 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Compassionate AI for Dementia Care
            </h2>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Always Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Private & Secure</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">Offline</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Works Without WiFi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-4 mx-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 py-12">
        <p className="text-slate-200 text-sm font-semibold">Memory Mirror — Compassionate AI for Dementia Care</p>
        <p className="mt-2 text-slate-400 text-xs">Designed with input from caregivers and dementia care specialists</p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap text-xs">
          <Link to={createPageUrl('FAQ')} className="text-slate-400 hover:text-slate-300 transition-colors">FAQ</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('TermsOfService')} className="text-slate-400 hover:text-slate-300 transition-colors">Terms of Service</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span className="text-slate-600">•</span>
          <a href="mailto:support@memorymirror.app" className="text-slate-400 hover:text-slate-300 transition-colors">Support</a>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('Feedback')} className="text-slate-400 hover:text-slate-300 transition-colors">Feedback</Link>
        </div>
      </div>

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
}