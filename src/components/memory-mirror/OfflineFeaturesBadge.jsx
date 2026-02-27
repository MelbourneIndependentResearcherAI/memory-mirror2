import React, { useState } from 'react';
import { WifiOff, BarChart3, X } from 'lucide-react';

export default function OfflineFeaturesBadge() {
  const [showTooltip, setShowTooltip] = useState(false);
  const isOnline = navigator.onLine;

  if (isOnline) {
    return null;
  }

  const offlineFeatures = [
    { icon: '💬', name: 'Basic AI Chat', desc: 'Limited responses' },
    { icon: '🎵', name: 'Music Library', desc: 'Downloaded songs' },
    { icon: '📖', name: 'Stories', desc: 'Stored narratives' },
    { icon: '📸', name: 'Photos', desc: 'Saved memories' },
    { icon: '📝', name: 'Journal', desc: 'Read/write entries' },
    { icon: '🧠', name: 'Games', desc: 'Memory exercises' }
  ];

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors min-h-[44px]"
        >
          <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Offline</span>
        </button>

        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-72 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Available Offline
              </h3>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {offlineFeatures.map(feature => (
                <div
                  key={feature.name}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">{feature.icon}</div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {feature.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-200">
                💡 <strong>Tip:</strong> Your changes are saved locally and will sync automatically once you're back online.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}