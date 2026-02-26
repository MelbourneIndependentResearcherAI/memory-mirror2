/**
 * Simple Offline Cache - Guaranteed to work
 * Uses localStorage only, no complex IndexedDB
 * Minimal, focused, reliable
 */

const CACHE_KEY = 'memoryMirror_offline_cache';
const MAX_CACHE_SIZE = 50; // Keep last 50 interactions

class SimpleOfflineCache {
  getCache() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : { interactions: [], lastOnline: Date.now() };
    } catch (error) {
      console.error('Cache read error:', error);
      return { interactions: [], lastOnline: Date.now() };
    }
  }

  saveCache(cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  // Cache a user message and AI response pair
  cacheInteraction(userMessage, aiResponse) {
    try {
      const cache = this.getCache();
      cache.interactions.push({
        userMessage: userMessage.substring(0, 500), // Limit size
        aiResponse: aiResponse.substring(0, 500),
        timestamp: Date.now()
      });
      
      // Keep only last 50
      if (cache.interactions.length > MAX_CACHE_SIZE) {
        cache.interactions = cache.interactions.slice(-MAX_CACHE_SIZE);
      }
      
      this.saveCache(cache);
      return true;
    } catch (error) {
      console.error('Failed to cache interaction:', error);
      return false;
    }
  }

  // Get a similar cached response based on keywords
  findSimilarResponse(userMessage) {
    try {
      const cache = this.getCache();
      if (!cache.interactions.length) return null;

      const keywords = userMessage.toLowerCase().split(' ');
      
      // Find interactions that match keywords
      for (const interaction of cache.interactions) {
        const msgLower = interaction.userMessage.toLowerCase();
        if (keywords.some(kw => msgLower.includes(kw))) {
          return interaction.aiResponse;
        }
      }
      
      // Fallback to most recent response
      return cache.interactions[cache.interactions.length - 1]?.aiResponse || null;
    } catch (error) {
      console.error('Failed to find similar response:', error);
      return null;
    }
  }

  // Get a caring fallback response
  getOfflineResponse() {
    const responses = [
      "I'm here with you, even though we're not connected right now. Tell me what's on your mind.",
      "We're offline at the moment, but I'm still here listening. What would you like to talk about?",
      "I'm with you always. Even offline, I care about what you have to say.",
      "We're having a moment without internet, but that doesn't change that I'm here for you.",
      "Tell me what you're thinking. I'm listening, offline or not."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  getCacheSize() {
    try {
      const cache = this.getCache();
      return cache.interactions.length;
    } catch {
      return 0;
    }
  }
}

export const offlineCache = new SimpleOfflineCache();