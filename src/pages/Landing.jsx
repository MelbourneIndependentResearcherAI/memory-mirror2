import React, { useState } from 'react';
import { MessageCircle, Brain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DonationModal from '@/components/DonationModal';
import InstallAppButton from '@/components/InstallAppButton';
import AppTutorial from '@/components/landing/AppTutorial';
import { useSubscriptionStatus } from '@/components/SubscriptionGuard';
import PromoLimitedOffer from '@/components/subscription/PromoLimitedOffer';
import FreeTrialRegistration from '@/components/subscription/FreeTrialRegistration';
import { isFreeTrial } from '@/components/subscription/FreeTrialManager';
import CognitiveAssessmentLink from '@/components/cognitive/CognitiveAssessmentLink';

export default function Landing() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const navigate = useNavigate();
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();

  const navigateTo = (page) => navigate(createPageUrl(page));
  const handleGetStarted = () => {
    if (isLoading) return; // Prevent click while loading
    if (subscriptionData?.isSubscribed) {
      navigate(createPageUrl('Home'));
    } else if (isFreeTrial() && !subscriptionData?.trialExpired) {
      navigate(createPageUrl('Home'));
    } else {
      setShowTrialModal(true);
    }
  };

  const handleTrialSuccess = () => {
    setShowTrialModal(false);
    navigate(createPageUrl('Home'));
  };

  const featureCards = [
    { icon: '🔴', title: 'Quick Access Button', desc: 'ONE BIG RED BUTTON for instant access - inspired by "Be My Eyes"', page: 'QuickAccess', color: 'from-red-500 to-rose-600' },
    { icon: '🎯', title: 'Big Button Mode', desc: 'Extra-large buttons for all features', page: 'BigButtonMode', color: 'from-orange-500 to-red-600' },
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      <QuickAccessCheck />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-8">
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

        {/* Quick Access - Big Red Button inspired by "Be My Eyes" */}
        <div className="flex justify-center mb-8 px-4">
          <button
            onClick={() => navigateTo('QuickAccess')}
            className="w-full max-w-sm bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white font-bold rounded-full shadow-2xl transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-3 border-8 border-white"
            style={{ minHeight: '200px', fontSize: '2rem' }}
            aria-label="Quick Access — one tap to start"
          >
            <span style={{ fontSize: '4rem' }}>🔴</span>
            <span className="text-3xl">Quick Access</span>
            <span className="text-lg font-normal opacity-90">ONE BIG BUTTON</span>
          </button>
        </div>

        {/* Dual Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8 px-4">
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

        {/* Key Features - Professional */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8 px-4">
          {[
            { icon: '🔴', title: 'Quick Access', page: 'QuickAccess' },
            { icon: '🧠', title: 'Brain Games', page: 'MemoryGames' },
            { icon: '🌙', title: 'Night Watch', page: 'NightWatch' },
            { icon: '🎵', title: 'Music Therapy', page: 'MusicTherapy' },
            { icon: '📍', title: 'GPS Safety', page: 'GeofenceTracking' },
            { icon: '🎤', title: 'Sing Along', page: 'SingAlongStudio' },
            { icon: '📺', title: 'TV Mode', page: 'TVMode' },
            { icon: '🏦', title: 'Banking', page: 'MyBank' },
          ].map((card) => (
            <button
              key={card.title}
              onClick={() => navigateTo(card.page)}
              className="group text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 p-4 min-h-[120px] flex flex-col items-center justify-center"
            >
              <div className="text-4xl mb-2">{card.icon}</div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{card.title}</h3>
            </button>
          ))}
        </div>

        {/* Individual Tool Pricing Teaser */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-800 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-center">
              <h2 className="text-xl font-bold text-white">🛠️ Only Need One Feature? Pay for Just That.</h2>
              <p className="text-purple-100 text-sm mt-1">Individual tool subscriptions from just $2.99/month</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5">
              {[
                { emoji: '🧠', name: 'AI Chat', price: '$2.99' },
                { emoji: '🌙', name: 'Night Watch', price: '$2.99' },
                { emoji: '🎵', name: 'Music Therapy', price: '$2.99' },
                { emoji: '🏦', name: 'Fake Banking', price: '$2.99' },
                { emoji: '📍', name: 'GPS Safety', price: '$2.99' },
                { emoji: '👨‍⚕️', name: 'Caregiver Tools', price: '$2.99' },
              ].map(tool => (
                <div key={tool.name} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <span className="text-xl">{tool.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{tool.name}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{tool.price}/mo</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                💡 Full access to everything is only <strong>$9.99/month</strong> — better value if you need 4+ tools
              </p>
              <button
                onClick={() => navigateTo('Pricing')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-md min-h-[44px]"
              >
                View All Plans & Subscribe →
              </button>
            </div>
          </div>
        </div>

        {/* Limited Time Offer */}
        <PromoLimitedOffer variant="banner" />

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 items-center px-4 max-w-md mx-auto mb-8">
          <InstallAppButton />
          <Button
            size="lg"
            disabled={isLoading}
            className="px-8 py-5 text-base md:text-xl rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full min-h-[60px] font-bold disabled:opacity-50"
            onClick={handleGetStarted}
          >
            {isLoading ? 'Loading...' : subscriptionData?.isSubscribed ? 'Go to Memory Mirror →' : '✨ Start 3-Day Free Trial'}
          </Button>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigateTo('Pricing')}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
            >
              💳 View Pricing
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => navigateTo('Paywall')}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
            >
              🧪 Test Paywall
            </button>
            <span className="text-slate-300">•</span>
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
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200/60 dark:border-slate-700/50 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Compassionate AI for Dementia Care
            </h2>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-0.5">24/7</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Always Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-0.5">100%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Private & Secure</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-0.5">Offline</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Works Without WiFi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Tutorial Section */}
      <AppTutorial />

      {/* Testimonials Section */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Loved by Families & Caregivers
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Real stories from people using Memory Mirror</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <span key={i} className="text-xl">⭐</span>)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
              "My mom finally smiles again. She talks to Memory Mirror like she's talking to an old friend, and it gives me so much peace of mind knowing she's never lonely."
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">Sarah M.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daughter, Adelaide</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <span key={i} className="text-xl">⭐</span>)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
              "The music therapy features are incredible. My dad lights up when his favorite songs from the 60s play. It's made such a difference in his mood."
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">James L.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Son & Caregiver, Melbourne</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <span key={i} className="text-xl">⭐</span>)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
              "As a care home manager, this has been a game-changer. It reduces anxiety, keeps residents engaged, and our families feel so much more confident."
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">Margaret T.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Care Manager, Brisbane</p>
          </div>
        </div>
      </div>

      {/* Free Cognitive Assessment */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <CognitiveAssessmentLink />
      </div>

      {/* Footer */}
      <div className="text-center px-4 mx-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 py-12 border-t-4 border-blue-600">
        <p className="text-slate-200 text-sm font-semibold">Memory Mirror — Compassionate AI for Dementia Care</p>
        <p className="mt-2 text-slate-400 text-xs">Designed with input from caregivers and dementia care specialists</p>
        <div className="mt-4 text-slate-400 text-xs space-y-1">
          <p>📧 Support: <a href="mailto:support@memorymirror.com.au" className="hover:text-blue-400">support@memorymirror.com.au</a></p>
          <p>🏢 Memory Mirror Community Indigenous Corporation</p>
          <p>🔒 End-to-end encrypted • HIPAA & GDPR compliant</p>
        </div>
        <div className="mt-6 flex justify-center gap-2 flex-wrap text-xs">
          <Link to={createPageUrl('FAQ')} className="text-slate-400 hover:text-slate-300 transition-colors">FAQ</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('Resources')} className="text-slate-400 hover:text-slate-300 transition-colors">Resources</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('TermsOfService')} className="text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-slate-300 transition-colors">Privacy</Link>
          <span className="text-slate-600">•</span>
          <Link to={createPageUrl('Feedback')} className="text-slate-400 hover:text-slate-300 transition-colors">Feedback</Link>
        </div>
      </div>

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
      {showTrialModal && (
        <FreeTrialRegistration 
          onSuccess={handleTrialSuccess}
          onClose={() => setShowTrialModal(false)}
        />
      )}
    </div>
  );
}