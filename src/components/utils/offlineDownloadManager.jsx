/**
 * Offline Download Manager - Comprehensive offline content download with validation
 * Stores everything in unified IndexedDB database
 */

import { initOfflineStorage, saveToStore, getAllFromStore, STORES, getStorageInfo } from './offlineStorage';
import { downloadAudioForOffline, getOfflineAudioLibrary } from './offlineManager';
import { OFFLINE_STORIES, OFFLINE_MUSIC, MEMORY_EXERCISES, COMPREHENSIVE_OFFLINE_RESPONSES } from './offlinePreloaderData.jsx';

const DOWNLOAD_RETRY_ATTEMPTS = 3;

export class OfflineDownloadManager {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
    this.progress = {
      current: 0,
      total: 100,
      currentItem: '',
      downloadedBytes: 0,
      totalBytes: 0,
      errors: [],
      failedItems: []
    };
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.progress);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.progress);
      } catch (error) {
        console.warn('Listener error:', error);
      }
    });
  }

  async checkStorageQuota() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { hasSpace: true };
    }

    const estimate = await navigator.storage.estimate();
    const usedMB = estimate.usage / 1024 / 1024;
    const quotaMB = estimate.quota / 1024 / 1024;
    const availableMB = (estimate.quota - estimate.usage) / 1024 / 1024;

    return {
      usedMB: parseFloat(usedMB.toFixed(2)),
      quotaMB: parseFloat(quotaMB.toFixed(2)),
      availableMB: parseFloat(availableMB.toFixed(2)),
      percentUsed: parseFloat(((estimate.usage / estimate.quota) * 100).toFixed(2)),
      hasSpace: availableMB > 100 // Need at least 100MB
    };
  }

  async startFullDownload() {
    if (this.isDownloading) {
      console.warn('Download already in progress');
      return;
    }

    this.isDownloading = true;
    this.progress = {
      current: 0,
      total: 100,
      currentItem: 'Checking storage...',
      downloadedBytes: 0,
      totalBytes: 0,
      errors: [],
      failedItems: []
    };
    this.notify();

    try {
      // Check storage quota
      const quota = await this.checkStorageQuota();
      if (!quota.hasSpace) {
        throw new Error(`Insufficient storage. Need 100MB, have ${quota.availableMB}MB available`);
      }

      await initOfflineStorage();

      this.progress.current = 5;
      this.progress.currentItem = 'Storage initialized...';
      this.notify();

      // Phase 1: AI Responses (5-25%)
      await this.downloadAIResponses();

      // Phase 2: Stories (25-45%)
      await this.downloadStories();

      // Phase 3: Music Metadata (45-65%)
      await this.downloadMusicMetadata();

      // Phase 4: Memory Exercises (65-80%)
      await this.downloadExercises();

      // Phase 5: Audio Files (80-95%)
      await this.downloadAudioFiles();

      // Phase 6: Verification (95-100%)
      await this.verifyDownload();

      this.progress.current = 100;
      this.progress.currentItem = 'Download Complete!';
      this.notify();

      const result = await this.getDownloadStats();
      console.log('✅ Full download complete:', result);
      return { success: true, ...result };

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

  async downloadAIResponses() {
    this.progress.current = 5;
    this.progress.currentItem = 'Downloading AI responses...';
    this.notify();

    let count = 0;
    for (const resp of COMPREHENSIVE_OFFLINE_RESPONSES) {
      try {
        await saveToStore(STORES.aiResponses, {
          prompt: resp.prompt,
          response: resp.response,
          category: resp.category,
          timestamp: Date.now(),
          offline: true
        });
        count++;

        if (count % 25 === 0) {
          this.progress.current = 5 + Math.floor((count / COMPREHENSIVE_OFFLINE_RESPONSES.length) * 20);
          this.progress.currentItem = `AI responses: ${count} / ${COMPREHENSIVE_OFFLINE_RESPONSES.length}`;
          this.notify();
        }
      } catch (error) {
        console.warn(`Failed to cache AI response: ${error.message}`);
      }
    }
    this.progress.current = 25;
  }

  async downloadStories() {
    this.progress.current = 25;
    this.progress.currentItem = 'Downloading stories...';
    this.notify();

    let count = 0;
    for (const story of OFFLINE_STORIES) {
      try {
        await saveToStore(STORES.stories, { ...story, offline_preloaded: true });
        count++;
      } catch (error) {
        console.warn(`Failed to cache story: ${error.message}`);
      }
    }
    this.progress.current = 45;
    this.progress.currentItem = `${count} stories cached`;
    this.notify();
  }

  async downloadMusicMetadata() {
    this.progress.current = 45;
    this.progress.currentItem = 'Downloading music library...';
    this.notify();

    let count = 0;
    for (const song of OFFLINE_MUSIC) {
      try {
        await saveToStore(STORES.music, {
          ...song,
          offline_preloaded: true,
          is_downloaded: false // Will be set to true once audio is downloaded
        });
        count++;
      } catch (error) {
        console.warn(`Failed to cache music: ${error.message}`);
      }
    }
    this.progress.current = 65;
    this.progress.currentItem = `${count} songs cached`;
    this.notify();
  }

  async downloadExercises() {
    this.progress.current = 65;
    this.progress.currentItem = 'Downloading memory exercises...';
    this.notify();

    let count = 0;
    for (const exercise of MEMORY_EXERCISES) {
      try {
        await saveToStore(STORES.activityLog, {
          activity_type: 'memory_exercise',
          exercise_id: exercise.id,
          details: exercise,
          offline_preloaded: true,
          created_date: new Date().toISOString()
        });
        count++;
      } catch (error) {
        console.warn(`Failed to cache exercise: ${error.message}`);
      }
    }
    this.progress.current = 80;
    this.progress.currentItem = `${count} exercises cached`;
    this.notify();
  }

  async downloadAudioFiles() {
    this.progress.current = 80;
    this.progress.currentItem = 'Downloading audio files (this may take a while)...';
    this.notify();

    const music = await getAllFromStore(STORES.music);
    const successfulDownloads = [];
    let count = 0;

    for (const song of music) {
      if (!song.audio_url && !song.audio_file_url) {
        continue; // Skip songs without audio
      }

      try {
        const result = await downloadAudioForOffline(song, DOWNLOAD_RETRY_ATTEMPTS);
        successfulDownloads.push(song.id);
        
        // Mark as downloaded
        song.is_downloaded = true;
        await saveToStore(STORES.music, song);
        
        count++;
        this.progress.current = 80 + Math.floor((count / music.length) * 15);
        this.progress.currentItem = `Downloaded ${count} audio files...`;
        this.progress.downloadedBytes += result.size;
        this.notify();
      } catch (error) {
        console.warn(`Failed to download audio for ${song.title}:`, error.message);
        this.progress.failedItems.push(`${song.title}: ${error.message}`);
      }
    }

    return { downloadedCount: count, totalCount: music.length };
  }

  async verifyDownload() {
    this.progress.current = 95;
    this.progress.currentItem = 'Verifying download integrity...';
    this.notify();

    const verification = {
      aiResponses: 0,
      stories: 0,
      music: 0,
      audioFiles: 0,
      exercises: 0,
      totalBytes: 0
    };

    try {
      verification.aiResponses = (await getAllFromStore(STORES.aiResponses)).length;
      verification.stories = (await getAllFromStore(STORES.stories)).length;
      verification.music = (await getAllFromStore(STORES.music)).length;
      verification.audioFiles = (await getOfflineAudioLibrary()).length;
      verification.exercises = (await getAllFromStore(STORES.activityLog))
        .filter(e => e.activity_type === 'memory_exercise').length;

      // Calculate total size
      const info = await getStorageInfo();
      verification.totalBytes = Object.values(info).reduce((sum, store) => sum + store.size, 0);

      console.log('✅ Verification complete:', verification);
      
      // Save metadata
      await saveToStore(STORES.syncMeta, {
        key: 'offline_download_verified',
        timestamp: new Date().toISOString(),
        verification
      });

      return verification;
    } catch (error) {
      console.error('Verification failed:', error);
      return verification;
    }
  }

  async getDownloadStats() {
    const info = await getStorageInfo();
    const quota = await this.checkStorageQuota();
    
    return {
      aiResponses: info[STORES.aiResponses]?.count || 0,
      stories: info[STORES.stories]?.count || 0,
      music: info[STORES.music]?.count || 0,
      audioFiles: info[STORES.audioLibrary]?.count || 0,
      exercises: info[STORES.activityLog]?.count || 0,
      totalBytes: Object.values(info).reduce((sum, store) => sum + store.size, 0),
      totalMB: (Object.values(info).reduce((sum, store) => sum + store.size, 0) / 1024 / 1024).toFixed(2),
      storageQuota: quota
    };
  }

  async downloadAudio(audioItem) {
    try {
      return await downloadAudioForOffline(audioItem, DOWNLOAD_RETRY_ATTEMPTS);
    } catch (error) {
      console.error(`Failed to download ${audioItem.title}:`, error);
      return { success: false, error: error.message };
    }
  }

  async downloadAudioBatch(audioItems) {
    const results = [];
    for (const item of audioItems) {
      const result = await this.downloadAudio(item);
      results.push({ item: item.title, ...result });
    }
    return results;
  }

  async getStorageStats() {
    return await this.getDownloadStats();
  }

  async clearAll() {
    console.log('🗑️ Clearing offline data...');
    try {
      const storeNames = Object.values(STORES);
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

  getStatus() {
    return {
      isDownloading: this.isDownloading,
      ...this.progress
    };
  }
}

// Singleton
export const downloadManager = new OfflineDownloadManager();

if (typeof window !== 'undefined') {
  window.offlineDownloadManager = downloadManager;
  
  downloadManager.getStorageStats().then(stats => {
    if (stats && stats.totalMB > 0) {
      console.log('📊 Offline content ready:', stats);
    }
  });
}

export default downloadManager;