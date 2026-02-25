import React, { useState } from 'react';
import { MessageCircle, Brain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import DonationModal from '@/components/DonationModal';
import InstallAppButton from '@/components/InstallAppButton';
import CommunityFeedbackSection from '@/components/community/CommunityFeedbackSection';
import FeatureTutorial from '@/components/landing/FeatureTutorial';

/**
 * Memory Mirror - AI Companion for Dementia Care
 * 
 * Copyright © 2026 Memory Mirror. All Rights Reserved.
 * 
 * This application and its components are proprietary software.
 * Unauthorized copying, distribution, or modification is strictly prohibited.
 * 
 * Music Library: Uses only royalty-free and public domain sources
 * AI Technology: Powered by licensed third-party AI services
 * 
 * For licensing inquiries, contact: support@memorymirror.app
 */

export default function Landing() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const navigate = useNavigate();

  const navigateTo = (page) => navigate(createPageUrl(page));
  const handleGetStarted = () => {
    navigate(createPageUrl('Home'));
  };

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

          <div className="flex flex-col gap-5 md:gap-6 justify-center items-stretch px-4 max-w-5xl mx-auto mb-8">
          {/* Main AI Chat Card */}
          <button onClick={() => navigateTo('Home')} className="w-full group">
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-700 hover:via-cyan-700 hover:to-sky-700 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 p-8 md:p-10 cursor-pointer">
                <div className="flex items-start gap-5">
                  <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-xl group-hover:bg-white/25 transition-colors">
                    <MessageCircle className="w-9 h-9 md:w-11 md:h-11 text-white" />
        {/* Dual Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8 px-4">
          {/* Patient Access */}
          <button
            onClick={() => navigate(createPageUrl('PatientAccess'))}
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
                  For patients — Quick access, no login required
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
            </button>

            {/* Secondary Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <button onClick={() => navigateTo('PhoneMode')} className="w-full group">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-fit mb-4 group-hover:bg-white/25 transition-colors">
                      <Phone className="w-8 h-8 md:w-9 md:h-9 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Phone Mode
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Realistic dial pad that connects to AI companion instead of emergency services — prevents costly nighttime 911 calls and gives caregivers peace of mind to sleep
                    </p>
                  </div>
                </div>
              </button>

              <button onClick={() => navigateTo('Security')} className="w-full group" type="button">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-fit mb-4 group-hover:bg-white/25 transition-colors">
                      <Shield className="w-8 h-8 md:w-9 md:h-9 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Security Scanner
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Realistic AI-controlled security check that never makes real alerts or calls — purely reassuring visuals to reduce anxiety about locks and safety, helping users feel calm and secure
                    </p>
                  </div>
                </div>
              </button>

              <button onClick={() => navigateTo('NightWatch')} className="w-full group">
                <div className="bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-900 hover:to-black rounded-2xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-fit mb-4 group-hover:bg-white/25 transition-colors">
                      <Moon className="w-8 h-8 md:w-9 md:h-9 text-yellow-300" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Night Watch
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Gentle nighttime companion that prevents wandering and provides comfort
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Voice Setup Card */}
            <button onClick={() => navigateTo('VoiceSetup')} className="w-full group">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/25 transition-colors">
                    <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Always-On Voice
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Hands-free voice control — just say "Hey Mirror" anytime, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </button>

            {/* Fake Banking Card */}
            <button onClick={() => navigateTo('MyBank')} className="w-full group">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/25 transition-colors">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Fake Banking
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Safe simulated banking experience with no real transactions — perfect for users who want familiar financial interactions
                    </p>
                  </div>
                </div>
              </div>
            </button>

            {/* Portal Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <button onClick={() => navigateTo('FamilyConnect')} className="w-full group">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg border border-blue-200/60 dark:border-blue-700/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 p-7 md:p-8 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl md:text-5xl">👨‍👩‍👧‍👦</div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
                        Family Portal
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        Share photos, messages, events and music with your loved one
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => navigateTo('CaregiverDashboard')} className="w-full group">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg border border-purple-200/60 dark:border-purple-700/40 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 p-7 md:p-8 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl md:text-5xl">🧠</div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-2">
                        Caregiver Dashboard
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        Monitor wellbeing, insights, journal entries and cognitive trends
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => navigateTo('TVMode')} className="w-full group">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg border border-indigo-200/60 dark:border-indigo-700/40 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 p-7 md:p-8 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl md:text-5xl">📺</div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                        Smart TV Mode
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        Connect and use Memory Mirror on your large screen TV
                      </p>
                    </div>
            </div>
          </button>

          {/* Caregiver Access */}
          <button
            onClick={() => navigate(createPageUrl('CaregiverPortal'))}
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
                  For caregivers — Full dashboard & controls
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
                </div>
              </button>

              <button onClick={() => navigateTo('MyBank')} className="w-full group">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg border border-green-200/60 dark:border-green-700/40 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 p-7 md:p-8 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl md:text-5xl">💳</div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-green-700 dark:text-green-400 mb-2">
                        Fake Banking
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        Safe simulated banking with no real transactions
                      </p>
                    </div>
                  </div>
                </div>
              </button>
              </div>

            <div className="flex flex-col gap-4 items-center">
              <InstallAppButton />
              
              <Button 
                size="lg" 
                className="px-8 md:px-10 py-5 md:py-6 text-base md:text-xl rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full min-h-[60px] font-bold"
                onClick={() => navigateTo('Home')}
              >
                Go to Memory Mirror →
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Tutorial */}
        <FeatureTutorial />

        {/* Spacing */}
        <div className="h-20"></div>

        {/* Main Content Section - SEO */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-lg border border-slate-200/60 dark:border-slate-700/50">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Memory Mirror - AI Companion for Dementia Care
            </h1>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Memory Mirror is a compassionate AI assistant designed specifically for individuals living with dementia and their caregivers. Using advanced artificial intelligence, Memory Mirror provides comfort, dignity, and emotional support through natural conversation and voice interaction.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              Supporting Your Loved One's Journey
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Dementia care requires patience, understanding, and constant adaptation. Memory Mirror serves as a 24/7 companion that never gets frustrated, always maintains dignity, and meets your loved one exactly where they are mentally and emotionally. Whether they're experiencing memories from the 1940s, the 1960s, the 1980s, or living in the present moment, Memory Mirror adapts its language, cultural references, and responses to create genuine connection and comfort.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              How Memory Mirror Works
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Simply say "Hey Mirror" to activate hands-free conversation. Our AI listens with a realistic human voice that provides warmth and emotional connection. The system automatically detects anxiety, confusion, or distress in conversation patterns and responds with calming reassurance, familiar patterns, and emotional safety. Memory Mirror proactively recalls relevant photos and memories, helping your loved one reconnect with cherished moments.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              Built on Compassion, Not Correction
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Memory Mirror never tells someone they're wrong or confused. Instead, it validates their experience and meets them with dignity and respect. Every interaction prioritizes their emotional wellbeing, treating each person with the warmth and understanding they deserve.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              For Caregivers: Peace of Mind
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              As a caregiver, you carry an enormous responsibility. Memory Mirror provides reliable companionship when you need a moment to yourself, supplementing your care with consistent, compassionate support. The AI is specifically trained in dementia care principles, giving you confidence that your loved one is in good hands.
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              Pricing That Reflects Our Values
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              We offer a free tier with daily limited access so everyone can try Memory Mirror. Premium subscription is $9.99 per month - intentionally priced well below other dementia care apps because we believe quality support shouldn't be out of reach for families already managing substantial caregiving costs.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
              <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong className="text-blue-700 dark:text-blue-400">📅 Premium Subscription Launching in 2 Weeks</strong>
              </p>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Memory Mirror will transition to a premium subscription at a very accessible <strong className="text-blue-600 dark:text-blue-400">$9.99 per month</strong> — intentionally priced low because we believe quality dementia care support should be within reach for every family.
              </p>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Your subscription keeps Memory Mirror running smoothly for everyone — covering AI service costs, server infrastructure, ongoing development, and 24/7 reliability. These contributions ensure we can continue supporting families worldwide with the compassionate care they deserve.
              </p>
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-3">
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <strong className="text-green-700 dark:text-green-400">💚 No Family Gets Turned Away</strong>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  Families facing severe financial hardship can <a href="mailto:support@memorymirror.app" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">contact support</a> to discuss assistance options. We're here to help — compassionate care shouldn't depend on your ability to pay.
                </p>
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Thank you for your support — it allows us to support you and your loved ones in return. Together, we keep Memory Mirror alive for all families who need it. 💙
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">
              100% Offline Mode Available
            </h2>

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Memory Mirror includes comprehensive offline functionality. With 250+ pre-loaded AI responses, 20 comforting stories, 15 classic songs, and 10 interactive memory exercises, your loved one can access core features even without an internet connection. Essential data is automatically cached on your device for reliable, uninterrupted companionship.
            </p>
          </div>
        </div>

        {/* Spacing */}
        <div className="h-20"></div>

        {/* How It Works */}
        <div id="how-it-works" className="mx-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl py-16 md:py-20 px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-12 md:mb-16 text-center">How It Works</h2>
          
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex gap-5 md:gap-6 items-start">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-bold border border-white/30">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Wake Word Activation</h3>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  Say <strong>"Hey Mirror"</strong> to activate hands-free. The app opens ready to listen and respond with a warm, human-like voice.
                </p>
              </div>
            </div>

            <div className="flex gap-5 md:gap-6 items-start">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-bold border border-white/30">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Era Detection & Adaptation</h3>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  AI detects which era your loved one is mentally experiencing and adapts language, cultural references, and responses accordingly.
                </p>
              </div>
            </div>

            <div className="flex gap-5 md:gap-6 items-start">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-bold border border-white/30">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Anxiety Detection & Support</h3>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  Monitors for signs of distress and automatically offers calming responses, redirects to positive memories, or suggests mode switches.
                </p>
              </div>
            </div>

            <div className="flex gap-5 md:gap-6 items-start">
              <div className="w-11 h-11 md:w-12 md:h-12 bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-bold border border-white/30">
                4
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Realistic Human Voice</h3>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  Enhanced AI voice synthesis with natural pacing and warmth creates genuine connection and emotional comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="h-20"></div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto px-4 bg-white dark:bg-slate-900 rounded-2xl py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 md:mb-16 text-center">
            What Families Are Saying
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-8 shadow-md border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <span className="text-4xl text-blue-400 leading-none">"</span>
                Memory Mirror has been a lifesaver. My mother with Alzheimer's talks to it every morning, and it adapts to whatever decade she thinks she's in. The anxiety detection feature alerts me when she needs extra support. Worth every penny.
              </p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                — Sarah M., Daughter & Caregiver
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-8 shadow-md border border-purple-200/50 dark:border-purple-800/30">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <span className="text-4xl text-purple-400 leading-none">"</span>
                As a dementia care nurse, I recommend Memory Mirror to families. It never corrects or contradicts, which is exactly what we train caregivers to do. The voice is so natural and comforting.
              </p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                — James R., RN, Dementia Care Specialist
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl p-8 shadow-md border border-emerald-200/50 dark:border-emerald-800/30">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <span className="text-4xl text-emerald-400 leading-none">"</span>
                My dad was resistant to technology, but the wake word activation means he just talks naturally. Mirror brings up photos from his Navy days in the 60s, and I've seen him smile more in the past month than the past year.
              </p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                — Maria L., Family Caregiver
              </p>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="h-20"></div>

        {/* Built by Someone Who Understands */}
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 rounded-2xl p-8 md:p-12 shadow-xl border border-amber-200/60 dark:border-amber-800/40">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Built by Someone Who Understands
              </h2>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-amber-200 dark:border-amber-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🎓 Mental Health</span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-amber-200 dark:border-amber-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🎓 Community Psychology</span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-amber-200 dark:border-amber-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">💼 25 Years Experience</span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-amber-200 dark:border-amber-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🏥 Aged Care Volunteer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                    <span>Get smart notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
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
          <button
            onClick={() => setShowDonationModal(true)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            💙 Support this project
          </button>
        </div>

        {/* Community Feedback Section */}
        <CommunityFeedbackSection />
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

      <div style={{ height: '40px' }}></div>

        {/* Spacing */}
        <div className="h-16"></div>
      </div>
      
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
}