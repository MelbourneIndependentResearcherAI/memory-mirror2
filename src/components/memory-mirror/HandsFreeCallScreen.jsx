import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, MicOff, Phone, Volume2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice } from './voiceUtils';
import { useQuery } from '@tanstack/react-query';
import { getOfflineResponse, cacheOfflineResponse } from '../utils/offlineManager';

const emergencyPrompt = `You are an empathetic emergency operator specially trained in dementia care. The person you're speaking with may be confused, scared, or disoriented.

RESPONSE RULES:
- Keep under 40 words
- Be warm, patient, reassuring
- Use simple, clear language
- Validate their concerns
- Never correct or contradict
- Focus on emotional safety

Respond naturally and compassionately.`;

export default function HandsFreeCallScreen({ phoneNumber, contactName, onEndCall }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [detectionTimeout, setDetectionTimeout] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const recognitionRef = useRef(null);
  const _speechSynthesisRef = useRef(null);

  // Check offline support data
  const { data: _offlineResponses = {} } = useQuery({
    queryKey: ['offlineResponses'],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem('offlineResponses');
        return stored ? JSON.parse(stored) : {};
      } catch (_e) {
        return {};
      }
    },
  });

  // Initialize connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      const greeting = "Hello, this is your emergency support operator. I'm here to help you. Can you tell me what's going on?";
      setMessages([{ role: 'assistant', content: greeting }]);
      setConversationHistory([{ role: 'assistant', content: greeting }]);
      speakMessage(greeting);
      setTimeout(() => startListening(), 2000);
    }, 1500);

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if (recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }

      if (event.results[event.results.length - 1].isFinal) {
        handleUserSpeech(transcript.trim());
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    initializeSpeechRecognition();
    if (recognitionRef.current && isConnected) {
      recognitionRef.current.start();
      // Auto-stop after 10 seconds of listening
      const timeout = setTimeout(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 10000);
      setDetectionTimeout(timeout);
    }
  };

  const handleUserSpeech = async (transcript) => {
    if (!transcript.trim() || isLoading) return;

    // Clear timeout and add message
    if (detectionTimeout) clearTimeout(detectionTimeout);
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);
    setIsLoading(true);

    const newHistory = [...conversationHistory, { role: 'user', content: transcript }];
    setConversationHistory(newHistory);

    try {
      let operatorMessage = '';

      if (isOnline()) {
        // Use API response
        try {
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `${emergencyPrompt}\n\nConversation:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nRespond warmly.`,
          });
          operatorMessage = typeof response === 'string' ? response : "I'm here with you. Everything is going to be okay.";

          // Cache for offline use
          await cacheOfflineResponse(transcript, operatorMessage);
        } catch (error) {
          console.error('API error, falling back to offline:', error);
          const offlineResponse = await getOfflineResponse(transcript);
          operatorMessage = offlineResponse.text;
        }
      } else {
        // Use offline responses
        const offlineResponse = await getOfflineResponse(transcript);
        operatorMessage = offlineResponse.text;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: operatorMessage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: operatorMessage }]);

      await speakMessage(operatorMessage);

      // Resume listening after response
      setTimeout(() => startListening(), 500);
    } catch (error) {
      console.error('Error:', error);
      const fallback = "I'm here with you. You're safe.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      await speakMessage(fallback);
      setTimeout(() => startListening(), 500);
    }

    setIsLoading(false);
  };

  const speakMessage = async (text) => {
    return new Promise((resolve) => {
      setIsSpeaking(true);
      speakWithRealisticVoice(text, {
        rate: 0.85,
        pitch: 0.98,
        volume: 1.0,
        onEnd: () => {
          setIsSpeaking(false);
          resolve();
        }
      });
    });
  };

  const handleEndCall = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    speechSynthesis.cancel();
    onEndCall();
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-8 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-black dark:to-slate-950">
      <div className="text-center flex-1 flex flex-col items-center justify-center w-full px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-5xl mb-8 shadow-2xl border-4 border-slate-500/50"
        >
          {contactName ? contactName[0].toUpperCase() : '👤'}
        </motion.div>
        
        <h2 className="text-3xl font-semibold mb-2 text-white">{contactName || 'Emergency Operator'}</h2>
        <p className="text-slate-400 text-lg mb-2">{phoneNumber}</p>

        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-amber-400 mb-6 text-sm bg-amber-900/30 px-4 py-2 rounded-full border border-amber-600/50"
          >
            <AlertTriangle className="w-4 h-4" />
            Offline Mode (Pre-cached responses)
          </motion.div>
        )}

        {isConnected && (
          <>
            {/* Listening Status */}
            <div className="mb-8">
              <motion.div
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
                className="flex flex-col items-center gap-3"
              >
                {isListening && (
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scaleY: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="w-1 h-12 bg-emerald-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scaleY: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                      className="w-1 h-12 bg-emerald-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scaleY: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1 h-12 bg-emerald-400 rounded-full"
                    />
                  </div>
                )}

                <p className={`text-lg font-semibold ${
                  isListening ? 'text-emerald-400' :
                  isSpeaking ? 'text-cyan-400' :
                  isLoading ? 'text-amber-400' :
                  'text-green-400'
                }`}>
                  {isListening ? '🎤 Listening...' :
                   isSpeaking ? '🔊 Speaking...' :
                   isLoading ? '⏳ Processing...' :
                   '✓ Ready'}
                </p>
              </motion.div>
            </div>

            {/* Conversation Display */}
            <div className="bg-slate-800/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl p-5 max-w-2xl w-full space-y-4 max-h-64 overflow-y-auto border border-slate-700/50 mb-8">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    msg.role === 'user'
                      ? 'bg-slate-700 dark:bg-slate-800 text-white ml-8'
                      : 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-100 mr-8'
                  } rounded-2xl p-4 text-sm shadow-lg`}
                >
                  <p className="font-semibold mb-1 text-xs opacity-80 uppercase tracking-wide">
                    {msg.role === 'user' ? 'You' : 'Operator'}
                  </p>
                  <p className="leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-4 text-sm shadow-lg mr-8"
                >
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="italic">Operator is responding...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-8">
              <motion.button
                onClick={() => {
                  if (isListening) {
                    if (recognitionRef.current) recognitionRef.current.stop();
                  } else {
                    startListening();
                  }
                }}
                disabled={isSpeaking || isLoading}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all border-2 ${
                  isListening
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 hover:from-blue-600 hover:to-blue-700'
                } disabled:opacity-50`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>

              {isSpeaking && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-cyan-400 flex items-center justify-center text-white"
                >
                  <Volume2 className="w-6 h-6" />
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      <motion.button
        onClick={handleEndCall}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-16 py-6 rounded-full text-lg font-semibold shadow-2xl transition-all min-h-[64px] border-2 border-red-400"
      >
        <Phone className="w-5 h-5 inline mr-2" />
        End Call
      </motion.button>
    </div>
  );
}