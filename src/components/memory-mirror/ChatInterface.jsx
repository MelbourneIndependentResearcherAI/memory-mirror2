import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, BookHeart, Gamepad2, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import VoiceSetup from './VoiceSetup';
import AnxietyAlert from './AnxietyAlert';
import GameInterface from '../games/GameInterface';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import EraSelector from './EraSelector';
import MusicPlayer from './MusicPlayer';
import StoryTeller from './StoryTeller';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from './voiceUtils';

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
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['safeZones'] });
    await queryClient.refetchQueries({ queryKey: ['memories'] });
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const { data: safeZones = [] } = useQuery({
    queryKey: ['safeZones'],
    queryFn: () => base44.entities.SafeMemoryZone.list(),
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 50),
  });

  const getSystemPrompt = () => {
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

    return `You are Memory Mirror, a compassionate AI companion for people with dementia. Core principles:

1. NEVER correct or reality-orient. Meet people where they are mentally.
2. ${eraInstructions}${eraSpecificContext[selectedEra] || ''}
3. When transitioning between eras, do so gently: "I can tell you're thinking about [time period]... let's talk about that..."
4. When confusion or anxiety is detected, redirect to "safe memory zones" - positive, familiar topics.
5. Proactively suggest specific positive memories when appropriate.
6. Validate all emotions without judgment.
7. Use warm, simple, clear language with era-appropriate expressions.
8. Reassure them that everything is taken care of.
9. Be patient and repeat information if needed.${safeZoneContext}${memoryContext}

After your response, on a new line output META: {"era": "1940s|1960s|1980s|present", "anxiety": 0-10, "suggestedMemory": "memory title or null"}`;
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const speakResponse = (text) => {
    speakWithRealisticVoice(text, {
      rate: 0.92,
      pitch: 1.05,
      volume: 1.0
    });
  };

  const sendMessage = async (transcribedText) => {
    const userMessage = transcribedText || '';
    if (!userMessage.trim() || isLoading) return;
    
    // Log chat activity
    base44.entities.ActivityLog.create({
      activity_type: 'chat',
      details: { message_length: userMessage.length, era: selectedEra }
    }).catch(() => {});
    
    // Detect anxiety in user message
    const anxietyDetection = detectAnxiety(userMessage);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);
    setIsLoading(true);

    // Handle high anxiety proactively
    if (anxietyDetection.level >= 7) {
      const calmingMessage = getCalmingRedirect(anxietyDetection.trigger);
      setMessages(prev => [...prev, { role: 'assistant', content: calmingMessage, hasVoice: true }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: calmingMessage }]);
      speakResponse(calmingMessage);
      
      // Suggest phone mode for high anxiety
      setAnxietyState({ level: anxietyDetection.level, suggestedMode: 'phone' });
      setShowAnxietyAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${getSystemPrompt()}\n\nIMPORTANT: User anxiety detected at level ${anxietyDetection.level}. ${anxietyDetection.trigger ? `Trigger: "${anxietyDetection.trigger}".` : ''} Respond with extra warmth and reassurance.\n\nConversation so far:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nRespond to the user's latest message with compassion.`,
      });

      let assistantMessage = response;
      let era = 'present';
      let detectedAnxiety = anxietyDetection.level;
      
      // Parse META data if present
      if (typeof response === 'string' && response.includes('META:')) {
        const parts = response.split('META:');
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

      // Track anxiety trends
      if (detectedAnxiety >= 4) {
        const today = new Date().toISOString().split('T')[0];
        base44.entities.AnxietyTrend.create({
          date: today,
          anxiety_level: detectedAnxiety,
          trigger_category: anxietyDetection.trigger ? 'distress' : 'none',
          mode_used: 'chat',
          interaction_count: 1
        }).catch(() => {});
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, hasVoice: true }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speakResponse(assistantMessage);

      // Show anxiety alert if needed
      if (detectedAnxiety >= 6) {
        setAnxietyState({ 
          level: detectedAnxiety, 
          suggestedMode: detectedAnxiety >= 8 ? 'phone' : null 
        });
        setShowAnxietyAlert(true);
        
        // Log high anxiety
        base44.entities.ActivityLog.create({
          activity_type: 'anxiety_detected',
          anxiety_level: detectedAnxiety,
          details: { trigger: userMessage.substring(0, 100) }
        }).catch(() => {});
      }

    } catch (error) {
      console.error('Chat error:', error);
      const fallback = "I'm here with you. Let's try again in just a moment.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallback,
        hasVoice: true 
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
    recognitionRef.current.lang = 'en-US';
    
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
  };

  return (
    <div className="flex flex-col h-full">
      <VoiceSetup />
      
      <EraSelector selectedEra={selectedEra} onEraChange={handleEraChange} />
      
      <div className="p-3 border-b border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMemoryGalleryOpen && onMemoryGalleryOpen()}
          className="flex items-center justify-center gap-2 min-h-[44px] border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <BookHeart className="w-4 h-4" />
          <span className="hidden sm:inline">Memories</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMusic(!showMusic)}
          className="flex items-center justify-center gap-2 min-h-[44px] border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <Music className="w-4 h-4" />
          <span className="hidden sm:inline">Music</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStory(!showStory)}
          className="flex items-center justify-center gap-2 min-h-[44px] border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Stories</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGames(true)}
          className="flex items-center justify-center gap-2 min-h-[44px] border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">Games</span>
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
      
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="flex-1 bg-gradient-to-b from-orange-50 via-pink-50 to-white dark:from-orange-950 dark:via-pink-950 dark:to-slate-900 min-h-[400px]"
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
            <Mic className="w-16 h-16 mx-auto mb-4 text-orange-400 animate-pulse" />
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

      <div className="p-6 border-t-4 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950">
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
            className={`
              w-24 h-24 rounded-full shadow-2xl transition-all duration-300
              ${isListening 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </Button>
        </div>
        <p className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
          {isListening ? '🎤 Listening... Speak now' : isLoading ? '💭 Thinking...' : 'Tap to speak'}
        </p>
      </div>
    </div>
  );
}