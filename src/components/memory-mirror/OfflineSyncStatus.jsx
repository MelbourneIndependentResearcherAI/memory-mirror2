import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff, Clock } from 'lucide-react';
import { syncQueue } from '@/components/utils/offlineSyncQueue';

export default function OfflineSyncStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    queueLength: 0,
    isSyncing: false,
    lastSyncTime: null,
    failedCount: 0
  });

  useEffect(() => {
    const updateStatus = (queueStatus) => {
      setStatus(prev => ({
        ...prev,
        queueLength: queueStatus.queueLength,
        isSyncing: queueStatus.isSyncing,
        lastSyncTime: queueStatus.lastSyncTime,
        failedCount: queueStatus.failedCount
      }));
    };

    const unsubscribe = syncQueue.subscribe(updateStatus);

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (status.isOnline && status.queueLength === 0 && !status.isSyncing) {
    return null;
  }

  const handleSync = async () => {
    await syncQueue.processQueue();
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40">
      <div className={`rounded-lg shadow-lg border-l-4 p-4 ${
        status.isOnline 
          ? status.isSyncing 
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' 
            : 'bg-green-50 dark:bg-green-900/30 border-green-500'
          : 'bg-amber-50 dark:bg-amber-900/30 border-amber-500'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            {!status.isOnline ? (
              <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : status.isSyncing ? (
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${
              !status.isOnline
                ? 'text-amber-900 dark:text-amber-200'
                : status.isSyncing
                ? 'text-blue-900 dark:text-blue-200'
                : 'text-green-900 dark:text-green-200'
            }`}>
              {!status.isOnline ? 'Offline Mode' : status.isSyncing ? 'Syncing Changes...' : 'All Changes Synced'}
            </h3>

            {status.queueLength > 0 && (
              <p className={`text-xs mt-1 ${
                !status.isOnline
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {status.queueLength} change{status.queueLength !== 1 ? 's' : ''} waiting to sync
              </p>
            )}

            {status.failedCount > 0 && (
              <p className="text-xs mt-1 text-red-700 dark:text-red-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {status.failedCount} failed sync{status.failedCount !== 1 ? 'es' : ''}
              </p>
            )}

            {status.lastSyncTime && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                !status.isOnline
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-green-600 dark:text-green-300'
              }`}>
                <Clock className="w-3 h-3" />
                Last synced: {new Date(status.lastSyncTime).toLocaleTimeString('en-AU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>

          {status.isOnline && status.queueLength > 0 && !status.isSyncing && (
            <button
              onClick={handleSync}
              className="flex-shrink-0 ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              Sync
            </button>
          )}
        </div>
      </div>
    </div>
  );
}