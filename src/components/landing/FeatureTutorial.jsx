import React, { useState } from 'react';
import { ChevronRight, MessageCircle, Phone, Shield, Moon, Volume2, CreditCard, Users, Brain, Tv } from 'lucide-react';

export default function FeatureTutorial() {
  const [expandedFeature, setExpandedFeature] = useState(null);

  const features = [
    {
      id: 'chat',
      title: 'AI Chat Companion',
      icon: MessageCircle,
      color: 'from-blue-600 to-cyan-600',
      description: 'Voice-activated conversation that adapts to any era',
      details: 'Have natural conversations with an AI that detects anxiety, recalls memories, and speaks with a warm, human-like voice. The AI adapts language and cultural references based on which era your loved one is experiencing.'
    },
    {
      id: 'phone',
      title: 'Phone Mode',
      icon: Phone,
      color: 'from-emerald-600 to-teal-700',
      description: 'Realistic dial pad connected to AI companion',
      details: 'Prevents costly nighttime 911 calls by providing a familiar phone interface that connects to the AI instead of emergency services. Gives caregivers peace of mind to sleep knowing calls go to the companion.'
    },
    {
      id: 'security',
      title: 'Security Scanner',
      icon: Shield,
      color: 'from-indigo-600 to-purple-700',
      description: 'AI-controlled security check for anxiety relief',
      details: 'Realistic security interface that never makes real alerts or calls. Purely reassuring visuals to reduce anxiety about locks and safety, helping users feel calm and secure.'
    },
    {
      id: 'night',
      title: 'Night Watch',
      icon: Moon,
      color: 'from-slate-800 to-slate-950',
      description: 'Gentle nighttime companion',
      details: 'Prevents wandering and provides comfort during nighttime hours. Monitors for distress and offers calming responses and redirects.'
    },
    {
      id: 'voice',
      title: 'Always-On Voice',
      icon: Volume2,
      color: 'from-cyan-600 to-blue-700',
      description: 'Hands-free voice control',
      details: 'Say "Hey Mirror" anytime, anywhere to activate. The system listens with a realistic human voice and responds with warmth and emotional connection.'
    },
    {
      id: 'banking',
      title: 'Fake Banking',
      icon: CreditCard,
      color: 'from-green-600 to-emerald-700',
      description: 'Realistic banking interface',
      details: 'Safe, simulated banking experience that never makes real transactions. View account balance, transaction history, and perform fake transfers—perfect for users who want familiar financial interactions without risk.'
    },
    {
      id: 'family',
      title: 'Family Portal',
      icon: Users,
      color: 'from-pink-600 to-rose-600',
      description: 'Share memories and connect',
      details: 'Family members can upload photos, messages, events, and music to share with their loved one. Creates a shared experience and deepens emotional connection.'
    },
    {
      id: 'dashboard',
      title: 'Caregiver Dashboard',
      icon: Brain,
      color: 'from-purple-600 to-pink-600',
      description: 'Monitor wellbeing and insights',
      details: 'Track journal entries, cognitive trends, mood patterns, and anxiety levels. Get alerts for behavioral changes and receive AI-generated insights to improve care.'
    },
    {
      id: 'tv',
      title: 'Smart TV Mode',
      icon: Tv,
      color: 'from-indigo-600 to-blue-700',
      description: 'Large screen experience',
      details: 'Use Memory Mirror on your television for a more immersive experience. Perfect for family gatherings and shared moments.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Complete Feature Tour
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
          Explore all the features that make Memory Mirror your companion
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isExpanded = expandedFeature === feature.id;
          
          return (
            <button
              key={feature.id}
              onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
              className="w-full text-left"
            >
              <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/10 ${isExpanded ? 'ring-2 ring-offset-2 ring-white dark:ring-offset-slate-950' : ''}`}>
                <div className="flex items-start gap-5 justify-between">
                  <div className="flex items-start gap-5 flex-1">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-base md:text-lg text-white/85">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className={`bg-white/20 p-3 rounded-lg mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-white/90 text-base leading-relaxed">
                      {feature.details}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}