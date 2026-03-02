// Unified offline storage - SINGLE database with proper structure
const DB_NAME = 'MemoryMirrorDB';
const DB_VERSION = 5;

const STORES = {
  // Core conversation & messages
  conversations: 'conversations',
  messages: 'messages',
  
  // Content libraries
  aiResponses: 'aiResponses',
  stories: 'stories',
  music: 'music',
  audioLibrary: 'audioLibrary',
  
  // User data
  memories: 'memories',
  userProfile: 'userProfile',
  careJournal: 'careJournal',
  familyMedia: 'familyMedia',
  
  // Activities & routines
  activityLog: 'activityLog',
  routines: 'routines',
  
  // Emergency & security
  safeZones: 'safeZones',
  emergencyContacts: 'emergencyContacts',
  
  // Metadata & sync
  syncMeta: 'syncMeta',
  pendingOps: 'pendingOps'
};

let dbInstance = null;

export async function initOfflineStorage() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('IndexedDB initialization timeout after 10 seconds'));
    }, 10000);

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error || new Error('IndexedDB open failed'));
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        dbInstance = request.result;
        dbInstance.onerror = (event) => {
          console.error('Database error:', event);
        };
        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        clearTimeout(timeout);
        const db = event.target.result;
        const uniqueStores = [...new Set(Object.values(STORES))];

        uniqueStores.forEach((storeName) => {
          try {
            if (!db.objectStoreNames.contains(storeName)) {
              if (storeName === 'messages') {
                const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('conversationId', 'conversationId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
              } else if (storeName === 'aiResponses') {
                const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('prompt', 'prompt', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
              } else if (storeName === 'audioLibrary') {
                const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
              } else if (storeName === 'syncMeta') {
                db.createObjectStore(storeName, { keyPath: 'key' });
              } else {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
              }
            }
          } catch (err) {
            console.error(`Error creating store ${storeName}:`, err);
          }
        });
      };
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

export async function saveToStore(storeName, data) {
  try {
    const db = await initOfflineStorage();
    
    // Handle undefined/null ids
    const dataToSave = { ...data };
    if (dataToSave.id === undefined || dataToSave.id === null) {
      delete dataToSave.id;
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Save timeout on ${storeName}`));
      }, 5000);

      try {
        const tx = db.transaction([storeName], 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(dataToSave);
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          resolve(request.result);
        };
        
        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error || new Error('Put failed'));
        };
        
        tx.onerror = () => {
          clearTimeout(timeout);
          reject(tx.error || new Error('Transaction failed'));
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to save to ${storeName}:`, error.message);
    return null;
  }
}

export async function getFromStore(storeName, id) {
  try {
    const db = await initOfflineStorage();
    
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to get from ${storeName}:`, error.message);
    return null;
  }
}

export async function getAllFromStore(storeName) {
  try {
    const db = await initOfflineStorage();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`GetAll timeout on ${storeName}`));
      }, 5000);

      try {
        const tx = db.transaction([storeName], 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          clearTimeout(timeout);
          reject(request.error || new Error('GetAll failed'));
        };
        
        tx.onerror = () => {
          clearTimeout(timeout);
          reject(tx.error || new Error('Transaction failed'));
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to get all from ${storeName}:`, error.message);
    return [];
  }
}

export async function deleteFromStore(storeName, id) {
  try {
    const db = await initOfflineStorage();
    
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to delete from ${storeName}:`, error.message);
  }
}

export async function clearStore(storeName) {
  try {
    const db = await initOfflineStorage();
    
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log(`✅ Cleared ${storeName}`);
          resolve();
        };
        
        request.onerror = () => {
          console.warn(`Failed to clear ${storeName}:`, request.error);
          reject(request.error);
        };
        
        tx.onerror = () => reject(tx.error);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to clear ${storeName}:`, error.message);
    return Promise.resolve();
  }
}

export async function queueOperation(operation) {
  await saveToStore(STORES.pendingOps, {
    ...operation,
    timestamp: Date.now(),
    synced: false
  });
}

export async function getStorageInfo() {
  const stores = Object.values(STORES);
  const info = {};
  
  for (const store of stores) {
    try {
      const data = await getAllFromStore(store);
      info[store] = {
        count: data.length,
        size: new Blob([JSON.stringify(data)]).size
      };
    } catch {
      info[store] = { count: 0, size: 0 };
    }
  }
  
  return info;
}

export { STORES };