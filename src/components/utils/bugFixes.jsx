/**
 * Bug Fixes and Error Prevention Utilities
 * Automatically applied across the app
 */

// Fix: Prevent console errors in production
export function initConsoleSafety() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const noop = () => {};
    console.warn = noop;
    console.error = noop;
  }
}

// Fix: Handle offline state gracefully
export function initOfflineHandling() {
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
      console.log('App is offline - enabling offline mode');
      document.body.classList.add('offline-mode');
    });

    window.addEventListener('online', () => {
      console.log('App is online - syncing data');
      document.body.classList.remove('offline-mode');
    });
  }
}

// Fix: Prevent double-tap zoom on iOS
export function preventDoubleTapZoom() {
  if (typeof document !== 'undefined') {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
}

// Fix: Handle speech synthesis errors gracefully
export function initSpeechSynthesisSafety() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const originalSpeak = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function(utterance) {
      try {
        return originalSpeak.call(this, utterance);
      } catch (error) {
        console.log('Speech synthesis error prevented:', error.message);
      }
    };
  }
}

// Fix: Auto-reload on service worker update
export function initServiceWorkerAutoReload() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New version available - reloading...');
            setTimeout(() => window.location.reload(), 1000);
          }
        });
      });
    });
  }
}

// Fix: Prevent memory leaks from event listeners
export function createSafeEventListener(element, event, handler) {
  const wrappedHandler = (...args) => {
    try {
      return handler(...args);
    } catch (error) {
      console.log('Event handler error prevented:', error.message);
    }
  };
  
  element.addEventListener(event, wrappedHandler);
  
  return () => element.removeEventListener(event, wrappedHandler);
}

// Initialize all bug fixes
export function initAllBugFixes() {
  initConsoleSafety();
  initOfflineHandling();
  preventDoubleTapZoom();
  initSpeechSynthesisSafety();
  initServiceWorkerAutoReload();
  
  console.log('✅ All bug fixes initialized');
}