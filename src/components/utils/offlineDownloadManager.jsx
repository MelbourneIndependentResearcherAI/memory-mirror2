/**
 * Offline Download Manager - Ensures proper downloading and storage to IndexedDB
 * Fixes: Ensures downloads complete, stores to IndexedDB properly, verifies storage
 */

import { initOfflineStorage, saveToStore, getAllFromStore, STORES } from './offlineStorage';
import { initOfflineDB, downloadAudioForOffline, getOfflineAudioLibrary } from './offlineManager';
import { base44 } from '@/api/base44Client';
import { OFFLINE_STORIES, OFFLINE_MUSIC, MEMORY_EXERCISES, COMPREHENSIVE_OFFLINE_RESPONSES } from './offlinePreloaderData.js';

export class OfflineDownloadManager {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
    this.progress = {
      current: 0,
      total: 0,
      currentItem: '',
      downloadedBytes: 0,
      errors: []
    };
    this.listeners = [];
  }

  // Subscribe to download progress
  subscribe(callback) {
    this.listeners.push(callback);
    // Immediately send current status to new subscriber
    callback(this.progress);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.progress);
      } catch (error) {
        console.warn('Listener notification failed:', error);
      }
    });
  }

  // Start full offline download - runs all phases with live progress updates
  async startFullDownload() {
    if (this.isDownloading) {
      console.warn('Download already in progress');
      return;
    }

    this.isDownloading = true;
    this.progress = {
      current: 0,
      total: 100,
      currentItem: 'Initializing storage...',
      downloadedBytes: 0,
      errors: []
    };
    this.notify();

    try {
      await initOfflineStorage();
      await initOfflineDB();

      this.progress.current = 5;
      this.progress.currentItem = 'Storage initialized...';
      this.notify();

      // Phase 1: AI Responses (250 items → 5% to 65%)
      this.progress.currentItem = 'Downloading AI responses...';
      this.notify();
      let aiCount = 0;
      for (const resp of COMPREHENSIVE_OFFLINE_RESPONSES) {
        await saveToStore(STORES.aiResponses, {
          prompt: resp.prompt,
          response: resp.response,
          category: resp.category,
          timestamp: Date.now(),
          offline: true
        });
        aiCount++;
        // Update every 10 items to avoid UI overload
        if (aiCount % 10 === 0) {
          this.progress.current = 5 + Math.floor((aiCount / COMPREHENSIVE_OFFLINE_RESPONSES.length) * 55);
          this.progress.currentItem = `AI responses: ${aiCount} / ${COMPREHENSIVE_OFFLINE_RESPONSES.length}`;
          this.progress.downloadedBytes = aiCount * 200;
          this.notify();
        }
      }

      // Phase 2: Stories (20 items → 65% to 75%)
      this.progress.current = 65;
      this.progress.currentItem = 'Downloading stories...';
      this.notify();
      let storyCount = 0;
      for (const story of OFFLINE_STORIES) {
        await saveToStore(STORES.stories, { ...story, offline_preloaded: true });
        storyCount++;
      }
      this.progress.current = 75;
      this.progress.currentItem = `${storyCount} stories downloaded`;
      this.notify();

      // Phase 3: Music (40 items → 75% to 85%)
      this.progress.current = 75;
      this.progress.currentItem = 'Downloading music library...';
      this.notify();
      let musicCount = 0;
      for (const song of OFFLINE_MUSIC) {
        await saveToStore(STORES.music, { ...song, offline_preloaded: true, is_downloaded: true });
        musicCount++;
      }
      this.progress.current = 85;
      this.progress.currentItem = `${musicCount} songs downloaded`;
      this.notify();

      // Phase 4: Exercises (25 items → 85% to 95%)
      this.progress.currentItem = 'Downloading memory exercises...';
      this.notify();
      let exCount = 0;
      for (const exercise of MEMORY_EXERCISES) {
        await saveToStore(STORES.activityLog, {
          activity_type: 'memory_exercise',
          exercise_id: exercise.id,
          details: exercise,
          offline_preloaded: true,
          created_date: new Date().toISOString()
        });
        exCount++;
      }
      this.progress.current = 95;
      this.progress.currentItem = `${exCount} exercises downloaded`;
      this.notify();

      // Phase 5: Verify
      this.progress.currentItem = 'Verifying download...';
      this.notify();
      const verified = await this.verifyDownload();

      // Done
      this.progress.current = 100;
      this.progress.currentItem = 'Download Complete!';
      this.progress.downloadedBytes = (aiCount * 200) + (storyCount * 1500) + (musicCount * 500) + (exCount * 800);
      this.notify();

      const result = { aiResponses: aiCount, stories: storyCount, music: musicCount, exercises: exCount };
      console.log('✅ Download complete:', result);
      return { success: true, ...result, verified };

    } catch (error) {
      console.error('❌ Download failed:', error);
      this.progress.errors.push(error.message);
      this.progress.currentItem = 'Download failed: ' + error.message;
      this.notify();
      throw error;
    } finally {
      this.isDownloading = false;
    }
  }

  // Verify that content was downloaded correctly
  async verifyDownload() {
    console.log('🔍 Verifying offline content...');
    
    const verification = {
      aiResponses: 0,
      stories: 0,
      music: 0,
      audioFiles: 0,
      exercises: 0,
      totalSize: 0
    };

    try {
      // Check AI responses
      const aiResponses = await getAllFromStore(STORES.aiResponses);
      verification.aiResponses = aiResponses.length;

      // Check stories
      const stories = await getAllFromStore(STORES.stories);
      verification.stories = stories.length;

      // Check music metadata
      const music = await getAllFromStore(STORES.music);
      verification.music = music.length;

      // Check downloaded audio files
      const audioLibrary = await getOfflineAudioLibrary();
      verification.audioFiles = audioLibrary.length;

      // Check exercises
      const exercises = await getAllFromStore(STORES.activityLog);
      verification.exercises = exercises.filter(e => 
        e.activity_type === 'memory_exercise'
      ).length;

      // Calculate total size
      const calculateSize = (items) => {
        return items.reduce((sum, item) => {
          const itemStr = JSON.stringify(item);
          return sum + new Blob([itemStr]).size;
        }, 0);
      };

      verification.totalSize = 
        calculateSize(aiResponses) +
        calculateSize(stories) +
        calculateSize(music) +
        calculateSize(exercises);

      console.log('✅ Verification complete:', verification);
      return verification;

    } catch (error) {
      console.error('Verification failed:', error);
      return verification;
    }
  }

  // Get current download status
  getStatus() {
    return {
      isDownloading: this.isDownloading,
      ...this.progress
    };
  }

  // Download specific audio file
  async downloadAudio(audioItem) {
    try {
      console.log(`🎵 Downloading audio: ${audioItem.title}`);
      await downloadAudioForOffline(audioItem);
      return { success: true };
    } catch (error) {
      console.error(`Failed to download ${audioItem.title}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Batch download multiple audio files
  async downloadAudioBatch(audioItems) {
    const results = [];
    for (const item of audioItems) {
      const result = await this.downloadAudio(item);
      results.push({ item: item.title, ...result });
    }
    return results;
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const stats = {
        aiResponses: await getAllFromStore(STORES.aiResponses),
        stories: await getAllFromStore(STORES.stories),
        music: await getAllFromStore(STORES.music),
        audioFiles: await getOfflineAudioLibrary(),
        exercises: await getAllFromStore(STORES.activityLog)
      };

      const totalItems = 
        stats.aiResponses.length +
        stats.stories.length +
        stats.music.length +
        stats.audioFiles.length +
        stats.exercises.filter(e => e.activity_type === 'memory_exercise').length;

      const totalBytes = 
        JSON.stringify(stats.aiResponses).length +
        JSON.stringify(stats.stories).length +
        JSON.stringify(stats.music).length +
        JSON.stringify(stats.exercises).length;

      return {
        itemCounts: {
          aiResponses: stats.aiResponses.length,
          stories: stats.stories.length,
          music: stats.music.length,
          audioFiles: stats.audioFiles.length,
          exercises: stats.exercises.filter(e => e.activity_type === 'memory_exercise').length
        },
        totalItems,
        totalBytes,
        totalKB: (totalBytes / 1024).toFixed(2),
        totalMB: (totalBytes / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }

  // Clear all offline data
  async clearAll() {
    console.log('🗑️ Clearing offline data...');
    try {
      // Clear main databases
      const storeNames = [
        STORES.aiResponses,
        STORES.stories,
        STORES.music,
        STORES.exercises,
        STORES.audioLibrary
      ];
      
      for (const storeName of storeNames) {
        try {
          const db = await initOfflineStorage();
          await new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        } catch (err) {
          console.warn(`Failed to clear ${storeName}:`, err);
        }
      }
      
      console.log('✅ Offline data cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const downloadManager = new OfflineDownloadManager();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.offlineDownloadManager = downloadManager;
  
  // Log storage stats on load
  downloadManager.getStorageStats().then(stats => {
    if (stats && stats.totalItems > 0) {
      console.log('📊 Offline content ready:', stats);
    }
  });
}

export default downloadManager;