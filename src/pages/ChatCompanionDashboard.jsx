import React from 'react';
import { ArrowLeft, MessageCircle, Heart, Music, BookOpen, Gamepad2, Languages, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatCompanionDashboardPage() {
  const navigate = useNavigate();

  const chatOptions = [
    { id: 1, title: 'Chat Mode', icon: '💬', description: 'Start conversation with AI companion', path: '/ChatMode', background: '#1E40AF' },
    { id: 2, title: 'Personal Care', icon: '❤️', description: 'Personalized companionship features', path: '/ChatMode', background: '#BE185D' },
    { id: 3, title: 'Music & Stories', icon: '🎵', description: 'Play music and listen to stories', path: '/MusicPlayer', background: '#6D28D9' },
    { id: 4, title: 'Memory Recall', icon: '📸', description: 'View and discuss family memories', path: '/PhotoLibrary', background: '#0891B2' },
    { id: 5, title: 'Memory Games', icon: '🎮', description: 'Interactive cognitive games', path: '/MemoryGames', background: '#D97706' },
    { id: 6, title: 'Conversation Analytics', icon: '📊', description: 'Track emotional patterns and insights', path: '/InsightsAnalytics', background: '#059669' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 pb-16">
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
            <MessageCircle className="w-12 h-12 text-blue-400" />
            Chat Companion Dashboard
          </h1>
          <p className="text-xl text-slate-400">
            Engaging conversation and emotional support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatOptions.map(option => (
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

        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-400" />
            About Chat Companion
          </h2>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>AI companion for meaningful conversations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Personalized responses based on life experiences and memories</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Era-aware communication - adapts to mental time period</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Multi-language support for natural communication</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Music therapy and storytelling features</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Cognitive games to stimulate memory and thinking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Anxiety detection and compassionate responses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Family memory integration and smart recall</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}