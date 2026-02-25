import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { offlineDataCache } from '@/components/utils/offlineDataCache';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';

export default function OfflineMemoryViewer({ onBack }) {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedEra, setSelectedEra] = useState('all');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  const themes = [
    'all',
    'family',
    'friendship',
    'nature',
    'adventure',
    'comfort',
    'childhood',
    'holidays'
  ];

  const eras = ['all', '1940s', '1960s', '1980s', 'present'];

  useEffect(() => {
    loadMemories();

    const unsubscribe = offlineSyncManager.onSyncStatusChange((status) => {
      if (status.type === 'online') {
        setIsOffline(false);
        loadMemories();
      } else if (status.type === 'offline') {
        setIsOffline(true);
      }
    });

    return unsubscribe;
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const cached = await offlineDataCache.getCachedMemories(100);
      setMemories(cached);
      applyFilters(cached, selectedTheme, selectedEra);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (mems, theme, era) => {
    let filtered = mems;

    if (theme !== 'all') {
      filtered = filtered.filter(m => m.theme === theme);
    }

    if (era !== 'all') {
      filtered = filtered.filter(m => m.era === era);
    }

    setFilteredMemories(filtered);
  };

  const handleThemeFilter = (theme) => {
    setSelectedTheme(theme);
    applyFilters(memories, theme, selectedEra);
  };

  const handleEraFilter = (era) => {
    setSelectedEra(era);
    applyFilters(memories, selectedTheme, era);
  };

  if (selectedMemory) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedMemory(null)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Memories
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {selectedMemory.title}
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(selectedMemory.created_date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {selectedMemory.theme && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Tag className="w-5 h-5" />
                <span className="capitalize">Theme: {selectedMemory.theme.replace('_', ' ')}</span>
              </div>
            )}

            {selectedMemory.era && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-5 h-5" />
                <span>Era: {selectedMemory.era}</span>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
              {selectedMemory.content}
            </p>
          </div>

          {selectedMemory.sync_status === 'pending' && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⏳ This memory will sync to the cloud when you're back online
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          ✨ Memories
        </h2>
        {isOffline && (
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              📱 Offline Mode
            </p>
          </div>
        )}
      </div>

      {/* Theme Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter by Theme
        </label>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeFilter(theme)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTheme === theme
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {theme === 'all' ? '📚 All' : theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Era Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter by Era
        </label>
        <div className="flex flex-wrap gap-2">
          {eras.map((era) => (
            <button
              key={era}
              onClick={() => handleEraFilter(era)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedEra === era
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {era === 'all' ? '📅 All' : era}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading memories...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No memories found with selected filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMemories.map((memory) => (
            <button
              key={memory.id}
              onClick={() => setSelectedMemory(memory)}
              className="text-left p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex-1">
                  {memory.title}
                </h3>
                {memory.sync_status === 'pending' && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3">
                {memory.theme && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Theme:</span> {memory.theme.replace('_', ' ')}
                  </p>
                )}
                {memory.era && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Era:</span> {memory.era}
                  </p>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                {memory.content}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}