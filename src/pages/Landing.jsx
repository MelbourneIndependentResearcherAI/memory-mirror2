import React from 'react';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl" style={{ marginTop: '0px' }}>
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg mb-4 md:mb-6 border-2 border-blue-200 dark:border-blue-700">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-pulse" />
            <span className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-100">Compassionate AI Companion</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 mb-2 md:mb-3 leading-tight px-4">
            Memory Mirror
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-4 md:mb-6 px-4 italic">
            dementia care kit for carers and their loved ones
          </p>
          
          <p className="text-lg md:text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 mb-2 md:mb-4 leading-relaxed font-light px-4">
            Meeting your loved one where they are,
          </p>
          <p className="text-base md:text-xl lg:text-2xl text-blue-600 dark:text-blue-400 mb-6 md:mb-8 italic px-4">
            with dignity, warmth, and understanding
          </p>

          <div className="flex flex-col gap-4 md:gap-5 justify-center items-stretch px-4 max-w-4xl mx-auto">
            <Link to="/chat" className="w-full animate-fade-in-up">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-10 md:px-12 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold flex items-center justify-center">
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                <span>Start AI Chat</span>
              </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Link to="/phone" className="w-full animate-fade-in-up animation-delay-100">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 md:px-10 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold flex items-center justify-center"
                >
                  <Phone className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                  <span>Phone Dial Pad</span>
                </Button>
              </Link>

              <Link to="/security" className="w-full animate-fade-in-up animation-delay-200">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 md:px-10 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                  <span>Security Scanner</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
              <Link to={createPageUrl('FamilyConnect')} className="w-full animate-fade-in-up animation-delay-100">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-2xl border-4 border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full min-h-[72px] font-medium flex items-center justify-center"
                >
                  <span>👨‍👩‍👧‍👦 Family Portal</span>
                </Button>
              </Link>
              <Link to={createPageUrl('CaregiverPortal')} className="w-full animate-fade-in-up animation-delay-200">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-2xl border-4 border-purple-400 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-950 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full min-h-[72px] font-medium flex items-center justify-center"
                >
                  <span>🧠 Caregiver Dashboard</span>
                </Button>
              </Link>
            </div>

            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-2xl border-3 border-cyan-300 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-950 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full animate-fade-in-up animation-delay-200 min-h-[64px] mt-2"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              ℹ️ Learn More About Memory Mirror
            </Button>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '60px' }}></div>

        {/* Main Content Section - SEO */}
        <div className="max-w-4xl mx-auto px-4" style={{ marginBottom: '0' }}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-blue-200 dark:border-blue-800">
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

            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-0">
              We offer a free tier with daily limited access so everyone can try Memory Mirror. Premium subscription is $14.99 per month - intentionally priced well below other dementia care apps because we believe quality support shouldn't be out of reach for families already managing substantial caregiving costs.
            </p>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '60px' }}></div>

        {/* How It Works */}
        <div id="how-it-works" className="mx-4" style={{ backgroundColor: '#3b82f6', borderRadius: '24px', paddingTop: '60px', paddingBottom: '60px', marginBottom: '0' }}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 md:mb-12 text-center px-6">How It Works</h2>
          
          <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto px-6">
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Wake Word Activation</h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                  Say <strong>"Hey Mirror"</strong> to activate hands-free. The app opens ready to listen and respond with a human-like voice.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Era Detection & Adaptation</h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                  AI detects which time period your loved one is mentally experiencing (1940s, 60s, 80s, or present) and adapts language, references, and responses accordingly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Anxiety Detection & Intervention</h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                  Monitors for keywords and sentiments indicating fear, confusion, or distress. Automatically offers calming responses, redirects to positive memories, or suggests mode switches for reassurance.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                4
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Realistic Human Voice</h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                  Responses use enhanced AI voice synthesis with natural pacing, warmth, and emotion to create genuine connection and comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div style={{ height: '80px' }}></div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto px-8 bg-white dark:bg-slate-900 rounded-3xl" style={{ paddingTop: '60px', paddingBottom: '60px', marginBottom: '0' }}>
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 dark:text-slate-100 mb-12 text-center">
            What Families Are Saying
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <span className="text-4xl text-blue-400 leading-none">"</span>
                Memory Mirror has been a lifesaver. My mother with Alzheimer's talks to it every morning, and it adapts to whatever decade she thinks she's in. The anxiety detection feature alerts me when she needs extra support. Worth every penny.
              </p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                — Sarah M., Daughter & Caregiver
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-800">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <span className="text-4xl text-purple-400 leading-none">"</span>
                As a dementia care nurse, I recommend Memory Mirror to families. It never corrects or contradicts, which is exactly what we train caregivers to do. The voice is so natural and comforting.
              </p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                — James R., RN, Dementia Care Specialist
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl p-8 shadow-lg border-2 border-emerald-200 dark:border-emerald-800">
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
          className="text-center relative px-4 z-10 mx-4 rounded-3xl"
          style={{
            backgroundColor: '#0a4a5c',
            paddingTop: '60px',
            paddingBottom: '60px',
            marginBottom: '0'
          }}
        >
          <p className="text-slate-200 text-sm md:text-base font-medium">Memory Mirror — Compassionate AI for dementia care</p>
          <p className="mt-2 text-slate-300 text-xs md:text-sm">Designed with input from caregivers and dementia specialists</p>
        </div>

        {/* Spacing */}
        <div style={{ height: '40px' }}></div>
      </div>
    </div>
  );
}