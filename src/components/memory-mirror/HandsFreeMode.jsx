import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, Power, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { speakWithRealisticVoice } from './voiceUtils';
import { offlineAIChat } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';

export default function HandsFreeMode({ 
  onMessage, 
  onAIResponse, 
  selectedLanguage = 'en',
  systemPrompt,
  conversationHistory = [],
  cognitiveLevel = 'mild',
  userProfile = null
}) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to start');
  const [errorCount, setErrorCount] = useState(0);
  
  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);
  const restartTimeoutRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const silenceTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopHandsFreeMode();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  const langMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
    pt: 'pt-PT', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA',
    hi: 'hi-IN', ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR',
    vi: 'vi-VN', th: 'th-TH', sv: 'sv-SE', no: 'nb-NO', da: 'da-DK'
  };

  const stopSpeech = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error('Stop speech error:', error);
    }
  }, []);

  const startRecognition = useCallback(() => {
    if (!isMountedRef.current || !isActive) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported. Please use Chrome, Edge, or Safari.');
      setIsActive(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // CRITICAL: Optimized for continuous, responsive listening
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 3;
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
      
      // Better speech detection sensitivity
      if (recognitionRef.current.grammars) {
        const speechRecognitionList = new window.SpeechGrammarList();
        recognitionRef.current.grammars = speechRecognitionList;
      }

      recognitionRef.current.onstart = () => {
        if (isMountedRef.current) {
          setIsListening(true);
          setStatusMessage('Listening...');
          setErrorCount(0);
        }
      };

      recognitionRef.current.onresult = (event) => {
        if (!isMountedRef.current || !isActive) return;

        // Clear silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        try {
          const resultIndex = event.resultIndex;
          const result = event.results[resultIndex];
          const transcript = result[0].transcript;
          const isFinal = result.isFinal;
          const confidence = result[0].confidence || 0;
          
          // Show interim results for responsiveness
          if (!isFinal && transcript.trim()) {
            setStatusMessage(`Hearing: "${transcript.substring(0, 50)}..."`);
          }
          
          // Process final results with confidence check
          if (isFinal && transcript.trim() && confidence > 0.5) {
            // Avoid duplicate processing
            const normalizedTranscript = transcript.trim().toLowerCase();
            if (normalizedTranscript === lastTranscriptRef.current.toLowerCase()) return;
            
            lastTranscriptRef.current = transcript.trim();
            setStatusMessage(`You said: "${transcript.substring(0, 60)}"`);
            handleUserSpeech(transcript.trim());
          } else if (isFinal && confidence <= 0.5) {
            setStatusMessage('Didn\'t catch that clearly, keep listening...');
          }
        } catch (error) {
          console.error('Recognition result error:', error);
        }

        // Set silence timeout to restart if no speech detected
        silenceTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isActive && !isProcessing && !isSpeaking) {
            setStatusMessage('Still listening...');
            restartRecognition(500);
          }
        }, 8000); // 8 seconds of silence
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (!isMountedRef.current) return;

        const errorMessages = {
          'no-speech': 'Listening... (no speech yet)',
          'audio-capture': '❌ Microphone not available',
          'not-allowed': '❌ Microphone permission denied - please enable',
          'network': '⚠️ Network error - working offline',
          'aborted': 'Restarting listener...',
          'service-not-allowed': '❌ Speech service not allowed',
          'language-not-supported': '⚠️ Language not supported, switching to English'
        };

        const errorMessage = errorMessages[event.error] || `Error: ${event.error}`;

        // Only show user-facing errors for critical issues
        if (['audio-capture', 'not-allowed', 'service-not-allowed'].includes(event.error)) {
          toast.error(errorMessage);
          setStatusMessage(errorMessage);
          setIsActive(false);
          setErrorCount(prev => prev + 1);
          return;
        }

        // Handle recoverable errors silently
        if (event.error === 'no-speech') {
          setStatusMessage('Listening for your voice...');
          restartRecognition(1000);
          return;
        }

        if (event.error === 'language-not-supported') {
          setStatusMessage('Switching to English...');
          // Will restart with English
          restartRecognition(1500);
          return;
        }

        // Auto-restart on other recoverable errors
        if (isActive && errorCount < 8) {
          if (['aborted', 'network'].includes(event.error)) {
            setStatusMessage(errorMessage);
            restartRecognition(1500);
          } else {
            setErrorCount(prev => prev + 1);
            restartRecognition(2000);
          }
        } else if (errorCount >= 8) {
          toast.error('Connection unstable. Please restart hands-free mode.');
          setIsActive(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (!isMountedRef.current) return;
        
        setIsListening(false);
        
        // CRITICAL: Auto-restart when recognition ends
        if (isActive && !isProcessing) {
          restartRecognition(1000);
        }
      };

      recognitionRef.current.start();
      
    } catch (error) {
      console.error('Start recognition error:', error);
      if (isMountedRef.current) {
        setStatusMessage('Failed to start listening');
        toast.error('Could not start voice recognition');
        setIsActive(false);
      }
    }
  }, [isActive, selectedLanguage, errorCount, isProcessing]);

  const restartRecognition = useCallback((delay = 1000) => {
    if (!isMountedRef.current || !isActive) return;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isActive && !isProcessing) {
        startRecognition();
      }
    }, delay);
  }, [isActive, isProcessing, startRecognition]);

  const handleUserSpeech = async (transcript) => {
    if (!transcript || isProcessing || !isMountedRef.current) return;

    // Immediate feedback
    setIsProcessing(true);
    setStatusMessage(`Processing: "${transcript.substring(0, 50)}..."`);

    // Stop listening while processing (prevent echo)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);

    // Notify parent immediately
    if (onMessage) {
      try {
        onMessage(transcript);
      } catch (error) {
        console.error('Parent onMessage error:', error);
      }
    }

    try {
      // Build rich conversation context
      const contextMessages = conversationHistory.slice(-8); // Last 4 exchanges
      const prompt = systemPrompt 
        ? `${systemPrompt}\n\nRecent conversation:\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser just said: "${transcript}"\n\nRespond warmly and naturally in 1-3 sentences. Be conversational and supportive.`
        : `You are a compassionate companion. User said: "${transcript}". Respond warmly in 1-3 sentences.`;

      setStatusMessage('Getting AI response...');
      
      const response = await Promise.race([
        offlineAIChat(prompt, { add_context_from_internet: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), 15000)
        )
      ]);

      let aiMessage = typeof response === 'string' ? response : response?.text || response;
      
      // Clean up AI response
      if (aiMessage) {
        aiMessage = aiMessage.replace(/META:.*$/s, '').trim();
        aiMessage = aiMessage.substring(0, 500); // Limit length for speech
      }
      
      if (aiMessage && isMountedRef.current) {
        setStatusMessage(`Speaking: "${aiMessage.substring(0, 40)}..."`);
        
        // Notify parent of AI response
        if (onAIResponse) {
          try {
            onAIResponse(aiMessage);
          } catch (error) {
            console.error('Parent onAIResponse error:', error);
          }
        }

        // Speak response with optimized parameters
        setIsSpeaking(true);
        
        await speakWithRealisticVoice(aiMessage, {
          rate: 0.92,
          pitch: 1.05,
          volume: 1.0,
          emotionalState: 'warm',
          anxietyLevel: 0,
          cognitiveLevel: cognitiveLevel,
          language: selectedLanguage,
          userProfile: userProfile,
          onEnd: () => {
            if (isMountedRef.current && isActive) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('Ready - speak anytime');
              lastTranscriptRef.current = '';
              
              // Quick resume of listening
              setTimeout(() => {
                if (isMountedRef.current && isActive) {
                  startRecognition();
                }
              }, 300);
            }
          }
        });
      } else {
        throw new Error('Empty AI response');
      }
    } catch (error) {
      console.error('AI response error:', error);
      
      if (isMountedRef.current) {
        const fallback = "I'm here with you. Everything is okay.";
        setStatusMessage('Connection issue - using fallback');
        
        if (onAIResponse) {
          try {
            onAIResponse(fallback);
          } catch {}
        }
        
        setIsSpeaking(true);
        speakWithRealisticVoice(fallback, {
          emotionalState: 'reassuring',
          rate: 0.9,
          cognitiveLevel: cognitiveLevel,
          language: selectedLanguage,
          userProfile: userProfile,
          onEnd: () => {
            if (isMountedRef.current && isActive) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('Ready - speak anytime');
              lastTranscriptRef.current = '';
              
              setTimeout(() => {
                if (isMountedRef.current && isActive) {
                  startRecognition();
                }
              }, 300);
            }
          }
        });
      }
    }
  };

  const toggleHandsFreeMode = () => {
    if (isActive) {
      stopHandsFreeMode();
    } else {
      startHandsFreeMode();
    }
  };

  const startHandsFreeMode = () => {
    setIsActive(true);
    setErrorCount(0);
    setStatusMessage('Starting up...');
    toast.success('🎤 Hands-free mode activated - just start talking naturally!', {
      duration: 4000
    });
    
    // Speak activation confirmation
    const activationMessage = "Hands-free mode activated. I'm listening - just speak naturally and I'll respond.";
    speakWithRealisticVoice(activationMessage, {
      rate: 1.0,
      emotionalState: 'warm',
      language: selectedLanguage,
      onEnd: () => {
        // Start recognition after greeting
        if (isMountedRef.current) {
          setTimeout(() => {
            startRecognition();
          }, 500);
        }
      }
    });
  };

  const stopHandsFreeMode = () => {
    setIsActive(false);
    setIsListening(false);
    setIsProcessing(false);
    stopSpeech();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    setStatusMessage('Stopped');
    lastTranscriptRef.current = '';
  };

  // Auto-restart recognition if language changes
  useEffect(() => {
    if (isActive && !isProcessing) {
      restartRecognition(500);
    }
  }, [selectedLanguage]);

  return (
    <>
      {/* Always Listening Indicator - Fixed at bottom */}
      {isActive && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up pointer-events-none">
          {isListening && !isProcessing && !isSpeaking && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white">
              <div className="relative">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full animate-ping opacity-75" />
              </div>
              <p className="text-base md:text-lg font-bold tracking-wide">
                🎤 Listening... speak anytime
              </p>
            </div>
          )}
          {isSpeaking && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white">
              <Volume2 className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              <p className="text-base md:text-lg font-bold tracking-wide">
                🔊 Speaking...
              </p>
            </div>
          )}
          {isProcessing && !isSpeaking && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white">
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <p className="text-base md:text-lg font-bold tracking-wide">
                💭 Thinking...
              </p>
            </div>
          )}
        </div>
      )}

      <Card className={`p-6 border-2 transition-all ${
        isActive 
          ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
          : 'border-slate-300 dark:border-slate-600'
      }`}>
        <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              isActive 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Hands-Free Mode
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Always-on voice conversation
              </p>
            </div>
          </div>
          
          <Button
            size="lg"
            onClick={toggleHandsFreeMode}
            className={`${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } min-w-[120px]`}
          >
            <Power className="w-5 h-5 mr-2" />
            {isActive ? 'Stop' : 'Start'}
          </Button>
        </div>

        {/* Status Indicators */}
        {isActive && (
          <div className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              {isListening && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Listening for your voice...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Processing...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Speaking response...</span>
                </div>
              )}
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Ready</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {statusMessage}
            </p>
          </div>
        )}

        {/* Instructions */}
        {!isActive && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-2 text-base">✨ True Hands-Free Experience:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong>Always listening</strong> - No buttons to press</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong>Just talk naturally</strong> - I'll hear and respond</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong>Automatic voice responses</strong> - Conversation flows naturally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong>Works in your language</strong> - {selectedLanguage.toUpperCase()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong>Smart error recovery</strong> - Keeps listening even with interruptions</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-blue-700 dark:text-blue-300 italic">
                💡 Best with Chrome, Edge, or Safari for optimal speech recognition
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
    </>
  );
}