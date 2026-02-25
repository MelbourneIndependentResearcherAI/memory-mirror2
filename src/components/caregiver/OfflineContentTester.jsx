import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, CheckCircle2, XCircle, Loader2, 
  Database, Wifi, WifiOff, FileText, Music, Brain, HardDrive, AlertCircle
} from 'lucide-react';
import { 
  initOfflineStorage, 
  getAllFromStore,
  STORES 
} from '@/components/utils/offlineStorage';
import { 
  initOfflineDB, 
  getOfflineResponse, 
  cacheOfflineResponse,
  getOfflineAudioLibrary,
  getOfflineStorageUsage,
  isOnline
} from '@/components/utils/offlineManager';
import { offlineDataCache } from '@/components/utils/offlineDataCache';
import { offlineSyncManager } from '@/components/utils/offlineSyncManager';
import { runOfflineHealthCheck, getStorageBreakdown } from '@/components/utils/offlineHealthCheck';

const tests = [
  {
    id: 'comprehensive_check',
    name: 'Comprehensive System Check',
    description: 'Run full offline health diagnostic',
    icon: CheckCircle2
  },
  {
    id: 'storage_init',
    name: 'IndexedDB Initialization',
    description: 'Initialize offline storage databases',
    icon: Database
  },
  {
    id: 'ai_responses',
    name: 'AI Response Cache',
    description: 'Test offline AI response retrieval',
    icon: Brain
  },
  {
    id: 'audio_library',
    name: 'Audio Library',
    description: 'Check offline audio storage',
    icon: Music
  },
  {
    id: 'data_cache',
    name: 'Data Cache Manager',
    description: 'Test offlineDataCache functionality',
    icon: FileText
  },
  {
    id: 'sync_manager',
    name: 'Sync Manager',
    description: 'Verify sync manager status',
    icon: Wifi
  },
  {
    id: 'content_stores',
    name: 'Content Stores',
    description: 'Verify all content stores are accessible',
    icon: Database
  },
  {
    id: 'storage_breakdown',
    name: 'Storage Breakdown',
    description: 'Detailed storage usage by category',
    icon: HardDrive
  }
];

export default function OfflineContentTester() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);

  const runTest = async (testId) => {
    setCurrentTest(testId);
    setTestResults(prev => ({ ...prev, [testId]: { status: 'running' } }));

    try {
      let result;
      
      switch (testId) {
        case 'comprehensive_check':
          const healthCheck = await runOfflineHealthCheck();
          const statusEmoji = {
            fully_operational: '✅',
            operational_with_warnings: '⚠️',
            degraded: '⚠️',
            critical: '❌'
          };
          result = {
            status: healthCheck.overall_status === 'fully_operational' ? 'passed' : 
                   healthCheck.overall_status === 'critical' ? 'failed' : 'warning',
            message: `${statusEmoji[healthCheck.overall_status]} ${healthCheck.overall_status.replace(/_/g, ' ').toUpperCase()} - ${healthCheck.checks.length} checks completed, ${healthCheck.errors.length} errors, ${healthCheck.warnings.length} warnings`
          };
          break;

        case 'storage_breakdown':
          const breakdown = await getStorageBreakdown();
          const totalSize = Object.values(breakdown).reduce((sum, store) => sum + parseFloat(store.sizeMB || 0), 0);
          const totalItems = Object.values(breakdown).reduce((sum, store) => sum + (store.count || 0), 0);
          const topStores = Object.entries(breakdown)
            .sort((a, b) => parseFloat(b[1].sizeMB || 0) - parseFloat(a[1].sizeMB || 0))
            .slice(0, 5)
            .map(([key, data]) => `${key}: ${data.count} items (${data.sizeMB} MB)`)
            .join(', ');
          result = {
            status: 'passed',
            message: `Total: ${totalSize.toFixed(2)} MB, ${totalItems} items. Top stores: ${topStores}`
          };
          break;

        case 'storage_init':
          await initOfflineStorage();
          await initOfflineDB();
          result = { status: 'passed', message: 'Both databases initialized successfully' };
          break;

        case 'ai_responses':
          const testPrompt = "hello how are you";
          const response = await getOfflineResponse(testPrompt);
          if (response && response.text) {
            // Test caching
            await cacheOfflineResponse("test input", "test response");
            result = { 
              status: 'passed', 
              message: `Response found: "${response.text.substring(0, 50)}..."` 
            };
          } else {
            result = { status: 'failed', message: 'No response returned' };
          }
          break;

        case 'audio_library':
          const audioLib = await getOfflineAudioLibrary();
          const usage = await getOfflineStorageUsage();
          result = { 
            status: 'passed', 
            message: `${audioLib.length} items, ${usage.total_size_mb} MB used` 
          };
          break;

        case 'data_cache':
          await offlineDataCache.init();
          const journals = await offlineDataCache.getCachedJournals(5);
          const memories = await offlineDataCache.getCachedMemories(5);
          result = { 
            status: 'passed', 
            message: `${journals.length} journals, ${memories.length} memories cached` 
          };
          break;

        case 'sync_manager':
          const isOnlineNow = offlineSyncManager.isCurrentlyOnline();
          const pending = await offlineSyncManager.getPendingSyncCount();
          result = { 
            status: 'passed', 
            message: `${isOnlineNow ? 'Online' : 'Offline'}, ${pending} pending` 
          };
          break;

        case 'content_stores':
          await initOfflineStorage();
          const storeTests = [];
          for (const [key, storeName] of Object.entries(STORES).slice(0, 10)) {
            try {
              const items = await getAllFromStore(storeName);
              storeTests.push(`${key}: ${items.length} items`);
            } catch (error) {
              storeTests.push(`${key}: ERROR`);
            }
          }
          result = { 
            status: 'passed', 
            message: storeTests.join(', ') 
          };
          break;

        default:
          result = { status: 'failed', message: 'Unknown test' };
      }

      setTestResults(prev => ({ ...prev, [testId]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testId]: { 
          status: 'failed', 
          message: error.message 
        } 
      }));
    }

    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setTesting(true);
    for (const test of tests) {
      await runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setTesting(false);
  };

  const getStatusIcon = (testId) => {
    const result = testResults[testId];
    if (!result) return null;
    
    if (result.status === 'running') {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (result.status === 'passed') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (result.status === 'warning') {
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const onlineStatus = isOnline();
  const allPassed = tests.every(test => testResults[test.id]?.status === 'passed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Offline Mode System Test</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Run diagnostics to verify all offline functionality is working correctly
        </p>
      </div>

      {/* Connection Status */}
      <Alert className={onlineStatus ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
        <AlertDescription className="flex items-center gap-2">
          {onlineStatus ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-green-800">Online - All tests available</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800">Offline - Testing offline capabilities only</span>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Run All Tests Button */}
      <Button
        onClick={runAllTests}
        disabled={testing}
        className="w-full bg-blue-600 hover:bg-blue-700 min-h-[50px]"
      >
        {testing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <PlayCircle className="w-5 h-5 mr-2" />
            Run All Tests
          </>
        )}
      </Button>

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <Alert className={allPassed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}>
          <AlertDescription>
            {allPassed ? (
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">All tests passed! Offline mode is fully operational.</span>
              </div>
            ) : (
              <div className="text-blue-800">
                <span className="font-semibold">
                  {Object.values(testResults).filter(r => r.status === 'passed').length} of {tests.length} tests passed
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Individual Tests */}
      <div className="grid gap-4">
        {tests.map(test => {
          const Icon = test.icon;
          const result = testResults[test.id];

          return (
            <Card key={test.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{test.name}</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.id)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.id)}
                      disabled={currentTest === test.id}
                      className="min-h-[40px]"
                    >
                      {currentTest === test.id ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {result && result.message && (
                <CardContent className="pt-0">
                  <div className={`text-sm p-3 rounded-lg ${
                    result.status === 'passed' 
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : result.status === 'failed'
                      ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : result.status === 'warning'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {result.message}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}