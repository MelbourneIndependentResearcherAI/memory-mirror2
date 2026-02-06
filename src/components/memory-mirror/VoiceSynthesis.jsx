// Enhanced voice synthesis with more human-like qualities
export const speakWithEmotion = (text, emotion = 'calm') => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices
  const voices = speechSynthesis.getVoices();
  
  // Prefer premium/natural voices
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') && voice.name.includes('en-US') ||
    voice.name.includes('Natural') ||
    voice.name.includes('Premium') ||
    voice.name.includes('Enhanced') ||
    voice.name.includes('Samantha') // High quality on Apple devices
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Adjust parameters based on emotion
  const emotionSettings = {
    calm: { rate: 0.85, pitch: 1.0, volume: 0.9 },
    reassuring: { rate: 0.8, pitch: 0.95, volume: 1.0 },
    warm: { rate: 0.9, pitch: 1.1, volume: 0.95 },
    gentle: { rate: 0.75, pitch: 1.05, volume: 0.85 },
    professional: { rate: 0.9, pitch: 0.95, volume: 1.0 },
  };

  const settings = emotionSettings[emotion] || emotionSettings.calm;
  
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  // Add slight variations for more natural speech
  utterance.rate += (Math.random() - 0.5) * 0.05;
  utterance.pitch += (Math.random() - 0.5) * 0.05;

  // Insert natural pauses for longer texts
  let processedText = text;
  if (text.length > 100) {
    processedText = text
      .replace(/\. /g, '. ... ') // Pause after sentences
      .replace(/\? /g, '? ... ') // Pause after questions
      .replace(/! /g, '! ... '); // Pause after exclamations
  }

  utterance.text = processedText;

  // Speak
  speechSynthesis.speak(utterance);

  return utterance;
};

// Ensure voices are loaded
if ('speechSynthesis' in window) {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
  // Initial load
  speechSynthesis.getVoices();
}