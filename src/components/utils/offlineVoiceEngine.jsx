/**
 * Offline Voice Engine - Provides voice synthesis without internet
 * Uses browser's built-in SpeechSynthesis API for guaranteed offline functionality
 */

// Pre-recorded common phrases for critical offline situations
const CRITICAL_OFFLINE_PHRASES = {
  emergency: "I'm here with you. You're safe. Help is available if you need it.",
  anxiety_high: "You're safe here. Everything is going to be alright. I'm right here with you.",
  greeting: "Hello! I'm here to keep you company. How are you feeling today?",
  comfort: "I'm here with you. You're not alone. Everything is taken care of.",
  goodnight: "Sleep well. I'll be here if you need me during the night.",
  reminder: "This is a gentle reminder for you. Take your time.",
  redirect_bathroom: "The bathroom is just nearby. Take your time, and I'm here if you need anything."
};

class OfflineVoiceEngine {
  constructor() {
    this.isInitialized = false;
    this.voices = [];
    this.preferredVoice = null;
    this.isSpeaking = false;
    this.queue = [];
  }

  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
        
        // Select best offline voice
        this.preferredVoice = this.selectBestVoice();
        this.isInitialized = true;
        
        console.log('✅ Offline Voice Engine initialized with', this.voices.length, 'voices');
        resolve();
      };

      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  selectBestVoice() {
    // Priority: warm, natural female voices for dementia care
    const priorities = [
      // English voices - warm and natural
      v => v.lang.startsWith('en') && v.name.includes('Samantha'),
      v => v.lang.startsWith('en') && v.name.includes('Karen'),
      v => v.lang.startsWith('en') && v.name.includes('Victoria'),
      v => v.lang.startsWith('en') && v.name.includes('Google UK English Female'),
      v => v.lang.startsWith('en') && v.name.includes('Microsoft Zira'),
      v => v.lang.startsWith('en') && v.name.includes('Google US English'),
      v => v.lang.startsWith('en') && !v.name.includes('Male'),
      v => v.lang.startsWith('en')
    ];

    for (const selector of priorities) {
      const voice = this.voices.find(selector);
      if (voice) return voice;
    }

    return this.voices[0] || null;
  }

  async speak(text, options = {}) {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text for speech:', text);
      return;
    }

    await this.init();

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Voice settings optimized for elderly listeners
        utterance.rate = options.rate || 0.85;     // Slower, clearer
        utterance.pitch = options.pitch || 1.05;   // Slightly higher, warmer
        utterance.volume = options.volume || 0.95; // Loud enough
        
        // Select voice
        if (options.voice) {
          utterance.voice = options.voice;
        } else if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        }
        
        // Language support
        if (options.language) {
          utterance.lang = options.language;
        }

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (error) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
          reject(error);
        };

        this.isSpeaking = true;
        window.speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error('Speech synthesis error:', error);
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  async speakCritical(phraseKey) {
    const text = CRITICAL_OFFLINE_PHRASES[phraseKey];
    if (!text) {
      console.warn('Unknown critical phrase:', phraseKey);
      return;
    }
    
    return this.speak(text, { rate: 0.80, pitch: 1.1, volume: 1.0 });
  }

  stop() {
    try {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.queue = [];
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  pause() {
    try {
      window.speechSynthesis.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  }

  resume() {
    try {
      window.speechSynthesis.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  }

  getSpeakingStatus() {
    return this.isSpeaking;
  }

  getAvailableVoices() {
    return this.voices;
  }
}

export const offlineVoiceEngine = new OfflineVoiceEngine();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  offlineVoiceEngine.init();
}