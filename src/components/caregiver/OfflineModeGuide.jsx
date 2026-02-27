import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, HardDrive, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { downloadManager } from '@/components/utils/offlineDownloadManager';
import { getStorageInfo } from '@/components/utils/offlineStorage';
import { toast } from 'sonner';

export default function OfflineModeGuide() {
  const [storageStats, setStorageStats] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [testMode, setTestMode] = useState(false);

  // Monitor storage in real-time
  useEffect(() => {
    const loadStats = async () => {
      const info = await getStorageInfo();
      const quota = await downloadManager.checkStorageQuota();
      setStorageStats({ info, quota });
    };
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitor online status
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  // Subscribe to download progress
  useEffect(() => {
    const unsubscribe = downloadManager.subscribe((progress) => {
      setDownloadProgress(progress.current);
      setIsDownloading(progress.current < 100);
    });
    return unsubscribe;
  }, []);

  const handleStartDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadManager.startFullDownload();
      toast.success('Offline download complete!');
    } catch (error) {
      toast.error('Download failed: ' + error.message);
    }
  };

  const totalSize = storageStats?.info 
    ? Object.values(storageStats.info).reduce((sum, store) => sum + (store.size || 0), 0)
    : 0;
  const totalMB = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Offline Mode Guide</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Learn how Memory Mirror works without internet
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Online Status */}
          <Card className={isOnline ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {isOnline ? (
                  <Wifi className="w-8 h-8 text-green-600" />
                ) : (
                  <WifiOff className="w-8 h-8 text-red-600" />
                )}
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isOnline ? 'Connected' : 'Offline'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isOnline ? 'Internet available' : 'No internet'}
              </p>
            </CardContent>
          </Card>

          {/* Storage Used */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <HardDrive className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {totalMB} MB
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Storage Used (500MB Max)
              </p>
            </CardContent>
          </Card>

          {/* Download Status */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDownloading ? `${downloadProgress}%` : 'Ready'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isDownloading ? 'Downloading...' : 'Offline data available'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What Gets Downloaded */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              What Gets Downloaded?
            </CardTitle>
            <CardDescription>
              Here's exactly what Memory Mirror saves for offline use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">AI Responses</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">100+ pre-written responses for common conversations</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Stories</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">50+ memory-triggering stories</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Music & Audio</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">200+ era-specific songs (metadata + audio files)</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Brain Games</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">30+ cognitive exercises & activities</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">User Data</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Profiles, care journal, family media</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Chat History</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Previous conversations saved locally</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Offline Mode Works</CardTitle>
            <CardDescription>
              Step-by-step explanation of the download process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Automatic Preload',
                  desc: 'When you first open Memory Mirror, it automatically downloads essential data in the background (3 seconds after app opens). This happens silently without interrupting use.'
                },
                {
                  step: '2',
                  title: 'Manual Full Download (Optional)',
                  desc: 'For complete offline functionality, you can manually download ALL content. This includes audio files and takes 2-5 minutes. You need 100MB of available space.'
                },
                {
                  step: '3',
                  title: 'Browser Storage (IndexedDB)',
                  desc: 'All data is saved in your browser\'s local database called "MemoryMirrorDB". It\'s not in the cloud - it\'s stored right on this device.'
                },
                {
                  step: '4',
                  title: 'Works With or Without Internet',
                  desc: 'Once downloaded, everything works perfectly offline. But if internet is available, it will use fresh data from our servers for the best experience.'
                },
                {
                  step: '5',
                  title: 'Smart Sync',
                  desc: 'When internet returns, the app automatically syncs any new conversations or activities you created while offline.'
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        {isDownloading && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Downloading Offline Content...</p>
              <Progress value={downloadProgress} className="h-3 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">{downloadProgress}% complete</p>
            </CardContent>
          </Card>
        )}

        {!isDownloading && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Download Full Offline Package</CardTitle>
              <CardDescription>
                Get everything for complete offline operation (recommended for reliable use)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-400">
                    <p className="font-semibold mb-1">First time? Make sure you have:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Active internet connection</li>
                      <li>At least 100MB of free storage</li>
                      <li>5 minutes of time</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleStartDownload}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-h-[48px] font-semibold text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Everything Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Live Demo */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Test Offline Mode (Even While Online!)
            </CardTitle>
            <CardDescription>
              You can test offline functionality right now without disconnecting from internet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>How to test:</strong>
            </p>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Check the "Offline" checkbox at the top</li>
              <li>Memory Mirror still works! All features available from cached data</li>
              <li>Uncheck "Offline" and see it sync back online seamlessly</li>
            </ol>
            <Button
              onClick={() => {
                setTestMode(!testMode);
                toast.info(
                  testMode
                    ? 'Follow the steps above to test offline mode in DevTools'
                    : 'Test mode activated! Open DevTools to simulate offline'
                );
              }}
              variant="outline"
              className="w-full"
            >
              {testMode ? '✓ Test Mode Instructions Ready' : 'Show Test Instructions'}
            </Button>
          </CardContent>
        </Card>

        {/* Storage Breakdown */}
        {storageStats?.info && (
          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown</CardTitle>
              <CardDescription>
                Current offline data stored on this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(storageStats.info)
                  .filter(([_, data]) => data.count > 0)
                  .map(([store, data]) => (
                    <div key={store} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white capitalize">
                          {store.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {data.count} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {((data.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-white">Total</p>
                  <p className="text-lg font-bold text-purple-600">
                    {totalMB} MB / 500 MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Common Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: 'Do I need internet to use Memory Mirror?',
                a: 'No! Once you download the offline package, everything works without internet. Internet is only used to sync new data when available.'
              },
              {
                q: 'Where is my data stored?',
                a: 'In your browser\'s local database called IndexedDB. It\'s private, encrypted, and never leaves your device.'
              },
              {
                q: 'How much storage do I need?',
                a: 'At least 100MB free. The full package is around 300-400MB including all audio files.'
              },
              {
                q: 'What happens if I clear browser data?',
                a: 'Your offline data will be deleted. You can re-download anytime from the Offline Management section.'
              },
              {
                q: 'Does offline mode work on mobile?',
                a: 'Yes! Works perfectly on phones and tablets. The app stores data the same way across all devices.'
              },
              {
                q: 'Can I download just what I need?',
                a: 'Yes. Tap the download button to get just the essentials, or the full package for complete offline features.'
              }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}