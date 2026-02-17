import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, Camera, Book, Wind, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { offlineEntities } from '@/components/utils/offlineAPI';

export default function BadDayMode({ onClose, userProfile }) {
  const [stage, setStage] = useState('greeting'); // greeting, breathing, memory, music, story
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    // Log bad day mode activation
    logBadDayActivation();
    
    // Alert caregiver silently
    alertCaregiver();

    // Start with greeting, then auto-progress
    const timer = setTimeout(() => {
      setStage('breathing');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const logBadDayActivation = async () => {
    try {
      await offlineEntities.create('ActivityLog', {
        activity_type: 'anxiety_detected',
        details: { trigger: 'bad_day_mode_activated', severity: 'medium' },
        anxiety_level: 6
      });
    } catch (error) {
      console.log('Failed to log:', error.message);
    }
  };

  const alertCaregiver = async () => {
    try {
      await offlineEntities.create('CaregiverAlert', {
        alert_type: 'check_in_suggested',
        severity: 'warning',
        message: `${userProfile?.loved_one_name || 'Your loved one'} activated Bad Day Mode and may need extra comfort right now.`,
        pattern_data: { timestamp: new Date().toISOString(), mode: 'bad_day' }
      });
    } catch (error) {
      console.log('Failed to alert caregiver:', error.message);
    }
  };

  const speakGently = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.75; // Slower
      utterance.pitch = 1.05; // Warmer
      utterance.volume = 0.85; // Softer
      
      const voices = speechSynthesis.getVoices();
      const gentleVoice = voices.find(v => 
        v.name.includes('Samantha') || v.name.includes('Google') && v.lang.startsWith('en')
      );
      if (gentleVoice) utterance.voice = gentleVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (stage === 'greeting') {
      speakGently("I'm here with you. You're safe, and everything is going to be alright. Let's take this one step at a time together.");
    } else if (stage === 'breathing') {
      speakGently("Let's breathe together. Breathe in slowly... and breathe out. You're doing beautifully.");
    } else if (stage === 'memory') {
      speakGently("Would you like to look at some happy memories? They always bring a smile.");
    } else if (stage === 'music') {
      speakGently("How about some gentle, peaceful music? Music has a way of making everything feel better.");
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm overflow-hidden">
      {/* Calming background animation */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ x: '-50%', y: '-50%' }}
        />
      </div>

      {/* Close button (minimal) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <AnimatePresence mode="wait">
          {stage === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-24 h-24 mx-auto text-pink-300" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white">You're Safe</h1>
              <p className="text-2xl text-blue-200 max-w-md">
                I'm here with you. Everything is going to be alright.
              </p>
            </motion.div>
          )}

          {stage === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-12"
            >
              <h2 className="text-3xl font-bold text-white">Let's Breathe Together</h2>
              
              <motion.div
                className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="text-white text-xl font-semibold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  {breathCount < 3 ? 'Breathe In...' : 'Breathe Out...'}
                </motion.div>
              </motion.div>

              <p className="text-xl text-blue-200">You're doing beautifully</p>

              <Button
                onClick={() => setStage('memory')}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {stage === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <Camera className="w-20 h-20 mx-auto text-yellow-300" />
              <h2 className="text-3xl font-bold text-white">Happy Memories</h2>
              <p className="text-xl text-blue-200 max-w-lg">
                Would you like to look at some beautiful photos and happy memories? They always bring comfort.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setStage('music')}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/40"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    // Navigate to memories would go here
                  }}
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-white/90"
                >
                  Show Memories
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <Music className="w-20 h-20 mx-auto text-green-300" />
              <h2 className="text-3xl font-bold text-white">Peaceful Music</h2>
              <p className="text-xl text-blue-200 max-w-lg">
                Music has a special way of making everything feel better. Let me play something gentle for you.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setStage('story')}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/40"
                >
                  Not Right Now
                </Button>
                <Button
                  onClick={() => {
                    setIsPlaying(true);
                    speakGently("Playing some peaceful music for you now.");
                  }}
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-white/90"
                >
                  Play Music
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <Book className="w-20 h-20 mx-auto text-orange-300" />
              <h2 className="text-3xl font-bold text-white">A Gentle Story</h2>
              <p className="text-xl text-blue-200 max-w-lg">
                Would you like me to read you a peaceful, comforting story?
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/40"
                >
                  I'm Feeling Better
                </Button>
                <Button
                  onClick={() => {
                    speakGently("Let me tell you a peaceful story...");
                  }}
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-white/90"
                >
                  Tell Me a Story
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gentle reminder at bottom */}
        <motion.p
          className="absolute bottom-8 text-center text-white/60 text-lg"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          You are safe. You are loved. I'm here with you.
        </motion.p>
      </div>
    </div>
  );
}