import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WakeWordDetector({ onWake, enabled = true }) {
  const [isListening, setIsListening] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!enabled || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Restart if still enabled
      if (enabled) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            // Already started
          }
        }, 1000);
      }
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .toLowerCase();

      // Check for wake words
      if (
        transcript.includes('hey mirror') ||
        transcript.includes('ok mirror') ||
        transcript.includes('okay mirror') ||
        transcript.includes('hello mirror')
      ) {
        setShowActivation(true);
        onWake();
        
        // Hide activation after 2 seconds
        setTimeout(() => setShowActivation(false), 2000);
      }
    };

    // Start listening
    try {
      recognitionRef.current.start();
    } catch {
      console.log('Wake word detection not available');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enabled, onWake]);

  return (
    <>
      {/* Listening Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <motion.div
          animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isListening ? Infinity : 0, duration: 2 }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm
            ${isListening ? 'bg-blue-500/90 text-white' : 'bg-slate-200/90 text-slate-600'}
          `}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isListening ? 'Say "Hey Mirror"' : 'Wake word off'}
          </span>
        </motion.div>
      </div>

      {/* Activation Animation */}
      <AnimatePresence>
        {showActivation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: 3, duration: 0.5 }}
              >
                <Mic className="w-20 h-20 text-blue-600 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-light text-slate-800 mb-2">I'm listening...</h2>
              <p className="text-slate-600">How can I help you?</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}