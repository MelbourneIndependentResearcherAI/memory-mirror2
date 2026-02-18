import React, { useState, useEffect, useRef } from 'react';
import { Tv, Mic, MicOff, ArrowUp, ArrowDown, Settings, Home, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { speakWithClonedVoice } from '@/components/memory-mirror/voiceUtils';
import { offlineAIChat } from '@/components/utils/offlineAPI';

export default function TVMode() {
  const [isPaired, setIsPaired] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState('extra-large');
  const [connectionId, setConnectionId] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const checkPairing = async (code) => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      const connections = await base44.entities.TVConnection.filter({ 
        pairing_code: code.toUpperCase(),
        is_active: true 
      });
      
      if (connections.length > 0) {
        const conn = connections[0];
        setIsPaired(true);
        setConnectionId(conn.id);
        setTextSize(conn.tv_settings?.text_size || 'extra-large');
        
        // Update connection with device info
        await base44.entities.TVConnection.update(conn.id, {
          device_name: 'Smart TV Connected',
          last_connected: new Date().toISOString()
        });
        
        toast.success('✅ TV Connected Successfully!', { duration: 5000 });
        
        // Welcome message with instructions
        const welcomeMsg = "Welcome to Memory Mirror on your Smart TV! I'm here to keep you company. Press the microphone button with your remote to talk to me. Use arrow keys to navigate.";
        setMessages([{ role: 'assistant', content: welcomeMsg }]);
        
        // Speak welcome
        speakWithClonedVoice(welcomeMsg, {
          rate: 0.9,
          emotionalState: 'warm'
        });
      } else {
        toast.error('❌ Invalid pairing code. Please check and try again.', {
          duration: 4000
        });
        setPairingCode('');
      }
    } catch (error) {
      console.error('Pairing check failed:', error);
      toast.error('❌ Connection failed. Please try again.');
    }
  };

  const handlePairingInput = (e) => {
    e.preventDefault();
    if (pairingCode.length === 6) {
      checkPairing(pairingCode);
    } else {
      toast.error('Please enter a 6-digit code');
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          handleUserMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice input error. Please try again.');
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Failed to start voice input');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleUserMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const recentMessages = messages.slice(-4);
      const conversationContext = recentMessages.map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const prompt = `You are Memory Mirror, a warm and compassionate AI companion for people with dementia viewing on a Smart TV.

CRITICAL INSTRUCTIONS:
- Keep responses SHORT (2-3 sentences maximum) - TV screen space is limited
- Use SIMPLE language and avoid complex words
- Be warm, reassuring, and supportive
- Validate their feelings and experiences
- Never correct or contradict them

Recent conversation:
${conversationContext}

User just said: "${text}"

Respond with empathy and warmth in 2-3 sentences:`;

      const response = await Promise.race([
        offlineAIChat(prompt, { add_context_from_internet: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 12000)
        )
      ]);

      const cleanResponse = typeof response === 'string' 
        ? response.replace(/META:.*$/s, '').trim().substring(0, 400)
        : 'I understand. Let\'s talk about that.';
      
      const assistantMessage = { role: 'assistant', content: cleanResponse };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak with TV-optimized settings
      speakWithClonedVoice(cleanResponse, {
        rate: 0.85,
        pitch: 1.05,
        emotionalState: 'warm'
      });
    } catch (error) {
      console.error('AI response failed:', error);
      const fallback = "I'm here with you. Everything is okay. Let's take a moment together.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speakWithClonedVoice(fallback, {
        rate: 0.85,
        emotionalState: 'reassuring'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard navigation for TV remote
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPaired) {
        // Handle pairing code input
        if (e.key >= '0' && e.key <= '9' && pairingCode.length < 6) {
          setPairingCode(prev => prev + e.key);
        } else if (e.key === 'Backspace') {
          setPairingCode(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter' && pairingCode.length === 6) {
          checkPairing(pairingCode);
        }
        return;
      }

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(3, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex === 0) {
            isListening ? stopVoiceInput() : startVoiceInput();
          } else if (focusedIndex === 1) {
            setShowSettings(!showSettings);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaired, focusedIndex, isListening, pairingCode, showSettings]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const textSizeClasses = {
    'large': 'text-2xl',
    'extra-large': 'text-4xl',
    'huge': 'text-6xl'
  };

  if (!isPaired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-4 border-white/20">
            <Tv className="w-32 h-32 text-white mx-auto mb-8" />
            <h1 className="text-6xl font-bold text-white mb-6">
              Memory Mirror TV
            </h1>
            <p className="text-3xl text-white/90 mb-4">
              Enter your 6-digit pairing code
            </p>
            <p className="text-xl text-white/70 mb-12">
              Get the code from your phone or tablet
            </p>
            
            <form onSubmit={handlePairingInput} className="space-y-8">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border-2 border-white/30">
                <div className="text-8xl font-bold text-white tracking-[0.5em] text-center font-mono">
                  {pairingCode.padEnd(6, '●').split('').map((char, i) => (
                    <span key={i} className={char === '●' ? 'opacity-30' : ''}>
                      {char}
                    </span>
                  )).reduce((prev, curr, i) => 
                    i === 3 ? [...prev, <span key="space" className="inline-block w-12"></span>, curr] : [...prev, curr]
                  , [])}
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-2xl text-white/90 font-medium">
                  📱 Use your TV remote's number keys
                </p>
                <div className="flex items-center justify-center gap-4 text-white/70">
                  <div className="bg-white/10 rounded-lg px-4 py-2 text-xl">1-9</div>
                  <div className="bg-white/10 rounded-lg px-4 py-2 text-xl">0</div>
                  <div className="bg-white/10 rounded-lg px-4 py-2 text-xl">Enter/OK</div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  onClick={() => setPairingCode('')}
                  className="text-2xl px-8 py-6 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={pairingCode.length !== 6}
                  className="text-2xl px-8 py-6 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Connect →
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-lg text-white/60">
                Don't have a code? Visit <strong className="text-white">memorymirror.app</strong> on your phone
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b-4 border-white/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Tv className="w-16 h-16 text-white" />
            <div>
              <h1 className="text-5xl font-bold text-white">Memory Mirror</h1>
              <p className="text-2xl text-white/80">TV Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-2xl text-white">Connected</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="text-center text-white py-20">
              <Volume2 className="w-32 h-32 mx-auto mb-8 opacity-50" />
              <p className="text-5xl font-bold mb-4">Ready to Chat</p>
              <p className="text-3xl opacity-80">Press the microphone button to start talking</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${textSizeClasses[textSize]} p-8 rounded-3xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-20'
                    : 'bg-white/10 backdrop-blur-lg text-white mr-20 border-2 border-white/20'
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
          {isProcessing && (
            <div className="text-4xl text-white text-center py-8 italic">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/40 backdrop-blur-sm border-t-4 border-white/20 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
          <button
            className={`p-8 rounded-2xl transition-all flex flex-col items-center gap-4 ${
              focusedIndex === 0
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={isListening ? stopVoiceInput : startVoiceInput}
          >
            {isListening ? (
              <MicOff className="w-20 h-20" />
            ) : (
              <Mic className="w-20 h-20" />
            )}
            <span className="text-2xl font-bold">
              {isListening ? 'Stop' : 'Talk'}
            </span>
          </button>

          <button
            className={`p-8 rounded-2xl transition-all flex flex-col items-center gap-4 ${
              focusedIndex === 1
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-20 h-20" />
            <span className="text-2xl font-bold">Settings</span>
          </button>

          <button
            className={`p-8 rounded-2xl transition-all flex flex-col items-center gap-4 ${
              focusedIndex === 2
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setMessages([])}
          >
            <Home className="w-20 h-20" />
            <span className="text-2xl font-bold">Clear</span>
          </button>

          <div className="p-8 rounded-2xl bg-white/10 flex flex-col items-center gap-2">
            <p className="text-xl text-white/80">Use Remote</p>
            <div className="flex gap-2">
              <ArrowUp className="w-8 h-8 text-white" />
              <ArrowDown className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-white/60">+ OK Button</p>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 bg-black/60 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
            <h3 className="text-3xl font-bold text-white mb-4">⚙️ Display Settings</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xl text-white/80 mb-3">Text Size:</p>
                <div className="grid grid-cols-3 gap-4">
                  {['large', 'extra-large', 'huge'].map(size => (
                    <button
                      key={size}
                      onClick={async () => {
                        setTextSize(size);
                        // Save to database
                        if (connectionId) {
                          try {
                            await base44.entities.TVConnection.update(connectionId, {
                              tv_settings: { text_size: size, voice_enabled: true, auto_scroll: true }
                            });
                            toast.success(`Text size: ${size}`);
                          } catch (error) {
                            console.error('Failed to save setting:', error);
                          }
                        }
                      }}
                      className={`p-4 rounded-xl font-bold transition-all ${
                        textSize === size
                          ? 'bg-white text-blue-900 scale-105 ring-4 ring-white/50'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      style={{ fontSize: size === 'large' ? '1.5rem' : size === 'extra-large' ? '2rem' : '2.5rem' }}
                    >
                      {size === 'large' ? 'A' : size === 'extra-large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}