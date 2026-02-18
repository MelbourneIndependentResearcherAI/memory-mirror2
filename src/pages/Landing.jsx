import React from 'react';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 pb-8">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-5 md:px-7 py-2.5 md:py-3 rounded-full shadow-sm mb-6 md:mb-8 border border-blue-200/50 dark:border-blue-700/50">
            <Heart className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
            <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300">Compassionate Care at Home</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-950 dark:text-white mb-4 md:mb-6 leading-tight px-4">
            Memory Mirror
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-3 md:mb-4 px-4 tracking-wide uppercase font-medium">
            AI Companion for Dementia Care
          </p>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-800 dark:text-slate-200 mb-3 md:mb-4 leading-relaxed font-medium px-4">
            Meeting your loved one where they are—
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-blue-600 dark:text-blue-400 mb-8 md:mb-12 font-light px-4">
            with dignity, warmth, and genuine understanding
          </p>

          <div className="flex flex-col gap-5 md:gap-6 justify-center items-stretch px-4 max-w-5xl mx-auto mb-8">
          {/* Main AI Chat Card */}
          <Link to="/chat" className="w-full group">
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-700 hover:via-cyan-700 hover:to-sky-700 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 p-8 md:p-10 cursor-pointer">
                <div className="flex items-start gap-5">
                  <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-xl group-hover:bg-white/25 transition-colors">
                    <MessageCircle className="w-9 h-9 md:w-11 md:h-11 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                      AI Chat Companion
                    </h3>
                    <p className="text-base md:text-lg text-white/85 leading-relaxed">
                      Voice-activated conversation that adapts to any era, detects anxiety, and recalls cherished memories
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Secondary Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <Link to="/phone" className="w-full group">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-fit mb-4 group-hover:bg-white/25 transition-colors">
                      <Phone className="w-8 h-8 md:w-9 md:h-9 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Phone Mode
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Familiar dial pad interface for calling loved ones with visual reassurance
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/security" className="w-full group">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 p-7 md:p-8 cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl w-fit mb-4 group-hover:bg-white/25 transition-colors">
                      <Shield className="w-8 h-8 md:w-9 md:h-9 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Security Scanner
                    </h3>
                    <p className="text-sm md:text-base text-white/85 leading-relaxed">
                      Visual security check to reduce anxiety about locks, lights, and safety
                    </p>
                  </div>
                </div>
              </Link>

              <Link to={createPageUrl('NightWatch')} className="w-full group">
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
              </Link>
            </div>

            {/* Voice Setup Card */}
            <Link to={createPageUrl('VoiceSetup')} className="w-full group">
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
            </Link>

            {/* Portal Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <Link to={createPageUrl('FamilyConnect')} className="w-full group">
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
              </Link>

              <Link to={createPageUrl('CaregiverPortal')} className="w-full group">
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
              </Link>
            </div>

            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 w-full min-h-[52px] font-medium"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More About Memory Mirror →
            </Button>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '80px' }}></div>

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

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                <strong className="text-blue-700 dark:text-blue-400">Important Note:</strong> The subscription fee will not begin until Memory Mirror is running smoothly and all final tweaks and adjustments are finalized. We want to ensure you receive the quality experience you deserve.
              </p>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Thank you for your patience, understanding, and support as we continue to refine and improve Memory Mirror for you and your loved ones. 💙
              </p>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '80px' }}></div>

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
        <div style={{ height: '80px' }}></div>

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
        <div style={{ height: '80px' }}></div>

        {/* Bottom Text Section */}
        <div 
          className="text-center relative px-4 z-10 mx-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 py-16 md:py-20"
        >
          <p className="text-slate-200 text-sm md:text-base font-semibold">Memory Mirror — Compassionate AI for Dementia Care</p>
          <p className="mt-2 text-slate-400 text-xs md:text-sm">Designed with input from caregivers and dementia care specialists</p>
          <div className="mt-6 flex justify-center gap-4 text-xs md:text-sm">
            <Link to={createPageUrl('FAQ')} className="text-slate-400 hover:text-slate-300 transition-colors">
              FAQ
            </Link>
            <span className="text-slate-600">•</span>
            <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-400 hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">•</span>
            <a href="mailto:support@memorymirror.app" className="text-slate-400 hover:text-slate-300 transition-colors">
              Support
            </a>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
}