import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, Loader2, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFromStore } from '../utils/offlineStorage';
import { preloadEssentialData } from '../utils/offlinePreloader';
import { isOnline } from '../utils/offlineManager';
import { toast } from 'sonner';

const DISMISS_KEY = 'offline_banner_dismissed';

export default function OfflineReadyIndicator() {
  const [offlineReady, setOfflineReady] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [online, setOnline] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    checkOfflineStatus();
    
    const interval = setInterval(checkOfflineStatus, 30000); // Check every 30 seconds
    
    // Listen for online/offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOfflineStatus = async () => {
    try {
      const status = await getFromStore('metadata', 'offline_ready');
      setOfflineReady(status);
      setOnline(isOnline());
    } catch (error) {
      console.error('Failed to check offline status:', error);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // localStorage unavailable; dismiss for session only
    }
    setDismissed(true);
  };

  const downloadOfflineData = async () => {
    setIsDownloading(true);
    toast.info('Downloading offline content...');
    
    try {
      const success = await preloadEssentialData();
      
      if (success) {
        await checkOfflineStatus();
        toast.success('Offline mode ready! App will work fully without internet.');
      } else {
        toast.error('Download incomplete. Please try again.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download offline content');
    } finally {
      setIsDownloading(false);
    }
  };

  if (offlineReady && online) {
    // Already prepared and online - show subtle indicator
    return (
      <div className="fixed top-4 right-4 z-40 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">Offline Ready</span>
      </div>
    );
  }

  if (offlineReady && !online) {
    // Offline and prepared
    return (
      <div className="fixed top-4 right-4 z-40 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">Offline Mode Active</span>
      </div>
    );
  }

  if (!offlineReady && online) {
    // Online but not prepared — show banner unless dismissed
    if (dismissed) return null;
    return (
      <div className="fixed top-4 right-4 z-40 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 p-4 rounded-lg shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">Enable Offline Mode</h4>
            <p className="text-xs mb-3 opacity-90">
              Download AI responses and content to use the app without internet
            </p>
            <Button
              onClick={downloadOfflineData}
              disabled={isDownloading}
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Now
                </>
              )}
            </Button>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="ml-1 p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Offline and not prepared - critical warning
  return (
    <div className="fixed top-4 right-4 z-40 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg shadow-xl max-w-sm">
      <div className="flex items-start gap-3">
        <WifiOff className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">Limited Offline Mode</h4>
          <p className="text-xs opacity-90">
            Basic functions available. Connect to internet to download full offline content.
          </p>
        </div>
      </div>
    </div>
  );
}