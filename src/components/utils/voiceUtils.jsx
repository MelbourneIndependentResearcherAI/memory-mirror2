// Enhanced voice synthesis with realistic, human-like settings

export const speakWithRealisticVoice = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  // Priority order for most natural-sounding voices
  const preferredVoiceNames = [
    // Google voices (most natural)
    'Google US English Female',
    'Google UK English Female',
    'Google US English Male',
    
    // Microsoft natural voices
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    
    // Apple voices (iOS/macOS)
    'Samantha',
    'Karen',
    'Moira',
    'Tessa',
    
    // Other quality voices
    'English United States',
    'English (United States)',
  ];

  // Find the best available voice
  let selectedVoice = null;
  
  for (const prefName of preferredVoiceNames) {
    const voice = voices.find(v => v.name.includes(prefName));
    if (voice) {
      selectedVoice = voice;
      break;
    }
  }

  // Fallback: any English female voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => 
      v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    );
  }

  // Final fallback: any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Natural, conversational settings
  utterance.rate = options.rate || 0.92; // Slightly slower for clarity and warmth
  utterance.pitch = options.pitch || 1.05; // Slightly higher for warmth
  utterance.volume = options.volume || 1.0;

  // Add natural pauses for commas and periods
  const textWithPauses = text
    .replace(/,/g, ', ') // Add space after commas for brief pause
    .replace(/\./g, '. '); // Add space after periods for longer pause

  utterance.text = textWithPauses;

  // Event handlers
  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    if (options.onError) options.onError(event);
  };

  // Speak
  window.speechSynthesis.speak(utterance);
};

// Load voices (needed for some browsers)
export const loadVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

// Detect anxiety keywords and patterns
export const detectAnxiety = (text) => {
  const anxietyKeywords = {
    high: ['scared', 'terrified', 'afraid', 'fear', 'help me', 'emergency', 'danger', 'hurt', 'pain', 'dying', 'stolen', 'breaking in', 'intruder', 'thief'],
    medium: ['worried', 'confused', 'lost', 'don\'t know', 'can\'t find', 'where am i', 'where is', 'missing', 'gone', 'nervous', 'anxious', 'upset'],
    low: ['unsure', 'wondering', 'question', 'forgot', 'remember', 'think']
  };

  const lowerText = text.toLowerCase();
  
  // Check for high anxiety
  for (const keyword of anxietyKeywords.high) {
    if (lowerText.includes(keyword)) {
      return { level: 9, trigger: keyword, category: 'high' };
    }
  }

  // Check for medium anxiety
  for (const keyword of anxietyKeywords.medium) {
    if (lowerText.includes(keyword)) {
      return { level: 6, trigger: keyword, category: 'medium' };
    }
  }

  // Check for low anxiety
  for (const keyword of anxietyKeywords.low) {
    if (lowerText.includes(keyword)) {
      return { level: 3, trigger: keyword, category: 'low' };
    }
  }

  return { level: 0, trigger: null, category: 'none' };
};

// Generate calming redirect prompts
export const getCalmingRedirect = (anxietyTrigger) => {
  const redirects = {
    scared: "I'm here with you. You're safe. Tell me about a happy memory - maybe from when you were younger?",
    confused: "That's okay. Let's take a deep breath together. What's something that always makes you smile?",
    lost: "You're right where you need to be. I'm here with you. What's your favorite thing to do to relax?",
    stolen: "Everything important is safe and accounted for. Let's talk about something pleasant - what's your favorite season?",
    pain: "I hear you. Let's focus on something comforting. What's your favorite food or meal?"
  };

  for (const [key, redirect] of Object.entries(redirects)) {
    if (anxietyTrigger && anxietyTrigger.includes(key)) {
      return redirect;
    }
  }

  return "I'm here with you. Everything is okay. What's something that brings you joy?";
};