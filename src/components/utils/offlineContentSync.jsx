/**
 * Offline Content Sync - Downloads and caches media files for offline access
 */

import { initOfflineStorage, saveToStore, getAllFromStore, STORES } from './offlineStorage';

// Download image/photo for offline access
export async function downloadPhotoForOffline(photo) {
  try {
    await initOfflineStorage();
    
    if (!photo?.media_url) {
      throw new Error('No media URL provided');
    }

    // Fetch the image
    const response = await fetch(photo.media_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Convert to base64 for storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          
          await saveToStore(STORES.familyMedia, {
            ...photo,
            offline_cached: true,
            offline_blob: base64data,
            offline_size: blob.size,
            cached_at: new Date().toISOString()
          });
          
          resolve({ success: true, size: blob.size });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to download photo:', error);
    throw error;
  }
}

// Download music file or metadata for offline
export async function downloadMusicForOffline(music) {
  try {
    await initOfflineStorage();
    
    // For music, we store metadata only (no actual audio download unless audio_file_url exists)
    const musicData = {
      ...music,
      offline_cached: true,
      cached_at: new Date().toISOString()
    };

    // If there's an actual audio file (not YouTube), download it
    if (music.audio_file_url && !music.youtube_url) {
      const response = await fetch(music.audio_file_url);
      if (response.ok) {
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              musicData.offline_blob = reader.result;
              musicData.offline_size = blob.size;
              await saveToStore(STORES.music, musicData);
              resolve({ success: true, size: blob.size });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }
    
    // Store metadata only
    await saveToStore(STORES.music, musicData);
    return { success: true, size: JSON.stringify(musicData).length };
  } catch (error) {
    console.error('Failed to download music:', error);
    throw error;
  }
}

// Download story for offline
export async function downloadStoryForOffline(story) {
  try {
    await initOfflineStorage();
    
    await saveToStore(STORES.stories, {
      ...story,
      offline_cached: true,
      cached_at: new Date().toISOString()
    });
    
    return { success: true, size: JSON.stringify(story).length };
  } catch (error) {
    console.error('Failed to download story:', error);
    throw error;
  }
}

// Download memory for offline
export async function downloadMemoryForOffline(memory) {
  try {
    await initOfflineStorage();
    
    let memoryData = {
      ...memory,
      offline_cached: true,
      cached_at: new Date().toISOString()
    };

    // If memory has an image, download it
    if (memory.image_url) {
      const response = await fetch(memory.image_url);
      if (response.ok) {
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              memoryData.offline_image_blob = reader.result;
              memoryData.offline_size = blob.size;
              await saveToStore(STORES.memories, memoryData);
              resolve({ success: true, size: blob.size });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }
    
    await saveToStore(STORES.memories, memoryData);
    return { success: true, size: JSON.stringify(memoryData).length };
  } catch (error) {
    console.error('Failed to download memory:', error);
    throw error;
  }
}

// Get cached content from offline storage
export async function getCachedContent(contentType) {
  try {
    await initOfflineStorage();
    
    const storeMap = {
      photo: STORES.familyMedia,
      music: STORES.music,
      story: STORES.stories,
      memory: STORES.memories
    };
    
    const storeName = storeMap[contentType];
    if (!storeName) return [];
    
    const items = await getAllFromStore(storeName);
    return items.filter(item => item.offline_cached);
  } catch (error) {
    console.error('Failed to get cached content:', error);
    return [];
  }
}

// Check if content is cached offline
export async function isContentCached(contentType, contentId) {
  try {
    const cached = await getCachedContent(contentType);
    return cached.some(item => item.id === contentId);
  } catch (error) {
    return false;
  }
}

// Get total offline content size
export async function getOfflineContentSize() {
  try {
    await initOfflineStorage();
    
    const allStores = [STORES.familyMedia, STORES.music, STORES.stories, STORES.memories];
    let totalSize = 0;
    let totalItems = 0;
    
    for (const store of allStores) {
      const items = await getAllFromStore(store);
      const cachedItems = items.filter(item => item.offline_cached);
      totalItems += cachedItems.length;
      totalSize += cachedItems.reduce((sum, item) => sum + (item.offline_size || 0), 0);
    }
    
    return {
      totalItems,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    console.error('Failed to get offline content size:', error);
    return { totalItems: 0, totalSizeBytes: 0, totalSizeMB: '0.00' };
  }
}