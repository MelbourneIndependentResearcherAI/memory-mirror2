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
  if (db) return db; // Return existing connection

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Offline DB initialization timeout after 10 seconds'));
    }, 10000);

    try {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error || new Error('IndexedDB open failed'));
      };
      
      request.onsuccess = () => {
        clearTimeout(timeout);
        db = request.result;
        
        // Error handler for connection issues
        db.onerror = (event) => {
          console.error('Offline DB connection error:', event);
        };
        
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        clearTimeout(timeout);
        const database = event.target.result;
        
        try {
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
        } catch (storeError) {
          console.error('Error creating stores:', storeError);
        }
      };
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
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
    // Support multiple audio URL formats
    const audioUrl = audioItem.audio_url || audioItem.audio_file_url || audioItem.youtube_url;
    if (!audioUrl) {
      throw new Error('Missing audio URL (audio_url, audio_file_url, or youtube_url required)');
    }
    
    // Validate URL format
    try {
      new URL(audioUrl);
    } catch {
      throw new Error('Invalid audio URL format');
    }
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(audioUrl, { 
      method: 'GET',
      headers: { 'Accept': 'audio/*' },
      credentials: 'same-origin',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    // Store in IndexedDB with full error handling
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readwrite');
        const store = transaction.objectStore(AUDIO_LIBRARY_STORE);

        const data = {
          id: audioItem.id || `audio_${Date.now()}_${Math.random()}`,
          title: audioItem.title || audioItem.name || 'Untitled Audio',
          type: audioItem.type || 'audio',
          audio_blob: blob,
          source_url: audioUrl,
          metadata: audioItem.metadata || {
            artist: audioItem.artist || 'Unknown',
            era: audioItem.era || 'present',
            genre: audioItem.genre || 'unknown'
          },
          downloaded_at: new Date().toISOString(),
          storage_size: blob.size,
          offline_ready: true
        };

        const request = store.put(data);
        
        request.onerror = () => {
          console.error('❌ IndexedDB store error:', request.error);
          reject(new Error(`Storage error: ${request.error?.message || 'Unknown'}`));
        };
        
        request.onsuccess = () => {
          console.log(`✅ Audio cached: ${data.title} (${(data.storage_size / 1024).toFixed(2)}KB)`);
          resolve({ id: data.id, size: data.storage_size });
        };
        
        transaction.onerror = () => {
          reject(new Error('Transaction failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('❌ Audio download failed:', error.message);
    // Don't re-throw - allow app to continue with missing audio
    return { success: false, error: error.message };
  }
};

// Get offline audio library
export const getOfflineAudioLibrary = async () => {
  if (!db) await initOfflineDB();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve([]); // Timeout fallback
    }, 5000);

    try {
      const transaction = db.transaction([AUDIO_LIBRARY_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_LIBRARY_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        clearTimeout(timeout);
        const items = request.result?.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          downloaded_at: item.downloaded_at,
          storage_size: item.storage_size
        })) || [];
        resolve(items);
      };

      request.onerror = () => {
        clearTimeout(timeout);
        resolve([]);
      };
      
      transaction.onerror = () => {
        clearTimeout(timeout);
        resolve([]);
      };
    } catch (error) {
      clearTimeout(timeout);
      resolve([]);
    }
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