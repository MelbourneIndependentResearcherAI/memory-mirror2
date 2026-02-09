import React from 'react';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6 border-2 border-blue-200 dark:border-blue-700">
            <Heart className="w-6 h-6 text-blue-500 animate-pulse" />
            <span className="text-lg font-medium text-slate-800 dark:text-slate-100">Compassionate AI Companion</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 mb-6 leading-tight">
            Memory Mirror
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 mb-4 leading-relaxed font-light">
            Meeting your loved one where they are,
          </p>
          <p className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 mb-8 italic">
            with dignity, warmth, and understanding
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Home')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-10 py-7 text-xl rounded-full shadow-2xl border-4 border-white/50 hover:scale-105 transition-transform">
                💙 Start Companion
              </Button>
            </Link>
            <Link to={createPageUrl('FamilyConnect')}>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-7 text-lg rounded-full border-3 border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950 shadow-xl hover:scale-105 transition-transform"
              >
                👨‍👩‍👧‍👦 Family Portal
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-7 text-lg rounded-full border-3 border-cyan-300 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-950 shadow-xl hover:scale-105 transition-transform"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              ℹ️ Learn More
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 backdrop-blur-sm shadow-2xl border-2 border-blue-200 dark:border-blue-800 hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Voice Companion</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                Hands-free voice conversations. Never corrects or contradicts. Adapts to their mental time period with warmth.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 backdrop-blur-sm shadow-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Safe Phone</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                Emergency calls redirect to AI support that validates concerns while providing reassurance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950 dark:to-sky-950 backdrop-blur-sm shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-[0_20px_60px_rgba(99,102,241,0.3)] hover:scale-105 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Security Monitor</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                Professional interface that reassures about home safety and responds to concerns with care.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl mb-20 border-4 border-blue-200 dark:border-blue-800">
          <h2 className="text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 mb-12 text-center">How It Works</h2>
          
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Wake Word Activation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Say <strong>"Hey Mirror"</strong> to activate hands-free. The app opens ready to listen and respond with a human-like voice.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Era Detection & Adaptation</h3>
                <p className="text-slate-600 leading-relaxed">
                  AI detects which time period your loved one is mentally experiencing (1940s, 60s, 80s, or present) and adapts language, references, and responses accordingly.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Anxiety Detection & Intervention</h3>
                <p className="text-slate-600 leading-relaxed">
                  Monitors for keywords and sentiments indicating fear, confusion, or distress. Automatically offers calming responses, redirects to positive memories, or suggests mode switches for reassurance.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Realistic Human Voice</h3>
                <p className="text-slate-600 leading-relaxed">
                  Responses use enhanced AI voice synthesis with natural pacing, warmth, and emotion to create genuine connection and comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-12 text-center">Core Principles</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
              <Brain className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Never Correct, Always Validate</h3>
              <p className="text-slate-700">
                Memory Mirror never tells someone they're wrong or confused. It meets them where they are mentally and emotionally.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
              <Heart className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Dignity & Respect</h3>
              <p className="text-slate-700">
                Every interaction prioritizes dignity, treating the person with the respect and warmth they deserve.
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl">
              <Volume2 className="w-10 h-10 text-rose-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Calming Presence</h3>
              <p className="text-slate-700">
                Designed to reduce anxiety and agitation through reassurance, familiar patterns, and emotional safety.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
              <Shield className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Safe Redirects</h3>
              <p className="text-slate-700">
                When confusion or fear arise, gently guides to positive memories and reassures that everything is handled.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-600 dark:from-blue-600 dark:via-cyan-600 dark:to-sky-700 text-white rounded-3xl p-12 shadow-2xl border-4 border-white/30">
          <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-light mb-6">Ready to Begin?</h2>
          <p className="text-2xl mb-8 text-white/90 leading-relaxed">
            Start using Memory Mirror today and provide your loved one<br />with a compassionate, understanding companion.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-7 text-xl rounded-full shadow-2xl hover:scale-105 transition-transform border-4 border-blue-200">
              💙 Launch Memory Mirror
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500 text-sm">
          <p>Memory Mirror — Compassionate AI for dementia care</p>
          <p className="mt-2">Designed with input from caregivers and dementia specialists</p>
        </div>
      </div>
    </div>
  );
}