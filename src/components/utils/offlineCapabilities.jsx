/**
 * Offline Capabilities - Central registry of what works offline
 * Provides status checking and feature availability detection
 */

export const OFFLINE_FEATURES = {
  // Core Features
  CHAT: {
    name: 'AI Chat',
    available: true,
    description: '100+ preloaded responses, context matching',
    fallback: 'Intelligent pattern matching with 6 fallback responses'
  },
  VOICE_OUTPUT: {
    name: 'Voice Synthesis',
    available: true,
    description: 'Browser built-in speech synthesis',
    fallback: 'System voices always available offline'
  },
  VOICE_INPUT: {
    name: 'Voice Recognition',
    available: true,
    description: 'Browser built-in speech recognition',
    fallback: 'Local speech-to-text processing'
  },
  
  // Content Features
  STORIES: {
    name: 'Story Library',
    available: true,
    description: '20 preloaded comforting stories',
    fallback: 'Offline story collection'
  },
  MUSIC: {
    name: 'Music Info',
    available: true,
    description: '15 classic songs metadata',
    fallback: 'Music suggestions (no playback offline)'
  },
  MEMORIES: {
    name: 'Personal Memories',
    available: true,
    description: 'Cached user memories',
    fallback: 'View previously loaded memories'
  },
  PHOTOS: {
    name: 'Photo Gallery',
    available: true,
    description: 'Cached family photos',
    fallback: 'Previously viewed photos available'
  },
  
  // Safety Features
  EMERGENCY_CONTACTS: {
    name: 'Emergency Contacts',
    available: true,
    description: 'Cached contact information',
    fallback: 'Pre-saved emergency numbers'
  },
  PHONE_MODE: {
    name: 'Phone Interface',
    available: true,
    description: 'Full offline phone UI',
    fallback: 'Quick dial and emergency calling'
  },
  NIGHT_WATCH: {
    name: 'Night Watch',
    available: true,
    description: 'Offline monitoring and comfort',
    fallback: 'Local anxiety detection and soothing'
  },
  
  // Data Management
  JOURNAL_ENTRY: {
    name: 'Care Journal',
    available: true,
    description: 'Create entries offline, sync later',
    fallback: 'Queue entries for sync when online'
  },
  ACTIVITY_LOG: {
    name: 'Activity Tracking',
    available: true,
    description: 'Local logging and tracking',
    fallback: 'All activities logged locally'
  },
  
  // Limited Features
  SMART_HOME: {
    name: 'Smart Home Control',
    available: false,
    description: 'Requires internet connection',
    fallback: 'View cached device status only'
  },
  AI_TRANSLATION: {
    name: 'Language Translation',
    available: false,
    description: 'Requires internet for AI translation',
    fallback: 'English only in offline mode'
  },
  VIDEO_PLAYBACK: {
    name: 'Video Content',
    available: false,
    description: 'Streaming requires internet',
    fallback: 'Cached videos only (if previously viewed)'
  }
};

export function getOfflineCapabilities() {
  const available = Object.entries(OFFLINE_FEATURES)
    .filter(([_, feature]) => feature.available)
    .map(([key, feature]) => ({
      key,
      ...feature
    }));
  
  const limited = Object.entries(OFFLINE_FEATURES)
    .filter(([_, feature]) => !feature.available)
    .map(([key, feature]) => ({
      key,
      ...feature
    }));
  
  return { available, limited };
}

export function isFeatureAvailableOffline(featureKey) {
  return OFFLINE_FEATURES[featureKey]?.available || false;
}

export async function checkOfflineReadiness() {
  const checks = {
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    speechSynthesis: 'speechSynthesis' in window,
    speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    notifications: 'Notification' in window,
    backgroundSync: 'sync' in (self?.registration || {}),
    persistentStorage: 'storage' in navigator && 'persist' in navigator.storage
  };

  const criticalMissing = [];
  if (!checks.indexedDB) criticalMissing.push('IndexedDB');
  if (!checks.speechSynthesis) criticalMissing.push('Speech Synthesis');
  
  return {
    ready: criticalMissing.length === 0,
    checks,
    criticalMissing,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length
  };
}

export async function getOfflineStorageStatus() {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }
    
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: percentUsed.toFixed(2),
      available: estimate.quota - estimate.usage,
      usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
      quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
      availableMB: ((estimate.quota - estimate.usage) / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Storage estimate failed:', error);
    return null;
  }
}