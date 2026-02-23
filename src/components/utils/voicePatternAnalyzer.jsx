/**
 * Voice Pattern & Tone Analyzer
 * Learns and adapts to user's voice characteristics, speech patterns, and tones
 */

class VoicePatternAnalyzer {
  constructor() {
    this.patterns = {
      voiceTone: [],        // Detected emotional tones (happy, sad, anxious, calm, etc.)
      speechRate: [],       // How fast/slow they speak
      pausePatterns: [],    // Natural pause patterns
      volumeLevel: [],      // Loudness variations
      frequencies: [],      // Voice frequency characteristics
      commonPhrases: [],    // Phrases they frequently use
      responseLatency: [],  // How long they take to respond
      emotionalShifts: [],  // How emotions change during conversation
      stressIndicators: [],  // Signs of anxiety/distress
      comfortTopics: [],    // Topics that relax them
      triggerTopics: []     // Topics that cause anxiety
    };
    
    this.conversationHistory = [];
    this.userProfile = {
      preferredSpeechRate: 'normal',
      preferredVolume: 'normal',
      emotionalBaseline: 'calm',
      anxietyTriggers: [],
      comfortingFactors: []
    };
  }

  // Analyze incoming voice data for patterns
  analyzeVoiceInput(transcriptText, audioData = null) {
    const analysis = {
      timestamp: Date.now(),
      transcript: transcriptText,
      detectedTone: this.detectEmotionalTone(transcriptText),
      wordCount: transcriptText.split(' ').length,
      averageWordLength: this.calculateAverageWordLength(transcriptText),
      punctuationUsage: this.analyzePunctuation(transcriptText),
      detectedStress: this.detectStressIndicators(transcriptText),
      predictedEmotion: this.predictEmotionalState(transcriptText)
    };
    
    // Store for learning
    this.patterns.voiceTone.push(analysis.detectedTone);
    this.patterns.emotionalShifts.push({
      time: Date.now(),
      emotion: analysis.predictedEmotion,
      confidence: 0.8
    });
    
    return analysis;
  }

  // Detect emotional tone from speech content
  detectEmotionalTone(text) {
    const lowerText = text.toLowerCase();
    
    const emotionalIndicators = {
      happy: ['happy', 'wonderful', 'great', 'love', 'fantastic', 'excellent', 'joy', 'smile', 'laugh'],
      sad: ['sad', 'down', 'lonely', 'miss', 'sorry', 'cry', 'hurt', 'lost'],
      anxious: ['worried', 'anxious', 'scared', 'nervous', 'afraid', 'panic', 'stress', 'overwhelmed'],
      calm: ['calm', 'peaceful', 'relax', 'comfortable', 'safe', 'content', 'soothed'],
      confused: ['confused', 'lost', 'where', 'what', 'how', '?', 'dont understand', 'memory', 'forget'],
      nostalgic: ['remember', 'old days', 'back then', 'used to', 'good old', 'childhood', 'old times']
    };
    
    const detectedTones = {};
    
    for (const [tone, keywords] of Object.entries(emotionalIndicators)) {
      const count = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (count > 0) {
        detectedTones[tone] = count;
      }
    }
    
    // Return most prominent tone
    const maxTone = Object.entries(detectedTones).sort(([,a], [,b]) => b - a)[0];
    return maxTone ? maxTone[0] : 'neutral';
  }

  // Calculate average word length
  calculateAverageWordLength(text) {
    const words = text.split(' ').filter(w => w.length > 0);
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }

  // Analyze punctuation patterns
  analyzePunctuation(text) {
    return {
      exclamations: (text.match(/!/g) || []).length,
      questions: (text.match(/\?/g) || []).length,
      periods: (text.match(/\./g) || []).length,
      ellipsis: (text.match(/\.\.\./g) || []).length,
      emotionalIntensity: text.match(/[!?]{2,}/) ? 'high' : 'normal'
    };
  }

  // Detect stress indicators
  detectStressIndicators(text) {
    const stressKeywords = [
      'help', 'please', 'emergency', 'pain', 'trouble', 'problem',
      'wrong', 'lost', 'scared', 'alone', 'forgotten'
    ];
    
    const stressCount = stressKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    return {
      stressLevel: Math.min(stressCount * 2, 10), // 0-10 scale
      hasEmergencyLanguage: text.toLowerCase().includes('help') || text.toLowerCase().includes('emergency'),
      detectedPanic: stressCount >= 3
    };
  }

  // Predict overall emotional state
  predictEmotionalState(text) {
    const recentTones = this.patterns.voiceTone.slice(-5);
    const currentTone = this.detectEmotionalTone(text);
    const stressIndicators = this.detectStressIndicators(text);
    
    let emotionalState = 'neutral';
    
    if (stressIndicators.stressLevel >= 7) {
      emotionalState = 'distressed';
    } else if (currentTone === 'anxious') {
      emotionalState = 'anxious';
    } else if (currentTone === 'happy') {
      emotionalState = 'happy';
    } else if (currentTone === 'sad') {
      emotionalState = 'sad';
    } else if (currentTone === 'calm') {
      emotionalState = 'calm';
    } else if (currentTone === 'confused') {
      emotionalState = 'confused';
    } else if (currentTone === 'nostalgic') {
      emotionalState = 'nostalgic';
    }
    
    return emotionalState;
  }

  // Learn user's speech patterns
  updateUserProfile(voiceData) {
    // Track common phrases
    if (voiceData.commonPhrases) {
      this.patterns.commonPhrases.push(...voiceData.commonPhrases);
      this.patterns.commonPhrases = [...new Set(this.patterns.commonPhrases)].slice(-20);
    }
    
    // Track comfort and anxiety topics
    if (voiceData.comfortTopic) {
      this.userProfile.comfortingFactors.push(voiceData.comfortTopic);
    }
    if (voiceData.anxietyTopic) {
      this.userProfile.anxietyTriggers.push(voiceData.anxietyTopic);
    }
    
    // Update emotional baseline
    if (this.patterns.emotionalShifts.length > 0) {
      const recentEmotions = this.patterns.emotionalShifts.slice(-10);
      const emotionCounts = {};
      recentEmotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });
      const baselineEmotion = Object.entries(emotionCounts).sort(([,a], [,b]) => b - a)[0];
      if (baselineEmotion) {
        this.userProfile.emotionalBaseline = baselineEmotion[0];
      }
    }
  }

  // Get adaptation recommendations based on learned patterns
  getAdaptations() {
    const adaptations = {
      toneToUse: this.userProfile.emotionalBaseline === 'anxious' ? 'soothing' : 'warm',
      topicsToAvoid: [...new Set(this.userProfile.anxietyTriggers)].slice(-5),
      topicsToEncourage: [...new Set(this.userProfile.comfortingFactors)].slice(-5),
      commonPhrases: this.patterns.commonPhrases.slice(-5),
      pacing: this.userProfile.preferredSpeechRate,
      volume: this.userProfile.preferredVolume
    };
    
    return adaptations;
  }

  // Store learning in localStorage for persistence
  persistPatterns() {
    try {
      const data = {
        patterns: this.patterns,
        userProfile: this.userProfile,
        lastUpdated: Date.now()
      };
      localStorage.setItem('voicePatterns', JSON.stringify(data));
    } catch (e) {
      console.log('Could not persist voice patterns:', e.message);
    }
  }

  // Load previously learned patterns
  loadPatterns() {
    try {
      const saved = localStorage.getItem('voicePatterns');
      if (saved) {
        const data = JSON.parse(saved);
        this.patterns = data.patterns;
        this.userProfile = data.userProfile;
        console.log('✅ Loaded learned voice patterns');
      }
    } catch (e) {
      console.log('Could not load voice patterns:', e.message);
    }
  }

  // Clear all learned data
  reset() {
    this.patterns = {
      voiceTone: [],
      speechRate: [],
      pausePatterns: [],
      volumeLevel: [],
      frequencies: [],
      commonPhrases: [],
      responseLatency: [],
      emotionalShifts: [],
      stressIndicators: [],
      comfortTopics: [],
      triggerTopics: []
    };
    this.userProfile = {
      preferredSpeechRate: 'normal',
      preferredVolume: 'normal',
      emotionalBaseline: 'calm',
      anxietyTriggers: [],
      comfortingFactors: []
    };
    try {
      localStorage.removeItem('voicePatterns');
    } catch (e) {
      console.log('Could not clear localStorage:', e.message);
    }
  }
}

// Export singleton instance
export const voicePatternAnalyzer = new VoicePatternAnalyzer();
voicePatternAnalyzer.loadPatterns();