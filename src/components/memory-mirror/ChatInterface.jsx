import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, BookHeart, Gamepad2, Music, BookOpen, Headphones, Heart } from 'lucide-react';
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
import HandsFreeMode from './HandsFreeMode';
import PersonalizedCompanion from './PersonalizedCompanion';
import { base44 } from '@/api/base44Client';
import { offlineAIChat, offlineEntities, offlineFunction } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice, speakWithClonedVoice, detectAnxiety, getCalmingRedirect } from './voiceUtils';
import { isOnline } from '../utils/offlineManager';

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
  const [showHandsFree, setShowHandsFree] = useState(false);
  const [showPersonalizedCompanion, setShowPersonalizedCompanion] = useState(false);
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
  const abortControllerRef = useRef(null);
  const lastMessageTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const proactiveIntervalRef = useRef(null);
  const lastProactiveCheckRef = useRef(Date.now());
  const sessionStartTimeRef = useRef(Date.now());
  // Refs to hold latest state for the unmount cleanup callback
  const conversationHistoryRef = useRef([]);
  const detectedEraRef = useRef('present');
  const conversationTopicsRef = useRef([]);
  const sessionStartRef = useRef(Date.now());
  const messagesRef = useRef([]);
  const peakAnxietyRef = useRef(0);
  const sessionEraRef = useRef('present');

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['safeZones'] });
    await queryClient.refetchQueries({ queryKey: ['memories'] });
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const { data: safeZones = [], error: _safeZonesError } = useQuery({
    queryKey: ['safeZones'],
    queryFn: async () => {
      try {
        return await offlineEntities.list('SafeMemoryZone');
      } catch (error) {
        console.error('Safe zones fetch failed:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const { data: memories = [], error: _memoriesError } = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      try {
        return await offlineEntities.list('Memory', '-created_date', 50);
      } catch (error) {
        console.error('Memories fetch failed:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const { data: userProfile, error: _profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const profiles = await offlineEntities.list('UserProfile');
        return profiles?.[0] || null;
      } catch (error) {
        console.error('Profile fetch failed:', error);
        return null;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 10,
  });

  const { data: cognitiveAssessments = [], error: _assessmentsError } = useQuery({
    queryKey: ['cognitiveAssessments'],
    queryFn: async () => {
      try {
        return await offlineEntities.list('CognitiveAssessment', '-assessment_date', 1);
      } catch (error) {
        console.error('Assessments fetch failed:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 15,
  });

  const speakResponse = useCallback(async (text, emotionalContext = {}) => {
    if (!text || !isMountedRef.current) return;
    
    try {
      // Use advanced voice synthesis from voiceUtils
      speakWithRealisticVoice(text, {
        emotionalState: emotionalContext.state || 'neutral',
        anxietyLevel: emotionalContext.anxietyLevel || 0,
        cognitiveLevel: cognitiveLevel,
        language: selectedLanguage,
        userProfile: userProfile,
        onEnd: () => {
          if (emotionalContext.onEnd) {
            emotionalContext.onEnd();
          }
        }
      });
    } catch (error) {
      console.error('Voice synthesis error:', error);
      
      // Ultimate fallback - basic speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        if (emotionalContext.onEnd) {
          emotionalContext.onEnd();
        }
      };
      
      utterance.onerror = () => {
        if (emotionalContext.onEnd) {
          emotionalContext.onEnd();
        }
      };
      
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedLanguage, cognitiveLevel, userProfile]);

  const translateText = useCallback(async (text, targetLang, sourceLang = null) => {
    if (!text || !targetLang) return text;
    if (targetLang === 'en' && !sourceLang) return text;
    
    try {
      const result = await offlineFunction('translateText', {
        text: String(text).substring(0, 5000), // Limit length
        targetLanguage: targetLang,
        sourceLanguage: sourceLang
      });
      return result?.data?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original on error
    }
  }, []);

  const sendProactiveMessage = useCallback(async (type = 'checkin') => {
    if (!isMountedRef.current || isLoading) return;
    
    lastProactiveCheckRef.current = Date.now();
    
    try {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      
      // Memory-jogging prompts using actual stored data
      const memoryPrompts = memories.length > 0 
        ? memories.slice(0, 5).map(m => `I remember you shared "${m.title}". Would you like to talk about that?`)
        : [];
      
      const photoPrompts = memories.filter(m => m.photo_url).length > 0
        ? [`I notice we have some photos. Would you like to look at them together?`]
        : [];
      
      // Time-based greetings
      const timeBasedGreetings = {
        morning: [
          "Good morning! How did you sleep last night?",
          "Morning! What would you like to do today?",
          "Good morning! Let's start the day with something pleasant."
        ],
        afternoon: [
          "Good afternoon! How has your day been so far?",
          "Hello! It's a lovely afternoon. How are you feeling?",
          "Afternoon! Would you like some music or a story?"
        ],
        evening: [
          "Good evening! How was your day today?",
          "Evening! Let's relax together. What sounds nice?",
          "Hello! It's a peaceful evening. How are you feeling?"
        ]
      };
      
      // Mood-based check-ins with memory prompts
      const moodCheckIns = [
        "How are you feeling right now? I'm here to listen.",
        "Is there anything on your mind you'd like to talk about?",
        "I'm here with you. Would you like to share how you're feeling?",
        ...memoryPrompts,
        ...photoPrompts
      ];
      
      // Routine/reminder prompts
      const routinePrompts = [];
      if (hour === 9) routinePrompts.push("Good morning! Time for breakfast. Have you eaten yet?");
      if (hour === 12) routinePrompts.push("It's lunchtime! Would you like me to remind someone?");
      if (hour === 15) routinePrompts.push("Afternoon time! How about a walk or some fresh air?");
      if (hour === 18) routinePrompts.push("Dinner time approaching. Are you feeling hungry?");
      if (hour === 20) routinePrompts.push("Evening time. Would you like to listen to some music before bed?");
      
      let messages = [];
      if (type === 'greeting') {
        messages = timeBasedGreetings[timeOfDay];
      } else if (type === 'routine' && routinePrompts.length > 0) {
        messages = routinePrompts;
      } else {
        messages = moodCheckIns;
      }
      
      let message = messages[Math.floor(Math.random() * messages.length)];
      
      // Translate to user's language
      if (selectedLanguage !== 'en') {
        try {
          message = await translateText(message, selectedLanguage, 'en');
        } catch (error) {
          console.error('Translation failed for proactive message:', error);
        }
      }
      
      if (isMountedRef.current) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: message, 
          hasVoice: true, 
          language: selectedLanguage,
          isProactive: true
        }]);
        
        setConversationHistory(prev => [...prev, { 
          role: 'assistant', 
          content: message 
        }]);
        
        // Speak the proactive message BUT DO NOT auto-start listening for proactive check-ins
        // Only auto-listen after conversational replies (handled elsewhere)
        speakResponse(message, { 
          state: 'warm', 
          anxietyLevel: 0
        });
        
        // Log proactive interaction
        offlineEntities.create('ActivityLog', {
          activity_type: 'chat',
          details: { 
            proactive: true, 
            type: type,
            language: selectedLanguage 
          }
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Proactive message error:', error);
    }
  }, [isLoading, selectedLanguage, speakResponse, translateText]);

  const startProactiveCheckIns = useCallback(() => {
    if (proactiveIntervalRef.current) {
      clearInterval(proactiveIntervalRef.current);
    }
    
    // Random interval between 5-10 minutes
    const getRandomInterval = () => {
      return (5 + Math.random() * 5) * 60 * 1000; // 5-10 minutes in milliseconds
    };
    
    // Check for routine prompts every hour
    const checkRoutinePrompts = () => {
      const hour = new Date().getHours();
      const routineTimes = [9, 12, 15, 18, 20]; // Meal times and activities
      
      if (routineTimes.includes(hour)) {
        const timeSinceLastMessage = Date.now() - lastMessageTimeRef.current;
        if (timeSinceLastMessage > 30 * 60 * 1000) { // 30 min since last interaction
          sendProactiveMessage('routine');
        }
      }
    };
    
    const scheduleNextCheckIn = () => {
      const interval = getRandomInterval();
      
      proactiveIntervalRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          // FIXED: Only send if NO conversation is happening (last 10 minutes)
          const timeSinceLastMessage = Date.now() - lastMessageTimeRef.current;
          const timeSinceLastProactive = Date.now() - lastProactiveCheckRef.current;
          
          // Only trigger proactive check-in if there's been no activity for 10+ minutes
          if (timeSinceLastMessage > 10 * 60 * 1000 && timeSinceLastProactive > 10 * 60 * 1000) {
            // Mood-aware check-ins
            const anxietyLevelCheck = anxietyState.level;
            if (anxietyLevelCheck >= 5) {
              sendProactiveMessage('comfort');
            } else {
              sendProactiveMessage('checkin');
            }
          }
          
          // Check routine prompts
          checkRoutinePrompts();
          
          // Schedule next check-in
          scheduleNextCheckIn();
        }
      }, interval);
    };
    
    scheduleNextCheckIn();
  }, [sendProactiveMessage, anxietyState]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Track patient session on mount
    const sessionData = sessionStorage.getItem('patientSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.patientId) {
          base44.functions.invoke('trackPatientSession', {
            patient_id: session.patientId,
            session_type: 'chat_started'
          }).catch(() => {});
        }
      } catch {}
    }
    
    // Initial greeting after 1 second - also SPEAK it
    const greetingTimeout = setTimeout(() => {
      if (isMountedRef.current && messages.length === 0) {
        sendProactiveMessage('greeting');
      }
    }, 1000);
    
    // Start proactive check-ins (every 5-10 minutes)
    startProactiveCheckIns();
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(greetingTimeout);
      
      // Stop proactive check-ins
      if (proactiveIntervalRef.current) {
        clearInterval(proactiveIntervalRef.current);
      }
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Stop any active speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      // Persist completed session to Chat History (Conversation entity)
      const history = conversationHistoryRef.current;
      const userMessages = history.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        const durationMs = Date.now() - sessionStartTimeRef.current;
        const durationMinutes = durationMs / 60000;
        base44.entities.Conversation.create({
          started_at: new Date(sessionStartTimeRef.current).toISOString(),
          message_count: history.length,
          messages: JSON.stringify(history),
          era: detectedEraRef.current || 'present',
          topics: conversationTopicsRef.current.slice(0, 10),
          duration_minutes: Math.round(durationMinutes * 10) / 10,
        }).catch(() => {});
      }
      // Save conversation session if there were meaningful messages
      const finalMessages = messagesRef.current;
      const userMsgCount = finalMessages.filter(m => m.role === 'user').length;
      if (userMsgCount >= 1) {
        const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
        base44.entities.Conversation.create({
          mode: 'chat',
          detected_era: sessionEraRef.current,
          messages: finalMessages.map(m => ({ role: m.role, content: m.content })),
          message_count: finalMessages.length,
          duration_minutes: durationMinutes,
          peak_anxiety_level: peakAnxietyRef.current,
          session_date: new Date().toISOString()
        }).catch(() => {});
      }
    };
  }, [sendProactiveMessage, startProactiveCheckIns]);

  // Keep refs in sync with latest state so the unmount cleanup can read fresh values
  useEffect(() => { conversationHistoryRef.current = conversationHistory; }, [conversationHistory]);
  useEffect(() => { detectedEraRef.current = detectedEra; }, [detectedEra]);
  useEffect(() => { conversationTopicsRef.current = conversationTopics; }, [conversationTopics]);

  useEffect(() => {
    if (cognitiveAssessments?.length > 0 && cognitiveAssessments[0]?.cognitive_level) {
      setCognitiveLevel(cognitiveAssessments[0].cognitive_level);
      setLastAssessment(cognitiveAssessments[0]);
    }
  }, [cognitiveAssessments]);

  // Keep messagesRef in sync so it can be read inside the cleanup function
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Track peak anxiety level
  useEffect(() => {
    if (anxietyState.level > peakAnxietyRef.current) {
      peakAnxietyRef.current = anxietyState.level;
    }
  }, [anxietyState.level]);

  // Track current era
  useEffect(() => {
    sessionEraRef.current = selectedEra === 'auto' ? detectedEra : selectedEra;
  }, [selectedEra, detectedEra]);

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

    return `You are Memory Mirror, a compassionate AI companion for people with dementia. CRITICAL: Follow dementia care best practices and validation therapy principles.

**VALIDATION THERAPY (GOLD STANDARD):**
- NEVER correct the user or tell them they are wrong
- Meet them where they are emotionally
- If they say something confused or incorrect, gently go along with their reality
- If they seem confused, gently redirect with warmth - never confront or correct

**SPEAKING STYLE (CRITICAL FOR DEMENTIA CARE):**
- Speak slowly and use very simple words
- Never use complicated sentences
- Short sentences only - one idea at a time
- Warm and familiar in tone - like an old friend
- Slow and calm - NOT rushed
- If the user repeats themselves, respond as if hearing it for the first time
- Repeat things gently if needed without making them feel embarrassed
- Always sound warm, patient and calm

**CONVERSATION PACING:**
- Keep responses VERY SHORT (1-2 sentences maximum)
- Start with natural acknowledgments: "I see...", "Mmhm...", "Oh...", "I understand..."
- Use simple, natural fillers: "Well...", "You know..."
- Ask one simple question, then STOP and listen
- NEVER rush the user or fill silences too quickly - dementia patients take longer to find their words
- Let them finish completely - interrupting would be distressing
- Use contractions: "I'm", "you're", "that's"

**CONVERSATION PRINCIPLES:**
1. NEVER correct or reality-orient. Meet them where they are mentally.
2. ${eraInstructions}${eraSpecificContext[selectedEra] || ''}
3. Use warm, simple language - like talking to a dear friend
4. When confusion detected, gently redirect to positive familiar topics
5. Validate emotions naturally: "I understand how you feel"
6. Keep it conversational - no formal language${profileContext}${safeZoneContext}${memoryContext}

**COGNITIVE ADAPTATION (${cognitiveLevel}):**
- Complexity: ${adaptation.complexity}
- Pacing: ${adaptation.speed}
- Memory: ${adaptation.memory}

${lastAssessment?.recommended_adaptations?.length > 0 ? `\nADAPTATIONS:\n${lastAssessment.recommended_adaptations.map(a => `- ${a}`).join('\n')}` : ''}

CRITICAL RULES:
- Start with acknowledgment: "I see...", "Mmhm...", "I understand..."
- Keep it to 1-2 sentences max unless they ask for detail
- Use natural filler words to sound human
- Wait for them - NEVER rush or interrupt
- Ask simple questions to keep conversation flowing

After your response, add META: {"era": "1940s|1960s|1980s|present", "anxiety": 0-10, "suggestedMemory": "memory title or null"}`;
  };

  useEffect(() => {
    if (chatContainerRef.current && isMountedRef.current) {
      try {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } catch (error) {
        console.error('Scroll error:', error);
      }
    }
  }, [messages]);

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    try {
      localStorage.setItem('memoryMirrorLanguage', languageCode);
    } catch {}
  };

  const sendMessage = useCallback(async (transcribedText) => {
    // Validation
    if (!transcribedText || typeof transcribedText !== 'string') {
      console.error('Invalid message input:', transcribedText);
      toast.error('Could not process your message');
      return;
    }

    const userMessage = transcribedText.trim();
    if (!userMessage) {
      toast.error('Please say something');
      return;
    }
    
    if (isLoading) {
      toast.info('Still processing. Please wait...');
      return;
    }
    
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping message');
      return;
    }
    
    console.log('Processing message:', userMessage);

    // Rate limiting: prevent spam (max 1 message per 2 seconds)
    const now = Date.now();
    if (now - lastMessageTimeRef.current < 2000) {
      toast.error('Please wait a moment before sending another message');
      return;
    }
    lastMessageTimeRef.current = now;

    // Length validation
    if (userMessage.length > 1000) {
      toast.error('Message is too long. Please keep it under 1000 characters.');
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
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
        
        // Also create team notification for collaborative care
        try {
          const profiles = await offlineEntities.list('UserProfile');
          const patientProfile = profiles?.[0];
          if (patientProfile?.id) {
            await offlineEntities.create('CaregiverNotification', {
              patient_profile_id: patientProfile.id,
              notification_type: 'high_anxiety',
              severity: 'urgent',
              title: '⚠️ High Anxiety Detected',
              message: `Patient is experiencing high anxiety (level ${sentimentAnalysis.anxiety_level}/10)`,
              data: {
                anxiety_level: sentimentAnalysis.anxiety_level,
                trigger_words: sentimentAnalysis.trigger_words || [],
                emotional_tone: sentimentAnalysis.emotional_tone || [],
                user_message: userMessage.substring(0, 200)
              },
              triggered_by: 'AI_sentiment_analysis'
            });
          }
        } catch (err) {
          console.log('Team notification skipped:', err.message);
        }
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
          reasoning: relevantMedia.data.reasoning,
          suggestedMention: relevantMedia.data.suggested_mention
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
      speakResponse(calmingMessage, { state: 'soothing', anxietyLevel });
      
      // Suggest phone mode for high anxiety
      setAnxietyState({ level: anxietyLevel, suggestedMode: 'phone' });
      setShowAnxietyAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Generating AI response for:', userMessageEnglish.substring(0, 50));
      
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

      // Add recent memories for context-aware responses
      const recentMemoriesContext = memories.length > 0
        ? `\n\nRECENT MEMORIES AVAILABLE (mention naturally when relevant):
${memories.slice(0, 5).map(m => `- "${m.title}" (${m.era})`).join('\n')}`
        : '';

      // Get AI response (offline-aware)
      const fullPrompt = `${getSystemPrompt()}${emotionalContext}${memoryContext}${recentMemoriesContext}

Conversation so far:
${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

RESPOND LIKE YOU'RE ON THE PHONE - natural, brief, conversational. ${memoryRecall?.should_proactively_mention ? 'Naturally weave in the suggested memory.' : ''}
MAXIMUM 1-2 SENTENCES. Start with acknowledgment filler ("I see...", "Mmhm..."). Sound completely human. Never interrupt or rush them.`;

      console.log('Calling AI chat...');
      let response = await offlineAIChat(fullPrompt, {
        add_context_from_internet: false
      });

      console.log('AI response received:', response);

      let assistantMessage = typeof response === 'string' ? response : response?.text || response;
      
      if (!assistantMessage) {
        throw new Error('Empty response from AI');
      }
      
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
        } catch {
          console.log('META parse skip (non-critical)');
        }
      }
      
      // Ensure we have a valid message
      if (!assistantMessage || assistantMessage.length === 0) {
        throw new Error('AI returned empty message');
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

      // Persist conversation snapshot every 10 messages (offline-aware)
      if (conversationHistory.length % 10 === 0 && conversationHistory.length > 0) {
        offlineEntities.create('Conversation', {
          mode: 'chat',
          detected_era: detectedEra || selectedEra,
          messages: conversationHistory.slice(-20),
          message_count: conversationHistory.length
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

      // Ensure component is still mounted and message is valid
      if (isMountedRef.current && assistantMessage) {
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, hasVoice: true, language: selectedLanguage }]);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        console.log('Message added to chat');
      }

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
      
      // Determine emotional state for voice adaptation with nuanced transitions
      const emotionalState = detectedAnxiety >= 8 ? 'soothing' :
                           detectedAnxiety >= 7 ? 'reassuring' :
                           detectedAnxiety >= 5 ? 'calm' :
                           detectedAnxiety >= 3 ? 'warm' :
                           detectedAnxiety <= 2 ? 'upbeat' : 'neutral';
      
      // Speak the response with proper voice synthesis
      if (assistantMessage && isMountedRef.current) {
        console.log('🔊 Speaking response with state:', emotionalState);
        speakResponse(assistantMessage, { 
          state: emotionalState,
          anxietyLevel: detectedAnxiety,
          onEnd: () => {
            // Auto-start listening after speaking for natural conversation flow
            if (isMountedRef.current && !isLoading) {
              console.log('🎤 Your turn - listening...');
              setTimeout(() => startVoiceInput(), 600);
            }
          }
        });
      }

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
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping error handling');
        return;
      }
      
      console.error('Chat error details:', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        isOnline: isOnline()
      });
      
      // Exponential backoff retry logic (but not for user input errors)
      if (retryCountRef.current < 3 && error.name !== 'AbortError' && error.message.indexOf('Empty') === -1) {
        retryCountRef.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000);
        toast.error(`Retrying in ${delay/1000}s...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            sendMessage(userMessage);
          }
        }, delay);
        return;
      }
      
      retryCountRef.current = 0;
      
      // User-friendly error messages
      let fallback = "I'm right here with you. ";
      if (error.name === 'AbortError') {
        fallback += "The request was cancelled. Let's try again.";
      } else if (!isOnline()) {
        fallback += "I'm in offline mode, so my responses may be limited, but I'm still listening.";
      } else {
        fallback += "I need a moment. Let's try that again.";
      }
      
      // Ensure fallback is not empty
      if (!fallback || fallback.trim().length === 0) {
        fallback = "I'm here to listen. What's on your mind?";
      }
      
      // Translate fallback message
      try {
        if (selectedLanguage !== 'en') {
          fallback = await translateText(fallback, selectedLanguage, 'en');
        }
      } catch (translateError) {
        console.log('Translation failed, using fallback', translateError.message);
      }
      
      if (isMountedRef.current && fallback) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: fallback,
          hasVoice: true,
          language: selectedLanguage,
          isError: true
        }]);
        speakResponse(fallback);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [isLoading, selectedLanguage, conversationHistory, selectedEra, detectedEra, conversationTopics, cognitiveLevel, lastAssessment, userProfile, safeZones, memories, speakResponse, translateText, onEraChange, queryClient]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      // CRITICAL FIX #3: Request microphone with proper settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false,     // Disabled to preserve soft speech
          autoGainControl: true,       // Boosts quiet voices
          channelCount: 1,
          sampleRate: 16000            // Standard for speech recognition
        }
      });
      
      console.log('✅ Microphone access granted with MAXIMUM sensitivity for soft voice detection');
      
      // Close the stream - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('Please allow microphone access in your browser settings to use voice input.');
      return false;
    }
  }, []);

  const startVoiceInput = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log('Cannot start voice: component not mounted');
      return;
    }
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input requires Chrome, Edge, Safari, or Firefox. Please use one of these browsers.');
      return;
    }

    try {
      // Stop any existing recognition gracefully
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Cleanup error (safe):', e.message);
        }
      }

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      // Create new recognition instance
      recognitionRef.current = new SpeechRecognition();
      
      // Configure for natural conversation - let user finish their thought
      recognitionRef.current.continuous = true;           // Keep listening for complete thoughts
      recognitionRef.current.interimResults = true;       // Show what they're saying
      recognitionRef.current.maxAlternatives = 3;         // Better detection
      
      // CRITICAL: Browser-specific optimizations for soft voice detection
      if (recognitionRef.current.audioTrack !== undefined) {
        // Enable audio processing for quieter speech
        recognitionRef.current.audioTrack = true;
      }
      
      // Language mapping
      const langMap = {
        en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
        pt: 'pt-PT', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA',
        hi: 'hi-IN', ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR',
        vi: 'vi-VN', th: 'th-TH', sv: 'sv-SE', no: 'nb-NO', da: 'da-DK'
      };
      
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
      
      const _speechEndTimeoutRef = { current: null };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started - Listening patiently for full thought');
        if (isMountedRef.current) {
          setIsListening(true);
          // Subtle toast - don't interrupt their flow
          toast.success('Listening...');
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          // Get only the LATEST result to avoid duplicates
          const lastResultIndex = event.results.length - 1;
          const lastResult = event.results[lastResultIndex];
          const transcript = lastResult[0].transcript;
          
          console.log('📝 Captured:', transcript, '| Final:', lastResult.isFinal);
          
          // Wait for user to fully finish their thought
          if (lastResult.isFinal) {
            const finalSpeech = transcript.trim();
            
            if (finalSpeech.length > 0 && isMountedRef.current) {
              console.log('✅ User finished thought:', finalSpeech);
              
              // CRITICAL: Don't interrupt - wait a moment to ensure they're done
              // This gives them time to add more without being cut off
              if (_speechEndTimeoutRef.current) {
                clearTimeout(_speechEndTimeoutRef.current);
              }
              
              _speechEndTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  // Stop listening
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      console.log('Stop error (safe):', e.message);
                    }
                  }
                  
                  setIsListening(false);
                  
                  // Natural pause before responding (like human conversation)
                  setTimeout(() => sendMessage(finalSpeech), 300);
                }
              }, 1200); // Wait 1.2 seconds of silence to ensure they're truly done
            }
          }
        } catch (error) {
          console.error('Recognition result error:', error);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (!isMountedRef.current) return;
        
        setIsListening(false);
        
        const errorMessages = {
          'no-speech': "😶 No speech detected. Please speak clearly and try again.",
          'audio-capture': '🎤 Microphone not working. Check device settings.',
          'not-allowed': '🔒 Microphone permission required. Check browser settings.',
          'network': '🌐 Network error. Check your connection.',
          'aborted': 'Voice input cancelled.',
          'service-not-allowed': '🔒 Voice service disabled. Check privacy settings.',
          'bad-grammar': '❌ Speech not recognized. Try a shorter phrase.',
          'unknown': '⚠️ Unexpected error. Please try again.'
        };
        
        const message = errorMessages[event.error] || errorMessages.unknown;
        console.error('Showing error:', message);
        toast.error(message);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        if (isMountedRef.current) {
          setIsListening(false);
        }
      };
      
      // Start listening
      recognitionRef.current.start();
      console.log('Voice input started for language:', langMap[selectedLanguage]);
    } catch (error) {
      console.error('Error starting voice input:', error);
      if (isMountedRef.current) {
        setIsListening(false);
        toast.error(`Voice error: ${error.message || 'Please try again'}`);
      }
    }
  }, [isLoading, selectedLanguage, sendMessage, requestMicrophonePermission]);
  
  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current && isMountedRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const handleEraChange = useCallback((era) => {
    if (!era || !isMountedRef.current) return;
    
    try {
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
      retryCountRef.current = 0;
    } catch (error) {
      console.error('Era change error:', error);
    }
  }, []);

  const handleMemorySelect = useCallback(async (type, item) => {
    if (!item || !type || !isMountedRef.current) return;
    
    try {
      setSmartRecall({ show: false, photos: [], memories: [], reasoning: null, suggestedMention: null });
      
      // Use AI-generated prompt if available, otherwise create a basic one
      let description = '';
      if (item.ai_prompt) {
        description = item.ai_prompt;
      } else if (type === 'photo' && item.title) {
        description = `Tell me about this photo: "${item.title}". ${item.caption || ''}`;
      } else if (item.title) {
        description = `I'd like to talk about: "${item.title}". ${item.description?.substring(0, 100) || ''}`;
      }
      
      if (description) {
        await sendMessage(description);
      }
    } catch (error) {
      console.error('Memory select error:', error);
      toast.error('Failed to load memory. Please try again.');
    }
  }, [sendMessage]);



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

      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="grid grid-cols-6 gap-2 mb-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowPersonalizedCompanion(true)}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-all"
          >
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <span className="text-xs font-semibold text-center leading-tight">Personal Care</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onMemoryGalleryOpen && onMemoryGalleryOpen()}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
          >
            <BookHeart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold">Memories</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowMusic(!showMusic)}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
          >
            <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold">Music</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowStory(!showStory)}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
          >
            <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold">Stories</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowGames(true)}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all"
          >
            <Gamepad2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold">Games</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowHandsFree(!showHandsFree)}
            className="flex flex-col items-center justify-center gap-1 h-20 border-2 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
          >
            <Headphones className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold text-center leading-tight">Hands-Free</span>
          </Button>
        </div>

        {showHandsFree && (
          <div className="mt-4 animate-fade-in-up">
            <HandsFreeMode
              onMessage={(message) => {
                console.log('📨 Hands-free user message:', message);
                setMessages(prev => [...prev, { role: 'user', content: message, language: selectedLanguage }]);
              }}
              onAIResponse={(response) => {
                console.log('🤖 Hands-free AI response:', response);
                setMessages(prev => [...prev, { role: 'assistant', content: response, hasVoice: true, language: selectedLanguage }]);
                setConversationHistory(prev => {
                  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
                  return [...prev, 
                    { role: 'user', content: lastUserMsg },
                    { role: 'assistant', content: response }
                  ];
                });
              }}
              selectedLanguage={selectedLanguage}
              systemPrompt={getSystemPrompt()}
              conversationHistory={conversationHistory}
              cognitiveLevel={cognitiveLevel}
              userProfile={userProfile}
            />
          </div>
        )}
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
          reasoning={smartRecall.reasoning}
          suggestedMention={smartRecall.suggestedMention}
          onClose={() => setSmartRecall({ show: false, photos: [], memories: [], reasoning: null, suggestedMention: null })}
          onSelect={handleMemorySelect}
        />
      )}

      {visualResponse.show && (
        <VisualResponse
          suggestions={visualResponse.suggestions}
          onClose={() => setVisualResponse({ show: false, suggestions: [] })}
        />
      )}

      {showPersonalizedCompanion && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
            <Button
              variant="ghost"
              onClick={() => setShowPersonalizedCompanion(false)}
              className="mb-2"
            >
              ← Back to Chat
            </Button>
            <h2 className="text-xl font-bold">Personalized Companionship</h2>
          </div>
          <PersonalizedCompanion
            currentAnxiety={anxietyState.level}
            emotionalState={anxietyState.level >= 7 ? 'anxious' : anxietyState.level >= 4 ? 'neutral' : 'calm'}
            onStartConversation={async (payload) => {
              setShowPersonalizedCompanion(false);
              if (payload.type === 'story' || payload.type === 'poem') {
                setMessages(prev => [...prev, { 
                  role: 'assistant', 
                  content: `${payload.content.title}\n\n${payload.content.content}`,
                  hasVoice: true,
                  language: selectedLanguage
                }]);
                speakResponse(payload.content.content);
              } else if (payload.text) {
                await sendMessage(payload.text);
              } else if (payload.starter) {
                await sendMessage(payload.starter);
              }
            }}
          />
        </div>
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
            userProfile={userProfile}
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
              key={`msg-${idx}-${msg.content?.substring(0, 20)}`}
              message={msg.content || ''}
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