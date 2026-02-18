// Offline-first API with comprehensive fallbacks for 100% offline functionality
import { base44 } from '@/api/base44Client';
import { 
  initOfflineStorage, 
  saveToStore, 
  getAllFromStore, 
  getFromStore,
  deleteFromStore,
  queueOperation,
  STORES 
} from './offlineStorage';
import { isOnline } from './offlineManager';

// Initialize storage
initOfflineStorage();

// Offline-aware entity operations
export const offlineEntities = {
  async list(entityName, sortField = '-created_date', limit = 100) {
    const storeName = entityName.toLowerCase();
    
    if (isOnline()) {
      try {
        const data = await base44.entities[entityName].list(sortField, limit);
        for (const item of data) {
          await saveToStore(storeName, item);
        }
        return data;
      } catch (error) {
        console.log('API failed, using offline cache:', error.message);
      }
    }
    
    return await getAllFromStore(storeName);
  },

  async create(entityName, data) {
    const storeName = entityName.toLowerCase();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const itemWithId = { ...data, id: tempId, created_date: new Date().toISOString() };
    
    await saveToStore(storeName, itemWithId);
    
    if (isOnline()) {
      try {
        const result = await base44.entities[entityName].create(data);
        await deleteFromStore(storeName, tempId);
        await saveToStore(storeName, result);
        return result;
      } catch (error) {
        console.log('API failed, queuing for sync:', error.message);
      }
    }
    
    await queueOperation({
      type: 'create',
      entity: entityName,
      data: data,
      tempId: tempId
    });
    
    return itemWithId;
  },

  async update(entityName, id, data) {
    const storeName = entityName.toLowerCase();
    const existing = await getFromStore(storeName, id);
    const updated = { ...existing, ...data, updated_date: new Date().toISOString() };
    await saveToStore(storeName, updated);
    
    if (isOnline()) {
      try {
        const result = await base44.entities[entityName].update(id, data);
        await saveToStore(storeName, result);
        return result;
      } catch (error) {
        console.log('API failed, queuing for sync:', error.message);
      }
    }
    
    await queueOperation({ type: 'update', entity: entityName, id: id, data: data });
    return updated;
  },

  async delete(entityName, id) {
    const storeName = entityName.toLowerCase();
    await deleteFromStore(storeName, id);
    
    if (isOnline()) {
      try {
        await base44.entities[entityName].delete(id);
        return;
      } catch (error) {
        console.log('API failed, queuing for sync:', error.message);
      }
    }
    
    await queueOperation({ type: 'delete', entity: entityName, id: id });
  }
};

// Offline-aware function calls
export async function offlineFunction(functionName, params = {}) {
  if (isOnline()) {
    try {
      return await base44.functions.invoke(functionName, params);
    } catch (error) {
      console.log('Function call failed:', error.message);
    }
  }
  
  return {
    data: {
      offline: true,
      message: 'Operating in offline mode. Basic functionality available.'
    }
  };
}

// Comprehensive offline AI chat - intelligently matches preloaded responses
export async function offlineAIChat(prompt, options = {}) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Get all cached responses
  const allResponses = await getAllFromStore(STORES.aiResponses);
  const offlineResponses = allResponses.filter(r => r.offline);
  
  // Try intelligent matching with preloaded responses
  if (offlineResponses.length > 0) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const cached of offlineResponses) {
      if (cached.prompt) {
        const keywords = cached.prompt.split(',').map(k => k.trim().toLowerCase());
        const matchCount = keywords.filter(kw => lowerPrompt.includes(kw)).length;
        const score = matchCount / keywords.length;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cached;
        }
      }
    }
    
    // If good match found (>30% keywords match), use it
    if (bestMatch && bestScore > 0.3) {
      console.log(`✅ Offline AI: Matched response (${Math.round(bestScore * 100)}% confidence)`);
      return bestMatch.response + '\n\nMETA: {"era": "present", "anxiety": 3, "suggestedMemory": null}';
    }
  }
  
  // Try online AI if available
  if (isOnline()) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        ...options
      });
      
      // Cache for future offline use
      await saveToStore(STORES.aiResponses, {
        id: `cached_${Date.now()}`,
        prompt: lowerPrompt.substring(0, 100),
        response,
        timestamp: Date.now(),
        offline: false
      });
      
      return response;
    } catch (error) {
      console.log('Online AI failed, using fallback:', error.message);
    }
  }
  
  // Ultimate fallback - context-aware default responses
  console.log('⚠️ Using fallback response (offline mode)');
  
  if (lowerPrompt.includes('scared') || lowerPrompt.includes('worried') || lowerPrompt.includes('afraid')) {
    return "I understand you're feeling worried. You're safe here with me. Everything is going to be alright. Let's take a deep breath together.";
  }
  
  if (lowerPrompt.includes('time') || lowerPrompt.includes('day') || lowerPrompt.includes('date')) {
    return `It's ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Everything is just fine. How can I help you today?`;
  }
  
  if (lowerPrompt.includes('family') || lowerPrompt.includes('daughter') || lowerPrompt.includes('son')) {
    return "Your family loves you very much and they'll be here soon. Would you like to look at some photos together?";
  }
  
  // General fallback
  return "I'm here with you. While I'm working in offline mode right now, I'm still here to listen and keep you company. What would you like to talk about?";
}

// Sync pending operations when back online
export async function syncPendingOperations() {
  if (!isOnline()) return;
  
  const pending = await getAllFromStore(STORES.pendingOps);
  console.log(`Syncing ${pending.length} pending operations...`);
  
  for (const op of pending) {
    try {
      if (op.type === 'create') {
        await base44.entities[op.entity].create(op.data);
      } else if (op.type === 'update') {
        await base44.entities[op.entity].update(op.id, op.data);
      } else if (op.type === 'delete') {
        await base44.entities[op.entity].delete(op.id);
      }
      await deleteFromStore(STORES.pendingOps, op.id);
      console.log(`✅ Synced ${op.type} operation for ${op.entity}`);
    } catch (error) {
      console.log(`Failed to sync ${op.type}:`, error.message);
    }
  }
}

// Auto-sync when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('📶 Back online - syncing pending operations...');
    syncPendingOperations();
  });
}