import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GREETINGS = [
  "We're so glad you're here.",
  "You're taking a wonderful step.",
  "Let's make care easier together.",
  "Welcome to your care companion.",
];

export default function OnboardingWelcome({ user, onNext }) {
  const [greeting, setGreeting] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    generateWelcomeMessage();
  }, []);

  const generateWelcomeMessage = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Memory Mirror AI companion for dementia care. Write a warm, brief (2-3 sentences), genuinely compassionate welcome message for a new user named "${user?.full_name || 'there'}" who has just joined. Mention that you'll guide them through a quick setup. Tone: warm, reassuring, human. Do NOT use generic phrases like "Certainly!" or "Of course!". Be natural and heartfelt.`,
    });
    setAiMessage(result);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="text-7xl mb-6"
      >
        🪞
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> Memory Mirror
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {user?.full_name ? `Welcome, ${user.full_name.split(' ')[0]}!` : 'Welcome!'}
        </h1>
        <p className="text-slate-500 text-lg mb-6">{greeting}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8 text-left"
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-slate-500 text-sm">Your AI companion is saying hello...</span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">AI</div>
            <p className="text-slate-700 leading-relaxed">{aiMessage}</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="flex flex-col gap-2 text-sm text-slate-500 mb-6">
          <div className="flex items-center justify-center gap-2"><span>✅</span> Takes about 2 minutes</div>
          <div className="flex items-center justify-center gap-2"><span>✅</span> We'll personalise everything for you</div>
          <div className="flex items-center justify-center gap-2"><span>✅</span> You can change settings anytime</div>
        </div>
        <Button
          onClick={onNext}
          disabled={loading}
          className="w-full max-w-xs mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-lg gap-2"
        >
          Let's get started <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}