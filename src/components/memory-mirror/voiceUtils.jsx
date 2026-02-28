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
  const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.volume = Math.max(0, Math.min(1, volume));

  return new Promise((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      resolve(false); // signal failure
    };
    audio.play().catch(() => resolve(false));
  });
};

// Synthesize speech via ElevenLabs (cloned voice if available, otherwise default EL voice)
// Falls back to browser TTS only if ElevenLabs is unavailable
export const speakWithClonedVoice = async (text, options = {}) => {
  if (!text || typeof text !== 'string') return;

  try {
    console.log('🎙️ Starting voice synthesis for:', text.substring(0, 50));
    
    // Prefer active cloned voice, otherwise use elevenLabsTTS with default voice
    const activeVoice = await getActiveClonedVoice();
    const functionName = activeVoice?.voice_id ? 'synthesizeClonedVoice' : 'elevenLabsTTS';
    const payload = activeVoice?.voice_id
      ? { text, voice_id: activeVoice.voice_id, stability: options.stability || 0.5, similarity_boost: options.similarity_boost || 0.75 }
      : { text, language: options.language || 'en', stability: 0.5, similarity_boost: 0.75 };

    console.log('📢 Calling', functionName, 'with payload:', payload);
    const result = await base44.functions.invoke(functionName, payload);

    console.log('✅ Voice function response:', result?.status);
    
    // result.data is either an ArrayBuffer (audio) or a JSON error object
    // If it's an ArrayBuffer (byteLength exists), it's valid audio
    const isAudioBuffer = result.data instanceof ArrayBuffer || 
                          (result.data && typeof result.data.byteLength === 'number');
    if (isAudioBuffer) {
      console.log('🔊 Playing audio buffer...');
      const ok = await playAudioBuffer(result.data, options.volume || 1.0, options.onEnd);
      if (ok !== false) return;
    }
    // If JSON with fallback flag, fall through to browser TTS
    if (result.data?.fallback) {
      console.log('⚠️ ElevenLabs fallback, using browser TTS');
      // intentional fall-through
    }
  } catch (error) {
    console.error('❌ Voice synthesis error:', error.message);
    // fall through to browser TTS
  }

  console.log('🎧 Falling back to browser TTS');
  // Fallback to browser TTS
  return speakWithRealisticVoice(text, options);
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

// Enhanced voice synthesis with cognitive, emotional, and profile-based adaptation
export function speakWithRealisticVoice(text, options = {}) {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text for voice synthesis:', text);
    return;
  }
  
  const {
    rate = 0.95,
    pitch = 1.0,
    volume = 1.0,
    emotionalState = 'neutral',
    anxietyLevel = 0,
    cognitiveLevel = 'mild',
    language = 'en',
    userProfile = null,
    onEnd = null
  } = options;

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  try {
    // Ensure any previous speech is stopped
    try {
      speechSynthesis.cancel();
    } catch (e) {
      console.log('Cancel previous speech:', e.message);
    }

    // Cognitive level adaptations - adjust speaking style based on dementia progression
    const cognitiveAdaptations = {
      'mild': { 
        rateBase: 0.95, 
        pitchBase: 1.05, 
        pauseMultiplier: 1.0,
        emphasis: 'normal'
      },
      'moderate': { 
        rateBase: 0.88, 
        pitchBase: 1.08, 
        pauseMultiplier: 1.3,
        emphasis: 'gentle'
      },
      'advanced': { 
        rateBase: 0.80, 
        pitchBase: 1.10, 
        pauseMultiplier: 1.6,
        emphasis: 'very gentle'
      },
      'severe': { 
        rateBase: 0.75, 
        pitchBase: 1.12, 
        pauseMultiplier: 2.0,
        emphasis: 'extremely gentle'
      }
    };
    
    const cognitiveAdapt = cognitiveAdaptations[cognitiveLevel] || cognitiveAdaptations.mild;
    
    // Emotional state adjustments - layered on top of cognitive base
    const emotionalAdjustments = {
      'calm': { rateMultiplier: 0.95, pitchMultiplier: 1.02, volumeMultiplier: 0.95 },
      'warm': { rateMultiplier: 1.0, pitchMultiplier: 1.05, volumeMultiplier: 1.0 },
      'upbeat': { rateMultiplier: 1.08, pitchMultiplier: 1.08, volumeMultiplier: 1.0 },
      'neutral': { rateMultiplier: 1.0, pitchMultiplier: 1.0, volumeMultiplier: 1.0 },
      'anxious': { rateMultiplier: 0.90, pitchMultiplier: 0.98, volumeMultiplier: 0.9 },
      'soothing': { rateMultiplier: 0.88, pitchMultiplier: 1.02, volumeMultiplier: 0.92 },
      'reassuring': { rateMultiplier: 0.85, pitchMultiplier: 1.08, volumeMultiplier: 0.95 }
    };
    
    const emotionalAdapt = emotionalAdjustments[emotionalState] || emotionalAdjustments.neutral;
    
    // Anxiety-based adjustments - slower and more soothing for high anxiety
    const anxietyAdjustment = anxietyLevel >= 7 ? 0.85 : 
                              anxietyLevel >= 5 ? 0.92 : 
                              anxietyLevel >= 3 ? 0.97 : 1.0;
    
    // User profile personalization - mimic preferred communication style
    let profileAdjustment = { rate: 1.0, pitch: 1.0 };
    if (userProfile?.communication_style) {
      const styleAdjustments = {
        'formal': { rate: 0.92, pitch: 0.98 },
        'casual': { rate: 1.05, pitch: 1.05 },
        'warm': { rate: 0.98, pitch: 1.08 },
        'gentle': { rate: 0.88, pitch: 1.10 }
      };
      profileAdjustment = styleAdjustments[userProfile.communication_style] || { rate: 1.0, pitch: 1.0 };
    }

    // Add natural pauses for better comprehension at higher cognitive decline levels
    let processedText = text;
    if (cognitiveAdapt.pauseMultiplier > 1.2) {
      // Add pauses after sentences and key phrases
      processedText = text
        .replace(/\. /g, '... ')
        .replace(/\? /g, '?.. ')
        .replace(/! /g, '!.. ')
        .replace(/,([A-Z])/g, ',.. $1'); // Pause after comma before capital letter
    }
    
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    // Combine all adjustments for final speech parameters
    const finalRate = Math.max(0.5, Math.min(2.0, 
      rate * 
      cognitiveAdapt.rateBase * 
      emotionalAdapt.rateMultiplier * 
      anxietyAdjustment *
      profileAdjustment.rate
    ));
    
    const finalPitch = Math.max(0.5, Math.min(2.0, 
      pitch * 
      cognitiveAdapt.pitchBase * 
      emotionalAdapt.pitchMultiplier *
      profileAdjustment.pitch
    ));
    
    const finalVolume = Math.max(0.1, Math.min(1.0, 
      volume * emotionalAdapt.volumeMultiplier
    ));
    
    utterance.rate = finalRate;
    utterance.pitch = finalPitch;
    utterance.volume = finalVolume;

    // Get voices
    let voices = speechSynthesis.getVoices();
    if (!voices.length) {
      console.warn('No voices available, waiting for voices to load...');
      // Wait for voices to load
      return new Promise((resolve) => {
        const loadVoices = () => {
          voices = speechSynthesis.getVoices();
          if (voices.length) {
            speechSynthesis.onvoiceschanged = null;
            
            // Select voice and speak
            const targetLangs = langMap[language] || ['en-US', 'en'];
            const languageVoices = voices.filter(v => 
              targetLangs.some(lang => v.lang.startsWith(lang))
            );
            
            let selectedVoice = null;
            if (languageVoices.length > 0) {
              selectedVoice = languageVoices.find(v => 
                v.name.includes('Natural') || v.name.includes('Neural') || 
                v.name.includes('Premium') || v.name.includes('Online')
              ) || languageVoices[0];
            } else if (voices.length > 0) {
              selectedVoice = voices[0];
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
              utterance.lang = selectedVoice.lang;
            }
            
            if (onEnd) {
              utterance.onend = onEnd;
              utterance.onerror = onEnd;
            }
            
            speechSynthesis.speak(utterance);
            resolve();
          }
        };
        speechSynthesis.onvoiceschanged = loadVoices;
      });
    }
    
    const userPreference = getUserVoicePreference();
    let selectedVoice = null;
    
    // Map language codes to voice language codes
    const langMap = {
      en: ['en-US', 'en-GB', 'en-AU', 'en'],
      es: ['es-ES', 'es-MX', 'es-US', 'es'],
      fr: ['fr-FR', 'fr-CA', 'fr'],
      de: ['de-DE', 'de-AT', 'de'],
      it: ['it-IT', 'it'],
      pt: ['pt-PT', 'pt-BR', 'pt'],
      zh: ['zh-CN', 'zh-TW', 'zh-HK', 'zh'],
      ja: ['ja-JP', 'ja'],
      ko: ['ko-KR', 'ko'],
      ar: ['ar-SA', 'ar-EG', 'ar'],
      hi: ['hi-IN', 'hi'],
      ru: ['ru-RU', 'ru'],
      nl: ['nl-NL', 'nl-BE', 'nl'],
      pl: ['pl-PL', 'pl'],
      tr: ['tr-TR', 'tr'],
      vi: ['vi-VN', 'vi'],
      th: ['th-TH', 'th'],
      sv: ['sv-SE', 'sv'],
      no: ['nb-NO', 'no'],
      da: ['da-DK', 'da']
    };
    
    const targetLangs = langMap[language] || ['en-US', 'en'];
    
    // Use user's preferred voice if set and matches language
    if (userPreference !== 'auto') {
      const preferredVoice = voices.find(v => v.name === userPreference);
      if (preferredVoice && targetLangs.some(lang => preferredVoice.lang.startsWith(lang))) {
        selectedVoice = preferredVoice;
      }
    }
    
    // Auto-select best voice for the target language
    if (!selectedVoice) {
      const languageVoices = voices.filter(v => 
        targetLangs.some(lang => v.lang.startsWith(lang))
      );
      
      if (languageVoices.length > 0) {
        // Select voice based on emotional state and cognitive level
        let preferredGender = null;
        if (anxietyLevel >= 7 || cognitiveLevel === 'advanced' || cognitiveLevel === 'severe') {
          preferredGender = 'female'; // Calm, soothing voices for comfort
        } else if (emotionalState === 'upbeat') {
          preferredGender = 'female';
        }
        
        if (preferredGender) {
          const genderVoices = languageVoices.filter(v => {
            const name = v.name.toLowerCase();
            return preferredGender === 'female' 
              ? (name.includes('female') || name.includes('woman') || 
                 !name.includes('male') && !name.includes('man'))
              : (name.includes('male') || name.includes('man'));
          });
          
          if (genderVoices.length > 0) {
            selectedVoice = genderVoices.find(v => 
              v.name.includes('Natural') || v.name.includes('Neural') || 
              v.name.includes('Premium') || v.name.includes('Online')
            ) || genderVoices[0];
          }
        }
        
        if (!selectedVoice) {
          selectedVoice = languageVoices.find(v => 
            v.name.includes('Natural') || v.name.includes('Neural') || 
            v.name.includes('Premium') || v.name.includes('Online')
          ) || languageVoices[0];
        }
      } else if (language === 'en') {
        const voicesByCategory = getAvailableVoices();
        
        let preferredCategory = 'warmComforting';
        if (anxietyLevel >= 7 || emotionalState === 'anxious') {
          preferredCategory = 'calm';
        } else if (emotionalState === 'upbeat') {
          preferredCategory = 'upbeat';
        }
        
        const categoriesInOrder = [
          preferredCategory,
          'warmComforting',
          'calm',
          'upbeat',
          'british',
          'american',
          'australian'
        ];
        
        for (const category of categoriesInOrder) {
          if (voicesByCategory[category]?.length > 0) {
            selectedVoice = voicesByCategory[category][0].voice;
            break;
          }
        }
      }
      
      if (!selectedVoice) {
        selectedVoice = voices[0];
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = targetLangs[0];
    }

    // Handle end callback BEFORE speaking
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => {
        console.log('Speech error, calling onEnd');
        if (onEnd) onEnd();
      };
    }

    console.log('Speaking with voice:', selectedVoice?.name || 'default', 'Rate:', finalRate, 'Pitch:', finalPitch);
    speechSynthesis.speak(utterance);
    
    return utterance;
    
  } catch (error) {
    console.error('Voice synthesis error:', error);
  }
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