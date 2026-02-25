/**
 * Sync Manager - Handles offline data synchronization with cloud
 */

import { base44 } from '@/api/base44Client';
import {
  getOfflineAudioLibrary,
  getOfflineStorageUsage
} from './offlineManager';

const SYNC_METADATA_KEY = 'syncMetadata';

// Get sync metadata from localStorage
export const getSyncMetadata = () => {
  try {
    const data = localStorage.getItem(SYNC_METADATA_KEY);
    return data ? JSON.parse(data) : {
      last_sync: null,
      last_sync_time: null,
      total_items_synced: 0,
      sync_status: 'idle',
      auto_sync_enabled: true
    };
  } catch {
    return {
      last_sync: null,
      last_sync_time: null,
      total_items_synced: 0,
      sync_status: 'idle',
      auto_sync_enabled: true
    };
  }
};

// Update sync metadata
export const updateSyncMetadata = (updates) => {
  try {
    const current = getSyncMetadata();
    const updated = { ...current, ...updates };
    localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update sync metadata:', error);
    return null;
  }
};

// Prepare offline data for sync
export const prepareOfflineDataForSync = async () => {
  try {
    const audioLibrary = await getOfflineAudioLibrary();
    const storageUsage = await getOfflineStorageUsage();

    // Get conversations from localStorage or IndexedDB
    let conversations = [];
    try {
      const stored = localStorage.getItem('offlineConversations');
      conversations = stored ? JSON.parse(stored) : [];
    } catch {
      conversations = [];
    }

    return {
      offline_conversations: conversations,
      audio_library_metadata: audioLibrary,
      storage_usage: storageUsage,
      settings: {
        language: localStorage.getItem('memoryMirrorLanguage') || 'en',
        theme: localStorage.getItem('memoryMirrorTheme') || 'auto',
        notification_enabled: localStorage.getItem('notificationsEnabled') !== 'false'
      }
    };
  } catch (error) {
    console.error('Failed to prepare sync data:', error);
    return null;
  }
};

// Perform cloud sync
export const syncToCloud = async (onProgress) => {
  try {
    updateSyncMetadata({ sync_status: 'syncing' });
    onProgress?.({ status: 'preparing', message: 'Preparing data for sync...' });

    const syncData = await prepareOfflineDataForSync();
    if (!syncData) {
      throw new Error('Failed to prepare data');
    }

    onProgress?.({ status: 'uploading', message: 'Uploading to cloud...' });

    const response = await base44.functions.invoke('syncOfflineData', {
      sync_type: 'full',
      ...syncData
    });

    const result = response.data;

    if (result.success) {
      const _metadata = updateSyncMetadata({
        sync_status: 'synced',
        last_sync: new Date().toISOString(),
        last_sync_time: Date.now(),
        total_items_synced: (result.conversations_synced || 0) + (result.audio_library_synced || 0)
      });

      onProgress?.({ 
        status: 'complete', 
        message: 'Sync complete!',
        summary: result
      });

      return { success: true, result };
    } else {
      throw new Error(result.error || 'Sync failed');
    }

  } catch (error) {
    console.error('Cloud sync error:', error);
    updateSyncMetadata({ sync_status: 'error' });
    onProgress?.({ 
      status: 'error', 
      message: error.message 
    });
    return { success: false, error: error.message };
  }
};

// Auto-sync when online
export const setupAutoSync = () => {
  const metadata = getSyncMetadata();
  
  if (!metadata.auto_sync_enabled) return;

  const handleOnline = async () => {
    console.log('Online detected, initiating sync...');
    await syncToCloud();
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Toggle auto-sync
export const setAutoSyncEnabled = (enabled) => {
  updateSyncMetadata({ auto_sync_enabled: enabled });
};

// Clear old sync data
export const clearSyncCache = () => {
  try {
    localStorage.removeItem('offlineConversations');
    updateSyncMetadata({
      last_sync: null,
      total_items_synced: 0
    });
    return true;
  } catch (error) {
    console.error('Failed to clear sync cache:', error);
    return false;
  }
};