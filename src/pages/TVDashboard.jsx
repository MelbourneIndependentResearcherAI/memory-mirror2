import React from 'react';
import { ArrowLeft, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TVDashboardPage() {
  const navigate = useNavigate();

  const tvOptions = [
    { id: 1, title: 'TV Mode', icon: '📺', description: 'Large-screen chat and photo gallery', path: '/TVMode', background: '#1E293B' },
    { id: 2, title: 'TV Pairing', icon: '🔗', description: 'Pair your television device', path: '/TVPairing', background: '#312E81' },
    { id: 3, title: 'Photo Gallery', icon: '🖼️', description: 'View family photos on big screen', path: '/TVMode', background: '#1F2937' },
    { id: 4, title: 'Music Therapy', icon: '🎵', description: 'Play curated music playlists', path: '/MusicPlayer', background: '#7C2D12' },
    { id: 5, title: 'Stories & Memories', icon: '📖', description: 'View stories on television', path: '/FamilyStories', background: '#164E63' },
    { id: 6, title: 'TV Settings', icon: '⚙️', description: 'Configure TV display options', path: '/TVPairing', background: '#292524' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pb-16">
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
            <Tv className="w-12 h-12 text-blue-400" />
            Smart TV Dashboard
          </h1>
          <p className="text-xl text-slate-400">
            Manage your large-screen experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tvOptions.map(option => (
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

        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About TV Mode</h2>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Extra-large text for comfortable viewing on television screens</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Voice-controlled interface - just say "Hey Mirror"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Family photo gallery optimized for big screens</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Music therapy sessions with curated playlists</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Full-screen experiences with minimal distractions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}