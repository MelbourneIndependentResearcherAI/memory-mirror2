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
    try {
      const connections = await base44.entities.TVConnection.filter({ 
        pairing_code: code,
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
        
        toast.success('TV Connected Successfully!');
        
        // Welcome message
        const welcomeMsg = "Welcome to Memory Mirror on your Smart TV! I'm here to keep you company. You can talk to me by pressing the microphone button with your remote.";
        setMessages([{ role: 'assistant', content: welcomeMsg }]);
        speakWithClonedVoice(welcomeMsg);
      } else {
        toast.error('Invalid pairing code. Please try again.');
      }
    } catch (error) {
      console.error('Pairing check failed:', error);
      toast.error('Failed to verify pairing code');
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
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const prompt = `You are Memory Mirror, a compassionate AI companion for people with dementia. 
The user is viewing you on a Smart TV with large text.
Keep responses concise (2-3 sentences) as they appear on a large screen.
Be warm, reassuring, and supportive.

User: ${text}

Respond with empathy and understanding:`;

      const response = await offlineAIChat(prompt);
      const assistantMessage = { role: 'assistant', content: response };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakWithClonedVoice(response);
    } catch (error) {
      console.error('AI response failed:', error);
      const fallback = "I'm here with you. Let's take a moment together.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speakWithClonedVoice(fallback);
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
            <p className="text-3xl text-white/90 mb-12">
              Enter your 6-digit pairing code
            </p>
            
            <form onSubmit={handlePairingInput} className="space-y-8">
              <div className="bg-white/20 rounded-2xl p-8">
                <div className="text-8xl font-bold text-white tracking-[0.5em] text-center">
                  {pairingCode.padEnd(6, '_').match(/.{1,3}/g).join('  ')}
                </div>
              </div>
              
              <p className="text-2xl text-white/80">
                Use your remote's number keys to enter the code
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  onClick={() => setPairingCode('')}
                  className="text-2xl px-8 py-6 bg-white/20 hover:bg-white/30"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={pairingCode.length !== 6}
                  className="text-2xl px-8 py-6 bg-green-600 hover:bg-green-700"
                >
                  Connect
                </Button>
              </div>
            </form>
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
          <div className="mt-6 bg-black/60 rounded-2xl p-6">
            <h3 className="text-3xl font-bold text-white mb-4">Text Size</h3>
            <div className="grid grid-cols-3 gap-4">
              {['large', 'extra-large', 'huge'].map(size => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`p-4 rounded-xl text-2xl font-bold ${
                    textSize === size
                      ? 'bg-white text-blue-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {size.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}