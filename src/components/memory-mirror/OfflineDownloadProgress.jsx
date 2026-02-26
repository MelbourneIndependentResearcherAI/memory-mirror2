import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, X, Wifi, WifiOff, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * OfflineDownloadProgress - Real-time status bar for offline content download
 * Downloads to IndexedDB in the browser (not device storage)
 * Shows progress for Stories, Music, AI Responses, and Exercises
 */
export default function OfflineDownloadProgress({ onComplete, autoStart = false }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [downloadStats, setDownloadStats] = useState({
    aiResponses: { current: 0, total: 0 },
    stories: { current: 0, total: 0 },
    music: { current: 0, total: 0 },
    exercises: { current: 0, total: 0 },
    entities: { current: 0, total: 0 }
  });
  const [isComplete, setIsComplete] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState(0);

  useEffect(() => {
    if (autoStart) {
      startDownload();
    }
  }, [autoStart]);

  const startDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    setIsComplete(false);

    try {
      // Import the preloader
      const { default: preloadEssentialData } = await import('../utils/offlinePreloader');
      
      // Override console.log temporarily to capture progress
      const originalLog = console.log;
      let itemsDone = 0;
      const totalItems = 250 + 20 + 40 + 25; // AI responses + stories + music + exercises = 335 items
      
      console.log = (...args) => {
        originalLog(...args);
        const message = args.join(' ');
        
        // Parse progress from log messages
        if (message.includes('Cached') && message.includes('AI responses')) {
          const count = parseInt(message.match(/(\d+)/)?.[0] || 0);
          setDownloadStats(prev => ({ ...prev, aiResponses: { current: count, total: 250 } }));
          setCurrentItem('AI Response Library');
          itemsDone += count;
          setProgress((itemsDone / totalItems) * 100);
          setDownloadedSize(prev => prev + (count * 200)); // ~200 bytes per response
        } else if (message.includes('Cached') && message.includes('stories')) {
          const count = parseInt(message.match(/(\d+)/)?.[0] || 0);
          setDownloadStats(prev => ({ ...prev, stories: { current: count, total: 20 } }));
          setCurrentItem('Story Library');
          itemsDone += count;
          setProgress((itemsDone / totalItems) * 100);
          setDownloadedSize(prev => prev + (count * 1500)); // ~1.5KB per story
        } else if (message.includes('Cached') && message.includes('songs')) {
          const count = parseInt(message.match(/(\d+)/)?.[0] || 0);
          setDownloadStats(prev => ({ ...prev, music: { current: count, total: 40 } }));
          setCurrentItem('Music Library');
          itemsDone += count;
          setProgress((itemsDone / totalItems) * 100);
          setDownloadedSize(prev => prev + (count * 500)); // ~500 bytes per song metadata
        } else if (message.includes('Cached') && message.includes('interactive exercises')) {
          const count = parseInt(message.match(/(\d+)/)?.[0] || 0);
          setDownloadStats(prev => ({ ...prev, exercises: { current: count, total: 25 } }));
          setCurrentItem('Memory Exercises');
          itemsDone += count;
          setProgress((itemsDone / totalItems) * 100);
          setDownloadedSize(prev => prev + (count * 800)); // ~800 bytes per exercise
        } else if (message.includes('Cached') && message.includes('records')) {
          const match = message.match(/(\d+)\s+(\w+)\s+records/);
          if (match) {
            const count = parseInt(match[1]);
            const entity = match[2];
            setDownloadStats(prev => ({
              ...prev,
              entities: { current: (prev.entities.current || 0) + count, total: 100 }
            }));
            setCurrentItem(`${entity} Data`);
            setDownloadedSize(prev => prev + (count * 1000)); // ~1KB per entity record
          }
        }
      };

      // Calculate total expected size
      setTotalSize((250 * 200) + (20 * 1500) + (40 * 500) + (25 * 800)); // ~135KB

      // Execute the preload
      await preloadEssentialData();

      // Restore console.log
      console.log = originalLog;

      setProgress(100);
      setIsComplete(true);
      setCurrentItem('Download Complete');

      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    } catch (error) {
      console.error('Download failed:', error);
      setCurrentItem('Download Failed');
      setIsDownloading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isDownloading && !isComplete) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Offline Mode Available
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Download 335+ items for full offline access:<br />
              <span className="font-semibold">250 AI Responses • 20 Stories • 40 Songs • 25 Exercises</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              💾 Downloads to browser storage (IndexedDB) - ~135KB total
            </p>
            <Button onClick={startDownload} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Download className="w-4 h-4" />
              Start Offline Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <Card className={`shadow-2xl border-2 ${
          isComplete 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700' 
            : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 border-blue-300 dark:border-blue-700'
        }`}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-bounce" />
                )}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {isComplete ? 'Offline Ready!' : 'Downloading Offline Content'}
                </h3>
              </div>
              {isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDownloading(false)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-4">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {Math.round(progress)}% Complete
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {formatBytes(downloadedSize)} / {formatBytes(totalSize)}
                </span>
              </div>
            </div>

            {/* Current Item */}
            {!isComplete && currentItem && (
              <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Downloading:</span> {currentItem}
                </p>
              </div>
            )}

            {/* Detailed Progress */}
            <div className="space-y-2">
              {/* AI Responses */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <WifiOff className="w-3 h-3" />
                  AI Response Library
                </span>
                <span className={`font-semibold ${
                  downloadStats.aiResponses.current === downloadStats.aiResponses.total && downloadStats.aiResponses.total > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {downloadStats.aiResponses.current} / 250
                </span>
              </div>

              {/* Stories */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">📖 Story Library</span>
                <span className={`font-semibold ${
                  downloadStats.stories.current === downloadStats.stories.total && downloadStats.stories.total > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {downloadStats.stories.current} / 20
                </span>
              </div>

              {/* Music */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">🎵 Music Library</span>
                <span className={`font-semibold ${
                  downloadStats.music.current === downloadStats.music.total && downloadStats.music.total > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {downloadStats.music.current} / 40
                </span>
              </div>

              {/* Exercises */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">🧠 Memory Exercises</span>
                <span className={`font-semibold ${
                  downloadStats.exercises.current === downloadStats.exercises.total && downloadStats.exercises.total > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {downloadStats.exercises.current} / 25
                </span>
              </div>

              {/* Entities */}
              {downloadStats.entities.current > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">📊 Personal Data</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {downloadStats.entities.current} items
                  </span>
                </div>
              )}
            </div>

            {/* Storage Info */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <HardDrive className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Storage Location: Browser IndexedDB</p>
                  <p className="leading-relaxed">
                    Data is stored locally in your browser's IndexedDB database. 
                    Not saved to device file system. Persists across sessions but cleared if browser data is cleared.
                  </p>
                </div>
              </div>
            </div>

            {/* Completion Message */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <p className="font-bold text-green-900 dark:text-green-300">
                    Offline Mode Ready!
                  </p>
                </div>
                <p className="text-sm text-green-800 dark:text-green-400">
                  335+ items downloaded to IndexedDB<br />
                  Total size: {formatBytes(totalSize)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-green-700 dark:text-green-500">
                  <WifiOff className="w-4 h-4" />
                  <span>Works fully offline now</span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!isComplete && isDownloading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Wifi className="w-4 h-4" />
                <span>Downloading from server...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}