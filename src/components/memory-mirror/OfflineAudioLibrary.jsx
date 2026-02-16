import React, { useState, useEffect } from 'react';
import { Download, Trash2, Play, Pause, Music, BookOpen, Heart, HardDrive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  downloadAudioForOffline,
  getOfflineAudioLibrary,
  removeOfflineAudio,
  getOfflineAudioBlob,
  getOfflineStorageUsage
} from '../utils/offlineManager';

export default function OfflineAudioLibrary() {
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [playingId, setPlayingId] = useState(null);
  const [libraryItems, setLibraryItems] = useState([]);
  const [storageUsage, setStorageUsage] = useState({ total_items: 0, total_size_mb: 0 });
  const [activeTab, setActiveTab] = useState('all'); // all, music, stories, messages

  // Fetch available audio items
  const { data: availableAudio = [] } = useQuery({
    queryKey: ['availableAudio'],
    queryFn: async () => {
      const [music, stories, messages] = await Promise.all([
        base44.entities.Music.list('-created_date', 50),
        base44.entities.Story.list('-created_date', 50),
        base44.entities.FamilyMessage.list('-created_date', 50)
      ]);

      return [
        ...music.map(m => ({ ...m, type: 'music', entity_id: m.id })),
        ...stories.map(s => ({ ...s, type: 'story', entity_id: s.id })),
        ...messages.map(m => ({ ...m, type: 'message', entity_id: m.id }))
      ].filter(item => item.audio_url || item.youtube_url);
    }
  });

  // Load offline library
  useEffect(() => {
    loadOfflineLibrary();
  }, []);

  const loadOfflineLibrary = async () => {
    const items = await getOfflineAudioLibrary();
    const usage = await getOfflineStorageUsage();
    setLibraryItems(items);
    setStorageUsage(usage);
  };

  const isDownloaded = (audioId) => {
    return libraryItems.some(item => item.id === audioId);
  };

  const handleDownload = async (audioItem) => {
    setDownloadingIds(prev => new Set([...prev, audioItem.id]));
    
    try {
      await downloadAudioForOffline({
        id: audioItem.id,
        title: audioItem.title || audioItem.name || 'Unknown',
        type: audioItem.type,
        audio_url: audioItem.audio_url,
        metadata: {
          entity_id: audioItem.entity_id,
          artist: audioItem.artist,
          era: audioItem.era
        }
      });

      await loadOfflineLibrary();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download audio. Please try again.');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioItem.id);
        return newSet;
      });
    }
  };

  const handlePlay = async (audioId) => {
    if (playingId === audioId) {
      setPlayingId(null);
      return;
    }

    const audioData = await getOfflineAudioBlob(audioId);
    if (audioData) {
      const audio = new Audio(audioData.url);
      audio.play();
      setPlayingId(audioId);

      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        setPlayingId(null);
        alert('Failed to play audio');
      };
    }
  };

  const handleRemove = async (audioId) => {
    if (confirm('Remove this audio from offline library?')) {
      try {
        await removeOfflineAudio(audioId);
        await loadOfflineLibrary();
      } catch (error) {
        console.error('Failed to remove audio:', error);
        alert('Failed to remove audio.');
      }
    }
  };

  const typeIcons = {
    music: <Music className="w-5 h-5 text-blue-500" />,
    story: <BookOpen className="w-5 h-5 text-purple-500" />,
    message: <Heart className="w-5 h-5 text-pink-500" />
  };

  const filteredAudio = availableAudio.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Storage Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl p-6 border-2 border-blue-300 dark:border-blue-700"
      >
        <div className="flex items-center gap-3 mb-3">
          <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Offline Audio Library</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Download your favorite music, stories, and voice messages to listen offline.
        </p>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Downloaded Items</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{storageUsage.total_items}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Storage Used</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{storageUsage.total_size_mb} MB</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-300 dark:border-slate-700">
        {[
          { label: 'All', value: 'all' },
          { label: 'Music', value: 'music' },
          { label: 'Stories', value: 'story' },
          { label: 'Messages', value: 'message' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audio Items Grid */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAudio.map(audio => {
            const downloaded = isDownloaded(audio.id);
            const isDownloading = downloadingIds.has(audio.id);
            const isPlaying = playingId === audio.id;

            return (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {typeIcons[audio.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {audio.title || audio.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {audio.artist || audio.sender_name || audio.era || 'Unknown'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {downloaded && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlay(audio.id)}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </Button>
                    )}

                    {downloaded ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemove(audio.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900"
                        title="Remove from offline"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDownload(audio)}
                        disabled={isDownloading}
                        className="gap-2 min-h-[40px] bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAudio.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No {activeTab !== 'all' ? activeTab : 'audio'} items available</p>
          </div>
        )}
      </div>
    </div>
  );
}