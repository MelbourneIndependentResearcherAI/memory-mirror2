import React, { useState, useEffect } from 'react';
import { Cloud, HardDrive, CheckCircle2, AlertCircle, Loader2, RotateCw, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSyncMetadata,
  syncToCloud,
  setAutoSyncEnabled
} from '../utils/syncManager';
import { getOfflineStorageUsage } from '../utils/offlineManager';
import { isOnline } from '../utils/offlineManager';
import { downloadManager } from '../utils/offlineDownloadManager';

export default function SyncBackupManager() {
  const [metadata, setMetadata] = useState(getSyncMetadata());
  const [storageUsage, setStorageUsage] = useState({ total_size_mb: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncSummary, setSyncSummary] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState('');

  useEffect(() => {
    loadStorageInfo();
    const interval = setInterval(() => {
      setMetadata(getSyncMetadata());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStorageInfo = async () => {
    const usage = await getOfflineStorageUsage();
    setStorageUsage(usage);
  };

  const handleSync = async () => {
    if (!isOnline()) {
      setSyncMessage('No internet connection');
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Starting sync...');
    setSyncSummary(null);

    await syncToCloud((progress) => {
      setSyncMessage(progress.message);
      if (progress.summary) {
        setSyncSummary(progress.summary);
      }
      setMetadata(getSyncMetadata());
    });

    setIsSyncing(false);
  };

  const handleToggleAutoSync = () => {
    const newState = !metadata.auto_sync_enabled;
    setAutoSyncEnabled(newState);
    setMetadata(getSyncMetadata());
  };

  const handleDownloadOfflineData = async () => {
    setIsDownloading(true);
    setDownloadMessage('Initializing download...');
    setDownloadProgress(0);

    try {
      const unsubscribe = downloadManager.subscribe((progress) => {
        setDownloadProgress(progress.current);
        setDownloadMessage(progress.currentItem || 'Downloading...');
      });

      const result = await downloadManager.startFullDownload();
      
      unsubscribe();
      
      if (result.success) {
        setDownloadMessage('✓ Download complete! Data is ready offline.');
      } else {
        setDownloadMessage('Download completed with some warnings.');
      }
    } catch (error) {
      setDownloadMessage(`Error: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const getSyncStatusColor = () => {
    switch (metadata.sync_status) {
      case 'synced':
        return 'text-green-600 dark:text-green-400';
      case 'syncing':
        return 'text-blue-600 dark:text-blue-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getSyncStatusIcon = () => {
    switch (metadata.sync_status) {
      case 'synced':
        return <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'syncing':
        return <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <Cloud className="w-6 h-6 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-2xl p-6 border-2 border-blue-300 dark:border-blue-700"
      >
        <div className="flex items-start gap-4">
          {getSyncStatusIcon()}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sync & Backup
            </h2>
            <p className={`text-lg font-semibold ${getSyncStatusColor()}`}>
              {metadata.sync_status === 'synced' && 'All data synced to cloud'}
              {metadata.sync_status === 'syncing' && 'Syncing in progress...'}
              {metadata.sync_status === 'error' && 'Sync error occurred'}
              {metadata.sync_status === 'idle' && 'Ready to sync'}
            </p>
            {syncMessage && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{syncMessage}</p>
            )}
          </div>
        </div>

        {/* Sync Details */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Sync</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {formatDate(metadata.last_sync)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Items Synced</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {metadata.total_items_synced}
            </p>
          </div>
        </div>

        {/* Sync Summary */}
        <AnimatePresence>
          {syncSummary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 space-y-2 text-sm"
            >
              <p className="text-slate-700 dark:text-slate-300">
                ✓ {syncSummary.conversations_synced || 0} conversations synced
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                ✓ {syncSummary.audio_library_synced || 0} audio items synced
              </p>
              {syncSummary.settings_synced && (
                <p className="text-slate-700 dark:text-slate-300">
                  ✓ Settings backed up
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Storage Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Storage Usage</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-700 dark:text-slate-300">Offline Audio Library</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {storageUsage.total_size_mb} MB ({storageUsage.total_items} items)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((storageUsage.total_size_mb / 500) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Up to 500 MB recommended for offline use
            </p>
          </div>
        </div>
      </motion.div>

      {/* Auto-Sync Setting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Automatic Sync</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Auto-sync when internet connection returns
              </p>
            </div>
          </div>
          <Button
            variant={metadata.auto_sync_enabled ? 'default' : 'outline'}
            onClick={handleToggleAutoSync}
            className="min-h-[40px]"
          >
            {metadata.auto_sync_enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Download for Offline Use</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Download all essential content to use the app without internet connection.
        </p>
        {isDownloading && (
          <div className="mb-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(downloadProgress / 335) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{downloadMessage}</p>
          </div>
        )}
        <Button
          onClick={handleDownloadOfflineData}
          disabled={isDownloading}
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white min-h-[50px] text-lg"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Downloading... {Math.round((downloadProgress / 335) * 100)}%
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Now
            </>
          )}
        </Button>
        {!isDownloading && downloadMessage && (
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">{downloadMessage}</p>
        )}
      </motion.div>

      {/* Manual Sync Button */}
      <Button
        onClick={handleSync}
        disabled={isSyncing || !isOnline()}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white min-h-[50px] text-lg"
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RotateCw className="w-5 h-5" />
            {isOnline() ? 'Sync Now' : 'No Connection'}
          </>
        )}
      </Button>

      {!isOnline() && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You're offline. Sync will start automatically when you reconnect to the internet.
          </p>
        </div>
      )}
    </div>
  );
}