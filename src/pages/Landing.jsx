import React from 'react';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950 pb-32 md:pb-40">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
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
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-10 md:px-12 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold">
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                Start AI Chat
              </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Link to="/phone" className="w-full animate-fade-in-up animation-delay-100">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 md:px-10 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold"
                >
                  <Phone className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                  Phone Dial Pad
                </Button>
              </Link>

              <Link to="/security" className="w-full animate-fade-in-up animation-delay-200">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 md:px-10 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-105 hover:shadow-3xl transition-all duration-300 w-full min-h-[88px] font-semibold"
                >
                  <Shield className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                  Security Scanner
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
              <Link to={createPageUrl('FamilyConnect')} className="w-full animate-fade-in-up animation-delay-100">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-2xl border-4 border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full min-h-[72px] font-medium"
                >
                  👨‍👩‍👧‍👦 Family Portal
                </Button>
              </Link>
              <Link to={createPageUrl('CaregiverPortal')} className="w-full animate-fade-in-up animation-delay-200">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl rounded-2xl border-4 border-purple-400 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-950 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full min-h-[72px] font-medium"
                >
                  🧠 Caregiver Dashboard
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

        {/* Key Features with Direct Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20 px-4">
          <Link to="/chat" className="block group">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 backdrop-blur-sm shadow-2xl border-4 border-blue-200 dark:border-blue-800 hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Voice Companion</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg mb-4">
                  Hands-free voice conversations. Never corrects or contradicts. Adapts to their mental time period with warmth.
                </p>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-semibold rounded-xl min-h-[56px]">
                  Open AI Chat →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/phone" className="block group">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 backdrop-blur-sm shadow-2xl border-4 border-emerald-200 dark:border-emerald-800 hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Safe Phone</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg mb-4">
                  Emergency calls redirect to AI support that validates concerns while providing reassurance.
                </p>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-base font-semibold rounded-xl min-h-[56px]">
                  Open Phone Pad →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/security" className="block group">
            <Card className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950 dark:to-sky-950 backdrop-blur-sm shadow-2xl border-4 border-indigo-200 dark:border-indigo-800 hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Security Monitor</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg mb-4">
                  Professional interface that reassures about home safety and responds to concerns with care.
                </p>
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 text-base font-semibold rounded-xl min-h-[56px]">
                  Open Security →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950 backdrop-blur-sm rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl mb-12 md:mb-20 border-4 border-blue-200 dark:border-blue-800 mx-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 mb-8 md:mb-12 text-center">How It Works</h2>
          
          <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Wake Word Activation</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Say <strong>"Hey Mirror"</strong> to activate hands-free. The app opens ready to listen and respond with a human-like voice.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Era Detection & Adaptation</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI detects which time period your loved one is mentally experiencing (1940s, 60s, 80s, or present) and adapts language, references, and responses accordingly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Anxiety Detection & Intervention</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitors for keywords and sentiments indicating fear, confusion, or distress. Automatically offers calming responses, redirects to positive memories, or suggests mode switches for reassurance.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg md:text-xl font-semibold">
                4
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Realistic Human Voice</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Responses use enhanced AI voice synthesis with natural pacing, warmth, and emotion to create genuine connection and comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-20 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-slate-800 dark:text-slate-100 mb-8 md:mb-12 text-center">Core Principles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-5 md:p-6 rounded-2xl">
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Never Correct, Always Validate</h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                Memory Mirror never tells someone they're wrong or confused. It meets them where they are mentally and emotionally.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-5 md:p-6 rounded-2xl">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Dignity & Respect</h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                Every interaction prioritizes dignity, treating the person with the respect and warmth they deserve.
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-5 md:p-6 rounded-2xl">
              <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-rose-600 dark:text-rose-400 mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Calming Presence</h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                Designed to reduce anxiety and agitation through reassurance, familiar patterns, and emotional safety.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-5 md:p-6 rounded-2xl">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Safe Redirects</h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                When confusion or fear arise, gently guides to positive memories and reassures that everything is handled.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-600 dark:from-blue-600 dark:via-cyan-600 dark:to-sky-700 text-white rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-white/30 mx-4">
          <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 animate-pulse" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-6">Ready to Begin?</h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 leading-relaxed px-4">
            Start using Memory Mirror today and provide your loved one with a compassionate, understanding companion.
          </p>
          <Link to="/chat">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 md:px-14 py-7 md:py-9 text-xl md:text-2xl rounded-2xl shadow-2xl hover:scale-105 transition-transform border-4 border-blue-200 min-h-[88px] font-bold">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 mr-3" />
              Launch AI Chat Now
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 md:mt-24 mb-8 text-slate-500 dark:text-slate-400 text-xs md:text-sm px-4">
          <p>Memory Mirror — Compassionate AI for dementia care</p>
          <p className="mt-2">Designed with input from caregivers and dementia specialists</p>
        </div>
      </div>
    </div>
  );
}