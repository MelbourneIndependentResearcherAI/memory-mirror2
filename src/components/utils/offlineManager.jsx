/**
 * Offline Manager - Handles offline functionality, caching, and pre-recorded audio responses
 */

const DB_NAME = 'MemoryMirrorOfflineDB';
const RESPONSES_STORE = 'offlineResponses';
const AUDIO_STORE = 'audioCache';
const AUDIO_LIBRARY_STORE = 'audioLibrary';
const METADATA_STORE = 'metadata';

// Pre-recorded common responses
const COMMON_OFFLINE_RESPONSES = {
  greeting: {
    text: "Hello, I'm here with you. How are you feeling today?",
    keywords: ['hi', 'hello', 'hey']
  },
  anxiety_high: {
    text: "I can see you're feeling worried. That's okay. I'm right here with you. You're safe.",
    keywords: ['scared', 'afraid', 'worried', 'anxious', 'help', 'emergency']
  },
  memory_prompt: {
    text: "Tell me about a happy memory. I'd love to hear what brings you joy.",
    keywords: ['remember', 'memory', 'forget', 'past']
  },
  time_confusion: {
    text: "You're right here, right now, and you're safe. Let's focus on the present moment together.",
    keywords: ['when', 'time', 'year', 'date', 'what time']
  },
  person_question: {
    text: "That's someone special. Tell me more about them and what they mean to you.",
    keywords: ['who', 'family', 'friend', 'mother', 'father', 'sister', 'brother']
  },
  goodbye: {
    text: "Thank you for talking with me. Rest well, and I'll be here whenever you need me.",
    keywords: ['bye', 'goodbye', 'sleep', 'rest', 'quit', 'exit']
  },
  phone_default: {
    text: "Hello, emergency operator here. I'm listening. How can I help you?",
    keywords: []
  },
  security_check: {
    text: "Let me check your doors and windows. Everything looks secure and safe.",
    keywords: []
  },
  night_watch: {
    text: "I'm here keeping watch over you. You're safe. Try to rest.",
    keywords: []
  }
};

let db = null;

// Initialize IndexedDB
export const initOfflineDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(RESPONSES_STORE)) {
        database.createObjectStore(RESPONSES_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains(AUDIO_STORE)) {
        database.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(AUDIO_LIBRARY_STORE)) {
        database.createObjectStore(AUDIO_LIBRARY_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
};

// Cache AI response for offline use
export const cacheOfflineResponse = async (userInput, aiResponse, audioUrl = null) => {
  if (!db) await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RESPONSES_STORE], 'readwrite');
    const store = transaction.objectStore(RESPONSES_STORE);

    const data = {
      userInput: userInput.toLowerCase(),
      aiResponse,
      audioUrl,
      timestamp: new Date().toISOString(),
      mode: 'general'
    };

    const request = store.add(data);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// Get best matching offline response
export const getOfflineResponse = async (userInput) => {
  if (!db) await initOfflineDB();

  return new Promise((resolve) => {
    const transaction = db.transaction([RESPONSES_STORE], 'readonly');
    const store = transaction.objectStore(RESPONSES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const responses = request.result;
      const lowerInput = userInput.toLowerCase();

      // First, try exact keyword matches from common responses
      for (const [key, response] of Object.entries(COMMON_OFFLINE_RESPONSES)) {
        if (response.keywords.some(kw => lowerInput.includes(kw))) {
          resolve({
            text: response.text,
            isCommon: true,
            type: key
          });
          return;
        }
      }

      // Then try cached responses
      if (responses.length > 0) {
        const matches = responses.filter(r =>
          lowerInput.includes(r.userInput) || r.userInput.includes(lowerInput)
        );

        if (matches.length > 0) {
          resolve({
            text: matches[0].aiResponse,
            audioUrl: matches[0].audioUrl,
            isCommon: false
          });
          return;
        }
      }

      // Final fallback
      resolve({
        text: "I'm here with you. Tell me more about how you're feeling.",
        isCommon: true,
        type: 'greeting'
      });
    };

    request.onerror = () => {
      resolve({
        text: "I'm here with you. Tell me more about how you're feeling.",
        isCommon: true,
        type: 'greeting'
      });
    };
  });
};

// Check if device is online
export const isOnline = () => {
  return navigator.onLine;
};

// Download and cache audio file for offline use
export const downloadAudioForOffline = async (audioItem) => {
  if (!db) await initOfflineDB();

  try {
    if (!audioItem?.audio_url) {
      throw new Error('Invalid audio item - missing audio_url');
    }
    
    const response = await fetch(audioItem.audio_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Store in IndexedDB
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readwrite');
        const store = transaction.objectStore(AUDIO_LIBRARY_STORE);

        const data = {
          id: audioItem.id || `audio_${Date.now()}`,
          title: audioItem.title || 'Untitled',
          type: audioItem.type || 'audio',
          audio_blob: blob,
          source_url: audioItem.audio_url,
          metadata: audioItem.metadata || {},
          downloaded_at: new Date().toISOString(),
          storage_size: blob.size
        };

        const request = store.put(data);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Failed to download audio:', error.message);
    throw error;
  }
};

// Get offline audio library
export const getOfflineAudioLibrary = async () => {
  if (!db) await initOfflineDB();

  return new Promise((resolve) => {
    const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_LIBRARY_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        downloaded_at: item.downloaded_at,
        storage_size: item.storage_size
      }));
      resolve(items);
    };

    request.onerror = () => resolve([]);
  });
};

// Get audio blob for playback
export const getOfflineAudioBlob = async (audioId) => {
  if (!db) await initOfflineDB();

  return new Promise((resolve) => {
    const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_LIBRARY_STORE);
    const request = store.get(audioId);

    request.onsuccess = () => {
      const item = request.result;
      if (item?.audio_blob) {
        const url = URL.createObjectURL(item.audio_blob);
        resolve({ url, title: item.title, type: item.type });
      } else {
        resolve(null);
      }
    };

    request.onerror = () => resolve(null);
  });
};

// Remove audio from offline library
export const removeOfflineAudio = async (audioId) => {
  if (!db) await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIO_LIBRARY_STORE);
    const request = store.delete(audioId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Get total offline storage usage
export const getOfflineStorageUsage = async () => {
  if (!db) await initOfflineDB();

  return new Promise((resolve) => {
    const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readonly');
    const store = transaction.objectStore(AUDIO_LIBRARY_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result;
      const totalSize = items.reduce((sum, item) => sum + (item.storage_size || 0), 0);
      resolve({
        total_items: items.length,
        total_size_bytes: totalSize,
        total_size_mb: (totalSize / 1024 / 1024).toFixed(2)
      });
    };

    request.onerror = () => resolve({ total_items: 0, total_size_bytes: 0, total_size_mb: 0 });
  });
};

// Set up online/offline listeners
export const setupOfflineListeners = (onlineCallback, offlineCallback) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

export { COMMON_OFFLINE_RESPONSES };