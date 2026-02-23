/**
 * Android WebView Bridge - Enables communication between JavaScript and native Android code
 * Provides access to device features while maintaining security
 */

class AndroidWebViewBridge {
  constructor() {
    this.isAndroidWebView = this.detectAndroidWebView();
    this.messageQueue = [];
    this.handlers = new Map();
    this.setupBridge();
  }

  /**
   * Detect if app is running in Android WebView
   */
  detectAndroidWebView() {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    return /Android/.test(userAgent) && /WebView/.test(userAgent);
  }

  /**
   * Initialize the bridge
   */
  setupBridge() {
    if (typeof window === 'undefined') return;

    // Expose bridge to Android native code
    window.MemoryMirrorBridge = {
      // Offline capabilities
      isOfflineReady: () => this.getOfflineStatus(),
      getOfflineData: (type) => this.getOfflineData(type),
      cacheContent: (content) => this.cacheContent(content),
      
      // Device features
      getDeviceInfo: () => this.getDeviceInfo(),
      setDisplayBrightness: (level) => this.setDisplayBrightness(level),
      keepScreenOn: (enabled) => this.keepScreenOn(enabled),
      
      // Notifications
      sendNotification: (title, message) => this.sendNotification(title, message),
      
      // File operations
      downloadFile: (url, filename) => this.downloadFile(url, filename),
      
      // Analytics
      trackEvent: (eventName, data) => this.trackEvent(eventName, data),
      
      // Emergency
      triggerEmergencyAlert: (data) => this.triggerEmergencyAlert(data)
    };

    // Listen for messages from native code
    window.addEventListener('message', (event) => this.handleNativeMessage(event));

    // Mark bridge as ready
    if (window.AndroidInterface && typeof window.AndroidInterface.onBridgeReady === 'function') {
      window.AndroidInterface.onBridgeReady();
    }

    console.log('🔗 Android WebView Bridge initialized');
  }

  /**
   * Send message to native Android code
   */
  sendToNative(action, data = {}) {
    if (!this.isAndroidWebView) {
      console.warn('Not running in Android WebView');
      return Promise.reject('Not in Android WebView');
    }

    try {
      if (window.AndroidInterface && typeof window.AndroidInterface[action] === 'function') {
        return Promise.resolve(window.AndroidInterface[action](JSON.stringify(data)));
      }
      console.warn(`Native method not available: ${action}`);
      return Promise.reject(`Native method not available: ${action}`);
    } catch (error) {
      console.error('Error sending to native:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Handle messages from native Android code
   */
  handleNativeMessage(event) {
    try {
      const { action, data } = event.data;
      if (this.handlers.has(action)) {
        const handler = this.handlers.get(action);
        handler(data);
      }
    } catch (error) {
      console.error('Error handling native message:', error);
    }
  }

  /**
   * Register handler for native messages
   */
  onNativeMessage(action, handler) {
    this.handlers.set(action, handler);
  }

  // ==================== Device Features ====================

  /**
   * Get device information
   */
  async getDeviceInfo() {
    try {
      const info = {
        isAndroidWebView: this.isAndroidWebView,
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine,
        storage: this.getStorageInfo(),
        screen: {
          width: window.innerWidth,
          height: window.innerHeight,
          orientation: window.orientation || 'unknown'
        }
      };
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }

  /**
   * Get storage information
   */
  getStorageInfo() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        return navigator.storage.estimate();
      }
      return { usage: 0, quota: 0 };
    } catch (error) {
      return { usage: 0, quota: 0 };
    }
  }

  /**
   * Set display brightness (0-100)
   */
  async setDisplayBrightness(level) {
    return this.sendToNative('setDisplayBrightness', { level: Math.max(0, Math.min(100, level)) });
  }

  /**
   * Keep screen on/off
   */
  async keepScreenOn(enabled) {
    return this.sendToNative('keepScreenOn', { enabled });
  }

  // ==================== Offline Features ====================

  /**
   * Get offline readiness status
   */
  async getOfflineStatus() {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return { ready: false };

      const syncMeta = await this.getFromStore('syncMeta', 'offline_ready');
      if (!syncMeta) return { ready: false };

      return {
        ready: true,
        version: syncMeta.version,
        contentCount: syncMeta.totalOfflineContent,
        lastSync: syncMeta.timestamp,
        details: {
          responses: syncMeta.responseCount,
          stories: syncMeta.storiesCount,
          music: syncMeta.musicCount,
          exercises: syncMeta.exercisesCount
        }
      };
    } catch (error) {
      console.error('Error getting offline status:', error);
      return { ready: false, error: error.message };
    }
  }

  /**
   * Get offline data by type
   */
  async getOfflineData(type) {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return [];

      const storeMap = {
        stories: 'stories',
        music: 'music',
        responses: 'aiResponses',
        exercises: 'activityLog'
      };

      const storeName = storeMap[type];
      if (!storeName) return [];

      return await this.getAllFromStore(storeName);
    } catch (error) {
      console.error(`Error getting offline ${type}:`, error);
      return [];
    }
  }

  /**
   * Cache content for offline
   */
  async cacheContent(content) {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return false;

      const storeMap = {
        story: 'stories',
        song: 'music',
        memory: 'memories'
      };

      const storeName = storeMap[content.type];
      if (!storeName) return false;

      await this.saveToStore(storeName, content);
      return true;
    } catch (error) {
      console.error('Error caching content:', error);
      return false;
    }
  }

  /**
   * Access offline IndexedDB
   */
  async getOfflineDatabase() {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('MemoryMirrorDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch (error) {
        resolve(null);
      }
    });
  }

  /**
   * Save to offline store
   */
  async saveToStore(storeName, data) {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return false;

      return new Promise((resolve) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Get from offline store
   */
  async getFromStore(storeName, key) {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return null;

      return new Promise((resolve) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all from offline store
   */
  async getAllFromStore(storeName) {
    try {
      const db = await this.getOfflineDatabase();
      if (!db) return [];

      return new Promise((resolve) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      return [];
    }
  }

  // ==================== Notifications ====================

  /**
   * Send notification to native
   */
  async sendNotification(title, message) {
    return this.sendToNative('sendNotification', { title, message });
  }

  /**
   * Handle notifications from native
   */
  onNotification(callback) {
    this.onNativeMessage('notification', callback);
  }

  // ==================== File Operations ====================

  /**
   * Download file
   */
  async downloadFile(url, filename) {
    return this.sendToNative('downloadFile', { url, filename });
  }

  // ==================== Analytics ====================

  /**
   * Track event
   */
  async trackEvent(eventName, data = {}) {
    if (!this.isAndroidWebView) return;
    
    try {
      await this.sendToNative('trackEvent', {
        eventName,
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  }

  // ==================== Emergency ====================

  /**
   * Trigger emergency alert
   */
  async triggerEmergencyAlert(data) {
    return this.sendToNative('emergencyAlert', {
      severity: data.severity || 'high',
      message: data.message || 'Emergency alert triggered',
      contacts: data.contacts || [],
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Listen for emergency calls from native
   */
  onEmergencyAlert(callback) {
    this.onNativeMessage('emergencyAlert', callback);
  }
}

// Singleton instance
const androidBridge = new AndroidWebViewBridge();

export default androidBridge;