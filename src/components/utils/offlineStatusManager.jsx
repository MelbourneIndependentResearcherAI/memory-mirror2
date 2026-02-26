/**
 * Offline Status Manager - Track online/offline state
 */

class OfflineStatusManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  onStatusChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.isOnline);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  getStatus() {
    return this.isOnline;
  }
}

export const offlineStatus = new OfflineStatusManager();