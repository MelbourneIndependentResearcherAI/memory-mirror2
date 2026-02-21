// Enhanced offline storage for all app data
const DB_NAME = 'MemoryMirrorDB';
const DB_VERSION = 2;

const STORES = {
  conversations: 'conversations',
  messages: 'messages',
  memories: 'memories',
  userProfile: 'userProfile',
  safeZones: 'safeZones',
  familyMedia: 'familyMedia',
  familyEvents: 'familyEvents',
  playlists: 'playlists',
  music: 'music',
  stories: 'stories',
  smartDevices: 'smartDevices',
  routines: 'routines',
  moodAutomations: 'moodAutomations',
  nightIncidents: 'nightIncidents',
  careJournal: 'careJournal',
  emergencyContacts: 'emergencyContacts',
  activityLog: 'activityLog',
  pendingOps: 'pendingOps',
  aiResponses: 'aiResponses',
  audioLibrary: 'audioLibrary',
  syncMeta: 'syncMeta'
};

let dbInstance = null;

export async function initOfflineStorage() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create all object stores if they don't exist
      Object.values(STORES).forEach((storeName) => {
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
            store.createIndex('fileName', 'fileName', { unique: false });
          } else {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          }
        }
      });
    };
  });
}

export async function saveToStore(storeName, data) {
  try {
    const db = await initOfflineStorage();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to save to ${storeName}:`, error.message);
    throw error;
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
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } catch (error) {
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
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.warn(`Failed to clear ${storeName}:`, error.message);
  }
}

// Queue operation for later sync when back online
export async function queueOperation(operation) {
  await saveToStore(STORES.pendingOps, {
    ...operation,
    timestamp: Date.now(),
    synced: false
  });
}

// Get storage usage
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
    } catch (error) {
      console.warn(`Failed to get storage info for ${store}:`, error.message);
      info[store] = { count: 0, size: 0 };
    }
  }
  
  return info;
}

export { STORES };