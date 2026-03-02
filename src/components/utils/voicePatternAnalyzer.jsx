/**
 * Voice Pattern & Tone Analyzer — AI-Driven Adaptive Learning
 * Learns vocabulary, sentence structure, emotional tone, topic preferences,
 * and response-length preferences to personalize every AI interaction.
 */

class VoicePatternAnalyzer {
  constructor() {
    this.patterns = {
      voiceTone: [],
      commonPhrases: [],
      emotionalShifts: [],
      topicFrequency: {},       // { topic: count }
      vocabularySet: {},        // { word: count } — tracks preferred words
      sentenceLengths: [],      // word counts per utterance
      questionRate: 0,          // 0-1 — how often user asks questions
      sessionCount: 0,
      responseLengthPreference: 'medium',  // 'short' | 'medium' | 'long'
      lastTopics: [],           // last 10 topics discussed
    };

    this.userProfile = {
      preferredSpeechRate: 'normal',
      preferredVolume: 'normal',
      emotionalBaseline: 'calm',
      anxietyTriggers: [],
      comfortingFactors: [],
      preferredVocabulary: [],   // high-frequency words user likes
      preferredSentenceStyle: 'simple',  // 'simple' | 'conversational' | 'detailed'
      preferredTopics: [],
      responseStyleHint: '',     // Free-text hint for the AI
    };
  }

  // ─── Core analysis ───────────────────────────────────────────────────────────

  analyzeVoiceInput(transcriptText, _audioData = null) {
    const words = transcriptText.trim().split(/\s+/).filter(Boolean);
    const lowerText = transcriptText.toLowerCase();

    const analysis = {
      timestamp: Date.now(),
      transcript: transcriptText,
      detectedTone: this.detectEmotionalTone(lowerText),
      wordCount: words.length,
      averageWordLength: this.calculateAverageWordLength(words),
      punctuationUsage: this.analyzePunctuation(transcriptText),
      detectedStress: this.detectStressIndicators(lowerText),
      predictedEmotion: this.predictEmotionalState(lowerText),
    };

    // ── Learning: vocabulary ──
    words.forEach(w => {
      const clean = w.replace(/[^a-z']/gi, '').toLowerCase();
      if (clean.length > 3) {
        this.patterns.vocabularySet[clean] = (this.patterns.vocabularySet[clean] || 0) + 1;
      }
    });

    // ── Learning: sentence length ──
    this.patterns.sentenceLengths.push(words.length);
    if (this.patterns.sentenceLengths.length > 100) {
      this.patterns.sentenceLengths = this.patterns.sentenceLengths.slice(-100);
    }

    // ── Learning: question rate ──
    const isQuestion = /\?/.test(transcriptText) || /^(who|what|where|when|why|how|can|could|do|did|is|are|was|were)\b/i.test(transcriptText.trim());
    const total = this.patterns.sentenceLengths.length;
    this.patterns.questionRate = ((this.patterns.questionRate * (total - 1)) + (isQuestion ? 1 : 0)) / total;

    // ── Learning: topic extraction ──
    const topics = this._extractTopics(lowerText);
    topics.forEach(t => {
      this.patterns.topicFrequency[t] = (this.patterns.topicFrequency[t] || 0) + 1;
    });
    this.patterns.lastTopics = [...this.patterns.lastTopics, ...topics].slice(-10);

    // ── Learning: tone history ──
    this.patterns.voiceTone.push(analysis.detectedTone);
    this.patterns.emotionalShifts.push({ time: Date.now(), emotion: analysis.predictedEmotion });
    if (this.patterns.voiceTone.length > 200) this.patterns.voiceTone = this.patterns.voiceTone.slice(-200);
    if (this.patterns.emotionalShifts.length > 200) this.patterns.emotionalShifts = this.patterns.emotionalShifts.slice(-200);

    // ── Derive response-length preference from avg utterance length ──
    const avgLen = this.patterns.sentenceLengths.reduce((a, b) => a + b, 0) / (this.patterns.sentenceLengths.length || 1);
    if (avgLen <= 5) this.patterns.responseLengthPreference = 'short';
    else if (avgLen <= 12) this.patterns.responseLengthPreference = 'medium';
    else this.patterns.responseLengthPreference = 'long';

    return analysis;
  }

  // ─── Emotion detection ────────────────────────────────────────────────────────

  detectEmotionalTone(lowerText) {
    const emotionalIndicators = {
      happy: ['happy', 'wonderful', 'great', 'love', 'fantastic', 'excellent', 'joy', 'smile', 'laugh', 'good', 'nice'],
      sad: ['sad', 'down', 'lonely', 'miss', 'sorry', 'cry', 'hurt', 'lost', 'upset'],
      anxious: ['worried', 'anxious', 'scared', 'nervous', 'afraid', 'panic', 'stress', 'overwhelmed'],
      calm: ['calm', 'peaceful', 'relax', 'comfortable', 'safe', 'content', 'soothed', 'okay'],
      confused: ['confused', 'lost', 'where', 'what', 'how', "don't know", 'memory', 'forget', 'remember'],
      nostalgic: ['remember', 'old days', 'back then', 'used to', 'childhood', 'years ago', 'when i was'],
    };

    const scores = {};
    for (const [tone, keywords] of Object.entries(emotionalIndicators)) {
      scores[tone] = keywords.filter(k => lowerText.includes(k)).length;
    }
    const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    return best && best[1] > 0 ? best[0] : 'neutral';
  }

  calculateAverageWordLength(words) {
    if (!words.length) return 0;
    return words.reduce((s, w) => s + w.length, 0) / words.length;
  }

  analyzePunctuation(text) {
    return {
      exclamations: (text.match(/!/g) || []).length,
      questions: (text.match(/\?/g) || []).length,
      periods: (text.match(/\./g) || []).length,
      ellipsis: (text.match(/\.\.\./g) || []).length,
      emotionalIntensity: text.match(/[!?]{2,}/) ? 'high' : 'normal',
    };
  }

  detectStressIndicators(lowerText) {
    const stressKeywords = ['help', 'please', 'emergency', 'pain', 'trouble', 'problem', 'wrong', 'lost', 'scared', 'alone', 'forgotten'];
    const count = stressKeywords.filter(k => lowerText.includes(k)).length;
    return {
      stressLevel: Math.min(count * 2, 10),
      hasEmergencyLanguage: lowerText.includes('help') || lowerText.includes('emergency'),
      detectedPanic: count >= 3,
    };
  }

  predictEmotionalState(lowerText) {
    const tone = this.detectEmotionalTone(lowerText);
    const stress = this.detectStressIndicators(lowerText);
    if (stress.stressLevel >= 7) return 'distressed';
    if (['anxious', 'happy', 'sad', 'calm', 'confused', 'nostalgic'].includes(tone)) return tone;
    return 'neutral';
  }

  // ─── Topic extraction ─────────────────────────────────────────────────────────

  _extractTopics(lowerText) {
    const topicMap = {
      family: ['family', 'son', 'daughter', 'wife', 'husband', 'children', 'grandchild', 'mum', 'dad', 'sister', 'brother'],
      music: ['music', 'song', 'sing', 'listen', 'radio', 'tune', 'melody'],
      food: ['food', 'eat', 'hungry', 'dinner', 'lunch', 'breakfast', 'cook', 'meal', 'tea', 'coffee'],
      nature: ['garden', 'flower', 'bird', 'outside', 'walk', 'weather', 'rain', 'sun', 'park'],
      memories: ['remember', 'used to', 'back when', 'old days', 'childhood', 'years ago'],
      health: ['pain', 'tired', 'sleep', 'feel', 'doctor', 'medicine', 'rest'],
      religion: ['god', 'church', 'prayer', 'faith', 'bless', 'bible'],
    };

    const found = [];
    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(k => lowerText.includes(k))) found.push(topic);
    }
    return found;
  }

  // ─── Profile update ───────────────────────────────────────────────────────────

  updateUserProfile(voiceData) {
    if (voiceData.comfortTopic) {
      this.userProfile.comfortingFactors.push(voiceData.comfortTopic);
      this.userProfile.comfortingFactors = [...new Set(this.userProfile.comfortingFactors)].slice(-20);
    }
    if (voiceData.anxietyTopic) {
      this.userProfile.anxietyTriggers.push(voiceData.anxietyTopic);
      this.userProfile.anxietyTriggers = [...new Set(this.userProfile.anxietyTriggers)].slice(-20);
    }

    // Derive emotional baseline from recent history
    if (this.patterns.emotionalShifts.length >= 3) {
      const recent = this.patterns.emotionalShifts.slice(-15);
      const counts = {};
      recent.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
      const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
      if (top) this.userProfile.emotionalBaseline = top[0];
    }

    // Preferred vocabulary — top 15 non-trivial words
    this.userProfile.preferredVocabulary = Object.entries(this.patterns.vocabularySet)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([w]) => w);

    // Sentence style
    const avgLen = this.patterns.sentenceLengths.reduce((a, b) => a + b, 0) / (this.patterns.sentenceLengths.length || 1);
    this.userProfile.preferredSentenceStyle = avgLen <= 5 ? 'simple' : avgLen <= 12 ? 'conversational' : 'detailed';

    // Preferred topics
    this.userProfile.preferredTopics = Object.entries(this.patterns.topicFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([t]) => t);

    // Build a concise style hint for the AI
    this._buildResponseStyleHint();

    this.patterns.sessionCount++;
  }

  _buildResponseStyleHint() {
    const parts = [];
    const lenPref = this.patterns.responseLengthPreference;
    if (lenPref === 'short') parts.push('Keep responses very brief — 1 to 2 short sentences only.');
    else if (lenPref === 'long') parts.push('The user enjoys longer, more detailed conversation — 3 to 4 sentences is fine.');
    else parts.push('Respond in 2 to 3 short, friendly sentences.');

    if (this.userProfile.preferredSentenceStyle === 'simple') {
      parts.push('Use very simple, easy-to-understand words.');
    } else if (this.userProfile.preferredSentenceStyle === 'detailed') {
      parts.push('The user appreciates some detail and nuance in responses.');
    }

    if (this.patterns.questionRate > 0.5) {
      parts.push('The user often asks questions — answer them directly and warmly.');
    }

    if (this.userProfile.preferredTopics.length > 0) {
      parts.push(`When natural, weave in topics they enjoy: ${this.userProfile.preferredTopics.join(', ')}.`);
    }

    if (this.userProfile.preferredVocabulary.length > 5) {
      parts.push(`Mirror their language style using words like: ${this.userProfile.preferredVocabulary.slice(0, 8).join(', ')}.`);
    }

    this.userProfile.responseStyleHint = parts.join(' ');
  }

  // ─── Adaptations for caller ───────────────────────────────────────────────────

  getAdaptations() {
    return {
      toneToUse: this.userProfile.emotionalBaseline === 'anxious' ? 'soothing' :
                 this.userProfile.emotionalBaseline === 'happy' ? 'joyful' : 'warm',
      topicsToAvoid: [...new Set(this.userProfile.anxietyTriggers)].slice(-5),
      topicsToEncourage: this.userProfile.preferredTopics,
      commonPhrases: this.userProfile.preferredVocabulary.slice(0, 8),
      responseStyleHint: this.userProfile.responseStyleHint,
      responseLengthPreference: this.patterns.responseLengthPreference,
      preferredSentenceStyle: this.userProfile.preferredSentenceStyle,
      sessionCount: this.patterns.sessionCount,
    };
  }

  // ─── Persistence ──────────────────────────────────────────────────────────────

  persistPatterns() {
    try {
      localStorage.setItem('voicePatterns', JSON.stringify({
        patterns: this.patterns,
        userProfile: this.userProfile,
        lastUpdated: Date.now(),
      }));
    } catch (e) {
      console.log('Could not persist voice patterns:', e.message);
    }
  }

  loadPatterns() {
    try {
      const saved = localStorage.getItem('voicePatterns');
      if (saved) {
        const data = JSON.parse(saved);
        // Merge saved data, keeping new keys with defaults
        this.patterns = { ...this.patterns, ...data.patterns };
        this.userProfile = { ...this.userProfile, ...data.userProfile };
        console.log('✅ Loaded learned voice patterns');
      }
    } catch (e) {
      console.log('Could not load voice patterns:', e.message);
    }
  }

  reset() {
    this.patterns = {
      voiceTone: [], commonPhrases: [], emotionalShifts: [],
      topicFrequency: {}, vocabularySet: {}, sentenceLengths: [],
      questionRate: 0, sessionCount: 0,
      responseLengthPreference: 'medium', lastTopics: [],
    };
    this.userProfile = {
      preferredSpeechRate: 'normal', preferredVolume: 'normal',
      emotionalBaseline: 'calm', anxietyTriggers: [], comfortingFactors: [],
      preferredVocabulary: [], preferredSentenceStyle: 'simple',
      preferredTopics: [], responseStyleHint: '',
    };
    try { localStorage.removeItem('voicePatterns'); } catch {}
  }
}

export const voicePatternAnalyzer = new VoicePatternAnalyzer();
voicePatternAnalyzer.loadPatterns();