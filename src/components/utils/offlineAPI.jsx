// Offline-first API wrapper
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

// Initialize on import
initOfflineStorage();

// Offline-aware entity operations
export const offlineEntities = {
  async list(entityName, sortField = '-created_date', limit = 100) {
    const storeName = entityName.toLowerCase();
    
    if (isOnline()) {
      try {
        const data = await base44.entities[entityName].list(sortField, limit);
        // Cache the results
        for (const item of data) {
          await saveToStore(storeName, item);
        }
        return data;
      } catch (error) {
        console.log('API failed, using cache:', error.message);
      }
    }
    
    // Return cached data
    return await getAllFromStore(storeName);
  },

  async get(entityName, id) {
    const storeName = entityName.toLowerCase();
    
    if (isOnline()) {
      try {
        const data = await base44.entities[entityName].get(id);
        await saveToStore(storeName, data);
        return data;
      } catch (error) {
        console.log('API failed, using cache:', error.message);
      }
    }
    
    return await getFromStore(storeName, id);
  },

  async create(entityName, data) {
    const storeName = entityName.toLowerCase();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const itemWithId = { ...data, id: tempId, created_date: new Date().toISOString() };
    
    // Save locally immediately
    await saveToStore(storeName, itemWithId);
    
    if (isOnline()) {
      try {
        const result = await base44.entities[entityName].create(data);
        // Replace temp item with real one
        await deleteFromStore(storeName, tempId);
        await saveToStore(storeName, result);
        return result;
      } catch (error) {
        console.log('API failed, queuing for sync:', error.message);
      }
    }
    
    // Queue for sync when back online
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
    
    // Update locally immediately
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
    
    // Queue for sync
    await queueOperation({
      type: 'update',
      entity: entityName,
      id: id,
      data: data
    });
    
    return updated;
  },

  async delete(entityName, id) {
    const storeName = entityName.toLowerCase();
    
    // Delete locally immediately
    await deleteFromStore(storeName, id);
    
    if (isOnline()) {
      try {
        await base44.entities[entityName].delete(id);
        return;
      } catch (error) {
        console.log('API failed, queuing for sync:', error.message);
      }
    }
    
    // Queue for sync
    await queueOperation({
      type: 'delete',
      entity: entityName,
      id: id
    });
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
  
  // Return offline fallback
  return {
    data: {
      offline: true,
      message: 'This feature requires an internet connection. Your request will be processed when you\'re back online.'
    }
  };
}

// Offline-aware AI chat
export async function offlineAIChat(prompt, options = {}) {
  // Check cache first
  const cacheKey = `${prompt}_${JSON.stringify(options)}`;
  const cached = await getCachedAIResponse(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }
  
  if (isOnline()) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        ...options
      });
      
      // Cache the response
      await saveToStore(STORES.aiResponses, {
        cacheKey,
        prompt,
        response,
        timestamp: Date.now()
      });
      
      return response;
    } catch (error) {
      console.log('AI call failed, using fallback:', error.message);
    }
  }
  
  // Return offline fallback response
  return getOfflineFallbackResponse(prompt);
}

async function getCachedAIResponse(cacheKey) {
  const allResponses = await getAllFromStore(STORES.aiResponses);
  return allResponses.find(r => r.cacheKey === cacheKey)?.response;
}

function getOfflineFallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Anxiety/distress detection
  if (lowerPrompt.includes('scared') || lowerPrompt.includes('afraid') || lowerPrompt.includes('worried')) {
    return "I understand you're feeling worried right now. You're safe, and everything is going to be alright. Would you like to look at some happy memories together, or perhaps listen to some calming music?";
  }
  
  // Time/orientation questions
  if (lowerPrompt.includes('what time') || lowerPrompt.includes('what day')) {
    return `It's ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Everything is just fine. Is there anything I can help you with today?`;
  }
  
  // Family questions
  if (lowerPrompt.includes('family') || lowerPrompt.includes('daughter') || lowerPrompt.includes('son')) {
    return "Your family loves you very much and they'll be here to see you soon. Would you like me to show you some photos of them?";
  }
  
  // Default comforting response
  return "I'm here with you. While I'm working in offline mode right now, I'm still here to listen and keep you company. What would you like to talk about?";
}

// Sync pending operations when back online
export async function syncPendingOperations() {
  if (!isOnline()) return;
  
  const pending = await getAllFromStore(STORES.pendingOps);
  
  for (const op of pending) {
    try {
      if (op.type === 'create') {
        await base44.entities[op.entity].create(op.data);
        await deleteFromStore(STORES.pendingOps, op.id);
      } else if (op.type === 'update') {
        await base44.entities[op.entity].update(op.id, op.data);
        await deleteFromStore(STORES.pendingOps, op.id);
      } else if (op.type === 'delete') {
        await base44.entities[op.entity].delete(op.id);
        await deleteFromStore(STORES.pendingOps, op.id);
      }
    } catch (error) {
      console.log('Failed to sync operation:', op.id, error.message);
    }
  }
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing pending operations...');
    syncPendingOperations();
  });
}