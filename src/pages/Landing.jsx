import React, { useState } from 'react';
import { MessageCircle, Brain, Heart, Shield, Moon, Phone, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import DonationModal from '@/components/DonationModal';
import QuickAccessCheck from '@/components/utils/QuickAccessCheck';

const features = [
  { icon: Phone, label: 'Phone Mode', desc: 'Simple large-button calling interface', page: 'PhoneMode', color: 'text-green-600 bg-green-50' },
  { icon: Shield, label: 'Home Security Scanner', desc: 'Scam detection & online safety', page: 'Security', color: 'text-blue-600 bg-blue-50' },
  { icon: Moon, label: 'Night Watch', desc: 'Overnight AI monitoring', page: 'NightWatch', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Brain, label: 'Caregiver Dashboard', desc: 'Insights, reports & care management', page: 'CaregiverDashboard', color: 'text-purple-600 bg-purple-50' },
];

export default function Landing() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <QuickAccessCheck />

      {/* Hero */}
      <div className="px-5 pt-12 pb-8 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Heart className="w-3.5 h-3.5" />
          AI Companion for Dementia Care
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          Memory Mirror
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Compassionate AI support — meeting your loved one where they are, with dignity and warmth.
        </p>
      </div>

      {/* Quick Access - Big Button */}
      <div className="px-5 max-w-sm mx-auto mb-8">
        <button
          onClick={() => navigate(createPageUrl('QuickAccess'))}
          className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2 py-8 transition-all duration-150 border-4 border-white dark:border-slate-800"
        >
          <span className="text-5xl">🔴</span>
          <span className="text-2xl font-bold">Quick Access</span>
          <span className="text-sm opacity-80">One tap to start</span>
        </button>
      </div>

      {/* Two Main Access Cards */}
      <div className="px-5 max-w-2xl mx-auto mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(createPageUrl('PatientAccess'))}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
          >
            <MessageCircle className="w-10 h-10 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Start Companion</h3>
            <p className="text-blue-100 text-sm">For patients — no login required</p>
          </button>

          <button
            onClick={() => navigate(createPageUrl('CaregiverPortal'))}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
          >
            <Brain className="w-10 h-10 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Caregiver Portal</h3>
            <p className="text-purple-100 text-sm">Dashboard, controls & insights</p>
          </button>
        </div>
      </div>

      {/* Key Features */}
      <div className="px-5 max-w-2xl mx-auto mb-10">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Key Features</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc, page, color }) => (
            <button
              key={label}
              onClick={() => navigate(createPageUrl(page))}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left hover:shadow-md active:scale-95 transition-all duration-150"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2"
        >
          See all features <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="px-5 max-w-2xl mx-auto mb-10">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-blue-600">24/7</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Always Available</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">Offline</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Works Without WiFi</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">100%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Private & Secure</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 max-w-sm mx-auto mb-10 text-center">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl py-4 text-base shadow-lg active:scale-95 transition-all duration-150"
        >
          ✨ Get Started — Completely Free
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">No sign-up required · Always free</p>
      </div>

      {/* Testimonials */}
      <div className="px-5 max-w-2xl mx-auto mb-10">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">What families say</h2>
        <div className="space-y-3">
          {[
            { quote: '"My mom finally smiles again. She talks to Memory Mirror like an old friend."', name: 'Sarah M.', location: 'Adelaide' },
            { quote: '"The music therapy is incredible. My dad lights up every time."', name: 'James L.', location: 'Melbourne' },
            { quote: '"As a care home manager, this has been a game-changer for our residents."', name: 'Margaret T.', location: 'Brisbane' },
          ].map((t, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-2">{t.quote}</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.name} <span className="font-normal text-slate-400">· {t.location}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-8 bg-slate-900 text-center">
        <p className="text-white font-semibold text-sm mb-1">Memory Mirror</p>
        <p className="text-slate-400 text-xs mb-4">Compassionate AI for Dementia Care</p>
        <div className="flex justify-center gap-4 flex-wrap text-xs text-slate-500 mb-4">
          <Link to={createPageUrl('Pricing')} className="hover:text-slate-300">Pricing</Link>
          <Link to={createPageUrl('FAQ')} className="hover:text-slate-300">FAQ</Link>
          <Link to={createPageUrl('Resources')} className="hover:text-slate-300">Resources</Link>
          <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-slate-300">Privacy</Link>
          <Link to={createPageUrl('TermsOfService')} className="hover:text-slate-300">Terms</Link>
        </div>
        <button onClick={() => setShowDonationModal(true)} className="text-xs text-slate-500 hover:text-slate-300">
          💙 Support this project
        </button>
      </div>

      {showDonationModal && <DonationModal onClose={() => setShowDonationModal(false)} />}
    </div>
  );
}