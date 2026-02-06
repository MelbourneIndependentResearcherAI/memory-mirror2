import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatMessage from './ChatMessage';
import VoiceSetup from './VoiceSetup';
import AnxietyAlert from './AnxietyAlert';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from '@/utils/voiceUtils';

const systemPrompt = `You are Memory Mirror, a compassionate AI companion for people with dementia. Core principles:

1. NEVER correct or reality-orient. Meet people where they are mentally.
2. Detect their mental time period from context clues and adapt your responses accordingly.
3. When confusion or anxiety is detected, redirect to "safe memory zones" - positive, familiar topics.
4. Validate all emotions without judgment.
5. Use warm, simple, clear language.
6. Reassure them that everything is taken care of.
7. Be patient and repeat information if needed.
8. Reference familiar things from their era if detected.

After your response, on a new line output META: {"era": "1940s|1960s|1980s|present", "anxiety": 0-10, "safeTopics": ["topic1", "topic2"]}`;

export default function ChatInterface({ onEraChange, onModeSwitch }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [anxietyState, setAnxietyState] = useState({ level: 0, suggestedMode: null });
  const [showAnxietyAlert, setShowAnxietyAlert] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

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
        prompt: `${systemPrompt}\n\nIMPORTANT: User anxiety detected at level ${anxietyDetection.level}. ${anxietyDetection.trigger ? `Trigger: "${anxietyDetection.trigger}".` : ''} Respond with extra warmth and reassurance.\n\nConversation so far:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nRespond to the user's latest message with compassion.`,
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
          onEraChange(era);
        } catch (e) {
          // Ignore parse errors
        }
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
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm here with you. Let's try again in just a moment.",
        hasVoice: true 
      }]);
    }

    setIsLoading(false);
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
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white min-h-[400px]"
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
          <div className="text-center text-slate-400 py-4 italic flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
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
            className="rounded-full px-6 h-12 bg-slate-600 hover:bg-slate-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}