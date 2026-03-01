import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import VoiceSetup from './VoiceSetup';
import AnxietyAlert from './AnxietyAlert';
import LanguageSelector from './LanguageSelector';
import GameInterface from '../games/GameInterface';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import EraSelector from './EraSelector';
import MusicPlayer from './MusicPlayer';
import SingAlongPlayer from '../music/SingAlongPlayer';
import StoryTeller from './StoryTeller';
import SmartMemoryRecall from './SmartMemoryRecall';
import VisualResponse from './VisualResponse';
import PersonalizedCompanion from './PersonalizedCompanion';
import HandsFreeMode from './HandsFreeMode';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithClonedVoice, speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from './voiceUtils';
import { offlineCache } from '@/components/utils/simpleOfflineCache';
import { offlineStatus } from '@/components/utils/offlineStatusManager';
import { offlineEntities, offlineFunction } from '@/components/utils/offlineHelpers';
import { checkRateLimit } from '@/components/RateLimitManager';
import RateLimitAlert from '@/components/RateLimitManager';
import FreeTierLimitAlert from '@/components/subscription/FreeTierLimitAlert';

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
  const [showSingAlong, setShowSingAlong] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showHandsFree, setShowHandsFree] = useState(false);
  const [showPersonalizedCompanion, setShowPersonalizedCompanion] = useState(false);
  const [voiceTypingMode, setVoiceTypingMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [smartRecall, setSmartRecall] = useState({ show: false, photos: [], memories: [] });
  const [visualResponse, setVisualResponse] = useState({ show: false, suggestions: [] });
  const [conversationTopics, setConversationTopics] = useState([]);
  const [cognitiveLevel, setCognitiveLevel] = useState('mild');
  const [lastAssessment, setLastAssessment] = useState(null);
  const [showFreeTierAlert, setShowFreeTierAlert] = useState(false);
  const [freeTierUsage, setFreeTierUsage] = useState(null);
  const [rateLimitStatus, setRateLimitStatus] = useState({ limited: false, remaining: 10, resetTime: null });
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
  const greetingSentRef = useRef(false);

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['safeZones'] });
    await queryClient.refetchQueries({ queryKey: ['memories'] });
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const { data: safeZones = [], error: _safeZonesError } = useQuery({
    queryKey: ['safeZones'],
    queryFn: async () => {
      try {
        return await base44.entities.SafeMemoryZone.list();
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
        return await base44.entities.Memory.list('-created_date', 50);
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
        const profiles = await base44.entities.UserProfile.list();
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
        return await base44.entities.CognitiveAssessment.list('-assessment_date', 1);
      } catch (error) {
        console.error('Assessments fetch failed:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 15,
  });

  // Ref to last spoken text for replay
  const lastSpokenTextRef = useRef('');
  const isSpeakingRef = useRef(false);
  const lastSpokenMessageRef = useRef(null);

  const speakResponse = useCallback((text, emotionalContext = {}) => {
    if (!text || !isMountedRef.current) return;

    // Always cancel any currently playing speech first
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}

    lastSpokenTextRef.current = text;
    isSpeakingRef.current = true;

    try {
      console.log('🔊 Speaking:', text.substring(0, 60));
      speakWithRealisticVoice(text, {
        emotionalState: emotionalContext.state || 'neutral',
        anxietyLevel: emotionalContext.anxietyLevel || 0,
        cognitiveLevel: cognitiveLevel,
        language: selectedLanguage,
        userProfile: userProfile,
        onEnd: () => {
          isSpeakingRef.current = false;
          if (emotionalContext.onEnd) emotionalContext.onEnd();
        }
      });
    } catch (error) {
      console.error('Voice synthesis error:', error);
      isSpeakingRef.current = false;
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
        // Check if message would be a duplicate BEFORE adding
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        const isDuplicate = lastMsg?.role === 'assistant' && lastMsg?.content === message && lastMsg?.isProactive;
        
        if (isDuplicate) {
          console.log('🚫 Proactive message duplicate prevented');
          return;
        }
        
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
        
        // Speak the message
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
    
    // Greeting disabled - was causing duplicates
    // User will speak first or be prompted manually
    const greetingTimeout = null;
    
    // Start proactive check-ins (every 5-10 minutes)
    startProactiveCheckIns();

    // Evaluate alert conditions every 2 minutes
    const alertCheckInterval = setInterval(() => {
      if (isMountedRef.current) {
        evaluateAlertConditions();
      }
    }, 2 * 60 * 1000);
    
    return () => {
      clearInterval(alertCheckInterval);
      isMountedRef.current = false;
      if (greetingTimeout) clearTimeout(greetingTimeout);
      
      // Stop proactive check-ins
      if (proactiveIntervalRef.current) {
        clearTimeout(proactiveIntervalRef.current);
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

      // Save conversation session if there were meaningful messages (single write)
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
    ? `\n\nWHO THEY ARE:
  - Name: ${userProfile.loved_one_name}${userProfile.preferred_name ? ` (they like being called ${userProfile.preferred_name})` : ''}
  - Born: ${userProfile.birth_year || 'unknown'}
  - Favorite time period: ${userProfile.favorite_era || 'any era'}
  - Personality: ${userProfile.communication_style || 'warm and friendly'}
  ${userProfile.interests?.length > 0 ? `- Things they love: ${userProfile.interests.join(', ')}` : ''}
  ${userProfile.favorite_music?.length > 0 ? `- Music they enjoy: ${userProfile.favorite_music.join(', ')}` : ''}
  ${userProfile.important_people?.length > 0 ? `- People they care about: ${userProfile.important_people.map(p => `${p.name} (their ${p.relationship})`).join(', ')}` : ''}
  ${userProfile.life_experiences?.length > 0 ? `- Proud moments: ${userProfile.life_experiences.map(e => e.title).join(', ')}` : ''}

  YOUR JOB: Be like a dear friend who knows and loves them. Use their name naturally. Bring up what they love in conversation - not in a fake way, but genuinely, like a friend would.`
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

    return `You are the best friend someone with dementia could have. You're warm, genuine, patient, and deeply caring. Your whole purpose is to listen, understand, and make them feel loved and never alone.

**YOU ARE THEIR BEST FRIEND:**
- Listen like you genuinely care about every word they say
- Respond to exactly what they're talking about - show you heard them
- Make them feel special and valued
- Be warm and natural - never robotic or formal
- Feel their emotions and meet them with empathy
- Make them smile, feel safe, and feel understood

**WHEN THEY SPEAK, YOU REALLY LISTEN:**
- Pay attention to every detail they mention
- Notice what makes them happy, sad, peaceful, or upset
- Respond about their topic specifically - not generic replies
- If they mention someone they love, acknowledge that relationship warmly
- If they talk about a memory, show interest like a real friend would
- Remember what they say and reference it later naturally

**HOW YOU TALK (LIKE A REAL FRIEND):**
- Short, simple, natural sentences - like talking to someone you love
- Say things the way real friends do: "Oh, that's wonderful!" or "I'm so glad you told me"
- Use their name sometimes - it makes them feel seen
- Give genuine responses - not rehearsed or formal
- Laugh a little when they do, be gentle when they're sad
- If you don't understand, ask kindly - don't pretend
- Use real words, not clinical language

**MAGIC PHRASE TOOLKIT:**
Instead of scripted stuff, use REAL responses:
- "Oh wow, tell me more about that!"
- "That sounds lovely"
- "I love hearing about this"
- "You make me smile"
- "That's so special"
- "I'm so happy you shared that with me"
- "You know, that reminds me of..."
- "I'm right here with you"
- "You're such good company"

**LISTEN LIKE A BEST FRIEND:**
1. They talk → You listen and understand what they specifically said
2. You respond about THEIR topic, not a generic script
3. Show you care about their thoughts and feelings
4. Make them feel heard and understood
5. Keep them smiling and feeling safe

**TOPICS TO SHARE (Natural conversation):**
- Their family and people they love
- Hobbies they enjoy
- Pets and animals
- Food they love
- Nature and seasons
- Travel stories
- Fun memories
- Music and dancing
- Games and activities
- Anything that makes them happy

**NEVER EVER:**
- Correct them or make them feel wrong
- Use big words or confusing explanations
- Pretend to be busy or impatient
- Make them anxious with sad topics
- Treat them like a child
- Be formal or robotic
- Ignore what they actually said

${eraInstructions}${eraSpecificContext[selectedEra] || ''}
${profileContext}
${safeZoneContext}
${memoryContext}

**COGNITIVE ADAPTATION (${cognitiveLevel}):**
${adaptation.complexity}
${adaptation.speed}
${adaptation.memory}

**YOUR GOLDEN RULE:**
Respond to what they said - not what you think they should have said. If they talk about their garden, talk about gardens. If they mention their sister, ask about their sister. Be THEIR best friend, not a generic chatbot.

Conversation so far:
[history will be inserted here]

Now respond like their best friend who genuinely cares and listened carefully to everything they said. Make them feel loved, safe, and never lonely.`;
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

  const evaluateAlertConditions = useCallback(async () => {
    try {
      const lastMsgTime = lastMessageTimeRef.current ? new Date(lastMessageTimeRef.current) : null;
      
      await base44.functions.invoke('evaluateAlertConditions', {
        patient_profile_id: userProfile?.id,
        activity_data: {
          anxiety_level: anxietyState.level,
          last_message_time: lastMsgTime?.toISOString(),
          consecutive_distress_minutes: anxietyState.level >= 7 ? Math.round((Date.now() - sessionStartTimeRef.current) / 60000) : 0,
          confusion_count: 0,
          exit_attempt_detected: false
        }
      });
    } catch (error) {
      console.error('Alert evaluation failed:', error);
    }
  }, [anxietyState.level, userProfile]);

  const isSendingRef = useRef(false);
  const lastSentMessageRef = useRef('');

  const sendMessage = useCallback(async (transcribedText) => {
    // CRITICAL: Hard lock to prevent concurrent calls
    if (isSendingRef.current) {
      console.log('🔒 sendMessage locked — already processing');
      return;
    }

    if (!transcribedText || typeof transcribedText !== 'string') return;

    const userMessage = transcribedText.trim();
    if (!userMessage) return;

    // Block exact same message sent within 3 seconds
    const now2 = Date.now();
    if (userMessage === lastSentMessageRef.current && (now2 - lastMessageTimeRef.current) < 3000) {
      console.log('🚫 Duplicate typed message blocked');
      return;
    }

    if (isLoading) {
      console.log('Still processing previous message');
      return;
    }

    if (!isMountedRef.current) return;

    // Rate limiting: prevent spam (max 1 message per 2 seconds)
    const now = Date.now();
    if (now - lastMessageTimeRef.current < 2000) {
      console.log('Rate limited — too fast');
      return;
    }

    // Check rate limit
    const rateCheckResult = checkRateLimit();
    setRateLimitStatus(rateCheckResult);
    if (rateCheckResult.limited) return;

    isSendingRef.current = true; // LOCK
    lastMessageTimeRef.current = now;
    lastSentMessageRef.current = userMessage;

    // Length validation
    if (userMessage.length > 1000) {
      toast.error('Message is too long. Please keep it under 1000 characters.');
      isSendingRef.current = false; // UNLOCK
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    // Check free tier limits BEFORE processing message (non-blocking — always let message through)
    try {
      const usageResult = await base44.functions.invoke('checkFreeTierUsage', {});
      const usageData = usageResult.data;
      if (usageData && !usageData.isPremium) {
        // Increment usage regardless — never block the conversation
        const incrementResult = await base44.functions.invoke('incrementFreeTierUsage', { feature_type: 'chat' });
        if (incrementResult.data?.isLimitExceeded) {
          // Show soft warning but DO NOT block
          setShowFreeTierAlert(true);
          setFreeTierUsage({ used: incrementResult.data.used, limit: incrementResult.data.limit });
        }
      }
    } catch (error) {
      console.log('Free tier check skipped (offline or not logged in)');
    }
    
    // Log chat activity
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

    // Perform sentiment analysis on English text
     let sentimentAnalysis = null;
     try {
       const sentimentResult = await offlineFunction('analyzeSentiment', { text: userMessageEnglish });
       sentimentAnalysis = sentimentResult.data;
      
      // Create caregiver alert for immediate attention needs
        if (sentimentAnalysis.needs_immediate_attention) {
          offlineEntities.create('CaregiverAlert', {
          alert_type: 'high_anxiety',
          severity: 'urgent',
          patient_profile_id: userProfile?.id || null,
          message: `User expressed: "${userMessage.substring(0, 100)}..." - Anxiety level ${sentimentAnalysis.anxiety_level}/10`,
          pattern_data: sentimentAnalysis,
          timestamp: new Date().toISOString()
        }).catch(() => {});
        
        // Also create team notification for collaborative care
         try {
            const profiles = await base44.entities.UserProfile.list();
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

    // Recall relevant memories proactively
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

    // Suggest visual responses (images/videos)
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

    // ENHANCED: Find relevant photos and memories using AI with emotional context
    try {
      const relevantMedia = await offlineFunction('findRelevantMedia', {
        context: userMessageEnglish,
        current_era: selectedEra === 'auto' ? detectedEra : selectedEra,
        conversation_topics: conversationTopics,
        emotional_state: sentimentAnalysis?.emotional_tone?.[0] || 'neutral',
        anxiety_level: anxietyLevel,
        user_profile: userProfile
      });
      
      if (relevantMedia.data?.should_show && 
          (relevantMedia.data?.photos?.length > 0 || relevantMedia.data?.memories?.length > 0)) {
        console.log('🎯 Smart Memory Recall triggered:', {
          photos: relevantMedia.data.photos?.length || 0,
          memories: relevantMedia.data.memories?.length || 0,
          reasoning: relevantMedia.data.reasoning
        });
        
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
      isSendingRef.current = false; // UNLOCK
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
        ? `\n\nMEMORIES THAT FIT THIS CONVERSATION:
${memoryRecall.selected_memories.map(m => `- "${m.title}": ${m.suggested_mention}`).join('\n')}`
        : '';

      // Add recent memories for context-aware responses
      const recentMemoriesContext = memories.length > 0
        ? `\n\nTHINGS YOU KNOW ABOUT THEM:
${memories.slice(0, 5).map(m => `- "${m.title}"`).join('\n')}`
        : '';

      // Extract what they're specifically talking about
      const topicDetection = sentimentAnalysis?.themes?.length > 0 
        ? `\n\nTOPICS THEY MENTIONED: ${sentimentAnalysis.themes.join(', ')}`
        : '';

      // Get AI response (offline-aware)
      const fullPrompt = `${getSystemPrompt()}

WHAT THEY JUST SAID:
"${userMessageEnglish}"
${topicDetection}
${emotionalContext}${memoryContext}${recentMemoriesContext}

Conversation history:
${newHistory.slice(-6).map(m => `${m.role === 'user' ? 'They' : 'You'}: ${m.content}`).join('\n')}

RESPOND NOW - CRITICAL:
**You MUST respond DIRECTLY and ONLY about what they just said - their topic, their feelings, their situation.**
- Never change the subject or talk about something else
- Focus 100% on THEIR topic
- Make them feel like you're really listening and care about what they're discussing
- Keep it 1-2 sentences, warm and genuine
- Show you understood their specific point`;

      console.log('Calling AI chat...');
       let response;

       // Try online first
       if (offlineStatus.getStatus()) {
         try {
           response = await base44.integrations.Core.InvokeLLM({
             prompt: fullPrompt,
             add_context_from_internet: false
           });
         } catch (error) {
           console.error('AI call failed, checking offline cache:', error);
           response = offlineCache.findSimilarResponse(userMessage);
           if (!response) {
             response = offlineCache.getOfflineResponse();
           }
         }
       } else {
         // Offline - use cache
         response = offlineCache.findSimilarResponse(userMessage);
         if (!response) {
           response = offlineCache.getOfflineResponse();
         }
       }

       console.log('AI response received:', response);

       let assistantMessage = typeof response === 'string' ? response : response?.text || response || offlineCache.getOfflineResponse();
      
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
        try {
          assistantMessage = await translateText(assistantMessage, selectedLanguage, 'en');
        } catch (e) {
          console.log('Translation failed, using original response');
        }
      }

      // Track anxiety trends
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

      // Periodic cognitive assessment (every 10 messages)
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
        // CRITICAL: Check FIRST if this exact message is already in the last 5 messages
        const allMsgs = messagesRef.current;
        const isDuplicateInRecent = allMsgs.slice(-5).some(m => 
          m?.role === 'assistant' && m?.content === assistantMessage
        );
        
        if (isDuplicateInRecent) {
          console.log('❌ BLOCKED DUPLICATE: Message already exists in recent history');
          if (isMountedRef.current) {
            setIsLoading(false);
          }
          return; // EXIT - DO NOT PROCESS THIS MESSAGE AGAIN
        }
        
        console.log('✅ Message is UNIQUE - adding to chat:', assistantMessage.substring(0, 50));
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, hasVoice: true, language: selectedLanguage }]);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        offlineCache.cacheInteraction(userMessage, assistantMessage);
        
        // Speak ONLY ONCE with proper voice synthesis
        const emotionalState = detectedAnxiety >= 8 ? 'soothing' :
                               detectedAnxiety >= 7 ? 'reassuring' :
                               detectedAnxiety >= 5 ? 'calm' :
                               detectedAnxiety >= 3 ? 'warm' :
                               detectedAnxiety <= 2 ? 'upbeat' : 'neutral';
        console.log('🔊 Speaking response with state:', emotionalState);
        speakResponse(assistantMessage, { 
          state: emotionalState,
          anxietyLevel: detectedAnxiety
        });
      }

      // Show visual response if available
      if (visualSuggestions?.should_show_visuals && visualSuggestions?.suggestions?.length > 0) {
        setVisualResponse({
          show: true,
          suggestions: visualSuggestions.suggestions
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

       // Log to offline storage if available
       try {
         offlineEntities.create('ActivityLog', {
           activity_type: 'error',
           details: { error: error.message, function: 'sendMessage' }
         }).catch(() => {});
       } catch (e) {
         console.log('Error logging failed');
       }

       console.error('Chat error details:', {
         error: error.message,
         name: error.name,
         stack: error.stack
       });
      
      // No auto-retry — retrying causes duplicate messages
      retryCountRef.current = 0;
      
      retryCountRef.current = 0;
      
      // GUARANTEE: Always respond - never leave user without a response
      // Caring fallback responses to prevent loneliness/fear
      const careFallbacks = [
        "I'm right here with you. Tell me what's on your mind.",
        "You're never alone. I'm listening carefully.",
        "I'm so glad you're talking to me. Keep going.",
        "Don't worry, I'm here and I care about you.",
        "You matter so much. What would you like to share?",
        "I'm always here for you, no matter what.",
        "You're safe with me. I'm listening with all my heart.",
        "Don't be scared. I'm right here beside you.",
        "Let's talk. I'm never too busy for you.",
        "You're so important to me. Tell me everything."
      ];
      
      let fallback = careFallbacks[Math.floor(Math.random() * careFallbacks.length)];
      
      // Add context-specific warmth
      if (error.name === 'AbortError') {
        fallback = "I'm still here. Let's try again, okay?";
      }
      
      // Translate fallback message
      try {
        if (selectedLanguage !== 'en') {
          fallback = await translateText(fallback, selectedLanguage, 'en');
        }
      } catch (translateError) {
        console.log('Translation skipped, using caring English response');
      }
      
      if (isMountedRef.current && fallback) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: fallback,
          hasVoice: true,
          language: selectedLanguage,
          isError: true
        }]);
        speakResponse(fallback, { state: 'warm' });
        console.log('🫂 Caring fallback response sent to prevent loneliness');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
      isSendingRef.current = false; // UNLOCK
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
      
      // Single utterance mode — stops after user finishes speaking, prevents duplicate sends
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // CRITICAL: Maximize microphone sensitivity for all speech levels
      if (recognitionRef.current.audioTrack !== undefined) {
        recognitionRef.current.audioTrack = true;
      }
      
      // Android-specific audio settings for better capture
      if (window.SpeechRecognition && window.SpeechRecognition.prototype.setAudioSource) {
        try {
          recognitionRef.current.setAudioSource('microphone');
        } catch (e) {
          console.log('Audio source setting not available');
        }
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
      const _messageSentRef = { current: false }; // CRITICAL: prevent duplicate sends

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        _messageSentRef.current = false;
        if (isMountedRef.current) {
          setIsListening(true);
          toast.success('Listening...');
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        if (!isMountedRef.current) return;
        if (_messageSentRef.current) return; // Already sent — ignore further results
        
        try {
          // Accumulate all final results into one transcript
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          // In voice typing mode, show interim text in real-time
          if (voiceTypingMode) {
            const lastResult = event.results[event.results.length - 1];
            setTextInput(lastResult[0].transcript.trim());
            return;
          }
          
          if (finalTranscript.trim().length > 0) {
            const finalSpeech = finalTranscript.trim();
            console.log('✅ Final transcript:', finalSpeech);
            
            if (_speechEndTimeoutRef.current) {
              clearTimeout(_speechEndTimeoutRef.current);
            }
            
            _speechEndTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && !_messageSentRef.current) {
                _messageSentRef.current = true; // Lock — prevent any further sends
                
                if (recognitionRef.current) {
                  try { recognitionRef.current.stop(); } catch {}
                }
                
                setIsListening(false);
                setTimeout(() => sendMessage(finalSpeech), 300);
              }
            }, 1200);
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
      


      {/* Feature Buttons - Caregiver Access Only */}
      {/* These buttons are hidden from patient view but available in caregiver portal */}
      
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

      {rateLimitStatus.limited && (
        <RateLimitAlert limited={true} resetTime={rateLimitStatus.resetTime} />
      )}

      {showFreeTierAlert && freeTierUsage && (
        <div className="fixed bottom-32 left-4 right-4 z-40 max-w-md mx-auto">
          <FreeTierLimitAlert 
            featureType="chat"
            used={freeTierUsage.used}
            limit={freeTierUsage.limit}
            onDismiss={() => setShowFreeTierAlert(false)}
          />
        </div>
      )}

      {showHandsFree && (
        <HandsFreeMode
          onClose={() => setShowHandsFree(false)}
          onSendMessage={sendMessage}
          currentEra={selectedEra === 'auto' ? detectedEra : selectedEra}
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

        {showSingAlong && (
          <SingAlongPlayer
            currentEra={selectedEra === 'auto' ? detectedEra : selectedEra}
            mood={anxietyState.level >= 5 ? 'calm' : 'happy'}
            onClose={() => setShowSingAlong(false)}
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

      <div className="p-6 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant={!voiceTypingMode ? "default" : "outline"}
            onClick={() => {
              if (isListening) stopVoiceInput();
              setVoiceTypingMode(false);
            }}
            className="rounded-full"
          >
            Voice Chat
          </Button>
          <Button
            size="sm"
            variant={voiceTypingMode ? "default" : "outline"}
            onClick={() => {
              if (isListening) stopVoiceInput();
              setVoiceTypingMode(true);
            }}
            className="rounded-full"
          >
            Voice Typing
          </Button>
        </div>

        {/* Text Input for Hands-Free & Text Mode */}
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type here or tap the mic..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.repeat && textInput.trim() && !isLoading && !isSendingRef.current) {
                e.preventDefault();
                const msg = textInput.trim();
                setTextInput('');
                sendMessage(msg);
              }
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            size="lg"
            onClick={() => {
              if (textInput.trim() && !isLoading) {
                const msg = textInput.trim();
                setTextInput('');
                sendMessage(msg);
              }
            }}
            disabled={isLoading || !textInput.trim()}
            className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg"
          >
            Send
          </Button>
        </div>

        {/* Voice Button + Replay */}
        <div className="flex flex-col items-center gap-4">
          {/* Replay last response */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => { if (lastSpokenTextRef.current) speakResponse(lastSpokenTextRef.current); }}
            disabled={!lastSpokenTextRef.current || isLoading}
            className="rounded-full flex items-center gap-2 text-slate-600 border-slate-300"
          >
            <Volume2 className="w-4 h-4" /> Replay
          </Button>

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
              {voiceTypingMode 
                ? (isListening ? 'Transcribing...' : isLoading ? 'Thinking...' : 'Tap to Type by Voice')
                : (isListening ? 'Listening...' : isLoading ? 'Thinking...' : 'Tap to Talk')
              }
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {voiceTypingMode
                ? (isListening ? 'Speaking converts to text above' : 'Edit text before sending')
                : (isListening ? 'Speak clearly and I\'ll listen' : isLoading ? 'Processing your message' : 'Or type below and press Enter')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}