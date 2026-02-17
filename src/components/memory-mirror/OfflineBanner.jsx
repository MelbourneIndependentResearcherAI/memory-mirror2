import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncPendingOperations } from '../utils/offlineAPI';
import { toast } from 'sonner';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your data...');
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re offline. The app will continue to work, and your data will sync when you\'re back online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setSyncing(true);
    try {
      await syncPendingOperations();
      toast.success('All data synced successfully!');
    } catch (error) {
      toast.error('Sync failed. Will retry automatically.');
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Offline Mode - Your data will sync when reconnected</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={syncing}
        className="text-white hover:bg-orange-600"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}