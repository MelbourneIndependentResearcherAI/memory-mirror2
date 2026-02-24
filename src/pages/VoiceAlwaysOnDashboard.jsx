import React from 'react';
import { ArrowLeft, Mic, Headphones, Settings, BarChart3, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VoiceAlwaysOnDashboardPage() {
  const navigate = useNavigate();

  const voiceOptions = [
    { id: 1, title: 'Always-On Voice', icon: '🎤', description: 'Activate continuous voice listening', path: '/VoiceSetup', background: '#1E3A8A' },
    { id: 2, title: 'Voice Commands', icon: '🗣️', description: 'Set up and manage voice commands', path: '/VoiceSetup', background: '#5B21B6' },
    { id: 3, title: 'Audio Library', icon: '🎵', description: 'Download audio for offline use', path: '/OfflineAudio', background: '#0E7490' },
    { id: 4, title: 'Voice Profiles', icon: '👤', description: 'Manage voice recognition profiles', path: '/VoiceCloning', background: '#7C2D12' },
    { id: 5, title: 'Usage Analytics', icon: '📊', description: 'Track voice interactions and patterns', path: '/InsightsAnalytics', background: '#164E63' },
    { id: 6, title: 'Settings & Preferences', icon: '⚙️', description: 'Configure voice system settings', path: '/VoiceSetup', background: '#1F2937' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Mic className="w-12 h-12 text-blue-400" />
            Voice Always-On Dashboard
          </h1>
          <p className="text-xl text-slate-400">
            Hands-free voice interaction and control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voiceOptions.map(option => (
            <button
              key={option.id}
              onClick={() => navigate(option.path)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105 border border-slate-700 hover:border-blue-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-blue-500" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4">{option.icon}</div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {option.title}
                </h3>
                <p className="text-slate-400 mt-3 text-lg">
                  {option.description}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300" />
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-blue-400" />
            About Always-On Voice
          </h2>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Always listening for the wake word "Hey Mirror"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Hands-free voice interaction with AI companion</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Voice-controlled smart home automation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Customizable voice commands and responses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Offline audio mode for continuous protection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Battery optimization and power management</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Privacy-focused with on-device processing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Detailed usage analytics and insights</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Zap className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Always Active</h3>
            <p className="text-slate-400">Listens 24/7 without manual activation</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Privacy Protected</h3>
            <p className="text-slate-400">Secure processing with encrypted data</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Smart Learning</h3>
            <p className="text-slate-400">Learns preferences and patterns over time</p>
          </div>
        </div>
      </div>
    </div>
  );
}