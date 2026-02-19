import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MusicPlayer({ currentEra, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = React.useRef(null);

  const { data: songs = [] } = useQuery({
    queryKey: ['music', currentEra],
    queryFn: async () => {
      const allSongs = await base44.entities.Music.list();
      return allSongs.filter(s => s.era === currentEra || s.era === 'any');
    },
  });

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0]);
    }
  }, [songs]);

  useEffect(() => {
    // Create audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        nextSong();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentSong) {
        // Announce song
        const utterance = new SpeechSynthesisUtterance(
          `Now playing ${currentSong.title}${currentSong.artist ? ` by ${currentSong.artist}` : ''}`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);

        // Play audio if URL exists, otherwise generate pleasant tones
        if (currentSong.youtube_url) {
          // Note: Direct YouTube playback requires YouTube API
          alert('YouTube playback requires API integration. For now, enjoying the song announcement!');
        } else {
          // Generate pleasant background music using Web Audio API
          playGeneratedMusic();
        }
        
        setIsPlaying(true);
        
        // Log activity
        base44.entities.ActivityLog.create({
          activity_type: 'memory_viewed',
          details: { type: 'music', title: currentSong.title, era: currentEra }
        }).catch(() => {});
      }
    }
  };

  const playGeneratedMusic = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 30; // 30 seconds per song
      
      // Create pleasant melody tones based on mood
      const frequencies = currentSong.mood === 'calm' 
        ? [261.63, 293.66, 329.63, 349.23, 392.00] // C major scale (calm)
        : [440, 493.88, 523.25, 587.33, 659.25]; // A major scale (uplifting)
      
      let time = audioContext.currentTime;
      
      // Play a pleasant melody
      frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, time + i * 0.5);
        gainNode.gain.linearRampToValueAtTime(0.2, time + i * 0.5 + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, time + i * 0.5 + 0.4);
        
        oscillator.start(time + i * 0.5);
        oscillator.stop(time + i * 0.5 + 0.5);
      });
      
      // Auto-stop after duration
      setTimeout(() => {
        setIsPlaying(false);
        nextSong();
      }, duration * 1000);
      
    } catch (error) {
      console.error('Audio generation failed:', error);
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    audioRef.current?.pause();
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(false);
  };

  if (songs.length === 0) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
        <div className="text-center text-slate-600 dark:text-slate-400">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No music available for this era yet</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {currentEra} Music
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {currentSong && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
            {currentSong.title}
          </h3>
          {currentSong.artist && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{currentSong.artist}</p>
          )}
          {currentSong.personal_significance && (
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-2 italic">
              💝 {currentSong.personal_significance}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={playPause}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={nextSong}
          className="w-12 h-12 rounded-full"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {isPlaying && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">Playing...</span>
        </motion.div>
      )}
    </motion.div>
  );
}