import React from 'react';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPageUrl } from './utils';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
            <Heart className="w-6 h-6 text-rose-500" />
            <span className="text-lg font-medium text-slate-700">Compassionate AI Companion</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light text-slate-800 mb-6 leading-tight">
            Memory Mirror
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
            Meeting your loved one where they are, <br />with dignity and understanding
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Home')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl">
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg rounded-full border-2 border-slate-300 hover:bg-white"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Companion Chat</h3>
              <p className="text-slate-600 leading-relaxed">
                Never corrects or contradicts. Meets them in their mental time period with warmth and validation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Safe Phone</h3>
              <p className="text-slate-600 leading-relaxed">
                Emergency calls redirect to AI support that validates concerns while providing reassurance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none hover:shadow-2xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Security Monitor</h3>
              <p className="text-slate-600 leading-relaxed">
                Professional security interface that reassures about home safety and responds to paranoia.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl mb-20">
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-12 text-center">How It Works</h2>
          
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
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-light mb-6">Ready to Begin?</h2>
          <p className="text-xl mb-8 text-blue-50">
            Start using Memory Mirror today and provide your loved one with a compassionate companion.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg rounded-full shadow-xl">
              Launch Memory Mirror
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