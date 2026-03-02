import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';

const FIRST_STEPS = {
  patient_family: [
    { emoji: '👤', text: 'Set up your loved one\'s profile', page: 'UserProfile' },
    { emoji: '🔴', text: 'Try the Quick Access button', page: 'QuickAccess' },
    { emoji: '👨‍⚕️', text: 'Explore the Caregiver Dashboard', page: 'CaregiverPortal' },
  ],
  caregiver: [
    { emoji: '👨‍⚕️', text: 'Open the Caregiver Dashboard', page: 'CaregiverPortal' },
    { emoji: '📊', text: 'Check Activity Reports', page: 'ActivityReports' },
    { emoji: '🌙', text: 'Set up Night Watch', page: 'NightWatch' },
  ],
  patient: [
    { emoji: '🔴', text: 'Press the big red button', page: 'QuickAccess' },
    { emoji: '🎵', text: 'Listen to some music', page: 'MusicTherapy' },
    { emoji: '🧠', text: 'Start a chat with your AI companion', page: 'ChatMode' },
  ],
};

export default function OnboardingComplete({ data, user, onFinish }) {
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    const concernMap = {
      loneliness: 'loneliness and isolation',
      anxiety: 'anxiety and agitation',
      safety: 'safety and wandering',
      memory: 'memory loss and confusion',
      family: 'staying connected to family',
      daily_routine: 'daily routine and reminders',
    };
    const concern = concernMap[data.primaryConcern] || 'supporting your loved one';
    const name = data.lovedOneName ? `for ${data.lovedOneName}` : '';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Memory Mirror AI. A new user has just finished onboarding. Their role: ${data.role}. ${name ? `Loved one name: ${name}` : ''}. Primary concern: ${concern}. Interests noted: ${(data.interests || []).join(', ') || 'not specified'}. Write a 2-sentence personalised message acknowledging what you learned and expressing genuine enthusiasm about how you'll help them. Be warm, specific, and heartfelt. Do NOT use generic filler phrases.`,
    });
    setAiSummary(result);
    setLoading(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    await onFinish();
  };

  const firstSteps = FIRST_STEPS[data.role] || FIRST_STEPS.patient_family;

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="text-7xl mb-4"
      >
        🎉
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">You're all set!</h2>
        <p className="text-slate-500 mb-6">Memory Mirror is personalised and ready for you.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl shadow-lg border border-blue-100 p-5 mb-6 text-left"
      >
        {loading ? (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-slate-500 text-sm">Personalising your experience...</span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">AI</div>
            <p className="text-slate-700 leading-relaxed">{aiSummary}</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <p className="text-sm font-semibold text-slate-600 mb-3 text-left">✨ Suggested first steps for you:</p>
        <div className="space-y-2 mb-8">
          {firstSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 text-left border border-slate-200">
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-sm font-medium text-slate-700">{step.text}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleFinish}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl text-lg gap-2"
        >
          {saving ? 'Saving...' : <><Sparkles className="w-5 h-5" /> Go to Memory Mirror</>}
        </Button>
      </motion.div>
    </div>
  );
}