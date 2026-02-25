import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';

export default function OfflineSyncIndicator() {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    const unsubscribe = offlineSyncManager.onSyncStatusChange(async (status) => {
      if (status.type === 'online') {
        setIsOnline(true);
      } else if (status.type === 'offline') {
        setIsOnline(false);
      } else if (status.type === 'sync_start') {
        setSyncStatus('syncing');
      } else if (status.type === 'sync_complete') {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        setPendingCount(0);
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else if (status.type === 'sync_error') {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    });

    const updatePendingCount = async () => {
      const count = await offlineSyncManager.getPendingSyncCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2 animate-pulse">
        <CloudOff className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Offline Mode</span>
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium hidden sm:inline">Syncing...</span>
      </div>
    );
  }

  if (syncStatus === 'success') {
    return (
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2 animate-bounce">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Synced!</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Sync Error</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {pendingCount} pending
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full p-3 shadow-lg flex items-center gap-2 opacity-70">
      <Cloud className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">Synced</span>
    </div>
  );
}