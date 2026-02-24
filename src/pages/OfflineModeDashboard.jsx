import React from 'react';
import { ArrowLeft, Wifi, WifiOff, HardDrive, Download, RefreshCw, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OfflineModeDashboardPage() {
  const navigate = useNavigate();

  const offlineOptions = [
    { id: 1, title: 'Audio Library', icon: '🎵', description: 'Download audio for offline access', path: '/OfflineAudio', background: '#1E40AF' },
    { id: 2, title: 'Content Manager', icon: '📦', description: 'Manage offline content and media', path: '/OfflineContent', background: '#7C2D12' },
    { id: 3, title: 'Sync & Backup', icon: '🔄', description: 'Sync data and backup to cloud', path: '/SyncBackup', background: '#0E7490' },
    { id: 4, title: 'Offline Status', icon: '📊', description: 'Monitor offline capabilities', path: '/OfflineTest', background: '#6D28D9' },
    { id: 5, title: 'Storage Info', icon: '💾', description: 'Check storage usage and limits', path: '/OfflineContent', background: '#059669' },
    { id: 6, title: 'Health Check', icon: '⚕️', description: 'Verify offline system health', path: '/OfflineTest', background: '#DC2626' }
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
            <WifiOff className="w-12 h-12 text-blue-400" />
            Offline Mode Dashboard
          </h1>
          <p className="text-xl text-slate-400">
            Stay connected even without internet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {offlineOptions.map(option => (
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

        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Offline Mode Features
          </h2>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Full app functionality without internet connection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Pre-downloaded audio and content libraries</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Continuous chat and conversation support</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Music playback from local storage</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Memory and photo access offline</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Automatic sync when connection restored</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Local data encryption and security</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Smart storage management and cleanup</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <HardDrive className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Storage</h3>
            <p className="text-slate-400">2.4 GB / 5 GB used</p>
            <div className="mt-4 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-yellow-400 h-full" style={{ width: '48%' }}></div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Download className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Downloaded</h3>
            <p className="text-slate-400">847 items cached</p>
            <p className="text-xs text-slate-500 mt-2">Last synced: 2 hours ago</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Wifi className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Status</h3>
            <p className="text-green-400">Currently Online</p>
            <p className="text-xs text-slate-500 mt-2">Ready for offline use</p>
          </div>
        </div>
      </div>
    </div>
  );
}