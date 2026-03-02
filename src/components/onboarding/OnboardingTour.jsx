import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_FEATURES = [
  {
    emoji: '🔴',
    title: 'Quick Access Button',
    desc: 'The big red button is how your loved one starts every session — no logins, no menus. Just tap and talk.',
    tip: '💡 Add Memory Mirror to the home screen so it\'s always one tap away.',
    roles: ['patient_family', 'patient'],
  },
  {
    emoji: '🧠',
    title: 'AI Chat Companion',
    desc: 'Our AI talks, listens, recalls personal memories, and adapts to mood. It never rushes and always responds with warmth.',
    tip: '💡 Try saying "Tell me a story from the 1960s" or "Play some music".',
    roles: ['patient_family', 'patient', 'caregiver', 'care_professional'],
  },
  {
    emoji: '👨‍⚕️',
    title: 'Caregiver Dashboard',
    desc: 'Monitor mood trends, review chat history, set reminders, write care journal entries, and manage the full care experience.',
    tip: '💡 Check the dashboard each morning for overnight activity summaries.',
    roles: ['patient_family', 'caregiver', 'care_professional'],
  },
  {
    emoji: '🌙',
    title: 'Night Watch',
    desc: 'AI-powered overnight monitoring detects distress, unusual sounds, or restlessness and sends instant alerts.',
    tip: '💡 Enable Night Watch before bedtime from the bottom navigation bar.',
    roles: ['patient_family', 'caregiver'],
  },
  {
    emoji: '🎵',
    title: 'Music Therapy',
    desc: 'Era-specific playlists, singalong sessions, and family-uploaded songs proven to reduce anxiety and spark joy.',
    tip: '💡 Upload personal songs your loved one loves from the Content Library.',
    roles: ['patient_family', 'patient', 'caregiver'],
  },
  {
    emoji: '🛡️',
    title: 'Security & Safety',
    desc: 'Scam detection, GPS geofencing with safe zone alerts, and an emergency contact button for instant help.',
    tip: '💡 Set up safe zones in the Caregiver Portal → Location Safety.',
    roles: ['patient_family', 'caregiver'],
  },
];

export default function OnboardingTour({ data, onNext, onBack }) {
  const [current, setCurrent] = useState(0);

  const relevant = ALL_FEATURES.filter(f => !f.roles || f.roles.includes(data.role));
  const feature = relevant[current] || ALL_FEATURES[0];
  const isLast = current === relevant.length - 1;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Quick feature tour</h2>
        <p className="text-slate-500 text-sm">{current + 1} of {relevant.length} — personalised for you</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6 min-h-[260px] flex flex-col justify-between"
        >
          <div>
            <div className="text-6xl mb-4">{feature.emoji}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">{feature.desc}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              {feature.tip}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {relevant.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-300'}`} />
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={current > 0 ? () => setCurrent(c => c - 1) : onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {isLast ? (
          <Button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold gap-2"
          >
            All done! <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrent(c => c + 1)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}