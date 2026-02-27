// Complete offline functionality preloader - ensures 100% offline operation
import { base44 } from '@/api/base44Client';
import { saveToStore, STORES, initOfflineStorage } from './offlineStorage';
import { isOnline } from './offlineManager';
import { OFFLINE_STORIES, OFFLINE_MUSIC, MEMORY_EXERCISES, COMPREHENSIVE_OFFLINE_RESPONSES } from './offlinePreloaderData.js';

// Essential data categories for offline mode
const ESSENTIAL_CATEGORIES = [
  'UserProfile',
  'Music',
  'CognitiveAssessment',
  'FamilyMedia',
  'VoiceProfile'
];

// Exported for use by both auto-start and manual (OfflineDownloadProgress) download
export async function preloadEssentialData() {
  console.log('🚀 Starting offline data preload...');
  
  await initOfflineStorage();
  
  const results = { aiResponses: 0, stories: 0, music: 0, exercises: 0, entities: {}, errors: [] };

  // 1. AI Responses
  for (const resp of COMPREHENSIVE_OFFLINE_RESPONSES) {
    try {
      await saveToStore(STORES.aiResponses, { prompt: resp.prompt, response: resp.response, category: resp.category, timestamp: Date.now(), offline: true });
      results.aiResponses++;
    } catch (e) { /* skip */ }
  }

  // 2. Stories
  for (const story of OFFLINE_STORIES) {
    try {
      await saveToStore(STORES.stories, { ...story, offline_preloaded: true });
      results.stories++;
    } catch (e) { /* skip */ }
  }

  // 3. Music metadata
  for (const song of OFFLINE_MUSIC) {
    try {
      await saveToStore(STORES.music, { ...song, offline_preloaded: true, is_downloaded: true });
      results.music++;
    } catch (e) { /* skip */ }
  }

  // 4. Memory Exercises
  for (const exercise of MEMORY_EXERCISES) {
    try {
      await saveToStore(STORES.activityLog, { activity_type: 'memory_exercise', exercise_id: exercise.id, details: exercise, offline_preloaded: true, created_date: new Date().toISOString() });
      results.exercises++;
    } catch (e) { /* skip */ }
  }

  // 5. Entity data (online only)
  if (isOnline()) {
    for (const entityName of ESSENTIAL_CATEGORIES) {
      try {
        const data = await base44.entities[entityName].list();
        let savedCount = 0;
        for (const item of data) {
          try { await saveToStore(entityName.toLowerCase(), item); savedCount++; } catch (e) { /* skip */ }
        }
        results.entities[entityName] = savedCount;
      } catch (error) {
        results.errors.push(`${entityName}: ${error.message}`);
      }
    }
  }

  // Mark complete
  try {
    await saveToStore(STORES.syncMeta, { key: 'offline_ready', timestamp: new Date().toISOString(), version: '5.0', ...results });
  } catch (e) { /* skip */ }

  console.log(`✅ Offline preload complete: ${results.aiResponses} AI, ${results.stories} stories, ${results.music} music, ${results.exercises} exercises`);
  return results;
}

// Auto-preload on app start
if (typeof window !== 'undefined') {
  const isAndroidWebView = /Android/.test(navigator.userAgent) && /WebView/.test(navigator.userAgent);
  const PRELOAD_SESSION_KEY = 'offline_preload_done';
  const sessionPreloaded = sessionStorage.getItem(PRELOAD_SESSION_KEY);
  
  if (!sessionPreloaded) {
    setTimeout(() => {
      preloadEssentialData().then((result) => {
        sessionStorage.setItem(PRELOAD_SESSION_KEY, 'true');
        if (isAndroidWebView && window.AndroidInterface?.onOfflinePreloadComplete) {
          window.AndroidInterface.onOfflinePreloadComplete(JSON.stringify(result));
        }
      }).catch(err => console.log('Preload warning:', err.message));
    }, 3000);
  }

  window.addEventListener('online', () => {
    setTimeout(() => preloadEssentialData(), 1000);
  });

  window.addEventListener('offline', () => {
    if (isAndroidWebView && window.AndroidInterface?.onOffline) {
      window.AndroidInterface.onOffline();
    }
  });
}

export default preloadEssentialData;