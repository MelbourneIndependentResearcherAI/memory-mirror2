import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Always-On Voice System for Memory Mirror
class AlwaysOnVoiceSystem {
  constructor(config) {
    this.wakeWords = config.wakeWords || ['hey mirror', 'hello mirror', 'memory mirror'];
    this.userProfile = config.userProfile;
    this.onStateChange = config.onStateChange || (() => {});
    this.isListening = false;
    this.isProcessing = false;
    this.conversationActive = false;
    this.conversationTimeout = null;
    this.conversationHistory = [];
    this.recognition = null;
    this.wakeLock = null;
  }

  async initialize() {
    console.log('Initializing Always-On Voice System...');
    
    try {
      await this.requestMicrophonePermission();
      await this.startWakeWordDetection();
      await this.enablePowerOptimization();
      
      console.log('Voice system ready - listening for:', this.wakeWords);
      this.onStateChange({ status: 'active', message: 'Listening for wake words...' });
      
      return true;
    } catch (error) {
      console.error('Voice system initialization failed:', error);
      this.onStateChange({ status: 'error', message: error.message });
      return false;
    }
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      return stream;
    } catch (error) {
      throw new Error('Microphone access required for voice features');
    }
  }

  async startWakeWordDetection() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    // Stop any existing recognition first
    if (this.recognition) {
      try {
        this.recognition.abort();
        this.recognition = null;
      } catch (e) {
        console.log('Cleanup error (safe):', e.message);
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.userProfile?.language || 'en-US';
    
    let isStarting = false;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .toLowerCase();

      this.processAudioInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error !== 'no-speech' && event.error !== 'aborted' && !isStarting) {
        setTimeout(() => {
          if (this.isListening && !isStarting) {
            isStarting = true;
            try {
              recognition.start();
            } catch (e) {
              console.log('Restart error:', e.message);
            } finally {
              isStarting = false;
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      if (this.isListening && !isStarting) {
        setTimeout(() => {
          if (this.isListening && !isStarting) {
            isStarting = true;
            try {
              recognition.start();
            } catch (e) {
              console.log('Restart on end error:', e.message);
            } finally {
              isStarting = false;
            }
          }
        }, 100);
      }
    };

    try {
      recognition.start();
      this.recognition = recognition;
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      throw error;
    }
  }

  processAudioInput(transcript) {
    const wakeWordDetected = this.wakeWords.some(word => 
      transcript.includes(word)
    );

    if (wakeWordDetected && !this.isProcessing) {
      console.log('Wake word detected:', transcript);
      this.onWakeWordDetected(transcript);
    } else if (this.conversationActive && !this.isProcessing && transcript.length > 5) {
      // Only process if conversation is active and we have meaningful input
      console.log('User spoke in active conversation:', transcript);
      this.onUserSpoke(transcript);
    }
  }

  async onWakeWordDetected(transcript) {
    this.isProcessing = true;
    this.conversationActive = true;
    this.onStateChange({ status: 'active_conversation', message: 'Listening...' });

    // Play activation sound
    this.playActivationSound();

    const query = this.extractQuery(transcript);

    if (query && query.length > 5) {
      // User said something after wake word - respond immediately
      await this.respondToUser(query);
    } else {
      // Just wake word - acknowledge and wait for input
      await this.speak("Yes, I'm listening. How can I help you?");
    }

    this.isProcessing = false;
    this.resetConversationTimeout();
  }

  extractQuery(transcript) {
    let query = transcript;
    
    this.wakeWords.forEach(wakeWord => {
      query = query.replace(wakeWord, '').trim();
    });

    return query || null;
  }

  async onUserSpoke(transcript) {
    if (this.isProcessing || transcript.length < 3) return;
    
    this.isProcessing = true;
    this.resetConversationTimeout();
    
    await this.respondToUser(transcript);
    
    this.isProcessing = false;
  }

  async respondToUser(userMessage) {
    console.log('User said:', userMessage);

    try {
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      const response = await base44.functions.invoke('chatWithAI', {
        userMessage,
        conversationHistory: this.conversationHistory.slice(-10),
        mode: 'always_on_voice',
        context: 'always_available_companion',
        userProfile: this.userProfile
      });

      const aiResponse = response.data.response;
      
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      await this.speak(aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      await this.speak("I'm sorry, I didn't quite catch that. Could you say it again?");
    }
  }

  async speak(text) {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Wait for voices to load
        const voices = speechSynthesis.getVoices();
        
        // Select the BEST voice available - prioritize natural sounding voices
        const preferredVoice = voices.find(voice => 
          (voice.name.includes('Google') && voice.lang.startsWith('en')) ||
          voice.name.includes('Samantha') || // High quality on Apple devices
          voice.name.includes('Natural') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced') ||
          voice.name.includes('Microsoft Zira') || // Windows quality voice
          voice.name.includes('Microsoft David')
        ) || voices.find(v => v.lang.startsWith('en-US') && !v.name.includes('eSpeak'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        }

        // Human-like speech parameters
        utterance.rate = 0.9;  // Natural conversational pace
        utterance.pitch = 1.05;  // Slightly warmer tone
        utterance.volume = 1.0;  // Full volume
        
        // Add natural pauses for longer responses
        if (text.length > 100) {
          utterance.text = text
            .replace(/\. /g, '. ... ')
            .replace(/\? /g, '? ... ')
            .replace(/! /g, '! ... ');
        }

        utterance.onend = () => {
          this.onStateChange({ status: 'active_conversation', message: 'Listening...' });
          resolve();
        };
        
        utterance.onstart = () => {
          this.onStateChange({ status: 'speaking', message: 'Speaking...' });
        };
        
        utterance.onerror = (e) => {
          console.error('Speech error:', e);
          resolve();
        };
        
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  playActivationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 150);
  }

  resetConversationTimeout() {
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
    }

    this.conversationTimeout = setTimeout(() => {
      this.endConversation();
    }, 30000);
  }

  endConversation() {
    console.log('Ending conversation due to silence');
    this.conversationActive = false;
    this.conversationTimeout = null;
    this.conversationHistory = [];
    this.onStateChange({ status: 'active', message: 'Listening for wake words...' });
  }

  async enablePowerOptimization() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired');
      } catch (error) {
        console.error('Wake lock failed:', error);
      }
    }

    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      
      battery.addEventListener('levelchange', () => {
        const level = Math.round(battery.level * 100);
        console.log('Battery level:', level + '%');
        
        if (level < 20) {
          toast.warning(`Battery low: ${level}%`);
        }
      });
    }
  }

  stopListening() {
    console.log('Stopping voice system');
    this.isListening = false;
    this.conversationActive = false;
    
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
    }
    
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    this.onStateChange({ status: 'inactive', message: 'Voice system stopped' });
  }
}

export default function AlwaysOnVoice({ userProfile, onClose }) {
  const [systemState, setSystemState] = useState({ status: 'inactive', message: 'Not started' });
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const systemRef = useRef(null);

  useEffect(() => {
    // Monitor battery
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    return () => {
      if (systemRef.current) {
        systemRef.current.stopListening();
      }
    };
  }, []);

  const startSystem = async () => {
    if (!systemRef.current) {
      systemRef.current = new AlwaysOnVoiceSystem({
        wakeWords: ['hey mirror', 'hello mirror', 'memory mirror'],
        userProfile,
        onStateChange: setSystemState
      });
    }

    const success = await systemRef.current.initialize();
    
    if (success) {
      toast.success('Voice system activated - Say "Hey Mirror" to start');
    } else {
      toast.error('Failed to start voice system');
    }
  };

  const stopSystem = () => {
    if (systemRef.current) {
      systemRef.current.stopListening();
      systemRef.current = null;
    }
  };

  const testVoiceSystem = async () => {
    if (systemRef.current) {
      await systemRef.current.speak(
        "Hello! I'm Memory Mirror, your AI companion. I'm ready to chat with you anytime. Just say 'Hey Mirror' followed by what you'd like to talk about."
      );
    }
  };

  const getStatusColor = () => {
    switch (systemState.status) {
      case 'active': return 'bg-green-500';
      case 'active_conversation': return 'bg-blue-500 animate-pulse';
      case 'speaking': return 'bg-purple-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isActive = systemState.status !== 'inactive' && systemState.status !== 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Always-On Voice System
              </span>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
                <div>
                  <div className="font-semibold">
                    {isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {systemState.message}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={isActive ? stopSystem : startSystem}
                variant={isActive ? 'destructive' : 'default'}
                className="gap-2"
              >
                {isActive ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
            </div>

            {isActive && (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Wake Words:
                  </h3>
                  <div className="space-y-1">
                    <Badge variant="secondary">"Hey Mirror"</Badge>
                    <Badge variant="secondary">"Hello Mirror"</Badge>
                    <Badge variant="secondary">"Memory Mirror"</Badge>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
                    Say any of these phrases followed by your question or request
                  </p>
                </div>

                <Button onClick={testVoiceSystem} variant="outline" className="w-full">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice Output
                </Button>
              </>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Battery className={`w-5 h-5 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-600'}`} />
                <span className="text-sm">Battery: {batteryLevel}%</span>
              </div>
              {isCharging && (
                <Badge variant="outline" className="text-xs">
                  Charging
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-300">
                1
              </div>
              <div>
                <p className="font-semibold">Always Listening</p>
                <p className="text-slate-600 dark:text-slate-400">
                  The system continuously listens for wake words without needing to press any buttons
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-300">
                2
              </div>
              <div>
                <p className="font-semibold">Hands-Free Activation</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Say "Hey Mirror" followed by your question or request
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-300">
                3
              </div>
              <div>
                <p className="font-semibold">Natural Conversation</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Once activated, continue speaking naturally - the system stays active for 30 seconds after each interaction
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Keep the device plugged in or charged for best performance. The system uses wake lock to prevent the device from sleeping.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}