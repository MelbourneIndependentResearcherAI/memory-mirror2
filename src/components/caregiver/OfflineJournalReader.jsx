import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Lightbulb } from 'lucide-react';
import { offlineDataCache } from '@/components/utils/offlineDataCache';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';

export default function OfflineJournalReader({ onBack }) {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();

    const unsubscribe = offlineSyncManager.onSyncStatusChange((status) => {
      if (status.type === 'online') {
        setIsOffline(false);
        loadJournals();
      } else if (status.type === 'offline') {
        setIsOffline(true);
      }
    });

    return unsubscribe;
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const cached = await offlineDataCache.getCachedJournals(100);
      setJournals(cached);
      setFilteredJournals(cached);
    } catch (error) {
      console.error('Failed to load journals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJournals(journals);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = journals.filter(journal =>
      journal.title?.toLowerCase().includes(term) ||
      journal.notes?.toLowerCase().includes(term) ||
      journal.mood_observed?.toLowerCase().includes(term)
    );
    setFilteredJournals(filtered);
  }, [searchTerm, journals]);

  if (selectedJournal) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedJournal(null)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Journal List
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {selectedJournal.title}
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(selectedJournal.entry_date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {selectedJournal.mood_observed && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Lightbulb className="w-5 h-5" />
                <span className="capitalize">
                  Mood: {selectedJournal.mood_observed.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedJournal.notes}
            </p>
          </div>

          {selectedJournal.activities && selectedJournal.activities.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">
                Activities
              </h4>
              <ul className="space-y-2">
                {selectedJournal.activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedJournal.sync_status === 'pending' && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⏳ This entry will sync to the cloud when you're back online
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
          📖 Journal Entries
        </h2>
        {isOffline && (
          <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              📱 Offline - Viewing cached entries
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search entries by title, mood, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading entries...</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {searchTerm ? 'No entries match your search' : 'No journal entries yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJournals.map((journal) => (
            <button
              key={journal.id}
              onClick={() => setSelectedJournal(journal)}
              className="text-left p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex-1">
                  {journal.title}
                </h3>
                {journal.sync_status === 'pending' && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(journal.entry_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {journal.mood_observed && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="capitalize">
                      {journal.mood_observed.replace('_', ' ')}
                    </span>
                  </p>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                {journal.notes}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}