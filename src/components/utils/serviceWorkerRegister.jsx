// Service Worker Registration for Offline Support
// DISABLED: Service worker file not available in Base44 environment
export function registerServiceWorker() {
  // Service worker registration disabled - app works without it
  console.log('Service worker registration skipped (not required)');
}

// Request persistent storage
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persistent storage: ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  }
  return false;
}

// Check storage quota
export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: percentUsed.toFixed(2),
      available: estimate.quota - estimate.usage
    };
  }
  return null;
}