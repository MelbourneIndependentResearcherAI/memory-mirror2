import { base44 } from '@/api/base44Client';

// Check if user has active cloned voice
export const getActiveClonedVoice = async () => {
  try {
    const profiles = await base44.entities.VoiceProfile.filter({ is_active: true });
    return profiles?.[0] || null;
  } catch {
    return null;
  }
};

// Play audio from ArrayBuffer
const playAudioBuffer = (arrayBuffer, volume = 1.0, onEnd = null) => {
  try {
    if (!window.Audio) {
      console.warn('Audio API not available');
      return Promise.resolve(false);
    }
    
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.volume = Math.max(0, Math.min(1, volume));

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        resolve(false);
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(audioUrl);
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Audio playback error:', error);
    return Promise.resolve(false);
  }
};

// ElevenLabs disabled - use speakWithRealisticVoice directly
export const speakWithClonedVoice = async (text, options = {}) => {
  if (!text) return false;
  try {
    await speakWithRealisticVoice(text, options);
  } catch (e) {
    console.log('Voice error (safe):', e);
  }
  return false;
};

// Get user's preferred voice from localStorage
const getUserVoicePreference = () => {
  try {
    return localStorage.getItem('memoryMirrorVoice') || 'auto';
  } catch {
    return 'auto';
  }
};

// Save user's voice preference
export const setUserVoicePreference = (voiceId) => {
  try {
    localStorage.setItem('memoryMirrorVoice', voiceId);
  } catch {}
};

// Get available quality voices categorized with accents and tones
export const getAvailableVoices = () => {
  const voices = speechSynthesis.getVoices();
  
  const voicesByCategory = {
    warmComforting: [],
    calm: [],
    upbeat: [],
    british: [],
    american: [],
    australian: []
  };
  
  // Comprehensive voice patterns with accents and emotional tones
  const voicePatterns = [
    // Warm & Comforting (female-leaning)
    { name: 'Microsoft Aria Online (Natural)', label: '🌸 Aria - Warm & Natural', category: 'warmComforting', icon: '🌸', tone: 'warm' },
    { name: 'Microsoft Jenny Online (Natural)', label: '💖 Jenny - Friendly & Caring', category: 'warmComforting', icon: '💖', tone: 'warm' },
    { name: 'Samantha', label: '🌺 Samantha - Comforting', category: 'warmComforting', icon: '🌺', tone: 'warm' },
    { name: 'Karen', label: '🌻 Karen - Gentle', category: 'warmComforting', icon: '🌻', tone: 'warm' },
    { name: 'Moira', label: '🌷 Moira - Soothing', category: 'warmComforting', icon: '🌷', tone: 'warm' },
    
    // Calm & Reassuring
    { name: 'Microsoft Guy Online (Natural)', label: '🌊 Guy - Calm & Steady', category: 'calm', icon: '🌊', tone: 'calm' },
    { name: 'Daniel', label: '🧘 Daniel - Peaceful', category: 'calm', icon: '🧘', tone: 'calm' },
    { name: 'Tom', label: '☮️ Tom - Serene', category: 'calm', icon: '☮️', tone: 'calm' },
    
    // Upbeat & Energetic
    { name: 'Tessa', label: '☀️ Tessa - Cheerful', category: 'upbeat', icon: '☀️', tone: 'upbeat' },
    { name: 'James', label: '⭐ James - Bright', category: 'upbeat', icon: '⭐', tone: 'upbeat' },
    
    // British Accents
    { name: 'Google UK English Female', label: '🇬🇧 British Female', category: 'british', icon: '🇬🇧', tone: 'neutral', accent: 'British' },
    { name: 'Google UK English Male', label: '🇬🇧 British Male', category: 'british', icon: '🇬🇧', tone: 'neutral', accent: 'British' },
    { name: 'Kate', label: '🇬🇧 Kate - British', category: 'british', icon: '🇬🇧', tone: 'warm', accent: 'British' },
    { name: 'Oliver', label: '🇬🇧 Oliver - British', category: 'british', icon: '🇬🇧', tone: 'calm', accent: 'British' },
    
    // American Accents
    { name: 'Google US English Female', label: '🇺🇸 American Female', category: 'american', icon: '🇺🇸', tone: 'neutral', accent: 'American' },
    { name: 'Google US English Male', label: '🇺🇸 American Male', category: 'american', icon: '🇺🇸', tone: 'neutral', accent: 'American' },
    { name: 'Alex', label: '🇺🇸 Alex - American', category: 'american', icon: '🇺🇸', tone: 'neutral', accent: 'American' },
    
    // Australian Accents
    { name: 'Google Australian Female', label: '🇦🇺 Australian Female', category: 'australian', icon: '🇦🇺', tone: 'upbeat', accent: 'Australian' },
    { name: 'Google Australian Male', label: '🇦🇺 Australian Male', category: 'australian', icon: '🇦🇺', tone: 'upbeat', accent: 'Australian' },
    { name: 'Catherine', label: '🇦🇺 Catherine - Australian', category: 'australian', icon: '🇦🇺', tone: 'warm', accent: 'Australian' },
  ];
  
  // Find and categorize voices
  voicePatterns.forEach(({ name, label, category, icon, tone, accent }) => {
    const voice = voices.find(v => v.name.includes(name) || v.name === name);
    if (voice) {
      voicesByCategory[category].push({ 
        voice, 
        label, 
        id: voice.name, 
        icon, 
        tone,
        accent: accent || null
      });
    }
  });
  
  // Fallback: categorize any English voices
  if (Object.values(voicesByCategory).every(arr => arr.length === 0)) {
    voices.filter(v => v.lang.startsWith('en')).forEach(voice => {
      const name = voice.name.toLowerCase();
      const category = name.includes('female') ? 'warmComforting' : 'calm';
      voicesByCategory[category].push({ 
        voice, 
        label: voice.name.split('-')[0].trim(), 
        id: voice.name,
        icon: '🎙️',
        tone: 'neutral'
      });
    });
  }
  
  return voicesByCategory;
};

// Pick the best available voice for the given language
function pickVoice(language) {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const langMap = {
    en: ['en-AU', 'en-GB', 'en-US', 'en'],
    es: ['es-ES', 'es-MX', 'es'],
    fr: ['fr-FR', 'fr-CA', 'fr'],
    de: ['de-DE', 'de'],
    it: ['it-IT', 'it'],
    pt: ['pt-PT', 'pt-BR', 'pt'],
    zh: ['zh-CN', 'zh-TW', 'zh'],
    ja: ['ja-JP', 'ja'],
    ko: ['ko-KR', 'ko'],
    ar: ['ar-SA', 'ar'],
    hi: ['hi-IN', 'hi'],
    ru: ['ru-RU', 'ru'],
    nl: ['nl-NL', 'nl'],
    pl: ['pl-PL', 'pl'],
    tr: ['tr-TR', 'tr'],
    vi: ['vi-VN', 'vi'],
    th: ['th-TH', 'th'],
    sv: ['sv-SE', 'sv'],
    no: ['nb-NO', 'no'],
    da: ['da-DK', 'da']
  };

  const userPreference = getUserVoicePreference();
  const targetLangs = langMap[language] || ['en-AU', 'en-US', 'en'];

  // Respect user preference
  if (userPreference !== 'auto') {
    const pref = voices.find(v => v.name === userPreference);
    if (pref) return pref;
  }

  const langVoices = voices.filter(v => targetLangs.some(l => v.lang.startsWith(l)));
  if (!langVoices.length) return voices[0];

  // Prefer natural/neural/premium voices
  return langVoices.find(v =>
    v.name.includes('Natural') || v.name.includes('Neural') ||
    v.name.includes('Premium') || v.name.includes('Online') ||
    v.name.includes('Samantha') || v.name.includes('Karen') ||
    v.name.includes('Aria') || v.name.includes('Jenny')
  ) || langVoices[0];
}

// Enhanced voice synthesis with cognitive, emotional, and profile-based adaptation
export function speakWithRealisticVoice(text, options = {}) {
  if (!text || typeof text !== 'string') return;
  if (!('speechSynthesis' in window)) return;

  const {
    rate = 0.95,
    pitch = 1.0,
    volume = 1.0,
    emotionalState = 'neutral',
    anxietyLevel = 0,
    cognitiveLevel = 'mild',
    language = 'en',
    onEnd = null
  } = options;

  // Cancel any current speech
  try { speechSynthesis.cancel(); } catch {}

  const doSpeak = () => {
    try {
      const voices = speechSynthesis.getVoices();

      // Rate adjustments
      const cogRates = { mild: 1.0, moderate: 0.9, advanced: 0.82, severe: 0.75 };
      const emoRates = { calm: 0.95, warm: 1.0, upbeat: 1.05, neutral: 1.0, soothing: 0.9, reassuring: 0.88, anxious: 0.92 };
      const anxRate = anxietyLevel >= 7 ? 0.88 : anxietyLevel >= 5 ? 0.94 : 1.0;

      const finalRate = Math.max(0.5, Math.min(1.8,
        rate * (cogRates[cognitiveLevel] || 1.0) * (emoRates[emotionalState] || 1.0) * anxRate
      ));
      const finalPitch = Math.max(0.8, Math.min(1.3, pitch));
      const finalVolume = Math.max(0.5, Math.min(1.0, volume));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = finalRate;
      utterance.pitch = finalPitch;
      utterance.volume = finalVolume;

      const voice = pickVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = language === 'en' ? 'en-AU' : language;
      }

      let ended = false;
      const finish = () => {
        if (!ended) {
          ended = true;
          if (onEnd) onEnd();
        }
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('Speech error:', e.error);
        finish();
      };

      // Watchdog: Chrome/Android can get stuck — resume if paused
      const watchdog = setInterval(() => {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        }
        if (!speechSynthesis.speaking || ended) {
          clearInterval(watchdog);
        }
      }, 5000);

      utterance.onend = () => { clearInterval(watchdog); finish(); };
      utterance.onerror = (e) => { clearInterval(watchdog); console.warn('Speech error:', e.error); finish(); };

      speechSynthesis.speak(utterance);
      console.log('🔊 Speaking:', text.substring(0, 60), '| Voice:', voice?.name || 'default', '| Rate:', finalRate.toFixed(2));
      return utterance;
    } catch (err) {
      console.error('Voice synthesis error:', err);
      if (onEnd) onEnd();
    }
  };

  // Small delay after cancel to let the browser settle (critical on mobile)
  setTimeout(doSpeak, 150);
}

// Detect anxiety/distress in user text
export const detectAnxiety = (text) => {
  const lowerText = text.toLowerCase();
  
  const triggers = {
    fear: ['scared', 'frightened', 'afraid', 'terrified', 'danger', 'threat', 'unsafe', 'nervous'],
    confusion: ['lost', "don't know", 'confused', 'where am i', 'who are you', "can't remember", 'forgotten'],
    distress: ['help', 'emergency', 'wrong', 'worried', 'upset', 'anxious', 'panic'],
    paranoia: ['stealing', 'stole', 'watching', 'following', "they're after", 'spying', 'broke in', 'intruder'],
    pain: ['hurt', 'pain', 'sick', 'injured', 'bleeding'],
  };

  let detectedTrigger = null;
  let maxLevel = 0;

  Object.entries(triggers).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const level = category === 'pain' ? 9 : 
                     category === 'distress' ? 8 :
                     category === 'paranoia' ? 7 :
                     category === 'fear' ? 6 :
                     5;
        if (level > maxLevel) {
          maxLevel = level;
          detectedTrigger = keyword;
        }
      }
    });
  });

  if (lowerText.includes('?') && lowerText.split(' ').length < 6) {
    maxLevel = Math.max(maxLevel, 4);
  }

  return {
    level: maxLevel,
    trigger: detectedTrigger
  };
};

// Get calming redirect based on trigger
export const getCalmingRedirect = (_trigger) => {
  const calmingResponses = [
    "I'm right here with you. Let's take a deep breath together. You're safe and everything is being taken care of. What's something that always makes you smile?",
    "I can hear that you're feeling worried. That's completely okay. I want you to know you're safe right now. Can you tell me about a happy memory that brings you comfort?",
    "You're doing just fine. Let's focus on something peaceful for a moment. What's a place you've always loved to be?",
    "I'm here to help and I'm not going anywhere. Everything is under control. Tell me about someone who always made you feel safe.",
  ];
  
  return calmingResponses[Math.floor(Math.random() * calmingResponses.length)];
};

// Ensure voices are loaded
if ('speechSynthesis' in window) {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
  speechSynthesis.getVoices();
}