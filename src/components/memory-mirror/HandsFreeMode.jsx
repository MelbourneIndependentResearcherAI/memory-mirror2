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
  conversationHistory = [] 
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
      toast.error('Voice recognition not supported in this browser');
      setIsActive(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // CRITICAL: Continuous listening
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';

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
          const transcript = event.results[resultIndex][0].transcript;
          const isFinal = event.results[resultIndex].isFinal;
          
          if (isFinal && transcript.trim()) {
            // Avoid duplicate processing
            if (transcript.trim() === lastTranscriptRef.current) return;
            lastTranscriptRef.current = transcript.trim();
            
            setStatusMessage(`You said: "${transcript}"`);
            handleUserSpeech(transcript.trim());
          }
        } catch (error) {
          console.error('Recognition result error:', error);
        }

        // Set silence timeout to restart if no speech detected
        silenceTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isActive && !isProcessing) {
            restartRecognition();
          }
        }, 10000); // 10 seconds of silence
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (!isMountedRef.current) return;

        const errorMessages = {
          'no-speech': 'No speech detected',
          'audio-capture': 'Microphone not available',
          'not-allowed': 'Microphone permission denied',
          'network': 'Network error',
          'aborted': 'Recognition aborted',
        };

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setStatusMessage(errorMessages[event.error] || 'Recognition error');
          setErrorCount(prev => prev + 1);
        }

        // Auto-restart on recoverable errors
        if (isActive && errorCount < 5) {
          if (['no-speech', 'aborted', 'network'].includes(event.error)) {
            restartRecognition(2000);
          } else if (event.error === 'audio-capture') {
            toast.error('Microphone issue. Please check your microphone.');
            setIsActive(false);
          }
        } else if (errorCount >= 5) {
          toast.error('Too many errors. Hands-free mode stopped.');
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

    setIsProcessing(true);
    setStatusMessage('Processing...');

    // Stop listening while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    // Notify parent
    if (onMessage) onMessage(transcript);

    try {
      // Build conversation context
      const contextMessages = conversationHistory.slice(-6); // Last 3 exchanges
      const prompt = systemPrompt 
        ? `${systemPrompt}\n\nConversation:\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${transcript}\n\nRespond naturally and briefly (1-2 sentences):`
        : transcript;

      const response = await offlineAIChat(prompt, {
        add_context_from_internet: false
      });

      const aiMessage = typeof response === 'string' ? response : response?.text || response;
      
      if (aiMessage && isMountedRef.current) {
        setStatusMessage('Speaking response...');
        
        // Notify parent
        if (onAIResponse) onAIResponse(aiMessage);

        // Speak response in selected language
        setIsSpeaking(true);
        speakWithRealisticVoice(aiMessage, {
          rate: 0.9,
          pitch: 1.05,
          volume: 1.0,
          emotionalState: 'warm',
          language: selectedLanguage,
          onEnd: () => {
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('Listening...');
              lastTranscriptRef.current = '';
              
              // Resume listening after speaking
              if (isActive) {
                setTimeout(() => {
                  startRecognition();
                }, 500);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('AI response error:', error);
      if (isMountedRef.current) {
        const fallback = "I'm here with you. Everything is okay.";
        setStatusMessage('Error - using fallback');
        
        if (onAIResponse) onAIResponse(fallback);
        
        setIsSpeaking(true);
        speakWithRealisticVoice(fallback, {
          language: selectedLanguage,
          onEnd: () => {
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('Listening...');
              lastTranscriptRef.current = '';
              if (isActive) {
                setTimeout(() => {
                  startRecognition();
                }, 500);
              }
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
    setStatusMessage('Activating...');
    toast.success('Hands-free mode activated - speak naturally');
    
    // Small delay before starting recognition
    setTimeout(() => {
      if (isMountedRef.current) {
        startRecognition();
      }
    }, 1000);
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
          <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Always listening - no button needed</li>
                <li>Just speak naturally, I'll respond</li>
                <li>AI speaks responses out loud automatically</li>
                <li>Works in your selected language</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}