import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, BookHeart, Gamepad2, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import VoiceSetup from './VoiceSetup';
import AnxietyAlert from './AnxietyAlert';
import LanguageSelector from './LanguageSelector';
import GameInterface from '../games/GameInterface';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import EraSelector from './EraSelector';
import MusicPlayer from './MusicPlayer';
import StoryTeller from './StoryTeller';
import SmartMemoryRecall from './SmartMemoryRecall';
import VisualResponse from './VisualResponse';
import SmartHomeControls from '../smartHome/SmartHomeControls';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from './voiceUtils';
import { isOnline, getOfflineResponse, cacheOfflineResponse } from '../utils/offlineManager';

export default function ChatInterface({ onEraChange, onModeSwitch, onMemoryGalleryOpen }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [anxietyState, setAnxietyState] = useState({ level: 0, suggestedMode: null });
  const [showAnxietyAlert, setShowAnxietyAlert] = useState(false);
  const [selectedEra, setSelectedEra] = useState('auto');
  const [detectedEra, setDetectedEra] = useState('present');
  const [showGames, setShowGames] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [smartRecall, setSmartRecall] = useState({ show: false, photos: [], memories: [] });
  const [visualResponse, setVisualResponse] = useState({ show: false, suggestions: [] });
  const [conversationTopics, setConversationTopics] = useState([]);
  const [cognitiveLevel, setCognitiveLevel] = useState('mild');
  const [lastAssessment, setLastAssessment] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem('memoryMirrorLanguage') || 'en';
    } catch {
      return 'en';
    }
  });
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['safeZones'] });
    await queryClient.refetchQueries({ queryKey: ['memories'] });
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const { data: safeZones = [] } = useQuery({
    queryKey: ['safeZones'],
    queryFn: () => offlineEntities.list('SafeMemoryZone'),
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => offlineEntities.list('Memory', '-created_date', 50),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await offlineEntities.list('UserProfile');
      return profiles[0] || null;
    },
  });

  const { data: cognitiveAssessments = [] } = useQuery({
    queryKey: ['cognitiveAssessments'],
    queryFn: () => offlineEntities.list('CognitiveAssessment', '-assessment_date', 1),
  });

  useEffect(() => {
    if (cognitiveAssessments.length > 0) {
      setCognitiveLevel(cognitiveAssessments[0].cognitive_level);
      setLastAssessment(cognitiveAssessments[0]);
    }
  }, [cognitiveAssessments]);

  const getSystemPrompt = () => {
    const profileContext = userProfile 
      ? `\n\nPERSONALIZATION PROFILE:
- Their name: ${userProfile.loved_one_name}${userProfile.preferred_name ? ` (prefers: ${userProfile.preferred_name})` : ''}
- Born: ${userProfile.birth_year || 'unknown'}
- Favorite era: ${userProfile.favorite_era || 'unknown'}
- Communication style: ${userProfile.communication_style || 'warm'}
${userProfile.interests?.length > 0 ? `- Interests: ${userProfile.interests.join(', ')}` : ''}
${userProfile.favorite_music?.length > 0 ? `- Favorite music: ${userProfile.favorite_music.join(', ')}` : ''}
${userProfile.important_people?.length > 0 ? `- Important people: ${userProfile.important_people.map(p => `${p.name} (${p.relationship})`).join(', ')}` : ''}
${userProfile.life_experiences?.length > 0 ? `- Key experiences: ${userProfile.life_experiences.map(e => e.title).join(', ')}` : ''}

USE THIS INFORMATION to personalize your responses. Call them by their preferred name. Reference their interests, favorite music, and life experiences naturally in conversation.`
      : '';

    const safeZoneContext = safeZones.length > 0 
      ? `\n\nSAFE MEMORY ZONES (redirect here when anxiety detected):\n${safeZones.map(z => `- ${z.title}: ${z.description}`).join('\n')}`
      : '';
    
    const memoryContext = memories.length > 0
      ? `\n\nAVAILABLE MEMORIES TO SUGGEST:\n${memories.slice(0, 10).map(m => `- "${m.title}" (${m.era}, ${m.emotional_tone}): ${m.description.substring(0, 100)}...`).join('\n')}`
      : '';

    const eraInstructions = selectedEra === 'auto' 
      ? `Detect their mental time period from context clues and adapt your responses accordingly. Smoothly transition between eras when their mental state shifts.`
      : `You are currently in ${selectedEra} mode. Maintain conversational consistency with ${selectedEra} language, cultural references, and expressions. Reference things familiar from ${selectedEra}. If they mention something from a different era, gracefully acknowledge it: "Oh yes, I remember that..." and weave it into the ${selectedEra} context naturally.`;

    const eraSpecificContext = {
      '1940s': '\n\nCULTURAL CONTEXT: Post-war era, big band music (Glenn Miller, Frank Sinatra), radio shows, traditional values, community gatherings, simpler technology, war memories, rationing, victory gardens.',
      '1960s': '\n\nCULTURAL CONTEXT: Rock & roll (Beatles, Elvis), cultural revolution, civil rights, moon landing, television becoming common, folk music, social changes, hippie movement.',
      '1980s': '\n\nCULTURAL CONTEXT: Pop and rock music (Madonna, Michael Jackson), arcade games, MTV, neon colors, big hair, cassette tapes, early personal computers, Reagan era.',
      'present': '\n\nCULTURAL CONTEXT: Smartphones, social media, streaming services, modern conveniences, current events.',
      'auto': ''
    };

    // Adaptive communication based on cognitive level
    const cognitiveAdaptations = {
      mild: {
        complexity: 'Use natural, conversational language with moderate complexity. Allow for nuanced discussions.',
        speed: 'Respond at a normal conversational pace.',
        memory: 'Reference memories with detail. Encourage reminiscence and storytelling.'
      },
      moderate: {
        complexity: 'Use simpler sentence structures. Break complex ideas into smaller parts. Repeat key information.',
        speed: 'Slow down responses slightly. Pause between concepts.',
        memory: 'Reference familiar memories with gentle prompting. Use concrete, sensory details.'
      },
      advanced: {
        complexity: 'Use very simple, short sentences (5-8 words). Focus on one idea at a time. Use concrete language only.',
        speed: 'Respond slowly with clear pauses. Give time to process.',
        memory: 'Focus on deeply familiar memories (childhood, early adulthood). Use emotions more than facts.'
      },
      severe: {
        complexity: 'Use extremely simple phrases (3-5 words). Focus on immediate comfort and reassurance.',
        speed: 'Very slow, gentle responses with long pauses.',
        memory: 'Focus on emotional connection rather than specific memories. Use sensory comfort words.'
      }
    };

    const adaptation = cognitiveAdaptations[cognitiveLevel] || cognitiveAdaptations.mild;

    return `You are Memory Mirror, a compassionate AI companion for people with dementia. Core principles:

1. NEVER correct or reality-orient. Meet people where they are mentally.
2. ${eraInstructions}${eraSpecificContext[selectedEra] || ''}
3. When transitioning between eras, do so gently: "I can tell you're thinking about [time period]... let's talk about that..."
4. When confusion or anxiety is detected, redirect to "safe memory zones" - positive, familiar topics.
5. Proactively suggest specific positive memories when appropriate.
6. Validate all emotions without judgment.
7. Use warm, simple, clear language with era-appropriate expressions.
8. Reassure them that everything is taken care of.
9. Be patient and repeat information if needed.${profileContext}${safeZoneContext}${memoryContext}

**COGNITIVE ADAPTATION (Current level: ${cognitiveLevel}):**
- Communication complexity: ${adaptation.complexity}
- Response pacing: ${adaptation.speed}
- Memory recall approach: ${adaptation.memory}

${lastAssessment?.recommended_adaptations?.length > 0 ? `\nRECOMMENDED ADAPTATIONS:\n${lastAssessment.recommended_adaptations.map(a => `- ${a}`).join('\n')}` : ''}

After your response, on a new line output META: {"era": "1940s|1960s|1980s|present", "anxiety": 0-10, "suggestedMemory": "memory title or null"}`;
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const speakResponse = (text, emotionalContext = {}) => {
    speakWithRealisticVoice(text, {
      rate: 0.92,
      pitch: 1.05,
      volume: 1.0,
      emotionalState: emotionalContext.state || 'neutral',
      anxietyLevel: emotionalContext.anxietyLevel || 0
    });
  };

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    try {
      localStorage.setItem('memoryMirrorLanguage', languageCode);
    } catch {}
  };

  const translateText = async (text, targetLang, sourceLang = null) => {
    if (targetLang === 'en' && !sourceLang) return text;
    
    try {
      const result = await offlineFunction('translateText', {
        text,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang
      });
      return result.data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const sendMessage = async (transcribedText) => {
    const userMessage = transcribedText || '';
    if (!userMessage.trim() || isLoading) return;
    
    // Log chat activity (offline-aware)
    offlineEntities.create('ActivityLog', {
      activity_type: 'chat',
      details: { message_length: userMessage.length, era: selectedEra, language: selectedLanguage }
    }).catch(() => {});
    
    // Display user message in their language
    setMessages(prev => [...prev, { role: 'user', content: userMessage, language: selectedLanguage }]);
    
    // Translate user message to English for processing if needed
    const userMessageEnglish = selectedLanguage !== 'en' 
      ? await translateText(userMessage, 'en', selectedLanguage)
      : userMessage;
    
    const newHistory = [...conversationHistory, { role: 'user', content: userMessageEnglish }];
    setConversationHistory(newHistory);
    setIsLoading(true);

    // Perform sentiment analysis on English text (offline-aware)
    let sentimentAnalysis = null;
    try {
      const sentimentResult = await offlineFunction('analyzeSentiment', { text: userMessageEnglish });
      sentimentAnalysis = sentimentResult.data;
      
      // Create caregiver alert for immediate attention needs
      if (sentimentAnalysis.needs_immediate_attention) {
        offlineEntities.create('CaregiverAlert', {
          alert_type: 'high_anxiety',
          severity: 'urgent',
          message: `User expressed: "${userMessage.substring(0, 100)}..." - Anxiety level ${sentimentAnalysis.anxiety_level}/10`,
          pattern_data: sentimentAnalysis
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      // Fallback to basic anxiety detection
      sentimentAnalysis = { anxiety_level: detectAnxiety(userMessageEnglish).level };
    }
    
    const anxietyLevel = sentimentAnalysis?.anxiety_level || 0;

    // Track conversation topics for smart recall
    const topics = sentimentAnalysis?.themes || [];
    setConversationTopics(prev => {
      const updated = [...new Set([...prev, ...topics])].slice(-10);
      return updated;
    });

    // Recall relevant memories proactively (offline-aware)
    let memoryRecall = null;
    try {
      const recallResult = await offlineFunction('recallMemories', {
        context: userMessageEnglish,
        sentiment_analysis: sentimentAnalysis,
        detected_era: selectedEra === 'auto' ? detectedEra : selectedEra
      });
      memoryRecall = recallResult.data;
    } catch (error) {
      console.error('Memory recall failed:', error);
    }

    // Suggest visual responses (images/videos) - offline-aware
    let visualSuggestions = null;
    try {
      const visualResult = await offlineFunction('suggestVisualResponses', {
        conversation_context: userMessageEnglish,
        detected_emotion: sentimentAnalysis?.emotional_tone?.[0] || 'neutral',
        detected_era: selectedEra === 'auto' ? detectedEra : selectedEra,
        anxiety_level: anxietyLevel,
        conversation_topics: conversationTopics
      });
      visualSuggestions = visualResult.data;
    } catch (error) {
      console.error('Visual suggestions failed:', error);
    }

    // Find relevant photos and conversation snippets using AI (offline-aware)
    try {
      const relevantMedia = await offlineFunction('findRelevantMedia', {
        context: userMessageEnglish,
        current_era: selectedEra === 'auto' ? detectedEra : selectedEra,
        conversation_topics: conversationTopics
      });
      
      if (relevantMedia.data?.should_show && 
          (relevantMedia.data?.photos?.length > 0 || relevantMedia.data?.memories?.length > 0)) {
        setSmartRecall({
          show: true,
          photos: relevantMedia.data.photos || [],
          memories: relevantMedia.data.memories || [],
          reasoning: relevantMedia.data.reasoning
        });
      }
    } catch (error) {
      console.error('Smart recall failed:', error);
    }

    // Handle high anxiety proactively
    if (anxietyLevel >= 7) {
      let calmingMessage = getCalmingRedirect(sentimentAnalysis?.trigger_words?.[0] || 'distress');
      
      // Translate calming message to user's language
      if (selectedLanguage !== 'en') {
        calmingMessage = await translateText(calmingMessage, selectedLanguage, 'en');
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: calmingMessage, hasVoice: true, language: selectedLanguage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: calmingMessage }]);
      speakResponse(calmingMessage, { state: 'calm', anxietyLevel });
      
      // Suggest phone mode for high anxiety
      setAnxietyState({ level: anxietyLevel, suggestedMode: 'phone' });
      setShowAnxietyAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      // Prepare enriched context for AI
      const emotionalContext = sentimentAnalysis 
        ? `\n\nEMOTIONAL ANALYSIS:
- Sentiment: ${sentimentAnalysis.sentiment}
- Emotional tone: ${sentimentAnalysis.emotional_tone?.join(', ')}
- Anxiety level: ${sentimentAnalysis.anxiety_level}/10
- Themes detected: ${sentimentAnalysis.themes?.join(', ')}
- Response approach: ${sentimentAnalysis.response_approach}
${sentimentAnalysis.trigger_words?.length > 0 ? `- Trigger words: ${sentimentAnalysis.trigger_words.join(', ')}` : ''}`
        : '';

      const memoryContext = memoryRecall?.should_proactively_mention && memoryRecall?.selected_memories?.length > 0
        ? `\n\nRELEVANT MEMORIES TO MENTION:
${memoryRecall.selected_memories.map(m => `- "${m.title}": ${m.suggested_mention}\n  Reasoning: ${m.reasoning}`).join('\n')}
Tone: ${memoryRecall.tone_recommendation}`
        : '';

      // Get AI response (offline-aware)
      const fullPrompt = `${getSystemPrompt()}${emotionalContext}${memoryContext}

Conversation so far:
${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Respond with compassion, validation, and warmth. ${memoryRecall?.should_proactively_mention ? 'Naturally weave in the suggested memory/memories.' : ''}`;

      let response = await offlineAIChat(fullPrompt, {
        add_context_from_internet: false
      });

      let assistantMessage = typeof response === 'string' ? response : response?.text || response;
      let era = 'present';
      let detectedAnxiety = anxietyLevel;
      
      // Parse META data if present
      if (typeof assistantMessage === 'string' && assistantMessage.includes('META:')) {
        const parts = assistantMessage.split('META:');
        assistantMessage = parts[0].trim();
        try {
          const meta = JSON.parse(parts[1].trim());
          era = meta.era || 'present';
          detectedAnxiety = meta.anxiety || detectedAnxiety;
          setDetectedEra(era);
          onEraChange(era);
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Translate response to user's language
      if (selectedLanguage !== 'en') {
        assistantMessage = await translateText(assistantMessage, selectedLanguage, 'en');
      }

      // Track anxiety trends (offline-aware)
      if (detectedAnxiety >= 4) {
        const today = new Date().toISOString().split('T')[0];
        offlineEntities.create('AnxietyTrend', {
          date: today,
          anxiety_level: detectedAnxiety,
          trigger_category: sentimentAnalysis?.trigger_words?.[0] ? 'distress' : 'none',
          mode_used: 'chat',
          interaction_count: 1
        }).catch(() => {});
      }

      // Periodic cognitive assessment (every 10 messages) - offline-aware
      if (conversationHistory.length % 10 === 0 && conversationHistory.length > 0) {
        offlineFunction('assessCognitiveLevel', {
          conversation_history: conversationHistory,
          recent_interactions: { message_count: conversationHistory.length }
        }).then(result => {
          if (result.data?.cognitive_level) {
            setCognitiveLevel(result.data.cognitive_level);
            queryClient.invalidateQueries({ queryKey: ['cognitiveAssessments'] });
          }
        }).catch(() => {});
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, hasVoice: true, language: selectedLanguage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      // Trigger mood-based device control (offline-aware)
      if (detectedAnxiety >= 4) {
        try {
          const moodControl = await offlineFunction('moodBasedDeviceControl', {
            anxiety_level: detectedAnxiety,
            detected_mood: detectedAnxiety >= 7 ? 'anxious' : detectedAnxiety >= 4 ? 'calm' : 'peaceful',
            conversation_context: userMessageEnglish
          });

          if (moodControl.data?.applied) {
            toast.success(`Environment adjusted: ${moodControl.data.automations_triggered.join(', ')}`);
          }
        } catch (error) {
          console.error('Mood-based control failed:', error);
        }
      }

      // Show visual response if available
      if (visualSuggestions?.should_show_visuals && visualSuggestions?.suggestions?.length > 0) {
        setVisualResponse({
          show: true,
          suggestions: visualSuggestions.suggestions
        });
      }
      
      // Determine emotional state for voice adaptation
      const emotionalState = detectedAnxiety >= 7 ? 'anxious' :
                           detectedAnxiety >= 4 ? 'calm' :
                           detectedAnxiety <= 2 ? 'upbeat' : 'neutral';
      
      speakResponse(assistantMessage, { state: emotionalState, anxietyLevel: detectedAnxiety });

      // Show anxiety alert if needed
      if (detectedAnxiety >= 6) {
        setAnxietyState({ 
          level: detectedAnxiety, 
          suggestedMode: detectedAnxiety >= 8 ? 'phone' : null 
        });
        setShowAnxietyAlert(true);
        
        // Log high anxiety (offline-aware)
        offlineEntities.create('ActivityLog', {
          activity_type: 'anxiety_detected',
          anxiety_level: detectedAnxiety,
          details: { trigger: userMessage.substring(0, 100) }
        }).catch(() => {});
      }

    } catch (error) {
      console.error('Chat error:', error);
      let fallback = "I'm here with you. Let's try again in just a moment.";
      
      // Translate fallback message
      if (selectedLanguage !== 'en') {
        fallback = await translateText(fallback, selectedLanguage, 'en');
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallback,
        hasVoice: true,
        language: selectedLanguage
      }]);
      speakResponse(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    // Map language codes to speech recognition locales
    const langMap = {
      en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
      pt: 'pt-PT', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA',
      hi: 'hi-IN', ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR',
      vi: 'vi-VN', th: 'th-TH', sv: 'sv-SE', no: 'nb-NO', da: 'da-DK'
    };
    
    recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        speakWithRealisticVoice("I didn't hear anything. Try again when you're ready.");
      }
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
      setIsListening(false);
    }
  };
  
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleEraChange = (era) => {
    setSelectedEra(era);
    if (era === 'auto') {
      speakWithRealisticVoice("I'll adapt to your mental time period naturally.");
    } else {
      speakWithRealisticVoice(`Switching to ${era} communication mode.`);
    }
    // Clear conversation when changing era for fresh context
    setMessages([]);
    setConversationHistory([]);
    setConversationTopics([]);
  };

  const handleMemorySelect = async (type, item) => {
    setSmartRecall({ show: false, photos: [], memories: [] });
    
    // Create a message about the selected memory
    let description = '';
    if (type === 'photo') {
      description = `Tell me about this photo: "${item.title}". ${item.caption || ''}`;
    } else {
      description = `I'd like to talk about: "${item.title}". ${item.description?.substring(0, 100)}...`;
    }
    
    await sendMessage(description);
  };

  return (
    <div className="flex flex-col h-full">
      <LanguageSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <VoiceSetup />
      
      <EraSelector selectedEra={selectedEra} onEraChange={handleEraChange} />
      
      {/* Smart Home Controls Panel */}
      {visualResponse.show && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
          <SmartHomeControls mode="compact" />
        </div>
      )}

      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onMemoryGalleryOpen && onMemoryGalleryOpen()}
          className="flex flex-col items-center justify-center gap-2 h-20 border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
        >
          <BookHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold">Memories</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowMusic(!showMusic)}
          className="flex flex-col items-center justify-center gap-2 h-20 border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
        >
          <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold">Music</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowStory(!showStory)}
          className="flex flex-col items-center justify-center gap-2 h-20 border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
        >
          <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold">Stories</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowGames(true)}
          className="flex flex-col items-center justify-center gap-2 h-20 border-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all"
        >
          <Gamepad2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-semibold">Games</span>
        </Button>
      </div>
      
      {showGames && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900">
          <GameInterface onClose={() => setShowGames(false)} />
        </div>
      )}
      
      {showAnxietyAlert && (
        <AnxietyAlert
          anxietyLevel={anxietyState.level}
          suggestedMode={anxietyState.suggestedMode}
          onModeSwitch={() => {
            if (anxietyState.suggestedMode && onModeSwitch) {
              onModeSwitch(anxietyState.suggestedMode);
            }
            setShowAnxietyAlert(false);
          }}
          onDismiss={() => setShowAnxietyAlert(false)}
        />
      )}

      {smartRecall.show && (
        <SmartMemoryRecall
          photos={smartRecall.photos}
          memories={smartRecall.memories}
          onClose={() => setSmartRecall({ show: false, photos: [], memories: [] })}
          onSelect={handleMemorySelect}
        />
      )}

      {visualResponse.show && (
        <VisualResponse
          suggestions={visualResponse.suggestions}
          onClose={() => setVisualResponse({ show: false, suggestions: [] })}
        />
      )}
      
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="flex-1 bg-gradient-to-b from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-slate-900 min-h-[400px]"
      >
        <div 
          ref={chatContainerRef}
          className="p-6 space-y-4"
        >
        {showMusic && (
          <MusicPlayer 
            currentEra={selectedEra === 'auto' ? detectedEra : selectedEra} 
            onClose={() => setShowMusic(false)} 
          />
        )}
        
        {showStory && (
          <StoryTeller 
            currentEra={selectedEra === 'auto' ? detectedEra : selectedEra}
            currentMood={anxietyState.level < 4 ? 'peaceful' : 'comforting'}
            onClose={() => setShowStory(false)} 
          />
        )}
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <Mic className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
            <p className="text-lg font-medium mb-2">Welcome to Memory Mirror</p>
            <p className="text-sm mb-4">I'm here to keep you company</p>
            <p className="text-xs text-slate-400">Tap the microphone below to speak</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg.content}
              isAssistant={msg.role === 'assistant'}
              hasVoice={msg.hasVoice}
              onSpeak={() => speakResponse(msg.content)}
            />
          ))
        )}
        
        {isLoading && (
          <div className="text-center text-slate-400 dark:text-slate-500 py-4 italic flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}
        </div>
      </PullToRefresh>

      <div className="p-6 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
            className={`
              w-28 h-28 rounded-full shadow-2xl transition-all duration-300 border-4 border-white dark:border-slate-800
              ${isListening 
                ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 animate-pulse' 
                : 'bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-14 h-14 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-14 h-14 text-white" />
            ) : (
              <Mic className="w-14 h-14 text-white" />
            )}
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {isListening ? 'Listening...' : isLoading ? 'Thinking...' : 'Tap to Talk'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isListening ? 'Speak clearly and I\'ll listen' : isLoading ? 'Processing your message' : 'Press the button to start'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}