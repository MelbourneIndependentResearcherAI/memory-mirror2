import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';
import { checkStorageQuota } from '@/components/utils/serviceWorkerRegister';

export default function OfflineStatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Update online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus({ type: 'syncing', message: 'Syncing data...' });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync status
    const unsubscribe = offlineSyncManager.onSyncStatusChange((status) => {
      if (status.type === 'sync_complete') {
        setSyncStatus({ type: 'success', message: `Synced ${status.itemsCount} items` });
        setTimeout(() => setSyncStatus(null), 3000);
        updatePendingCount();
      } else if (status.type === 'sync_error') {
        setSyncStatus({ type: 'error', message: 'Sync failed' });
        setTimeout(() => setSyncStatus(null), 5000);
      }
    });

    // Load storage info
    loadStorageInfo();
    updatePendingCount();

    // Update every 30 seconds
    const interval = setInterval(() => {
      loadStorageInfo();
      updatePendingCount();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await checkStorageQuota();
      if (info) {
        setStorageInfo(info);
      }
    } catch (error) {
      console.log('Storage info unavailable');
    }
  };

  const updatePendingCount = async () => {
    try {
      const count = await offlineSyncManager.getPendingSyncCount();
      setPendingCount(count);
    } catch (error) {
      console.log('Pending count unavailable');
    }
  };

  return (
    <AnimatePresence>
      {(!isOnline || syncStatus || pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 shadow-lg"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Online/Offline Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-sm font-medium">Offline Mode</span>
                </>
              )}
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div className="flex items-center gap-2">
                {syncStatus.type === 'success' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs">{syncStatus.message}</span>
                  </>
                )}
                {syncStatus.type === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs">{syncStatus.message}</span>
                  </>
                )}
                {syncStatus.type === 'syncing' && (
                  <>
                    <Database className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs">{syncStatus.message}</span>
                  </>
                )}
              </div>
            )}

            {/* Pending Items */}
            {pendingCount > 0 && !syncStatus && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="text-xs">{pendingCount} pending</span>
              </div>
            )}

            {/* Storage Info (optional, only show if low) */}
            {storageInfo && storageInfo.percentUsed > 80 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-xs">{storageInfo.percentUsed}% storage</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}