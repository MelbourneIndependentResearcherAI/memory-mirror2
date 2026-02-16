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

// Enhanced voice synthesis with emotional adaptation
export const speakWithRealisticVoice = (text, options = {}) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get voices
  const voices = speechSynthesis.getVoices();
  const userPreference = getUserVoicePreference();
  const emotionalState = options.emotionalState || 'neutral'; // calm, anxious, confused, happy
  const anxietyLevel = options.anxietyLevel || 0;
  
  let selectedVoice = null;
  
  // Use user's preferred voice if set
  if (userPreference !== 'auto') {
    selectedVoice = voices.find(v => v.name === userPreference);
  }
  
  // Auto-select best voice based on emotional context
  if (!selectedVoice) {
    const voicesByCategory = getAvailableVoices();
    
    // Select voice category based on user's emotional state
    let preferredCategory = 'warmComforting';
    if (anxietyLevel >= 7 || emotionalState === 'anxious') {
      preferredCategory = 'calm'; // Use calm, reassuring voices for high anxiety
    } else if (emotionalState === 'happy' || emotionalState === 'upbeat') {
      preferredCategory = 'upbeat'; // Match positive energy
    }
    
    // Try preferred category first, then fallback
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
    
    // Final fallback
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US'));
    }
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Dynamically adjust voice parameters based on emotional context
  let rate = 0.90;
  let pitch = 1.0;
  let volume = 1.0;

  // Adjust for emotional state
  if (anxietyLevel >= 7 || emotionalState === 'anxious') {
    // Slower, lower, calmer for high anxiety
    rate = 0.75;
    pitch = 0.95;
    volume = 0.9;
  } else if (emotionalState === 'confused') {
    // Slightly slower, clear for confusion
    rate = 0.85;
    pitch = 1.0;
    volume = 1.0;
  } else if (emotionalState === 'happy' || emotionalState === 'upbeat') {
    // Slightly faster, higher for positive emotions
    rate = 0.95;
    pitch = 1.05;
    volume = 1.0;
  } else if (emotionalState === 'calm') {
    // Gentle, steady for calm moments
    rate = 0.88;
    pitch = 1.0;
    volume = 0.95;
  }

  // Allow manual overrides
  utterance.rate = options.rate || rate;
  utterance.pitch = options.pitch || pitch;
  utterance.volume = options.volume || volume;

  // Add natural pauses with emotional pacing
  let processedText = text;
  if (text.length > 80) {
    const pauseDuration = anxietyLevel >= 7 ? ' .... ' : ' ... '; // Longer pauses for anxiety
    processedText = text
      .replace(/\. /g, `.${pauseDuration}`)
      .replace(/\? /g, `?${pauseDuration}`)
      .replace(/! /g, `!${pauseDuration}`)
      .replace(/,  /g, ', .. ');
  }

  utterance.text = processedText;

  // Handle end callback for hands-free mode
  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  // Speak
  speechSynthesis.speak(utterance);

  return utterance;
};

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

  // Check each category
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

  // Add context-based detection
  if (lowerText.includes('?') && lowerText.split(' ').length < 6) {
    maxLevel = Math.max(maxLevel, 4); // Short confused questions
  }

  return {
    level: maxLevel,
    trigger: detectedTrigger
  };
};

// Get calming redirect based on trigger
export const getCalmingRedirect = (trigger) => {
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
  // Initial load
  speechSynthesis.getVoices();
}