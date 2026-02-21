import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, WifiOff, Database, Download, CheckCircle, XCircle, 
  MessageCircle, Music, BookOpen, Image, Phone, Shield, 
  RefreshCw, Trash2, AlertTriangle
} from 'lucide-react';
import { 
  getOfflineCapabilities, 
  checkOfflineReadiness, 
  getOfflineStorageStatus 
} from '@/components/utils/offlineCapabilities';
import { getStorageInfo } from '@/components/utils/offlineStorage';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';
import { toast } from 'sonner';

export default function OfflineModeDashboard() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [readiness, setReadiness] = useState(null);
  const [storage, setStorage] = useState(null);
  const [capabilities, setCapabilities] = useState({ available: [], limited: [] });
  const [pendingSync, setPendingSync] = useState(0);
  const [offlineData, setOfflineData] = useState(null);

  useEffect(() => {
    loadStatus();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(loadStatus, 10000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const loadStatus = async () => {
    try {
      const [ready, storageStatus, caps, pending, dataInfo] = await Promise.all([
        checkOfflineReadiness(),
        getOfflineStorageStatus(),
        Promise.resolve(getOfflineCapabilities()),
        offlineSyncManager.getPendingSyncCount(),
        getStorageInfo()
      ]);
      
      setReadiness(ready);
      setStorage(storageStatus);
      setCapabilities(caps);
      setPendingSync(pending);
      setOfflineData(dataInfo);
    } catch (error) {
      console.error('Status load failed:', error);
    }
  };

  const handleSync = async () => {
    toast.info('Starting sync...');
    try {
      await offlineSyncManager.syncPendingChanges();
      toast.success('Sync complete!');
      loadStatus();
    } catch (error) {
      toast.error('Sync failed: ' + error.message);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all offline cache? This will remove downloaded content.')) {
      return;
    }
    
    try {
      const { clearStore, STORES } = await import('@/components/utils/offlineStorage');
      await Promise.all(
        Object.values(STORES).map(store => clearStore(store).catch(() => {}))
      );
      toast.success('Cache cleared');
      loadStatus();
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Offline Mode Status
        </h2>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800 gap-2">
              <Wifi className="w-3 h-3" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 gap-2 animate-pulse">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Readiness Check */}
      {readiness && (
        <Card className={readiness.ready ? 'border-green-300' : 'border-amber-300'}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Readiness</span>
              {readiness.ready ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(readiness.checks).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
            {readiness.criticalMissing.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Missing: {readiness.criticalMissing.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Status */}
      {storage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Used</span>
                <span className="font-bold">{storage.usageMB} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Available</span>
                <span className="font-bold">{storage.availableMB} MB</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    parseFloat(storage.percentUsed) > 80 ? 'bg-red-500' :
                    parseFloat(storage.percentUsed) > 60 ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${storage.percentUsed}%` }}
                />
              </div>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                {storage.percentUsed}% used
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cached Data Overview */}
      {offlineData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Cached Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(offlineData).map(([store, info]) => (
                <div key={store} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 capitalize">
                    {store.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {info.count}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(info.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                ✅ Fully Available Offline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {capabilities.available.map((feature) => (
                  <div key={feature.key} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{feature.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                ⚠️ Limited Offline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {capabilities.limited.map((feature) => (
                  <div key={feature.key} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                    <XCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{feature.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{feature.fallback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {isOnline && pendingSync > 0 && (
          <Button onClick={handleSync} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync {pendingSync} Pending Items
          </Button>
        )}
        <Button onClick={loadStatus} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
        <Button onClick={handleClearCache} variant="outline" className="gap-2 text-red-600">
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </Button>
      </div>

      {/* Offline Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">
            💡 Offline Mode Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• Voice chat works 100% offline with preloaded responses</p>
          <p>• All safety features (Phone Mode, Night Watch) function offline</p>
          <p>• Stories, memories, and music info are cached locally</p>
          <p>• Journal entries and activities are saved and will sync when online</p>
          <p>• Smart home controls require internet connection</p>
        </CardContent>
      </Card>
    </div>
  );
}