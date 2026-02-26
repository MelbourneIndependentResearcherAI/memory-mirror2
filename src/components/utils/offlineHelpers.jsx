// Offline helpers for ChatInterface - provides fallback implementations
import { base44 } from '@/api/base44Client';

// Cache for offline responses
const offlineResponseCache = {
  interactions: [],
  
  cache: (userMsg, aiMsg) => {
    offlineResponseCache.interactions.push({ userMsg, aiMsg, timestamp: Date.now() });
    if (offlineResponseCache.interactions.length > 100) {
      offlineResponseCache.interactions = offlineResponseCache.interactions.slice(-50);
    }
  },
  
  findSimilar: (userMsg) => {
    if (!userMsg || offlineResponseCache.interactions.length === 0) return null;
    
    const lower = userMsg.toLowerCase();
    for (const interaction of offlineResponseCache.interactions) {
      if (interaction.userMsg.toLowerCase().includes(lower) || 
          lower.includes(interaction.userMsg.toLowerCase())) {
        return interaction.aiMsg;
      }
    }
    return null;
  },
  
  getGeneric: () => {
    const responses = [
      "I'm here with you. Tell me what's on your mind.",
      "You're safe and not alone. I'm listening.",
      "What would you like to talk about?",
      "I care about you. How are you feeling?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

// Offline entity operations
export const offlineEntities = {
  create: async (entityName, data) => {
    try {
      return await base44.entities[entityName].create(data);
    } catch (error) {
      console.log(`Offline: ${entityName} create skipped`, error.message);
      return null;
    }
  },
  
  filter: async (entityName, query) => {
    try {
      return await base44.entities[entityName].filter(query);
    } catch (error) {
      console.log(`Offline: ${entityName} filter skipped`, error.message);
      return [];
    }
  }
};

// Offline function calls
export const offlineFunction = async (functionName, params) => {
  try {
    return await base44.functions.invoke(functionName, params);
  } catch (error) {
    console.log(`Offline: ${functionName} call skipped`, error.message);
    
    // Return safe fallbacks
    if (functionName === 'translateText') {
      return { data: { translatedText: params.text } };
    }
    if (functionName === 'analyzeSentiment') {
      return { data: { sentiment: 'neutral', anxiety_level: 0, themes: [] } };
    }
    if (functionName === 'recallMemories') {
      return { data: { should_proactively_mention: false, selected_memories: [] } };
    }
    
    return { data: null };
  }
};

export default offlineResponseCache;