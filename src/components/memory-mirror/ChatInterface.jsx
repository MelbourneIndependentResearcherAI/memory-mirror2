import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, BookHeart, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatMessage from './ChatMessage';
import VoiceSetup from './VoiceSetup';
import AnxietyAlert from './AnxietyAlert';
import GameInterface from '../games/GameInterface';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from './voiceUtils';

export default function ChatInterface({ onEraChange, onModeSwitch, onMemoryGalleryOpen }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [anxietyState, setAnxietyState] = useState({ level: 0, suggestedMode: null });
  const [showAnxietyAlert, setShowAnxietyAlert] = useState(false);
  const [detectedEra, setDetectedEra] = useState('present');
  const [showGames, setShowGames] = useState(false);
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

    return `You are Memory Mirror, a compassionate AI companion for people with dementia. Core principles:

1. NEVER correct or reality-orient. Meet people where they are mentally.
2. Detect their mental time period from context clues and adapt your responses accordingly.
3. When confusion or anxiety is detected, redirect to "safe memory zones" - positive, familiar topics.
4. Proactively suggest specific positive memories when appropriate.
5. Validate all emotions without judgment.
6. Use warm, simple, clear language.
7. Reassure them that everything is taken care of.
8. Be patient and repeat information if needed.
9. Reference familiar things from their era if detected.${safeZoneContext}${memoryContext}

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Log chat activity
    base44.entities.ActivityLog.create({
      activity_type: 'chat',
      details: { message_length: userMessage.length }
    }).catch(() => {});
    
    // Detect anxiety in user message
    const anxietyDetection = detectAnxiety(userMessage);
    
    setInput('');
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

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <VoiceSetup />
      
      <div className="p-3 border-b border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 grid grid-cols-2 gap-2">
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
          onClick={() => setShowGames(true)}
          className="flex items-center justify-center gap-2 min-h-[44px] border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">Play Games</span>
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
          className="p-6"
        >
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p className="text-lg font-medium mb-2">Welcome to Memory Mirror</p>
            <p className="text-sm">I'm here to keep you company. What's on your mind today?</p>
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

      <div className="p-4 border-t-4 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share what's on your mind..."
            className="flex-1 text-base py-6 rounded-full border-slate-300 focus:border-slate-500"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoiceInput}
            className={`rounded-full w-12 h-12 ${isListening ? 'bg-red-100 border-red-300 text-red-600' : ''}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-full px-6 h-12 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}