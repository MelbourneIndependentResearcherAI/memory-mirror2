// Enhanced voice synthesis with more human-like qualities
export const speakWithRealisticVoice = (text, options = {}) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices
  const voices = speechSynthesis.getVoices();
  
  // Prefer premium/natural voices - prioritize the most human-sounding options
  const preferredVoice = voices.find(voice => 
    // Google's Neural voices (best quality)
    (voice.name.includes('Google') && voice.name.includes('Neural')) ||
    voice.name.includes('Natural') ||
    voice.name.includes('Premium') ||
    voice.name.includes('Enhanced') ||
    // Apple's high quality voices
    voice.name.includes('Samantha') ||
    voice.name.includes('Karen') ||
    voice.name.includes('Victoria') ||
    // Microsoft's natural voices
    (voice.name.includes('Microsoft') && voice.name.includes('Natural'))
  ) || voices.find(v => v.lang.startsWith('en-US'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Apply custom settings with slight randomization for naturalness
  utterance.rate = (options.rate || 0.88) + (Math.random() - 0.5) * 0.05;
  utterance.pitch = (options.pitch || 1.0) + (Math.random() - 0.5) * 0.05;
  utterance.volume = options.volume || 1.0;

  // Insert natural pauses for longer texts
  let processedText = text;
  if (text.length > 80) {
    processedText = text
      .replace(/\. /g, '. ... ') // Pause after sentences
      .replace(/\? /g, '? ... ') // Pause after questions
      .replace(/! /g, '! ... ') // Pause after exclamations
      .replace(/,  /g, ', .. '); // Short pause after commas
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