/**
 * Offline Sync Manager - Handles bidirectional sync when online
 * Queues changes locally, syncs when connection returns
 */

import { base44 } from '@/api/base44Client';
import { offlineDataCache } from './offlineDataCache';

class OfflineSyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners({ type: 'online' });
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners({ type: 'offline' });
    });
  }

  onSyncStatusChange(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(status) {
    this.syncListeners.forEach(callback => callback(status));
  }

  async syncPendingChanges() {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    try {
      const pendingQueue = await offlineDataCache.getPendingSyncQueue();
      
      for (const item of pendingQueue) {
        try {
          await this.syncItem(item);
          await offlineDataCache.removePendingSync(item.id);
        } catch (error) {
          console.error(`Failed to sync ${item.entity_type}:`, error);
          this.notifyListeners({ 
            type: 'sync_error', 
            error: error.message,
            entity_type: item.entity_type 
          });
        }
      }

      this.notifyListeners({ type: 'sync_complete', itemsCount: pendingQueue.length });
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners({ type: 'sync_error', error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  async syncItem(item) {
    switch (item.entity_type) {
      case 'care_journal':
        return this.syncJournal(item);
      case 'memory':
        return this.syncMemory(item);
      case 'media':
        return this.syncMedia(item);
      default:
        throw new Error(`Unknown entity type: ${item.entity_type}`);
    }
  }

  async syncJournal(item) {
    if (item.action === 'create') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, created_locally: _created_locally, ...journalData } = item.data;
      const created = await base44.entities.CareJournal.create(journalData);
      await offlineDataCache.markAsSynced('care_journal', item.local_id, created.id);
      return created;
    } else if (item.action === 'update') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, ...journalData } = item.data;
      const updated = await base44.entities.CareJournal.update(item.remote_id, journalData);
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, ..._journalData } = item.data;
      await offlineDataCache.markAsSynced('care_journal', item.local_id, item.remote_id);
      return updated;
    }
  }

  async syncMemory(item) {
    if (item.action === 'create') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, created_locally: _created_locally, ...memoryData } = item.data;
      const created = await base44.entities.Memory.create(memoryData);
      await offlineDataCache.markAsSynced('memory', item.local_id, created.id);
      return created;
    } else if (item.action === 'update') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, ...memoryData } = item.data;
      const updated = await base44.entities.Memory.update(item.remote_id, memoryData);
      await offlineDataCache.markAsSynced('memory', item.local_id, item.remote_id);
      return updated;
    }
  }

  async syncMedia(item) {
    if (item.action === 'create') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, created_locally: _created_locally, ...mediaData } = item.data;
      const created = await base44.entities.FamilyMedia.create(mediaData);
      await offlineDataCache.markAsSynced('media', item.local_id, created.id);
      return created;
    } else if (item.action === 'update') {
      const { id: _id, sync_status: _sync_status, cached_at: _cached_at, ...mediaData } = item.data;
      const updated = await base44.entities.FamilyMedia.update(item.remote_id, mediaData);
      await offlineDataCache.markAsSynced('media', item.local_id, item.remote_id);
      return updated;
    }
  }

  async cacheRemoteData() {
    try {
      // Cache journals
      const journals = await base44.entities.CareJournal.list('-created_date', 100);
      for (const journal of journals) {
        await offlineDataCache.cacheJournal(journal);
      }

      // Cache memories
      const memories = await base44.entities.Memory.list('-created_date', 100);
      for (const memory of memories) {
        await offlineDataCache.cacheMemory(memory);
      }

      // Cache family media
      const media = await base44.entities.FamilyMedia.list('-created_date', 50);
      for (const item of media) {
        await offlineDataCache.cacheMedia(item);
      }

      this.notifyListeners({ type: 'cache_complete' });
    } catch (error) {
      console.error('Failed to cache remote data:', error);
    }
  }

  getPendingSyncCount() {
    return offlineDataCache.getPendingSyncQueue().then(queue => queue.length);
  }

  isCurrentlyOnline() {
    return this.isOnline;
  }
}

export const offlineSyncManager = new OfflineSyncManager();

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineSyncManager.syncPendingChanges();
  });
}