/**
 * Offline Sync Queue - Manages queued changes while offline
 * Syncs all changes once connectivity is restored
 */

import { initOfflineStorage, saveToStore, getAllFromStore, STORES } from './offlineStorage';

const SYNC_QUEUE_STORE = 'syncQueue';

export class OfflineSyncQueue {
  constructor() {
    this.queue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb({
          queueLength: this.queue.length,
          isSyncing: this.isSyncing,
          lastSyncTime: this.lastSyncTime
        });
      } catch (error) {
        console.warn('Sync listener error:', error);
      }
    });
  }

  async addToQueue(action) {
    const queueItem = {
      id: `${Date.now()}-${Math.random()}`,
      action: action.type, // 'create', 'update', 'delete'
      entity: action.entity, // entity name
      entityId: action.entityId,
      data: action.data,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending'
    };

    this.queue.push(queueItem);

    // Persist to IndexedDB
    try {
      await initOfflineStorage();
      await saveToStore(STORES.syncMeta, {
        key: 'syncQueue',
        items: this.queue,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }

    this.notify();
    return queueItem.id;
  }

  async processQueue() {
    if (this.isSyncing || this.queue.length === 0) {
      return { success: true, itemsProcessed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    let itemsProcessed = 0;
    const failedItems = [];

    try {
      const { base44 } = await import('@/api/base44Client');

      for (const item of this.queue) {
        try {
          switch (item.action) {
            case 'create':
              await base44.entities[item.entity].create(item.data);
              itemsProcessed++;
              break;
            case 'update':
              await base44.entities[item.entity].update(item.entityId, item.data);
              itemsProcessed++;
              break;
            case 'delete':
              await base44.entities[item.entity].delete(item.entityId);
              itemsProcessed++;
              break;
          }
          item.status = 'synced';
        } catch (error) {
          item.retries++;
          console.warn(`Failed to sync item ${item.id}:`, error);
          
          if (item.retries >= 3) {
            item.status = 'failed';
            failedItems.push(item);
          }
        }
      }

      // Remove synced items from queue
      this.queue = this.queue.filter(item => item.status !== 'synced');
      
      this.lastSyncTime = new Date().toISOString();

      // Persist updated queue
      await initOfflineStorage();
      await saveToStore(STORES.syncMeta, {
        key: 'syncQueue',
        items: this.queue,
        lastSyncTime: this.lastSyncTime
      });

      console.log(`✅ Synced ${itemsProcessed} offline changes`);

      this.isSyncing = false;
      this.notify();

      return {
        success: true,
        itemsProcessed,
        failedItems,
        queueRemaining: this.queue.length
      };
    } catch (error) {
      console.error('Sync process failed:', error);
      this.isSyncing = false;
      this.notify();
      return { success: false, error: error.message };
    }
  }

  async loadQueue() {
    try {
      await initOfflineStorage();
      const allMeta = await getAllFromStore(STORES.syncMeta);
      const queueMeta = allMeta.find(item => item.key === 'syncQueue');
      
      if (queueMeta?.items) {
        this.queue = queueMeta.items;
        this.lastSyncTime = queueMeta.lastSyncTime;
        this.notify();
        return this.queue;
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
    }
    return [];
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      failedCount: this.queue.filter(i => i.status === 'failed').length,
      pendingCount: this.queue.filter(i => i.status === 'pending').length
    };
  }

  async clearQueue() {
    this.queue = [];
    try {
      await initOfflineStorage();
      await saveToStore(STORES.syncMeta, {
        key: 'syncQueue',
        items: [],
        clearedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to clear queue:', error);
    }
    this.notify();
  }
}

export const syncQueue = new OfflineSyncQueue();

if (typeof window !== 'undefined') {
  window.offlineSyncQueue = syncQueue;
  
  // Initialize on app load
  (async () => {
    await syncQueue.loadQueue();
    // Auto-sync if there are pending items
    if (syncQueue.queue.length > 0 && navigator.onLine) {
      setTimeout(() => syncQueue.processQueue(), 2000);
    }
  })();

  // Auto-sync when online
  window.addEventListener('online', () => {
    console.log('📡 Back online - attempting to sync offline changes');
    setTimeout(() => syncQueue.processQueue(), 1000);
  });
}