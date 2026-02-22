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
  const speechEndTimeoutRef = useRef(null);
  const isRestartingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupAllResources();
    };
  }, []);

  const langMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
    pt: 'pt-PT', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA',
    hi: 'hi-IN', ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR',
    vi: 'vi-VN', th: 'th-TH', sv: 'sv-SE', no: 'nb-NO', da: 'da-DK'
  };

  const cleanupAllResources = useCallback(() => {
    // Stop speech
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } catch {}

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    
    // Clear all timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (speechEndTimeoutRef.current) {
      clearTimeout(speechEndTimeoutRef.current);
      speechEndTimeoutRef.current = null;
    }

    isRestartingRef.current = false;
  }, []);

  const startRecognition = useCallback(async () => {
    if (!isMountedRef.current || !isActive || isRestartingRef.current) {
      console.log('⏹️ Cannot start - mounted:', isMountedRef.current, 'active:', isActive, 'restarting:', isRestartingRef.current);
      return;
    }

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice not supported. Please use Chrome, Edge, or Safari.');
      setIsActive(false);
      return;
    }

    try {
      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
        console.log('✅ Mic permission granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error('❌ Mic permission denied');
        toast.error('Please allow microphone access', { duration: 5000 });
        setIsActive(false);
        setStatusMessage('Microphone access required');
        return;
      }

      // Stop existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.stop();
        } catch {}
      }

      // Create new recognition instance
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 3;
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';

      // ON START
      recognitionRef.current.onstart = () => {
        console.log('✅ VOICE RECOGNITION ACTIVE - Always listening for your voice');
        if (!isMountedRef.current) return;
        setIsListening(true);
        setStatusMessage('🎤 Always listening - speak anytime');
        setErrorCount(0);
      };

      // ON RESULT
      recognitionRef.current.onresult = (event) => {
        if (!isMountedRef.current || !isActive) {
          console.log('⏹️ Ignoring - not mounted or not active');
          return;
        }

        if (isSpeaking) {
          console.log('🔇 Ignoring - AI is speaking');
          return;
        }

        if (isProcessing) {
          console.log('⏳ Ignoring - still processing previous input');
          return;
        }

        // Clear speech end timeout
        if (speechEndTimeoutRef.current) {
          clearTimeout(speechEndTimeoutRef.current);
          speechEndTimeoutRef.current = null;
        }

        try {
          let finalText = '';
          let interimText = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcript + ' ';
            } else {
              interimText += transcript + ' ';
            }
          }
          
          const completeSpeech = (finalText + interimText).trim();
          
          if (completeSpeech.length > 0) {
            console.log('📝 Hearing:', completeSpeech.substring(0, 60));
            setStatusMessage(`👂 "${completeSpeech.substring(0, 50)}..."`);
          }
          
          // Wait for user to finish speaking (1.5s silence = done speaking)
          speechEndTimeoutRef.current = setTimeout(() => {
            const finalSpeech = (finalText + interimText).trim();
            
            if (finalSpeech.length > 3 && isMountedRef.current && isActive && !isSpeaking && !isProcessing) {
              console.log('✅ USER FINISHED SPEAKING - Processing:', finalSpeech);
              
              // Prevent duplicates
              if (finalSpeech.toLowerCase() !== lastTranscriptRef.current.toLowerCase()) {
                lastTranscriptRef.current = finalSpeech;
                handleUserSpeech(finalSpeech);
              } else {
                console.log('🚫 Duplicate detected - ignored');
              }
            } else if (isSpeaking) {
              console.log('🔇 AI is speaking - ignoring input');
            } else if (isProcessing) {
              console.log('⏳ Still processing - ignoring new input');
            }
            
            speechEndTimeoutRef.current = null;
          }, 1500);
          
        } catch (error) {
          console.error('Result error:', error);
        }
      };

      // ON ERROR
      recognitionRef.current.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (!isMountedRef.current) return;

        // Critical errors - stop completely
        if (['audio-capture', 'not-allowed', 'service-not-allowed'].includes(event.error)) {
          toast.error('Microphone error - please check settings', { duration: 5000 });
          setIsActive(false);
          return;
        }

        // Recoverable errors - auto-restart
        if (event.error === 'no-speech') {
          console.log('No speech - continuing...');
          restartRecognition(1000);
          return;
        }

        // Network/abort - restart
        if (['network', 'aborted'].includes(event.error)) {
          restartRecognition(1000);
          return;
        }

        // Too many errors - stop
        if (errorCount >= 8) {
          toast.error('Connection unstable. Please restart.');
          setIsActive(false);
        } else {
          setErrorCount(prev => prev + 1);
          restartRecognition(2000);
        }
      };

      // ON END
      recognitionRef.current.onend = () => {
        console.log('⚠️ Recognition ended - auto-restarting for continuous listening');
        if (!isMountedRef.current) return;
        
        setIsListening(false);
        
        // CRITICAL: Always auto-restart for true hands-free (unless processing/speaking)
        if (isActive && !isRestartingRef.current) {
          if (isSpeaking) {
            console.log('🔇 AI speaking - will restart after speech ends');
          } else if (isProcessing) {
            console.log('⏳ Processing - will restart after response');
          } else {
            console.log('🔄 IMMEDIATE AUTO-RESTART for continuous listening');
            restartRecognition(300);
          }
        }
      };

      // START
      console.log('▶️ Starting recognition...');
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('Start error:', error);
      if (isMountedRef.current) {
        toast.error('Could not start voice recognition');
        setIsActive(false);
      }
    }
  }, [isActive, selectedLanguage, errorCount, isProcessing, isSpeaking]);

  const restartRecognition = useCallback((delay = 500) => {
    if (!isMountedRef.current || !isActive || isRestartingRef.current) return;
    
    isRestartingRef.current = true;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    console.log(`⏰ Restart in ${delay}ms`);
    restartTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isActive && !isProcessing && !isSpeaking) {
        isRestartingRef.current = false;
        startRecognition();
      } else {
        isRestartingRef.current = false;
      }
    }, delay);
  }, [isActive, isProcessing, isSpeaking, startRecognition]);

  const handleUserSpeech = useCallback(async (transcript) => {
    if (!transcript || isProcessing || isSpeaking || !isMountedRef.current) {
      console.log('⚠️ Cannot process - already busy or invalid state');
      return;
    }

    console.log('🎯 PROCESSING USER SPEECH:', transcript);

    // STOP listening while processing (prevent echo and duplicate input)
    setIsProcessing(true);
    setStatusMessage(`💭 Thinking about: "${transcript.substring(0, 30)}..."`);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    // Notify parent
    if (onMessage) {
      try {
        onMessage(transcript);
      } catch {}
    }

    try {
      // Build prompt
      const contextMessages = conversationHistory.slice(-6);
      const prompt = systemPrompt 
        ? `${systemPrompt}\n\nRecent:\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: "${transcript}"\n\nRespond warmly in 1-2 sentences.`
        : `Compassionate companion. User: "${transcript}". Respond warmly in 1-2 sentences.`;

      setStatusMessage('🤖 Getting response...');
      
      const response = await Promise.race([
        offlineAIChat(prompt, { add_context_from_internet: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);

      let aiMessage = typeof response === 'string' ? response : response?.text || response;
      
      if (aiMessage) {
        aiMessage = aiMessage.replace(/META:.*$/s, '').trim().substring(0, 500);
      }
      
      if (!aiMessage) throw new Error('Empty response');
      
      if (isMountedRef.current) {
        console.log('🔊 Speaking...');
        setStatusMessage(`🔊 Speaking...`);
        
        if (onAIResponse) {
          try {
            onAIResponse(aiMessage);
          } catch {}
        }

        // SPEAK (recognition stays OFF)
        setIsSpeaking(true);
        
        await speakWithRealisticVoice(aiMessage, {
          rate: 0.92,
          pitch: 1.05,
          volume: 1.0,
          emotionalState: 'warm',
          cognitiveLevel: cognitiveLevel,
          language: selectedLanguage,
          userProfile: userProfile,
          onEnd: () => {
            console.log('✅ AI FINISHED SPEAKING');
            if (isMountedRef.current && isActive) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('✅ Ready - Listening...');
              lastTranscriptRef.current = '';
              
              // CRITICAL: ALWAYS resume listening after AI stops (true hands-free)
              setTimeout(() => {
                if (isMountedRef.current && isActive && !isSpeaking && !isProcessing) {
                  console.log('🔄 RESUMING CONTINUOUS LISTENING - ready for next input');
                  startRecognition();
                } else {
                  console.log('⚠️ Cannot resume yet - will retry. State:', {
                    mounted: isMountedRef.current,
                    active: isActive,
                    speaking: isSpeaking,
                    processing: isProcessing
                  });
                  // Retry in case of race condition
                  setTimeout(() => {
                    if (isMountedRef.current && isActive && !isSpeaking && !isProcessing) {
                      console.log('🔄 RETRY: Starting recognition');
                      startRecognition();
                    }
                  }, 500);
                }
              }, 500);
            }
          }
        });
      }
    } catch (error) {
      console.error('AI error:', error.message);
      
      if (isMountedRef.current) {
        const fallback = "I'm here with you.";
        setStatusMessage('Using backup');
        
        if (onAIResponse) {
          try {
            onAIResponse(fallback);
          } catch {}
        }
        
        setIsSpeaking(true);
        speakWithRealisticVoice(fallback, {
          emotionalState: 'reassuring',
          rate: 0.9,
          language: selectedLanguage,
          onEnd: () => {
            console.log('✅ Fallback speech done');
            if (isMountedRef.current && isActive) {
              setIsSpeaking(false);
              setIsProcessing(false);
              lastTranscriptRef.current = '';
              
              setTimeout(() => {
                if (isMountedRef.current && isActive && !isSpeaking && !isProcessing) {
                  console.log('🔄 Resuming after fallback');
                  startRecognition();
                }
              }, 500);
            }
          }
        });
      }
    }
  }, [isActive, onMessage, onAIResponse, systemPrompt, conversationHistory, cognitiveLevel, selectedLanguage, userProfile, isProcessing, startRecognition]);

  const startHandsFreeMode = async () => {
    console.log('🚀 START HANDS-FREE MODE - FULLY AUTOMATIC');
    setIsActive(true);
    setErrorCount(0);
    setStatusMessage('Activating continuous listening...');
    lastTranscriptRef.current = '';
    
    toast.success('🎤 Hands-free ON - Always listening!', { duration: 3000 });
    
    setIsSpeaking(true);
    const greeting = "Hands-free mode is now active. I'm always listening and will respond when you speak.";
    speakWithRealisticVoice(greeting, {
      rate: 1.0,
      emotionalState: 'warm',
      language: selectedLanguage,
      onEnd: () => {
        console.log('✅ Greeting done - starting CONTINUOUS listening');
        setIsSpeaking(false);
        if (isMountedRef.current) {
          setTimeout(() => {
            console.log('▶️ LAUNCHING continuous voice recognition');
            startRecognition();
          }, 500);
        }
      }
    });
  };

  const stopHandsFreeMode = () => {
    console.log('🛑 STOP HANDS-FREE');
    setIsActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setStatusMessage('Stopped');
    setErrorCount(0);
    lastTranscriptRef.current = '';
    
    cleanupAllResources();
    toast.success('Stopped', { duration: 2000 });
  };

  const toggleHandsFreeMode = () => {
    if (isActive) {
      stopHandsFreeMode();
    } else {
      startHandsFreeMode();
    }
  };

  return (
    <>
      {/* Floating Status Indicator */}
      {isActive && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          {isListening && !isProcessing && !isSpeaking && (
            <div className="bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-white">
              <div className="relative">
                <div className="w-5 h-5 bg-white rounded-full animate-pulse" />
                <div className="absolute inset-0 w-5 h-5 bg-white rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <p className="text-lg font-bold">🎤 LISTENING</p>
                <p className="text-xs opacity-90">Speak now</p>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="bg-blue-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-white">
              <Volume2 className="w-6 h-6 animate-pulse" />
              <div>
                <p className="text-lg font-bold">🔊 SPEAKING</p>
                <p className="text-xs opacity-90">Please wait</p>
              </div>
            </div>
          )}
          {isProcessing && !isSpeaking && (
            <div className="bg-purple-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <div>
                <p className="text-lg font-bold">💭 THINKING</p>
                <p className="text-xs opacity-90">Processing</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Card className={`p-6 border-2 ${isActive ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-xl' : 'border-slate-300'}`}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}>
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hands-Free Mode</h3>
                <p className="text-sm text-slate-600">{isActive ? '✨ Always listening' : 'Press Start'}</p>
              </div>
            </div>
            
            <Button
              size="lg"
              onClick={toggleHandsFreeMode}
              className={`${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} min-w-[120px] font-bold`}
            >
              <Power className="w-5 h-5 mr-2" />
              {isActive ? 'STOP' : 'START'}
            </Button>
          </div>

          {/* Status */}
          {isActive && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {isListening && !isProcessing && !isSpeaking && (
                  <>
                    <Mic className="w-6 h-6 text-green-600 animate-pulse" />
                    <span className="font-bold text-green-600">LISTENING</span>
                  </>
                )}
                {isProcessing && !isSpeaking && (
                  <>
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                    <span className="font-bold text-purple-600">PROCESSING</span>
                  </>
                )}
                {isSpeaking && (
                  <>
                    <Volume2 className="w-6 h-6 text-blue-600 animate-pulse" />
                    <span className="font-bold text-blue-600">SPEAKING</span>
                  </>
                )}
                {!isListening && !isProcessing && !isSpeaking && (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="font-bold text-green-600">READY</span>
                  </>
                )}
              </div>
              
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm font-medium">{statusMessage}</p>
              </div>
              
              {errorCount > 0 && errorCount < 8 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">⚠️ Connection issues ({errorCount}/8) - recovering...</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!isActive && (
            <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border-2 border-blue-300">
              <div className="flex gap-4">
                <AlertCircle className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-lg mb-3">🎤 100% Hands-Free Healthcare Voice</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Always Listening</strong> - No buttons, just speak</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Instant Response</strong> - AI answers immediately</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Echo Prevention</strong> - Won't hear itself</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Auto-Recovery</strong> - Never stops working</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Healthcare Grade</strong> - Built for reliability</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-xs font-medium">💡 Use Chrome or Edge for best results</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}