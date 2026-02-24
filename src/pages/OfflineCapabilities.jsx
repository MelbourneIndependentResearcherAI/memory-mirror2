import React from 'react';
import { ArrowLeft, Check, X, Download, Music, MessageCircle, Image, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OfflineCapabilitiesPage() {
  const navigate = useNavigate();

  const capabilities = [
    {
      category: 'Communication',
      items: [
        { name: 'Chat Mode', available: true, description: 'Offline-enabled AI conversations' },
        { name: 'Voice Chat', available: true, description: 'Local speech synthesis' },
        { name: 'Messages', available: true, description: 'View stored conversations' }
      ]
    },
    {
      category: 'Media & Entertainment',
      items: [
        { name: 'Music Playback', available: true, description: 'Play downloaded songs' },
        { name: 'Stories', available: true, description: 'Offline story library' },
        { name: 'Games', available: true, description: 'Cognitive games offline' },
        { name: 'Photos & Memories', available: true, description: 'Browse cached memories' }
      ]
    },
    {
      category: 'Features',
      items: [
        { name: 'Night Watch', available: true, description: 'Offline incident logging' },
        { name: 'Reminders', available: true, description: 'Local notification system' },
        { name: 'Settings', available: true, description: 'Configure preferences' },
        { name: 'Language Support', available: true, description: 'Multi-language interface' }
      ]
    },
    {
      category: 'Cloud Features',
      items: [
        { name: 'Cloud Sync', available: false, description: 'Requires internet connection' },
        { name: 'Video Calls', available: false, description: 'Requires internet connection' },
        { name: 'Real-time Updates', available: false, description: 'Requires internet connection' },
        { name: 'Live Media Upload', available: false, description: 'Requires internet connection' }
      ]
    }
  ];

  const storageBreakdown = [
    { name: 'Audio Files', size: '1.2 GB', percentage: 50 },
    { name: 'Photos & Media', size: '0.8 GB', percentage: 33 },
    { name: 'Application Data', size: '0.3 GB', percentage: 12 },
    { name: 'Cache', size: '0.1 GB', percentage: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-6 pb-16">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Download className="w-10 h-10 text-blue-400" />
            Offline Capabilities
          </h1>
          <p className="text-slate-400 text-lg">
            Complete feature availability in offline mode
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {capabilities.map((section, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all">
                    <div className="mt-1">
                      {item.available ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${item.available ? 'text-white' : 'text-slate-400'}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.available 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {item.available ? 'Available' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-blue-400" />
            Storage Breakdown
          </h2>
          <div className="space-y-4">
            {storageBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-end gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-slate-400">{item.size}</p>
                  </div>
                  <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-slate-400 w-12 text-right">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Getting Started with Offline Mode</h3>
          <ol className="space-y-4 text-slate-300">
            <li className="flex gap-4">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Download audio and media content through the Audio Library</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Sync all data and create a backup before losing connection</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Check offline status to verify all features are ready</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Use the app normally - all core features work without internet</span>
            </li>
            <li className="flex gap-4">
              <span className="text-blue-400 font-bold">5.</span>
              <span>When back online, data syncs automatically to the cloud</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}