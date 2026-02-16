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

// Get available quality voices categorized
export const getAvailableVoices = () => {
  const voices = speechSynthesis.getVoices();
  
  const maleVoices = [];
  const femaleVoices = [];
  
  // Premium voice patterns
  const premiumPatterns = {
    male: [
      { name: 'Microsoft Guy Online (Natural)', label: 'Guy (Natural)' },
      { name: 'Google UK English Male', label: 'British Male' },
      { name: 'Google US English Male', label: 'American Male' },
      { name: 'Daniel', label: 'Daniel' },
      { name: 'James', label: 'James' },
    ],
    female: [
      { name: 'Microsoft Aria Online (Natural)', label: 'Aria (Natural)' },
      { name: 'Microsoft Jenny Online (Natural)', label: 'Jenny (Natural)' },
      { name: 'Google UK English Female', label: 'British Female' },
      { name: 'Google US English Female', label: 'American Female' },
      { name: 'Samantha', label: 'Samantha' },
      { name: 'Karen', label: 'Karen' },
      { name: 'Moira', label: 'Moira' },
      { name: 'Tessa', label: 'Tessa' },
    ]
  };
  
  // Find premium voices
  premiumPatterns.male.forEach(({ name, label }) => {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) maleVoices.push({ voice, label, id: voice.name });
  });
  
  premiumPatterns.female.forEach(({ name, label }) => {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) femaleVoices.push({ voice, label, id: voice.name });
  });
  
  // Fallback: any English voices
  if (maleVoices.length === 0) {
    voices.filter(v => v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female')))
      .forEach(voice => maleVoices.push({ voice, label: voice.name.split('-')[0].trim(), id: voice.name }));
  }
  
  if (femaleVoices.length === 0) {
    voices.filter(v => v.lang.startsWith('en') && 
      v.name.toLowerCase().includes('female'))
      .forEach(voice => femaleVoices.push({ voice, label: voice.name.split('-')[0].trim(), id: voice.name }));
  }
  
  return { maleVoices, femaleVoices };
};

// Enhanced voice synthesis with user preference
export const speakWithRealisticVoice = (text, options = {}) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get voices
  const voices = speechSynthesis.getVoices();
  const userPreference = getUserVoicePreference();
  
  let selectedVoice = null;
  
  // Use user's preferred voice if set
  if (userPreference !== 'auto') {
    selectedVoice = voices.find(v => v.name === userPreference);
  }
  
  // Auto-select best voice if no preference or voice not found
  if (!selectedVoice) {
    const { maleVoices, femaleVoices } = getAvailableVoices();
    const allPremium = [...femaleVoices, ...maleVoices];
    
    if (allPremium.length > 0) {
      selectedVoice = allPremium[0].voice;
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US'));
    }
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Natural, warm settings
  utterance.rate = options.rate || 0.90;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Add natural pauses
  let processedText = text;
  if (text.length > 80) {
    processedText = text
      .replace(/\. /g, '. ... ')
      .replace(/\? /g, '? ... ')
      .replace(/! /g, '! ... ')
      .replace(/,  /g, ', .. ');
  }

  utterance.text = processedText;

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