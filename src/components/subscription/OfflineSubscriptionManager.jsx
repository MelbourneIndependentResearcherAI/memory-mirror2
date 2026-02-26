/**
 * Offline Subscription Manager
 * Caches subscription data locally for offline access
 */

const SUBSCRIPTION_CACHE_KEY = 'mm_subscription_cache';
const SUBSCRIPTION_CACHE_TIME = 'mm_subscription_cache_time';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const offlineSubscriptionManager = {
  // Save subscription to localStorage
  saveSubscription(subscriptionData) {
    try {
      localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subscriptionData));
      localStorage.setItem(SUBSCRIPTION_CACHE_TIME, Date.now().toString());
    } catch (error) {
      console.error('Failed to save subscription cache:', error);
    }
  },

  // Get cached subscription
  getCachedSubscription() {
    try {
      const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      const cacheTime = localStorage.getItem(SUBSCRIPTION_CACHE_TIME);
      
      if (!cached || !cacheTime) return null;

      // Check if cache is still valid
      const age = Date.now() - parseInt(cacheTime);
      if (age > CACHE_DURATION) {
        this.clearCache();
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to read subscription cache:', error);
      return null;
    }
  },

  // Clear cached subscription
  clearCache() {
    try {
      localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      localStorage.removeItem(SUBSCRIPTION_CACHE_TIME);
    } catch (error) {
      console.error('Failed to clear subscription cache:', error);
    }
  },

  // Check if data is fresh enough
  isCacheFresh() {
    try {
      const cacheTime = localStorage.getItem(SUBSCRIPTION_CACHE_TIME);
      if (!cacheTime) return false;

      const age = Date.now() - parseInt(cacheTime);
      return age < CACHE_DURATION;
    } catch {
      return false;
    }
  }
};