/**
 * Offline Data Cache - Manages local storage of user-generated content
 * Handles CareJournal entries, Memories, FamilyMedia, and AI responses
 */

const DB_NAME = 'MemoryMirrorOfflineDB';
const STORES = {
  journals: 'care_journals',
  memories: 'memories',
  media: 'family_media',
  aiResponses: 'ai_responses',
  pendingSync: 'pending_sync'
};

class OfflineDataCache {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized && this.db) return this.db;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Data cache initialization timeout after 10 seconds'));
      }, 10000);

      try {
        const request = indexedDB.open(DB_NAME, 3);

        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error || new Error('IndexedDB open failed'));
        };
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          this.db = request.result;
          this.initialized = true;
          
          // Set error handler
          this.db.onerror = (event) => {
            console.error('Data cache connection error:', event);
          };
          
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          clearTimeout(timeout);
          const db = event.target.result;

          try {
            // Care Journals
            if (!db.objectStoreNames.contains(STORES.journals)) {
              const journalStore = db.createObjectStore(STORES.journals, { keyPath: 'id' });
              journalStore.createIndex('created_date', 'created_date', { unique: false });
              journalStore.createIndex('sync_status', 'sync_status', { unique: false });
            }

            // Memories
            if (!db.objectStoreNames.contains(STORES.memories)) {
              const memoryStore = db.createObjectStore(STORES.memories, { keyPath: 'id' });
              memoryStore.createIndex('created_date', 'created_date', { unique: false });
              memoryStore.createIndex('sync_status', 'sync_status', { unique: false });
            }

            // Family Media
            if (!db.objectStoreNames.contains(STORES.media)) {
              const mediaStore = db.createObjectStore(STORES.media, { keyPath: 'id' });
              mediaStore.createIndex('created_date', 'created_date', { unique: false });
              mediaStore.createIndex('sync_status', 'sync_status', { unique: false });
            }

            // AI Responses Cache
            if (!db.objectStoreNames.contains(STORES.aiResponses)) {
              const aiStore = db.createObjectStore(STORES.aiResponses, { keyPath: 'hash' });
              aiStore.createIndex('created_at', 'created_at', { unique: false });
            }

            // Pending Sync Queue
            if (!db.objectStoreNames.contains(STORES.pendingSync)) {
              const syncStore = db.createObjectStore(STORES.pendingSync, { keyPath: 'id', autoIncrement: true });
              syncStore.createIndex('entity_type', 'entity_type', { unique: false });
              syncStore.createIndex('created_at', 'created_at', { unique: false });
            }
          } catch (storeError) {
            console.error('Error creating data cache stores:', storeError);
          }
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // ============ CARE JOURNALS ============
  async cacheJournal(journal) {
    await this.init();
    return this._put(STORES.journals, {
      ...journal,
      sync_status: 'synced',
      cached_at: new Date().toISOString()
    });
  }

  async getCachedJournals(limit = 50) {
    await this.init();
    const allJournals = await this._getAll(STORES.journals);
    return allJournals
      .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
      .slice(0, limit);
  }

  async getCachedJournal(id) {
    await this.init();
    return this._get(STORES.journals, id);
  }

  async savePendingJournal(journal) {
    await this.init();
    const tempId = `temp_${Date.now()}`;
    const pendingJournal = {
      ...journal,
      id: tempId,
      sync_status: 'pending',
      created_locally: true,
      cached_at: new Date().toISOString()
    };
    
    await this._put(STORES.journals, pendingJournal);
    await this._addPendingSync({
      entity_type: 'care_journal',
      local_id: tempId,
      data: pendingJournal,
      action: 'create'
    });
    
    return pendingJournal;
  }

  // ============ MEMORIES ============
  async cacheMemory(memory) {
    await this.init();
    return this._put(STORES.memories, {
      ...memory,
      sync_status: 'synced',
      cached_at: new Date().toISOString()
    });
  }

  async getCachedMemories(limit = 100) {
    await this.init();
    const allMemories = await this._getAll(STORES.memories);
    return allMemories
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, limit);
  }

  async getCachedMemoriesByTheme(theme) {
    await this.init();
    const allMemories = await this._getAll(STORES.memories);
    return allMemories.filter(m => m.theme === theme || m.era === theme);
  }

  // ============ FAMILY MEDIA ============
  async cacheMedia(media) {
    await this.init();
    return this._put(STORES.media, {
      ...media,
      sync_status: 'synced',
      cached_at: new Date().toISOString()
    });
  }

  async getCachedMedia(limit = 50) {
    await this.init();
    const allMedia = await this._getAll(STORES.media);
    return allMedia
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, limit);
  }

  async getCachedMediaByPerson(personName) {
    await this.init();
    const allMedia = await this._getAll(STORES.media);
    return allMedia.filter(m => 
      m.people_in_media?.includes(personName) || m.uploaded_by_name === personName
    );
  }

  // ============ AI RESPONSES ============
  async cacheAIResponse(prompt, response, ttl = 86400000) {
    await this.init();
    const hash = this._hashPrompt(prompt);
    return this._put(STORES.aiResponses, {
      hash,
      prompt,
      response,
      created_at: Date.now(),
      expires_at: Date.now() + ttl
    });
  }

  async getAICachedResponse(prompt) {
    await this.init();
    const hash = this._hashPrompt(prompt);
    const cached = await this._get(STORES.aiResponses, hash);
    
    if (cached && cached.expires_at > Date.now()) {
      return cached.response;
    }
    
    if (cached) {
      await this._delete(STORES.aiResponses, hash);
    }
    
    return null;
  }

  // ============ PENDING SYNC ============
  async getPendingSyncQueue() {
    await this.init();
    return this._getAll(STORES.pendingSync);
  }

  async _addPendingSync(syncItem) {
    return this._put(STORES.pendingSync, {
      ...syncItem,
      created_at: Date.now()
    });
  }

  async removePendingSync(id) {
    await this.init();
    return this._delete(STORES.pendingSync, id);
  }

  async clearPendingSyncQueue() {
    await this.init();
    const queue = await this._getAll(STORES.pendingSync);
    for (const item of queue) {
      await this._delete(STORES.pendingSync, item.id);
    }
  }

  // ============ SYNC HELPERS ============
  async markAsSynced(entityType, localId, remoteId) {
    await this.init();
    let _store, entry;

    switch (entityType) {
      case 'care_journal':
        entry = await this._get(STORES.journals, localId);
        if (entry) {
          entry.sync_status = 'synced';
          entry.id = remoteId;
          entry.synced_at = new Date().toISOString();
          await this._put(STORES.journals, entry);
        }
        break;
      case 'memory':
        entry = await this._get(STORES.memories, localId);
        if (entry) {
          entry.sync_status = 'synced';
          entry.id = remoteId;
          entry.synced_at = new Date().toISOString();
          await this._put(STORES.memories, entry);
        }
        break;
      case 'media':
        entry = await this._get(STORES.media, localId);
        if (entry) {
          entry.sync_status = 'synced';
          entry.id = remoteId;
          entry.synced_at = new Date().toISOString();
          await this._put(STORES.media, entry);
        }
        break;
    }
  }

  // ============ STORAGE MANAGEMENT ============
  async getStorageStats() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 };
    }
    return navigator.storage.estimate();
  }

  async clearOldCache(daysOld = 30) {
    await this.init();
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    for (const store of Object.values(STORES)) {
      const items = await this._getAll(store);
      for (const item of items) {
        const itemTime = new Date(item.cached_at || item.created_at).getTime();
        if (itemTime < cutoffTime) {
          await this._delete(store, item.id || item.hash);
        }
      }
    }
  }

  // ============ INTERNAL HELPERS ============
  async _put(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Put operation timeout on ${storeName}`));
      }, 5000);

      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => {
          clearTimeout(timeout);
          resolve(data);
        };
        
        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error || new Error('Put failed'));
        };
        
        transaction.onerror = () => {
          clearTimeout(timeout);
          reject(transaction.error || new Error('Transaction failed'));
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async _get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`GetAll operation timeout on ${storeName}`));
      }, 5000);

      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          clearTimeout(timeout);
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error || new Error('GetAll failed'));
        };
        
        transaction.onerror = () => {
          clearTimeout(timeout);
          reject(transaction.error || new Error('Transaction failed'));
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async _delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  _hashPrompt(prompt) {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

export const offlineDataCache = new OfflineDataCache();