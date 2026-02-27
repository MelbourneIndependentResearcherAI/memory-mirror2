/**
 * Unified Offline Manager - All offline functionality through single database
 */

import { initOfflineStorage, saveToStore, getAllFromStore, STORES } from './offlineStorage';

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
  }
};

// Initialize offline DB (uses unified offlineStorage)
export const initOfflineDB = async () => {
  return await initOfflineStorage();
};

// Cache AI response
export const cacheOfflineResponse = async (userInput, aiResponse, audioUrl = null) => {
  return await saveToStore(STORES.aiResponses, {
    userInput: userInput.toLowerCase(),
    aiResponse,
    audioUrl,
    timestamp: new Date().toISOString(),
    mode: 'general'
  });
};

// Get best matching offline response
export const getOfflineResponse = async (userInput) => {
  const responses = await getAllFromStore(STORES.aiResponses);
  const lowerInput = userInput.toLowerCase();

  // First, try exact keyword matches
  for (const [key, response] of Object.entries(COMMON_OFFLINE_RESPONSES)) {
    if (response.keywords.some(kw => lowerInput.includes(kw))) {
      return {
        text: response.text,
        isCommon: true,
        type: key
      };
    }
  }

  // Then try cached responses
  if (responses.length > 0) {
    const matches = responses.filter(r =>
      lowerInput.includes(r.userInput) || r.userInput.includes(lowerInput)
    );

    if (matches.length > 0) {
      return {
        text: matches[0].aiResponse,
        audioUrl: matches[0].audioUrl,
        isCommon: false
      };
    }
  }

  // Fallback
  return {
    text: "I'm here with you. Tell me more about how you're feeling.",
    isCommon: true,
    type: 'greeting'
  };
};

// Check online status
export const isOnline = () => {
  return navigator.onLine;
};

// Download and cache audio file with retry logic
export const downloadAudioForOffline = async (audioItem, maxRetries = 3) => {
  const audioUrl = audioItem.audio_url || audioItem.audio_file_url || audioItem.youtube_url;
  if (!audioUrl) {
    throw new Error('Missing audio URL');
  }

  // Validate URL
  try {
    new URL(audioUrl);
  } catch {
    throw new Error('Invalid audio URL format');
  }

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(audioUrl, {
        method: 'GET',
        headers: { 'Accept': 'audio/*' },
        credentials: 'same-origin',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty audio file');
      }

      // Store in IndexedDB
      const audioData = {
        id: audioItem.id || `audio_${Date.now()}_${Math.random()}`,
        title: audioItem.title || audioItem.name || 'Untitled',
        type: audioItem.type || 'audio',
        audio_blob: blob,
        source_url: audioUrl,
        metadata: {
          artist: audioItem.artist || 'Unknown',
          era: audioItem.era || 'present',
          genre: audioItem.genre || 'unknown'
        },
        downloadedAt: new Date().toISOString(),
        storage_size: blob.size,
        offline_ready: true
      };

      await saveToStore(STORES.audioLibrary, audioData);
      console.log(`✅ Audio cached: ${audioData.title} (${(blob.size / 1024).toFixed(2)}KB)`);
      
      return { id: audioData.id, size: blob.size };
    } catch (error) {
      lastError = error;
      console.warn(`❌ Audio download attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Audio download failed');
};

// Get offline audio library
export const getOfflineAudioLibrary = async () => {
  try {
    const items = await getAllFromStore(STORES.audioLibrary);
    return items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      downloadedAt: item.downloadedAt,
      storage_size: item.storage_size
    }));
  } catch (error) {
    console.error('Failed to get audio library:', error);
    return [];
  }
};

// Remove audio from offline library
export const removeOfflineAudio = async (audioId) => {
  try {
    const db = await initOfflineStorage();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.audioLibrary], 'readwrite');
      const store = tx.objectStore(STORES.audioLibrary);
      const request = store.delete(audioId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to remove audio:', error);
    throw error;
  }
};

// Get audio blob for playback
export const getOfflineAudioBlob = async (audioId) => {
  try {
    const db = await initOfflineStorage();
    return new Promise((resolve) => {
      const tx = db.transaction([STORES.audioLibrary], 'readonly');
      const store = tx.objectStore(STORES.audioLibrary);
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
  } catch (error) {
    console.error('Failed to get audio blob:', error);
    return null;
  }
};

// Get total offline storage usage
export const getOfflineStorageUsage = async () => {
  try {
    const items = await getAllFromStore(STORES.audioLibrary);
    const totalSize = items.reduce((sum, item) => sum + (item.storage_size || 0), 0);
    return {
      total_items: items.length,
      total_size_bytes: totalSize,
      total_size_mb: (totalSize / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    return { total_items: 0, total_size_bytes: 0, total_size_mb: 0 };
  }
};

// Setup online/offline listeners
export const setupOfflineListeners = (onlineCallback, offlineCallback) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

export { COMMON_OFFLINE_RESPONSES };