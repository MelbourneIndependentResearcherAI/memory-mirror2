import React, { useState } from 'react';
import { MessageCircle, Brain, Heart, Shield, Moon, Phone, ChevronRight, Settings } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <QuickAccessCheck />

      {/* Caregiver Settings - tucked away top right */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={() => navigate(createPageUrl('CaregiverPortal'))}
          className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md"
          title="Caregiver Settings"
        >
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 text-blue-700 dark:text-blue-300 px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
          <Heart className="w-4 h-4" />
          AI Companion for Dementia Care
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-950 dark:text-white mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-blue-700 dark:from-white dark:via-purple-200 dark:to-blue-300">
          Memory Mirror
        </h1>
        <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
          Compassionate AI support — meeting your loved one where they are, with dignity, warmth, and presence.
        </p>
      </div>

      {/* Quick Access - Big Button */}
      <div className="px-6 max-w-sm mx-auto mb-12">
        <button
          onClick={() => navigate(createPageUrl('QuickAccess'))}
          className="w-full bg-gradient-to-br from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 active:scale-95 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 py-10 transition-all duration-300 border-0 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
          <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">🔴</span>
          <span className="text-3xl font-black relative z-10 tracking-tight">Quick Access</span>
          <span className="text-sm opacity-90 relative z-10 font-medium">One tap to start</span>
        </button>
      </div>

      {/* Two Main Access Cards */}
      <div className="px-6 max-w-3xl mx-auto mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate(createPageUrl('PatientAccess'))}
            className="group bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 rounded-3xl p-8 text-left shadow-2xl hover:shadow-2xl active:scale-95 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 text-white mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">Start Companion</h3>
              <p className="text-blue-100 text-base">For patients — no login required</p>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('CaregiverPortal'))}
            className="group bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 rounded-3xl p-8 text-left shadow-2xl hover:shadow-2xl active:scale-95 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
            <div className="relative z-10">
              <Brain className="w-12 h-12 text-white mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">Caregiver Portal</h3>
              <p className="text-purple-100 text-base">Dashboard, controls & insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Key Features */}
      <div className="px-6 max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Key Features</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc, page, color }) => (
            <button
              key={label}
              onClick={() => navigate(createPageUrl(page))}
              className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 text-left hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{label}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">{desc}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-3"
        >
          See all features <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="px-6 max-w-3xl mx-auto mb-14">
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-900/50 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 grid grid-cols-3 gap-6 text-center backdrop-blur-sm">
          <div className="group hover:scale-105 transition-transform duration-300">
            <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">24/7</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">Always Available</p>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Free</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">Forever, No Cost</p>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">100%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">Private & Secure</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 max-w-sm mx-auto mb-14 text-center">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl py-5 text-lg shadow-2xl hover:shadow-2xl active:scale-95 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all duration-300"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">✨ Get Started — Completely Free</span>
        </button>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium">No sign-up required · Always free</p>
      </div>

      {/* Testimonials */}
      <div className="px-6 max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">What families say</h2>
        <div className="space-y-4">
          {[
            { quote: '"My mom finally smiles again. She talks to Memory Mirror like an old friend."', name: 'Sarah M.', location: 'Adelaide' },
            { quote: '"The music therapy is incredible. My dad lights up every time."', name: 'James L.', location: 'Melbourne' },
            { quote: '"As a care home manager, this has been a game-changer for our residents."', name: 'Margaret T.', location: 'Brisbane' },
          ].map((t, i) => (
            <div key={i} className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300">
              <p className="text-base text-slate-700 dark:text-slate-300 italic mb-3 font-light leading-relaxed">{t.quote}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name} <span className="font-normal text-slate-500 dark:text-slate-400">· {t.location}</span></p>
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