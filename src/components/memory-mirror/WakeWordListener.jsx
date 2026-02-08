import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function WakeWordListener({ onWakeWordDetected, isActive }) {
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
        .toLowerCase();

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
        setWakeWordDetected(true);
        
        // Speak confirmation
        const utterance = new SpeechSynthesisUtterance("I'm here. How can I help?");
        utterance.rate = 0.95;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
        
        onWakeWordDetected();
        
        // Visual feedback
        setTimeout(() => setWakeWordDetected(false), 2000);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.log('Wake word recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Restart listening after a short delay
        if (isListening) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
            } catch (e) {
              console.log('Error restarting:', e);
            }
          }, 500);
        }
      }
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.log('Error restarting on end:', e);
          }
        }, 500);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onWakeWordDetected]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Audio feedback
      const utterance = new SpeechSynthesisUtterance("Wake word disabled");
      utterance.rate = 1.0;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        
        // Audio feedback
        const utterance = new SpeechSynthesisUtterance("Wake word enabled. Say Hey Mirror to activate.");
        utterance.rate = 1.0;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
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
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <Volume2 className="w-6 h-6" />
              <span className="text-xl font-semibold">I'm listening...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}