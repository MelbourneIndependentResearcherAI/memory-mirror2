import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Heart, Shield, Moon, Music, Phone, 
  Camera, Users, MessageCircle, MapPin, Zap,
  ChevronRight, ChevronDown, Star, CheckCircle2
} from 'lucide-react';

const WHO_CARDS = [
  {
    emoji: '🧓',
    title: 'People Living with Dementia',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    description: 'Memory Mirror is designed to feel like a warm, familiar friend — not a machine. It speaks gently, plays favourite songs, shares comforting stories, and never makes your loved one feel confused or lost.',
    benefits: [
      'No complicated menus or logins',
      'ONE big red button to start',
      'Responds to voice — completely hands-free',
      'Remembers personal stories and preferences',
      'Adapts to their era (1940s, 60s, 80s...)',
    ]
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Family Members',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    description: 'Even when you can\'t be there in person, Memory Mirror keeps your loved one connected, calm, and cared for. You\'ll always know how they\'re doing — and they\'ll always feel loved.',
    benefits: [
      'Share photos, messages & memories remotely',
      'Receive real-time wellbeing updates',
      'Video call directly through the app',
      'Upload family songs and stories for them',
      'Night Watch alerts if anything unusual happens',
    ]
  },
  {
    emoji: '👨‍⚕️',
    title: 'Carers & Care Professionals',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    description: 'A powerful, professional-grade care dashboard that gives you insight into every patient\'s mood, behaviour, routines and anxiety levels — so you can provide smarter, more responsive care.',
    benefits: [
      'AI mood & sentiment analysis after every chat',
      'Smart alerts for anxiety spikes or behaviour changes',
      'Digital care journal with audio entries',
      'Routine tracking and care plan builder',
      'Multi-patient management from one dashboard',
    ]
  },
];

const FEATURES = [
  {
    icon: <MessageCircle className="w-7 h-7" />,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'AI Chat Companion',
    tagline: 'Like a wise, patient friend who\'s always there',
    description: 'Our AI is trained to speak with warmth, patience, and deep empathy. It never rushes, never corrects harshly, and always meets the person where they are emotionally. It recalls personal memories, adapts to different eras of life, and provides genuine comfort — day or night.',
  },
  {
    icon: <Music className="w-7 h-7" />,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Music Therapy',
    tagline: 'The songs that unlock forgotten memories',
    description: 'Music is one of the most powerful tools in dementia care. Memory Mirror curates era-specific playlists, can sing along with your loved one, and even lets families upload personally meaningful tracks. Watch anxiety dissolve and joy return.',
  },
  {
    icon: <Moon className="w-7 h-7" />,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    title: 'Night Watch',
    tagline: 'Peace of mind while they sleep — and while you do too',
    description: 'Night-time is when dementia-related anxiety peaks. Night Watch monitors for unusual sounds, distress calls, and restlessness. Carers receive instant alerts, and the AI can gently respond to calm someone down — even at 3am.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Safety & Security',
    tagline: 'Scam protection and GPS geofencing',
    description: 'People with dementia are frequent targets of phone scams. Memory Mirror\'s Security Scanner helps identify suspicious activity. GPS Geofencing alerts family the moment a loved one wanders beyond a safe boundary.',
  },
  {
    icon: <Camera className="w-7 h-7" />,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    title: 'Memory Gallery & Family Stories',
    tagline: 'Relive beautiful moments, again and again',
    description: 'Upload family photos, stories and voice memories that the AI can recall and narrate aloud. The AI can describe photos in detail, spark conversations about cherished moments, and bring the whole family into the room — even from thousands of kilometres away.',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    title: 'Emergency Button',
    tagline: 'One tap. Instant help.',
    description: 'Inspired by "Be My Eyes", the big red Quick Access button gives instant one-tap access to help. No passwords, no menus. Press once to confirm, and an emergency alert is sent instantly to registered carers and emergency contacts.',
  },
];

const HOW_STEPS = [
  { step: '01', title: 'Set up a profile', desc: 'Enter your loved one\'s name, their era (decade they grew up in), favourite music, family members and memories. Takes under 5 minutes.' },
  { step: '02', title: 'Hand them the tablet or phone', desc: 'Press the ONE BIG RED BUTTON and they\'re immediately talking to their AI companion — no logins, no passwords, no confusion.' },
  { step: '03', title: 'The AI takes it from there', desc: 'Memory Mirror chats, plays music, tells stories, checks in on their mood, and keeps them company. Every conversation is logged for caregiver review.' },
  { step: '04', title: 'You stay informed', desc: 'Receive mood updates, anxiety alerts, Night Watch reports and care journal entries — all from the Caregiver Dashboard, anywhere in the world.' },
];

export default function AppTutorial() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [whoTab, setWhoTab] = useState(0);

  return (
    <div className="max-w-5xl mx-auto px-4 mb-16 space-y-20">

      {/* SECTION 1: What is it? */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Star className="w-4 h-4" /> What is Memory Mirror?
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          The world's most compassionate<br className="hidden md:block" /> AI companion for dementia care
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
          Memory Mirror is a complete care ecosystem — not just a chatbot. It's a 24/7 AI companion, 
          music therapist, safety monitor, family connector and caregiver dashboard rolled into one beautifully 
          simple app. Built specifically for people living with dementia and the families who love them.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '24/7 Companion', icon: '🤖', sub: 'Always on, always warm' },
            { label: 'No Tech Skills Needed', icon: '☝️', sub: 'One button to start' },
            { label: 'Works Offline', icon: '📶', sub: 'No WiFi? No problem' },
            { label: 'Loved by Families', icon: '❤️', sub: 'Across Australia' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Who is it for? */}
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Users className="w-4 h-4" /> Who is it for?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Built for everyone in the care circle
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {WHO_CARDS.map((card, i) => (
            <button
              key={i}
              onClick={() => setWhoTab(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all ${
                whoTab === i
                  ? `bg-gradient-to-r ${card.color} text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {card.emoji} {card.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={whoTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className={`rounded-3xl border p-8 ${WHO_CARDS[whoTab].bg} ${WHO_CARDS[whoTab].border}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="text-5xl mb-4">{WHO_CARDS[whoTab].emoji}</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {WHO_CARDS[whoTab].title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base mb-6">
                  {WHO_CARDS[whoTab].description}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">What you get:</p>
                <ul className="space-y-3">
                  {WHO_CARDS[whoTab].benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SECTION 3: Features Deep Dive */}
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" /> Key Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Everything you need, beautifully integrated
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Feature List */}
          <div className="md:w-1/3 space-y-2">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeFeature === i
                    ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className={`${activeFeature === i ? f.color : 'text-slate-400'}`}>{f.icon}</span>
                {f.title}
                {activeFeature === i && <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />}
              </button>
            ))}
          </div>

          {/* Feature Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="md:flex-1 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <div className={`w-14 h-14 ${FEATURES[activeFeature].bg} rounded-2xl flex items-center justify-center mb-4 ${FEATURES[activeFeature].color}`}>
                {FEATURES[activeFeature].icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {FEATURES[activeFeature].title}
              </h3>
              <p className={`font-semibold text-sm mb-4 ${FEATURES[activeFeature].color}`}>
                {FEATURES[activeFeature].tagline}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {FEATURES[activeFeature].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 4: How it works */}
      <div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ChevronRight className="w-4 h-4" /> How it Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Set up in minutes. Life-changing from day one.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex gap-5 items-start">
              <div className="text-4xl font-black text-slate-100 dark:text-slate-700 leading-none select-none w-12 flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{s.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to make a real difference?</h3>
          <p className="text-blue-100 mb-2 text-sm">
            🔥 Founder's Pricing — first 200 users lock in <strong>$9.99/month forever</strong>
          </p>
          <p className="text-blue-200 text-xs">After 200 spots are filled, new users pay $18.99/month. Your price never increases — ever.</p>
        </div>
      </div>
    </div>
  );
}