/**
 * Offline Chat AI - Provides basic AI responses without internet
 * Uses pre-cached responses and fallback generation
 */

import { getAllFromStore, STORES, initOfflineStorage } from './offlineStorage';

const COMMON_TOPICS = {
  memory: ['remember', 'memory', 'forgot', 'recall', 'past', 'when'],
  mood: ['happy', 'sad', 'anxious', 'worried', 'feel', 'feeling', 'mood', 'upset'],
  activity: ['activity', 'exercise', 'music', 'game', 'activity', 'do', 'did'],
  health: ['health', 'pain', 'medicine', 'medication', 'hurt', 'sick'],
  family: ['family', 'mother', 'father', 'child', 'son', 'daughter', 'wife', 'husband'],
  time: ['what time', 'when', 'today', 'tomorrow', 'yesterday', 'date']
};

export class OfflineChatAI {
  constructor() {
    this.cachedResponses = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await initOfflineStorage();
      const responses = await getAllFromStore(STORES.aiResponses);
      this.cachedResponses = responses || [];
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load cached AI responses:', error);
      this.initialized = true;
    }
  }

  async getResponse(userMessage) {
    if (!this.initialized) {
      await this.initialize();
    }

    const lowerMessage = userMessage.toLowerCase();

    // 1. Try to find exact cached response
    const cachedMatch = this.cachedResponses.find(r =>
      lowerMessage.includes(r.prompt?.toLowerCase()) &&
      r.response
    );
    
    if (cachedMatch) {
      return {
        text: cachedMatch.response,
        source: 'cached',
        timestamp: new Date().toISOString()
      };
    }

    // 2. Try topic-based fallback responses
    const response = this.generateFallbackResponse(userMessage);
    return {
      text: response,
      source: 'offline_fallback',
      timestamp: new Date().toISOString()
    };
  }

  generateFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for time-related questions
    if (COMMON_TOPICS.time.some(word => lowerMessage.includes(word))) {
      const now = new Date();
      return `It's currently ${now.toLocaleTimeString('en-AU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} on ${now.toLocaleDateString('en-AU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}. Is there something I can help you with?`;
    }

    // Check for memory-related questions
    if (COMMON_TOPICS.memory.some(word => lowerMessage.includes(word))) {
      return "I'm here to help you recall precious memories. Would you like to talk about a specific time or person from your past? I'm a good listener.";
    }

    // Check for mood-related questions
    if (COMMON_TOPICS.mood.some(word => lowerMessage.includes(word))) {
      return "I'm here for you. Sometimes it helps to talk about what's on your mind. What would you like to tell me?";
    }

    // Check for activity suggestions
    if (COMMON_TOPICS.activity.some(word => lowerMessage.includes(word))) {
      const activities = [
        "How about we listen to some music? I have lots of songs from different eras.",
        "Would you like to look at some photos or memories?",
        "We could play a gentle memory game if you'd like.",
        "Would you enjoy hearing a relaxing story?"
      ];
      return activities[Math.floor(Math.random() * activities.length)];
    }

    // Check for health-related questions
    if (COMMON_TOPICS.health.some(word => lowerMessage.includes(word))) {
      return "I hope you're feeling well. If you need medical assistance, please contact your healthcare provider or local emergency services. Is there something else I can help with?";
    }

    // Check for family-related questions
    if (COMMON_TOPICS.family.some(word => lowerMessage.includes(word))) {
      return "Family is precious. I'd love to hear more about your loved ones. What would you like to tell me?";
    }

    // Default friendly response
    const defaultResponses = [
      "That's an interesting thought. Tell me more about that.",
      "I'm listening. What's on your mind?",
      "I'm here to chat with you. What would you like to talk about?",
      "That sounds important. I'm here to listen.",
      "I appreciate you sharing that with me."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  async searchCachedResponses(query) {
    if (!this.initialized) {
      await this.initialize();
    }

    const lowerQuery = query.toLowerCase();
    return this.cachedResponses.filter(r =>
      r.prompt?.toLowerCase().includes(lowerQuery) ||
      r.response?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const offlineChatAI = new OfflineChatAI();

if (typeof window !== 'undefined') {
  window.offlineChatAI = offlineChatAI;
}