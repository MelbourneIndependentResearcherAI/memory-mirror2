import React, { useState, useEffect, useRef } from 'react';
import { Tv, Mic, MicOff, ArrowUp, ArrowDown, Settings, Home, Volume2, Image, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { speakWithClonedVoice } from '@/components/memory-mirror/voiceUtils';
import { useQuery } from '@tanstack/react-query';

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
  const [showPhotos, setShowPhotos] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch TV-viewable content
  const { data: photos = [] } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.list('-created_date', 20),
    enabled: isPaired,
    staleTime: 1000 * 60 * 5,
  });

  const { data: music = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list('-created_date', 30),
    enabled: isPaired,
    staleTime: 1000 * 60 * 5,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date', 15),
    enabled: isPaired,
    staleTime: 1000 * 60 * 5,
  });

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

      // Use the unified chatWithAI function for consistency
      const response = await base44.functions.invoke('chatWithAI', {
        userMessage: text,
        conversationHistory: recentMessages,
        detectedEra: 'present',
        userLanguage: 'en'
      });

      const cleanResponse = response.data?.response || 'I understand. Let\'s talk about that.';
      
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
          setFocusedIndex(prev => Math.min(5, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex === 0) {
            isListening ? stopVoiceInput() : startVoiceInput();
          } else if (focusedIndex === 1) {
            setShowPhotos(!showPhotos);
          } else if (focusedIndex === 2) {
            setShowMusic(!showMusic);
          } else if (focusedIndex === 3) {
            setShowStories(!showStories);
          } else if (focusedIndex === 4) {
            setShowSettings(!showSettings);
          } else if (focusedIndex === 5) {
            setMessages([]);
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
          {showPhotos ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-5xl font-bold text-white mb-4">📸 Family Photos</h2>
                <Button onClick={() => setShowPhotos(false)} variant="outline" size="lg" className="bg-white/20 text-white hover:bg-white/30 text-2xl px-8 py-6">
                  ← Back to Chat
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {photos.length > 0 ? photos.map((photo) => (
                  <div key={photo.id} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border-4 border-white/20">
                    <img src={photo.media_url} alt={photo.title} className="w-full h-96 object-cover" />
                    <div className="p-6">
                      <h3 className="text-3xl font-bold text-white mb-2">{photo.title}</h3>
                      <p className="text-2xl text-white/80">{photo.caption}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center text-white/60 py-20">
                    <p className="text-3xl">No photos yet. Family can add photos via the Family Portal.</p>
                  </div>
                )}
              </div>
            </div>
          ) : showMusic ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-5xl font-bold text-white mb-4">🎵 Music Library</h2>
                <Button onClick={() => setShowMusic(false)} variant="outline" size="lg" className="bg-white/20 text-white hover:bg-white/30 text-2xl px-8 py-6">
                  ← Back to Chat
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {music.length > 0 ? music.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      if (song.youtube_url) {
                        window.open(song.youtube_url, '_blank');
                        toast.success(`Playing: ${song.title}`);
                      }
                    }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-4 border-white/20 hover:bg-white/20 transition-all text-left"
                  >
                    <h3 className="text-4xl font-bold text-white mb-2">{song.title}</h3>
                    <p className="text-3xl text-white/80">{song.artist}</p>
                    <div className="flex gap-3 mt-3">
                      <span className="text-2xl bg-purple-600/50 px-4 py-2 rounded-full">{song.era}</span>
                      <span className="text-2xl bg-blue-600/50 px-4 py-2 rounded-full">{song.genre}</span>
                    </div>
                  </button>
                )) : (
                  <div className="text-center text-white/60 py-20">
                    <p className="text-3xl">No music yet. Add songs via the Music Library.</p>
                  </div>
                )}
              </div>
            </div>
          ) : showStories ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-5xl font-bold text-white mb-4">📖 Stories</h2>
                <Button onClick={() => setShowStories(false)} variant="outline" size="lg" className="bg-white/20 text-white hover:bg-white/30 text-2xl px-8 py-6">
                  ← Back to Chat
                </Button>
              </div>
              <div className="space-y-4">
                {stories.length > 0 ? stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      setMessages([
                        { role: 'assistant', content: `${story.title}\n\n${story.content}` }
                      ]);
                      setShowStories(false);
                      speakWithClonedVoice(story.content, { rate: 0.88, emotionalState: 'warm' });
                    }}
                    className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-4 border-white/20 hover:bg-white/20 transition-all text-left"
                  >
                    <h3 className="text-4xl font-bold text-white mb-3">{story.title}</h3>
                    <p className="text-2xl text-white/70 line-clamp-3">{story.content}</p>
                    <div className="flex gap-3 mt-4">
                      <span className="text-xl bg-green-600/50 px-4 py-2 rounded-full">{story.theme}</span>
                      <span className="text-xl bg-pink-600/50 px-4 py-2 rounded-full">{story.mood}</span>
                    </div>
                  </button>
                )) : (
                  <div className="text-center text-white/60 py-20">
                    <p className="text-3xl">No stories yet. Add stories via the Story Library.</p>
                  </div>
                )}
              </div>
            </div>
          ) : messages.length === 0 ? (
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
        <div className="max-w-7xl mx-auto grid grid-cols-6 gap-4">
          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 0
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={isListening ? stopVoiceInput : startVoiceInput}
          >
            {isListening ? (
              <MicOff className="w-16 h-16" />
            ) : (
              <Mic className="w-16 h-16" />
            )}
            <span className="text-xl font-bold">
              {isListening ? 'Stop' : 'Talk'}
            </span>
          </button>

          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 1
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              setShowPhotos(!showPhotos);
              setShowMusic(false);
              setShowStories(false);
              setShowSettings(false);
            }}
          >
            <Image className="w-16 h-16" />
            <span className="text-xl font-bold">Photos</span>
          </button>

          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 2
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              setShowMusic(!showMusic);
              setShowPhotos(false);
              setShowStories(false);
              setShowSettings(false);
            }}
          >
            <Music className="w-16 h-16" />
            <span className="text-xl font-bold">Music</span>
          </button>

          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 3
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              setShowStories(!showStories);
              setShowPhotos(false);
              setShowMusic(false);
              setShowSettings(false);
            }}
          >
            <BookOpen className="w-16 h-16" />
            <span className="text-xl font-bold">Stories</span>
          </button>

          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 4
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              setShowSettings(!showSettings);
              setShowPhotos(false);
              setShowMusic(false);
              setShowStories(false);
            }}
          >
            <Settings className="w-16 h-16" />
            <span className="text-xl font-bold">Settings</span>
          </button>

          <button
            className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-3 ${
              focusedIndex === 5
                ? 'bg-white text-blue-900 scale-105 ring-4 ring-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => {
              setMessages([]);
              setShowPhotos(false);
              setShowMusic(false);
              setShowStories(false);
              setShowSettings(false);
            }}
          >
            <Home className="w-16 h-16" />
            <span className="text-xl font-bold">Clear</span>
          </button>
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