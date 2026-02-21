// Offline-capable audio player for preloaded music
import { isOnline } from './offlineManager';

class OfflineAudioPlayer {
  constructor() {
    this.audioContext = null;
    this.currentSource = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.onEndCallback = null;
    this.htmlAudio = null;
  }

  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Generate simple musical tones for offline playback
  async generateMusicTone(frequency, duration, genre = 'calm') {
    await this.init();
    
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        
        // Create pleasant harmonics based on genre
        let sample = 0;
        if (genre === 'calm' || genre === 'classical') {
          // Soft, calming tones
          sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 +
                  Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.2 +
                  Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1;
        } else if (genre === 'jazz' || genre === 'big_band') {
          // More complex harmonics
          sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 +
                  Math.sin(2 * Math.PI * frequency * 1.25 * t) * 0.2 +
                  Math.sin(2 * Math.PI * frequency * 1.75 * t) * 0.15;
        } else {
          // Pop/Rock - more energetic
          sample = Math.sin(2 * Math.PI * frequency * t) * 0.5 +
                  Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2;
        }
        
        // Apply fade in/out
        const fadeLength = sampleRate * 0.1; // 100ms fade
        if (i < fadeLength) {
          sample *= i / fadeLength;
        } else if (i > numSamples - fadeLength) {
          sample *= (numSamples - i) / fadeLength;
        }
        
        channelData[i] = sample;
      }
    }
    
    return buffer;
  }

  // Play a song - online uses YouTube, offline uses generated audio
  async play(song, onEnd) {
    this.stop(); // Stop any current playback
    this.currentTrack = song;
    this.onEndCallback = onEnd;

    // If online and has YouTube URL, use YouTube player (handled by parent component)
    // This function handles offline audio generation
    if (!isOnline() || !song.youtube_url) {
      await this.playOfflineAudio(song);
    }
  }

  async playOfflineAudio(song) {
    await this.init();
    
    console.log('Playing offline audio for:', song.title);
    
    // Map genre to frequency and create soothing audio
    const genreMap = {
      'classical': 261.63, // Middle C
      'jazz': 293.66, // D
      'big_band': 329.63, // E
      'rock': 349.23, // F
      'pop': 392.00, // G
      'folk': 440.00, // A
      'disco': 493.88, // B
      'country': 523.25 // High C
    };
    
    const baseFreq = genreMap[song.genre] || 440;
    const duration = 120; // 2 minutes
    
    try {
      const buffer = await this.generateMusicTone(baseFreq, duration, song.genre);
      
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.connect(this.audioContext.destination);
      
      this.currentSource.onended = () => {
        this.isPlaying = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
      
      this.currentSource.start(0);
      this.isPlaying = true;
      
      console.log('✅ Offline audio playing');
    } catch (error) {
      console.error('Offline audio playback error:', error);
    }
  }

  pause() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentTrack() {
    return this.currentTrack;
  }
}

// Singleton instance
export const offlineAudioPlayer = new OfflineAudioPlayer();