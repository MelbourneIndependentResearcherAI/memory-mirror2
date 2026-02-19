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

  const startRecognition = useCallback(async () => {
    if (!isMountedRef.current || !isActive) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported. Please use Chrome, Edge, or Safari.');
      setIsActive(false);
      return;
    }

    try {
      // CRITICAL: Request microphone permission with ENHANCED settings for soft voices
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,  // CRITICAL: Auto-boosts soft/quiet voices
            channelCount: 1,
            sampleRate: 48000,      // Higher quality capture
            sampleSize: 16,
            volume: 1.0
          }
        });
        console.log('✅ Microphone access granted with ENHANCED sensitivity for soft voices');
        // Close stream - we just needed permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error('❌ Microphone permission denied:', permError);
        toast.error('🎤 Please allow microphone access to use hands-free mode');
        setIsActive(false);
        setStatusMessage('Microphone access required');
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // CRITICAL: MAXIMUM sensitivity for soft/quiet voices
      recognitionRef.current.continuous = true;          // Always listening
      recognitionRef.current.interimResults = true;      // Show what's being heard
      recognitionRef.current.maxAlternatives = 3;        // More options = better soft voice detection
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
      
      // Enable browser-specific audio enhancements
      if (recognitionRef.current.audioTrack !== undefined) {
        recognitionRef.current.audioTrack = true;
      }
      
      console.log('🎤 Starting ENHANCED speech recognition (soft voice optimized) with language:', langMap[selectedLanguage] || 'en-US');
      


      recognitionRef.current.onstart = () => {
        console.log('✅ Speech recognition STARTED successfully');
        if (isMountedRef.current) {
          setIsListening(true);
          setStatusMessage('🎤 Listening - speak now!');
          setErrorCount(0);
          toast.success('👂 I can hear you now - just speak naturally!', { duration: 2000 });
        }
      };

      let fullTranscript = '';
      let speechEndTimeoutLocal = null;

      recognitionRef.current.onresult = (event) => {
        if (!isMountedRef.current || !isActive) return;

        // Clear silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Clear speech end timeout
        if (speechEndTimeoutLocal) {
          clearTimeout(speechEndTimeoutLocal);
        }

        try {
          // Build COMPLETE transcript from ALL results
          let interimText = '';
          let finalText = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalText += transcript + ' ';
            } else {
              interimText += transcript + ' ';
            }
          }
          
          const completeSpeech = (finalText + interimText).trim();
          
          console.log('🎤 Capturing:', completeSpeech.substring(0, 80));
          
          // Show what's being heard in real-time
          if (completeSpeech.length > 0) {
            setStatusMessage(`👂 Hearing: "${completeSpeech.substring(0, 60)}..."`);
          }
          
          // Wait for user to FINISH speaking (2 second pause after last word)
          speechEndTimeoutLocal = setTimeout(() => {
            const finalSpeech = (finalText + interimText).trim();
            
            if (finalSpeech.length > 3 && isMountedRef.current && isActive) {
              console.log('✅ COMPLETE SENTENCE:', finalSpeech);
              
              // Avoid duplicate processing
              const normalized = finalSpeech.toLowerCase();
              if (normalized === lastTranscriptRef.current.toLowerCase()) {
                console.log('⚠️ Duplicate, skipping');
                return;
              }
              
              lastTranscriptRef.current = finalSpeech;
              setStatusMessage(`✅ Heard: "${finalSpeech.substring(0, 60)}"`);
              handleUserSpeech(finalSpeech);
            }
          }, 2000);
          
        } catch (error) {
          console.error('❌ Recognition result error:', error);
        }

        // Set silence timeout to restart if no speech detected
        silenceTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isActive && !isProcessing && !isSpeaking) {
            console.log('⏱️ Silence timeout - ensuring still listening...');
            setStatusMessage('👂 Ready - speak anytime');
          }
        }, 10000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        if (!isMountedRef.current) return;

        const errorMessages = {
          'no-speech': '👂 Listening... (no speech detected yet)',
          'audio-capture': '❌ Microphone not available - check device settings',
          'not-allowed': '❌ Microphone permission denied - please enable in browser settings',
          'network': '⚠️ Network error - working offline',
          'aborted': '🔄 Restarting listener...',
          'service-not-allowed': '❌ Speech service not allowed',
          'language-not-supported': '⚠️ Language not supported, using English'
        };

        const errorMessage = errorMessages[event.error] || `Error: ${event.error}`;
        console.log('Error message:', errorMessage);

        // Only show user-facing errors for critical issues
        if (['audio-capture', 'not-allowed', 'service-not-allowed'].includes(event.error)) {
          console.error('🚨 CRITICAL ERROR:', event.error);
          toast.error(errorMessage, { duration: 5000 });
          setStatusMessage(errorMessage);
          setIsActive(false);
          setErrorCount(prev => prev + 1);
          return;
        }

        // Handle recoverable errors silently
        if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, continuing to listen...');
          setStatusMessage('👂 Listening for your voice...');
          restartRecognition(1000);
          return;
        }

        if (event.error === 'language-not-supported') {
          console.log('⚠️ Language not supported, switching to English');
          setStatusMessage('Using English...');
          restartRecognition(1500);
          return;
        }

        // Auto-restart on other recoverable errors
        if (isActive && errorCount < 10) {
          console.log(`🔄 Recoverable error ${errorCount + 1}/10, restarting...`);
          if (['aborted', 'network'].includes(event.error)) {
            setStatusMessage(errorMessage);
            restartRecognition(1500);
          } else {
            setErrorCount(prev => prev + 1);
            restartRecognition(2000);
          }
        } else if (errorCount >= 10) {
          console.error('🚨 Too many errors, stopping');
          toast.error('Connection unstable. Please restart hands-free mode.');
          setIsActive(false);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended');
        if (!isMountedRef.current) return;
        
        setIsListening(false);
        
        // CRITICAL: Auto-restart when recognition ends (only if not processing or speaking)
        if (isActive && !isProcessing && !isSpeaking) {
          console.log('🔄 Auto-restarting recognition in 800ms...');
          restartRecognition(800);
        } else {
          console.log('⏹️ Not restarting - isActive:', isActive, 'isProcessing:', isProcessing, 'isSpeaking:', isSpeaking);
        }
      };

      console.log('▶️ Attempting to START speech recognition...');
      recognitionRef.current.start();
      console.log('✅ Speech recognition start() called successfully');
      
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
    if (!isMountedRef.current || !isActive) {
      console.log('⏹️ Skipping restart - mounted:', isMountedRef.current, 'active:', isActive);
      return;
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    console.log(`⏰ Scheduling restart in ${delay}ms...`);
    restartTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isActive && !isProcessing && !isSpeaking) {
        console.log('🔄 Executing scheduled restart');
        startRecognition();
      } else {
        console.log('⏹️ Restart cancelled - mounted:', isMountedRef.current, 'active:', isActive, 'processing:', isProcessing, 'speaking:', isSpeaking);
      }
    }, delay);
  }, [isActive, isProcessing, isSpeaking, startRecognition]);

  const handleUserSpeech = useCallback(async (transcript) => {
    if (!transcript || isProcessing || !isMountedRef.current) {
      console.log('⚠️ Skipping handleUserSpeech:', { 
        hasTranscript: !!transcript, 
        isProcessing, 
        isMounted: isMountedRef.current 
      });
      return;
    }

    console.log('🎯 HANDLING USER SPEECH:', transcript);

    // Immediate feedback
    setIsProcessing(true);
    setStatusMessage(`💭 Processing: "${transcript.substring(0, 50)}..."`);
    toast.success(`Heard: "${transcript.substring(0, 40)}..."`, { duration: 2000 });

    // Stop listening while processing (prevent echo)
    if (recognitionRef.current) {
      try {
        console.log('⏸️ Pausing recognition during processing');
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Stop error (safe):', e.message);
      }
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
        ? `${systemPrompt}\n\nRecent conversation:\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser just said: "${transcript}"\n\nRespond warmly and naturally in 1-3 short sentences. Be conversational and supportive. Keep it brief.`
        : `You are a compassionate companion. User said: "${transcript}". Respond warmly in 1-2 short sentences.`;

      setStatusMessage('🤖 Getting AI response...');
      console.log('📤 Sending to AI:', transcript.substring(0, 50));
      
      const response = await Promise.race([
        offlineAIChat(prompt, { add_context_from_internet: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), 20000)
        )
      ]);

      console.log('✅ AI response received:', typeof response, response);

      let aiMessage = typeof response === 'string' ? response : response?.text || response;
      
      // Clean up AI response
      if (aiMessage) {
        aiMessage = aiMessage.replace(/META:.*$/s, '').trim();
        aiMessage = aiMessage.substring(0, 600); // Limit length for speech
        console.log('✅ Cleaned AI message:', aiMessage.substring(0, 100));
      } else {
        console.error('❌ No AI message extracted from response');
      }
      
      if (aiMessage && isMountedRef.current) {
        console.log('🔊 Preparing to speak response');
        setStatusMessage(`🔊 Speaking: "${aiMessage.substring(0, 40)}..."`);
        
        // Notify parent of AI response FIRST
        if (onAIResponse) {
          try {
            console.log('📤 Notifying parent of AI response');
            onAIResponse(aiMessage);
          } catch (error) {
            console.error('❌ Parent onAIResponse error:', error);
          }
        }

        // Speak response with optimized parameters
        setIsSpeaking(true);
        console.log('🗣️ Starting speech synthesis...');
        
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
            console.log('✅ Speech ended, preparing to resume listening');
            if (isMountedRef.current && isActive) {
              setIsSpeaking(false);
              setIsProcessing(false);
              setStatusMessage('✅ Ready - speak anytime');
              lastTranscriptRef.current = '';
              
              // Quick resume of listening
              setTimeout(() => {
                if (isMountedRef.current && isActive && !isSpeaking) {
                  console.log('🔄 Resuming listening after AI response');
                  startRecognition();
                }
              }, 500);
            }
          }
        });
        console.log('✅ Speech synthesis initiated');
      } else {
        console.error('❌ No AI message to speak');
        throw new Error('Empty AI response');
      }
    } catch (error) {
      console.error('❌ AI response error:', error.message);
      
      if (isMountedRef.current) {
        const fallback = "I'm here with you. Everything is okay.";
        setStatusMessage('⚠️ Using backup response');
        console.log('🔄 Using fallback message');
        
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
                if (isMountedRef.current && isActive && !isSpeaking) {
                  console.log('🔄 Resuming listening after fallback');
                  startRecognition();
                }
              }, 500);
            }
          }
        });
      }
    }
  }, [isMountedRef, isActive, onMessage, onAIResponse, systemPrompt, conversationHistory, cognitiveLevel, userProfile, selectedLanguage, isProcessing]);

  const toggleHandsFreeMode = () => {
    if (isActive) {
      stopHandsFreeMode();
    } else {
      startHandsFreeMode();
    }
  };

  const startHandsFreeMode = async () => {
    console.log('🚀 STARTING HANDS-FREE MODE');
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
          console.log('🎤 Starting recognition after activation message...');
          setTimeout(() => {
            startRecognition();
          }, 500);
        }
      }
    });
  };

  const stopHandsFreeMode = () => {
    console.log('🛑 STOPPING HANDS-FREE MODE');
    setIsActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    stopSpeech();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error (safe):', e.message);
      }
      recognitionRef.current = null;
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    setStatusMessage('Stopped');
    setErrorCount(0);
    lastTranscriptRef.current = '';
    toast.success('Hands-free mode stopped', { duration: 2000 });
  };

  // Auto-restart recognition if language changes
  useEffect(() => {
    if (isActive && !isProcessing && !isSpeaking) {
      console.log('🌍 Language changed, restarting with new language:', selectedLanguage);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      restartRecognition(1000);
    }
  }, [selectedLanguage, isActive, isProcessing, isSpeaking, restartRecognition]);

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
              <div className="flex flex-col items-center">
                <p className="text-base md:text-lg font-bold tracking-wide">
                  🎤 Listening
                </p>
                <p className="text-xs opacity-90">Speak anytime</p>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white">
              <Volume2 className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              <div className="flex flex-col items-center">
                <p className="text-base md:text-lg font-bold tracking-wide">
                  🔊 Speaking
                </p>
                <p className="text-xs opacity-90">Please wait</p>
              </div>
            </div>
          )}
          {isProcessing && !isSpeaking && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white">
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <div className="flex flex-col items-center">
                <p className="text-base md:text-lg font-bold tracking-wide">
                  💭 Thinking
                </p>
                <p className="text-xs opacity-90">Processing your message</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Card className={`p-6 border-2 transition-all duration-300 ${
        isActive 
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg' 
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
      }`}>
        <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg animate-pulse' 
                : 'bg-slate-300 dark:bg-slate-700'
            }`}>
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Hands-Free Mode
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isActive ? '✨ Always-on voice conversation' : 'Tap Start to activate'}
              </p>
            </div>
          </div>
          
          <Button
            size="lg"
            onClick={toggleHandsFreeMode}
            className={`${
              isActive
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg'
            } min-w-[120px] font-semibold transition-all duration-300`}
          >
            <Power className="w-5 h-5 mr-2" />
            {isActive ? 'Stop' : 'Start'}
          </Button>
        </div>

        {/* Status Indicators */}
        {isActive && (
          <div className="flex flex-col gap-3 p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              {isListening && !isProcessing && !isSpeaking && (
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 animate-fade-in-up">
                  <div className="relative">
                    <Mic className="w-6 h-6 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                  </div>
                  <span className="font-semibold text-base">Listening for your voice...</span>
                </div>
              )}
              {isProcessing && !isSpeaking && (
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 animate-fade-in-up">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-semibold text-base">Processing your message...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 animate-fade-in-up">
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span className="font-semibold text-base">Speaking response...</span>
                </div>
              )}
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold text-base">Ready to listen</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {statusMessage}
              </p>
            </div>
            
            {errorCount > 0 && errorCount < 8 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ Minor connection issues detected ({errorCount}/10) - auto-recovering...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isActive && (
          <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-md">
            <AlertCircle className="w-7 h-7 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-bold mb-3 text-lg">✨ True Hands-Free Voice Experience</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Always listening</strong> - No buttons to press, just speak naturally</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Instant responses</strong> - AI hears you and responds with warm, human-like voice</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Natural conversation</strong> - Talk back-and-forth seamlessly</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Multi-language support</strong> - Currently set to {selectedLanguage.toUpperCase()}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Auto-recovery</strong> - Keeps working even with brief interruptions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 text-base">✓</span>
                  <span className="leading-relaxed"><strong>Privacy first</strong> - Everything stays on your device</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                  💡 <strong>Pro Tip:</strong> Use Chrome, Edge, or Safari for the best voice recognition experience
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
    </>
  );
}