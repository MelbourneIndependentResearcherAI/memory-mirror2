import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function WakeWordListener({ onWakeWordDetected, isActive }) {
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const recognitionRef = useRef(null);
  const isRestartingRef = useRef(false);

  useEffect(() => {
    if (!isActive || !isListening) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('❌ Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const startRecognition = () => {
      if (isRestartingRef.current) return;
      
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          console.log('✅ Wake word listening started');
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
            .toLowerCase();

          console.log('👂 Wake word check:', transcript.substring(0, 50));

          // Check for wake words with variations
          const wakeWords = [
            'memory mirror',
            'hey mirror', 
            'ok mirror',
            'hey memory',
            'okay mirror',
            'hi mirror'
          ];
          
          const detected = wakeWords.some(word => transcript.includes(word));
          
          if (detected) {
            console.log('🎯 WAKE WORD DETECTED!');
            setWakeWordDetected(true);

            // Speak confirmation
            const utterance = new SpeechSynthesisUtterance("I'm here. How can I help?");
            utterance.rate = 0.95;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);

            if (onWakeWordDetected) onWakeWordDetected();
            
            // Visual feedback
            setTimeout(() => setWakeWordDetected(false), 2000);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log('⚠️ Wake word error:', event.error);
          if (event.error === 'no-speech' || event.error === 'aborted') {
            // Restart after short delay
            if (isListening && !isRestartingRef.current) {
              isRestartingRef.current = true;
              setTimeout(() => {
                isRestartingRef.current = false;
                if (isListening) startRecognition();
              }, 1000);
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log('⏹️ Wake word ended');
          // Auto-restart
          if (isListening && !isRestartingRef.current) {
            isRestartingRef.current = true;
            setTimeout(() => {
              isRestartingRef.current = false;
              if (isListening) startRecognition();
            }, 500);
          }
        };

        recognitionRef.current.start();
        console.log('▶️ Wake word recognition started');
      } catch (e) {
        console.error('❌ Error starting wake word:', e);
      }
    };

    startRecognition();

    return () => {
      isRestartingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isListening, isActive]);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      isRestartingRef.current = false;
      console.log('🔇 Wake word disabled');
      
      // Audio feedback
      const utterance = new SpeechSynthesisUtterance("Wake word disabled");
      utterance.rate = 1.0;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    } else {
      setIsListening(true);
      console.log('🎤 Wake word enabled');
      
      // Audio feedback
      const utterance = new SpeechSynthesisUtterance("Wake word enabled. Say Hey Mirror to activate.");
      utterance.rate = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={toggleListening}
          size="lg"
          className={`
            w-16 h-16 rounded-full shadow-2xl transition-all duration-300
            ${isListening 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
              : 'bg-slate-600 hover:bg-slate-700'}
          `}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <MicOff className="w-7 h-7 text-white" />
          )}
        </Button>

        {isListening && (
          <div className="absolute -top-16 right-0 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
            Say "Memory Mirror"
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {wakeWordDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <Volume2 className="w-6 h-6" />
              <span className="text-xl font-semibold">I'm listening...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}