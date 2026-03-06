import React, { useState } from 'react';
import { MessageCircle, Brain, Heart, Shield, Moon, Phone, ChevronRight, Settings, Sparkles, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import DonationModal from '@/components/DonationModal';
import QuickAccessCheck from '@/components/utils/QuickAccessCheck';

const features = [
  { icon: Phone, label: 'Phone Mode', desc: 'Simple large-button calling interface', page: 'PhoneMode', gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30' },
  { icon: Shield, label: 'Home Security', desc: 'Scam detection & online safety', page: 'Security', gradient: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/30' },
  { icon: Moon, label: 'Night Watch', desc: 'Overnight AI monitoring', page: 'NightWatch', gradient: 'from-indigo-500 to-violet-600', glow: 'shadow-indigo-500/30' },
  { icon: Brain, label: 'Caregiver Hub', desc: 'Insights, reports & care management', page: 'CaregiverDashboard', gradient: 'from-purple-500 to-pink-600', glow: 'shadow-purple-500/30' },
];

const testimonials = [
  { quote: '"My mom finally smiles again. She talks to Memory Mirror like an old friend."', name: 'Sarah M.', location: 'Adelaide', stars: 5 },
  { quote: '"The music therapy is incredible. My dad lights up every time."', name: 'James L.', location: 'Melbourne', stars: 5 },
  { quote: '"As a care home manager, this has been a game-changer for our residents."', name: 'Margaret T.', location: 'Brisbane', stars: 5 },
];

export default function Landing() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #020818 0%, #0a0f2e 30%, #0d0825 60%, #020818 100%)' }}>
      <QuickAccessCheck />

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulse 12s ease-in-out infinite 4s' }} />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(50px)', animation: 'pulse 9s ease-in-out infinite 1s' }} />
        {/* Star dots */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
          }} />
        ))}
      </div>

      {/* Caregiver Settings */}
      <div className="relative z-10 flex justify-end px-6 pt-6">
        <button
          onClick={() => navigate(createPageUrl('CaregiverPortal'))}
          className="w-11 h-11 rounded-xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          title="Caregiver Settings"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-10 pb-12 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', backdropFilter: 'blur(10px)' }}>
          <Sparkles className="w-4 h-4" />
          AI Companion for Dementia Care
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{
          background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 40%, #818cf8 70%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.4))'
        }}>
          Memory Mirror
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light" style={{ color: 'rgba(191,219,254,0.8)' }}>
          Compassionate AI support — meeting your loved one where they are, with dignity, warmth, and presence.
        </p>
      </div>

      {/* Quick Access - Big Button */}
      <div className="relative z-10 px-6 max-w-sm mx-auto mb-12">
        <button
          onClick={() => navigate(createPageUrl('QuickAccess'))}
          className="w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-10 transition-all duration-300 active:scale-95 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #be123c 50%, #9f1239 100%)',
            boxShadow: '0 0 60px rgba(220,38,38,0.5), 0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
          <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">🔴</span>
          <span className="text-3xl font-black text-white relative z-10 tracking-tight">Quick Access</span>
          <span className="text-sm text-red-200 relative z-10 font-medium">One tap to start</span>
        </button>
      </div>

      {/* Two Main Access Cards */}
      <div className="relative z-10 px-6 max-w-3xl mx-auto mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => navigate(createPageUrl('PatientAccess'))}
            className="group rounded-3xl p-8 text-left active:scale-95 transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.8) 0%, rgba(6,182,212,0.8) 100%)',
              border: '1px solid rgba(99,179,237,0.3)',
              boxShadow: '0 0 40px rgba(37,99,235,0.3), 0 20px 40px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Start Companion</h3>
              <p className="text-blue-100/80 text-base">For patients — no login required</p>
              <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
                <span>Open now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(createPageUrl('CaregiverPortal'))}
            className="group rounded-3xl p-8 text-left active:scale-95 transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(236,72,153,0.8) 100%)',
              border: '1px solid rgba(167,139,250,0.3)',
              boxShadow: '0 0 40px rgba(124,58,237,0.3), 0 20px 40px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Caregiver Portal</h3>
              <p className="text-purple-100/80 text-base">Dashboard, controls & insights</p>
              <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
                <span>Sign in</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Key Features */}
      <div className="relative z-10 px-6 max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl font-black text-white mb-2">Key Features</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(148,163,184,0.8)' }}>Everything your loved one needs</p>
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc, page, gradient, glow }) => (
            <button
              key={label}
              onClick={() => navigate(createPageUrl(page))}
              className={`group rounded-2xl p-5 text-left active:scale-95 transition-all duration-300 hover:shadow-xl ${glow} relative overflow-hidden`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.03)' }} />
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-sm text-white leading-tight">{label}</p>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{desc}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-semibold py-3 transition-colors duration-300"
          style={{ color: 'rgba(139,92,246,0.8)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(167,139,250,1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(139,92,246,0.8)'}
        >
          See all features <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="relative z-10 px-6 max-w-3xl mx-auto mb-14">
        <div className="rounded-3xl p-8 grid grid-cols-3 gap-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
          {[
            { value: '24/7', label: 'Always Available', color: '#60a5fa' },
            { value: 'Free', label: 'Forever, No Cost', color: '#34d399' },
            { value: '100%', label: 'Private & Secure', color: '#c084fc' },
          ].map(({ value, label, color }) => (
            <div key={value} className="group hover:scale-105 transition-transform duration-300 relative z-10">
              <p className="text-3xl font-black mb-2" style={{ color, filter: `drop-shadow(0 0 10px ${color}60)` }}>{value}</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.8)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 max-w-sm mx-auto mb-14 text-center">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="w-full font-black rounded-2xl py-5 text-lg active:scale-95 transition-all duration-300 relative overflow-hidden group text-white"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
            boxShadow: '0 0 40px rgba(16,185,129,0.4), 0 10px 30px rgba(0,0,0,0.3)',
            border: '1px solid rgba(52,211,153,0.3)'
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Get Started — Completely Free
          </span>
        </button>
        <p className="text-sm mt-3 font-medium" style={{ color: 'rgba(100,116,139,0.9)' }}>No sign-up required · Always free</p>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 px-6 max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl font-black text-white mb-2">What families say</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(148,163,184,0.8)' }}>Real stories from real families</p>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i}
              className="rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.02)' }} />
              <div className="relative z-10">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.stars)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-base italic mb-3 leading-relaxed font-light" style={{ color: 'rgba(226,232,240,0.9)' }}>{t.quote}</p>
                <p className="text-sm font-bold text-white">{t.name} <span className="font-normal" style={{ color: 'rgba(100,116,139,0.9)' }}>· {t.location}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-12 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <p className="text-white font-black text-lg">Memory Mirror</p>
        </div>
        <p className="text-sm mb-6 font-light" style={{ color: 'rgba(100,116,139,0.9)' }}>Compassionate AI for Dementia Care</p>
        <div className="flex justify-center gap-6 flex-wrap text-sm mb-6" style={{ color: 'rgba(100,116,139,0.9)' }}>
          <Link to={createPageUrl('Pricing')} className="hover:text-white transition-colors duration-300 font-medium">Pricing</Link>
          <Link to={createPageUrl('FAQ')} className="hover:text-white transition-colors duration-300 font-medium">FAQ</Link>
          <Link to={createPageUrl('Resources')} className="hover:text-white transition-colors duration-300 font-medium">Resources</Link>
          <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors duration-300 font-medium">Privacy</Link>
          <Link to={createPageUrl('TermsOfService')} className="hover:text-white transition-colors duration-300 font-medium">Terms</Link>
        </div>
        <button onClick={() => setShowDonationModal(true)} className="text-sm hover:text-white transition-colors duration-300 font-medium" style={{ color: 'rgba(100,116,139,0.9)' }}>
          💙 Support this project
        </button>
      </div>

      {showDonationModal && <DonationModal onClose={() => setShowDonationModal(false)} />}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.15; }
          50% { transform: scale(1.1) translate(2%, 2%); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}