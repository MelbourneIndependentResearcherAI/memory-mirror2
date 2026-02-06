import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Shield, Heart, Brain, Volume2, Mic, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const features = [
  {
    icon: MessageCircle,
    title: 'Compassionate Chat',
    description: 'AI companion that meets people with dementia where they are mentally, never correcting or reorienting.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Phone,
    title: 'Safe Emergency Phone',
    description: 'Familiar phone interface that redirects to AI operator, validating concerns while providing reassurance.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Shield,
    title: 'Security Monitor',
    description: 'Professional security dashboard that addresses paranoia with real-time monitoring reassurance.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Volume2,
    title: 'Natural Voice',
    description: 'Realistic, human-like AI voice responses that sound warm and familiar.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: Mic,
    title: 'Wake Word',
    description: 'Hands-free activation - just say "Memory Mirror" to start a conversation.',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    icon: Brain,
    title: 'Anxiety Detection',
    description: 'Proactively detects distress and redirects to calming topics and safe memories.',
    color: 'bg-teal-100 text-teal-600'
  }
];

const howItWorks = [
  {
    step: 1,
    title: 'Choose Your Mode',
    description: 'Select Chat for conversation, Phone for emergencies, or Security for home monitoring.'
  },
  {
    step: 2,
    title: 'Interact Naturally',
    description: 'Speak or type - the AI adapts to the person\'s mental time period and emotional state.'
  },
  {
    step: 3,
    title: 'Get Reassurance',
    description: 'Receive validation, comfort, and redirection to positive memories when anxiety is detected.'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
              <Heart className="w-4 h-4" />
              Compassionate AI for Dementia Care
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Memory Mirror</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your companion, meeting you where you are — reducing anxiety and providing comfort through AI-powered conversation, security, and emergency support.
            </p>
            <Link to={createPageUrl('Home')}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-full shadow-xl">
                Start Using Memory Mirror
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How Memory Mirror Helps</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Three specialized modes designed to provide comfort, safety, and companionship for people living with dementia.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Simple, intuitive, and designed for ease of use</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Dementia Care</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Memory Mirror never corrects or reality-orients. Instead, it validates emotions, detects anxiety triggers, and gently redirects to safe, comforting topics. The AI adapts to each person's mental time period, whether they're in the 1940s or present day.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white/20 px-6 py-3 rounded-full">✓ Anxiety Detection</div>
            <div className="bg-white/20 px-6 py-3 rounded-full">✓ Era-Adaptive Responses</div>
            <div className="bg-white/20 px-6 py-3 rounded-full">✓ Voice Activation</div>
            <div className="bg-white/20 px-6 py-3 rounded-full">✓ 24/7 Companionship</div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Experience compassionate AI companionship designed specifically for dementia care.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-full shadow-xl">
              Launch Memory Mirror
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>Memory Mirror — Compassionate AI companion for dementia care</p>
      </div>
    </div>
  );
}