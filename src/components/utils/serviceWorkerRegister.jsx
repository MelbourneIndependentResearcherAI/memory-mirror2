// Service Worker Registration for Offline Support
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
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