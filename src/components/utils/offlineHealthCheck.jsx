/**
 * Offline Health Check - Comprehensive system diagnostics
 */

import { initOfflineStorage, getAllFromStore, STORES } from './offlineStorage';
import { initOfflineDB, getOfflineAudioLibrary } from './offlineManager';
import { offlineDataCache } from './offlineDataCache';
import { offlineSyncManager } from './offlineSyncManager';

export async function runOfflineHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    overall_status: 'unknown',
    checks: [],
    warnings: [],
    errors: []
  };

  // Check 1: IndexedDB Support
  try {
    if (!window.indexedDB) {
      throw new Error('IndexedDB not supported');
    }
    results.checks.push({
      name: 'IndexedDB Support',
      status: 'passed',
      message: 'Browser supports IndexedDB'
    });
  } catch (error) {
    results.errors.push('IndexedDB not available');
    results.checks.push({
      name: 'IndexedDB Support',
      status: 'failed',
      message: error.message
    });
  }

  // Check 2: Storage Initialization
  try {
    await initOfflineStorage();
    await initOfflineDB();
    results.checks.push({
      name: 'Storage Initialization',
      status: 'passed',
      message: 'Both storage systems initialized'
    });
  } catch (error) {
    results.errors.push('Storage initialization failed');
    results.checks.push({
      name: 'Storage Initialization',
      status: 'failed',
      message: error.message
    });
  }

  // Check 3: Data Cache
  try {
    await offlineDataCache.init();
    const journals = await offlineDataCache.getCachedJournals(1);
    results.checks.push({
      name: 'Data Cache',
      status: 'passed',
      message: `Cache initialized, ${journals.length} journals available`
    });
  } catch (error) {
    results.warnings.push('Data cache may not be fully functional');
    results.checks.push({
      name: 'Data Cache',
      status: 'warning',
      message: error.message
    });
  }

  // Check 4: Sync Manager
  try {
    const isOnline = offlineSyncManager.isCurrentlyOnline();
    const pendingCount = await offlineSyncManager.getPendingSyncCount();
    results.checks.push({
      name: 'Sync Manager',
      status: 'passed',
      message: `Manager operational, ${isOnline ? 'online' : 'offline'}, ${pendingCount} pending`
    });
  } catch (error) {
    results.warnings.push('Sync manager may not be fully functional');
    results.checks.push({
      name: 'Sync Manager',
      status: 'warning',
      message: error.message
    });
  }

  // Check 5: Audio Library
  try {
    const audioLib = await getOfflineAudioLibrary();
    results.checks.push({
      name: 'Audio Library',
      status: 'passed',
      message: `${audioLib.length} audio items available offline`
    });
  } catch (error) {
    results.warnings.push('Audio library may not be accessible');
    results.checks.push({
      name: 'Audio Library',
      status: 'warning',
      message: error.message
    });
  }

  // Check 6: Content Stores Access
  try {
    const storeChecks = [];
    for (const [key, storeName] of Object.entries(STORES)) {
      try {
        const items = await getAllFromStore(storeName);
        storeChecks.push(`${key}: ${items.length}`);
      } catch (error) {
        storeChecks.push(`${key}: ERROR`);
        results.warnings.push(`Store ${key} may have issues`);
      }
    }
    results.checks.push({
      name: 'Content Stores',
      status: storeChecks.some(c => c.includes('ERROR')) ? 'warning' : 'passed',
      message: `${Object.keys(STORES).length} stores checked`,
      details: storeChecks.join(', ')
    });
  } catch (error) {
    results.errors.push('Content stores access failed');
    results.checks.push({
      name: 'Content Stores',
      status: 'failed',
      message: error.message
    });
  }

  // Check 7: Service Worker
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        results.checks.push({
          name: 'Service Worker',
          status: 'passed',
          message: 'Service worker registered and active'
        });
      } else {
        results.warnings.push('Service worker not registered');
        results.checks.push({
          name: 'Service Worker',
          status: 'warning',
          message: 'Not registered - offline caching limited'
        });
      }
    } else {
      results.warnings.push('Service worker not supported');
      results.checks.push({
        name: 'Service Worker',
        status: 'warning',
        message: 'Not supported by browser'
      });
    }
  } catch (error) {
    results.warnings.push('Service worker check failed');
    results.checks.push({
      name: 'Service Worker',
      status: 'warning',
      message: error.message
    });
  }

  // Check 8: Storage Quota
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);
      const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
      const totalMB = (estimate.quota / 1024 / 1024).toFixed(2);
      
      results.checks.push({
        name: 'Storage Quota',
        status: percentUsed > 90 ? 'warning' : 'passed',
        message: `${usedMB} MB of ${totalMB} MB used (${percentUsed}%)`
      });
      
      if (percentUsed > 90) {
        results.warnings.push('Storage almost full - consider clearing old data');
      }
    } else {
      results.checks.push({
        name: 'Storage Quota',
        status: 'warning',
        message: 'Storage API not available'
      });
    }
  } catch (error) {
    results.checks.push({
      name: 'Storage Quota',
      status: 'warning',
      message: error.message
    });
  }

  // Determine overall status
  const failedChecks = results.checks.filter(c => c.status === 'failed').length;
  const warningChecks = results.checks.filter(c => c.status === 'warning').length;
  
  if (failedChecks > 0) {
    results.overall_status = 'critical';
  } else if (warningChecks > 2) {
    results.overall_status = 'degraded';
  } else if (warningChecks > 0) {
    results.overall_status = 'operational_with_warnings';
  } else {
    results.overall_status = 'fully_operational';
  }

  return results;
}

// Get storage breakdown by type
export async function getStorageBreakdown() {
  try {
    await initOfflineStorage();
    
    const breakdown = {};
    
    for (const [key, storeName] of Object.entries(STORES)) {
      try {
        const items = await getAllFromStore(storeName);
        const dataStr = JSON.stringify(items);
        breakdown[key] = {
          count: items.length,
          sizeBytes: new Blob([dataStr]).size,
          sizeMB: (new Blob([dataStr]).size / 1024 / 1024).toFixed(3)
        };
      } catch (error) {
        breakdown[key] = {
          count: 0,
          sizeBytes: 0,
          sizeMB: '0.000',
          error: error.message
        };
      }
    }
    
    return breakdown;
  } catch (error) {
    console.error('Storage breakdown failed:', error);
    return {};
  }
}

// Clear all offline data (for testing/reset)
export async function clearAllOfflineData() {
  try {
    // Clear IndexedDB databases
    await new Promise((resolve, reject) => {
      const deleteReq1 = indexedDB.deleteDatabase('MemoryMirrorOfflineDB');
      deleteReq1.onsuccess = resolve;
      deleteReq1.onerror = reject;
    });
    
    await new Promise((resolve, reject) => {
      const deleteReq2 = indexedDB.deleteDatabase('MemoryMirrorDB');
      deleteReq2.onsuccess = resolve;
      deleteReq2.onerror = reject;
    });
    
    // Clear localStorage sync data
    localStorage.removeItem('syncMetadata');
    localStorage.removeItem('offlineConversations');
    
    return { success: true, message: 'All offline data cleared' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}