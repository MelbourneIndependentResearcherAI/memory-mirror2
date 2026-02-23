/**
 * Android WebView Configuration
 * Settings for optimal Android WebView integration
 */

export const ANDROID_WEBVIEW_CONFIG = {
  // Display settings
  display: {
    // Handle notch/safe area insets
    safeAreaInsetTop: 'max(env(safe-area-inset-top), 10px)',
    safeAreaInsetBottom: 'max(env(safe-area-inset-bottom), 10px)',
    safeAreaInsetLeft: 'max(env(safe-area-inset-left), 0px)',
    safeAreaInsetRight: 'max(env(safe-area-inset-right), 0px)',
    
    // Viewport settings
    viewport: {
      width: 'device-width',
      initialScale: 1.0,
      minimumScale: 1.0,
      maximumScale: 5.0,
      userScalable: 'no',
      viewportFit: 'cover'
    },

    // Touch settings
    touchAction: 'manipulation',
    webkitTouchCallout: 'none',
    userSelect: 'none',
    textSizeAdjust: '100%'
  },

  // Offline capabilities
  offline: {
    // IndexedDB settings
    maxStorageSize: 50 * 1024 * 1024, // 50MB
    
    // Cache settings
    serviceWorkerEnabled: true,
    cacheName: 'memory-mirror-v1',
    
    // Content preload priorities
    preloadPriorities: {
      stories: 'high',
      music: 'high',
      aiResponses: 'critical',
      images: 'medium',
      videos: 'low'
    },

    // Sync settings
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    retryDelay: 2000
  },

  // Dark mode
  darkMode: {
    enabled: true,
    preferSystemSettings: true,
    
    // CSS variables for dark mode
    colors: {
      background: '#0a0a0a',
      foreground: '#f5f5f5',
      card: '#1a1a1a',
      primary: '#2563eb',
      accent: '#3b82f6'
    },

    // Auto-detect based on time
    scheduleEnabled: false,
    scheduleStart: 20, // 8 PM
    scheduleEnd: 6    // 6 AM
  },

  // Performance optimizations
  performance: {
    // Image optimization
    imageCompression: {
      enabled: true,
      maxWidth: 1080,
      quality: 0.8
    },

    // Lazy loading
    lazyLoad: {
      enabled: true,
      imageThreshold: '50px',
      videoThreshold: '50px'
    },

    // Smooth scrolling
    smoothScroll: true,
    
    // Debounce delays
    debounceDelay: 300,
    throttleDelay: 500
  },

  // Battery optimization
  battery: {
    // Reduce animations on low battery
    reducedMotionOnBattery: true,
    batteryLevelThreshold: 20, // %
    
    // Limit background sync
    backgroundSyncEnabled: true,
    backgroundSyncDelay: 60000 // 1 minute
  },

  // Memory optimization
  memory: {
    // Memory limits
    maxCachedImages: 50,
    maxCachedAudio: 10,
    
    // Garbage collection
    enableGC: true,
    gcInterval: 5 * 60 * 1000 // 5 minutes
  },

  // Network optimization
  network: {
    // Connection detection
    enableConnectionDetection: true,
    
    // Data saver mode
    dataServerMode: {
      enabled: true,
      reduceImages: true,
      reduceVideo: true,
      lowerQuality: true
    },

    // Request optimization
    requestTimeout: 10000,
    retryAttempts: 3,
    
    // Compression
    gzipEnabled: true
  },

  // Security
  security: {
    // HTTPS only
    httpsOnly: true,
    
    // Certificate pinning (optional)
    certificatePinning: false,
    
    // Content security policy
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https:', 'data:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'", 'https:'],
        mediaSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"]
      }
    }
  },

  // Accessibility
  accessibility: {
    // Minimum touch target size
    minTouchTarget: 48, // pixels
    
    // Text size
    minFontSize: 14,
    lineHeight: 1.6,
    
    // Color contrast
    minContrast: 4.5, // WCAG AA
    
    // Focus indication
    focusIndicatorWidth: 3
  },

  // Platform specific
  android: {
    // WebView version detection
    minWebViewVersion: 60,
    
    // Hardware acceleration
    hardwareAcceleration: true,
    
    // Vertical scrollbar
    verticalScrollbar: true,
    
    // Mixed content mode
    mixedContentMode: 'MIXED_CONTENT_COMPATIBILITY',
    
    // Safe browsing
    safeBrowsingEnabled: true,
    
    // User agent override (optional)
    userAgentString: null // Uses default if null
  }
};

/**
 * Get current configuration
 */
export function getAndroidWebViewConfig() {
  return ANDROID_WEBVIEW_CONFIG;
}

/**
 * Apply configuration to document
 */
export function applyAndroidWebViewConfig() {
  if (typeof document === 'undefined') return;

  // Set viewport meta tag
  const viewport = ANDROID_WEBVIEW_CONFIG.display.viewport;
  const viewportContent = `width=${viewport.width}, initial-scale=${viewport.initialScale}, maximum-scale=${viewport.maximumScale}, user-scalable=${viewport.userScalable}, viewport-fit=${viewport.viewportFit}`;
  
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', viewportContent);
  }

  // Set theme color
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    document.head.appendChild(themeMeta);
  }
  themeMeta.content = ANDROID_WEBVIEW_CONFIG.darkMode.colors.primary;

  // Apply display CSS
  const style = document.createElement('style');
  style.textContent = `
    :root {
      /* Safe area */
      --safe-area-top: ${ANDROID_WEBVIEW_CONFIG.display.safeAreaInsetTop};
      --safe-area-bottom: ${ANDROID_WEBVIEW_CONFIG.display.safeAreaInsetBottom};
      --safe-area-left: ${ANDROID_WEBVIEW_CONFIG.display.safeAreaInsetLeft};
      --safe-area-right: ${ANDROID_WEBVIEW_CONFIG.display.safeAreaInsetRight};
      
      /* Colors */
      --android-bg: ${ANDROID_WEBVIEW_CONFIG.darkMode.colors.background};
      --android-fg: ${ANDROID_WEBVIEW_CONFIG.darkMode.colors.foreground};
      --android-card: ${ANDROID_WEBVIEW_CONFIG.darkMode.colors.card};
      --android-primary: ${ANDROID_WEBVIEW_CONFIG.darkMode.colors.primary};
      --android-accent: ${ANDROID_WEBVIEW_CONFIG.darkMode.colors.accent};
    }

    body, html {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    #root {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
    }

    button, a, input[type="button"], input[type="submit"] {
      min-height: ${ANDROID_WEBVIEW_CONFIG.accessibility.minTouchTarget}px;
      min-width: ${ANDROID_WEBVIEW_CONFIG.accessibility.minTouchTarget}px;
      -webkit-tap-highlight-color: transparent;
    }

    /* Prevent pinch zoom */
    input, select, textarea {
      font-size: 16px;
    }

    /* Focus indicator */
    :focus-visible {
      outline: ${ANDROID_WEBVIEW_CONFIG.accessibility.focusIndicatorWidth}px solid var(--android-primary);
      outline-offset: 2px;
    }

    /* Smooth scrolling */
    ${ANDROID_WEBVIEW_CONFIG.performance.smoothScroll ? `
    html {
      scroll-behavior: smooth;
    }
    ` : ''}

    /* Safe area padding */
    .safe-area-top {
      padding-top: var(--safe-area-top);
    }

    .safe-area-bottom {
      padding-bottom: var(--safe-area-bottom);
    }

    .safe-area-left {
      padding-left: var(--safe-area-left);
    }

    .safe-area-right {
      padding-right: var(--safe-area-right);
    }
  `;
  
  document.head.appendChild(style);
}

export default ANDROID_WEBVIEW_CONFIG;