import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, X, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';

// Curated music library with working audio URLs
const MUSIC_LIBRARY = {
  '1940s': [
    { title: 'Moonlight Serenade', artist: 'Glenn Miller', genre: 'big_band', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'In The Mood', artist: 'Glenn Miller', genre: 'big_band', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Sing Sing Sing', artist: 'Benny Goodman', genre: 'jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  ],
  '1960s': [
    { title: 'Classical Gas', artist: 'Mason Williams', genre: 'folk', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'Blue Moon', artist: 'The Marcels', genre: 'rock', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ],
  '1980s': [
    { title: 'Take On Me', artist: 'a-ha', genre: 'pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  ],
  'present': [
    { title: 'Relaxing Piano', artist: 'Various', genre: 'classical', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  ]
};

export default function MusicPlayer({ currentEra, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cached, setCached] = useState({});
  const audioRef = useRef(null);

  const songs = MUSIC_LIBRARY[currentEra] || MUSIC_LIBRARY['present'];

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0]);
      setCurrentIndex(0);
    }
  }, [currentEra, songs]);

  // Update song when index changes
  useEffect(() => {
    if (songs[currentIndex]) {
      setCurrentSong(songs[currentIndex]);
    }
  }, [currentIndex, songs]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const cacheAudio = async (song) => {
    try {
      const response = await fetch(song.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setCached(prev => ({ ...prev, [song.title]: blobUrl }));
      toast.success(`${song.title} cached for offline use`);
      
      return blobUrl;
    } catch (error) {
      console.error('Cache failed:', error);
      toast.error('Failed to cache song');
      return song.url;
    }
  };

  const playPause = async () => {
    if (!currentSong) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      try {
        // Announce song
        const utterance = new SpeechSynthesisUtterance(
          `Now playing ${currentSong.title}${currentSong.artist ? ` by ${currentSong.artist}` : ''}`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);

        // Create audio element if needed
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.addEventListener('ended', nextSong);
          audioRef.current.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            toast.error('Failed to load audio');
            setIsPlaying(false);
          });
        }

        // Set source and play
        const audioUrl = cached[currentSong.title] || currentSong.url;
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 0.7;
        
        await audioRef.current.play();
        setIsPlaying(true);
        toast.success('Now playing!');
        
        // Log activity
        offlineEntities.create('ActivityLog', {
          activity_type: 'memory_viewed',
          details: { type: 'music', title: currentSong.title, era: currentEra }
        }).catch(() => {});
      } catch (error) {
        console.error('Playback failed:', error);
        toast.error(`Playback error: ${error.message}`);
        setIsPlaying(false);
      }
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const nextIdx = (currentIndex + 1) % songs.length;
    setCurrentIndex(nextIdx);
    setCurrentSong(songs[nextIdx]);
    setIsPlaying(false);
    
    // Auto-play next song
    setTimeout(() => {
      playPause();
    }, 500);
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
        <div className="mb-6">
          <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
            {currentSong.title}
          </h3>
          {currentSong.artist && (
            <p className="text-base text-slate-700 dark:text-slate-300 mt-1">{currentSong.artist}</p>
          )}
          {currentSong.genre && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              {currentSong.genre.replace('_', ' ').toUpperCase()}
            </p>
          )}
          
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cacheAudio(currentSong)}
              disabled={!!cached[currentSong.title]}
              className="w-full"
            >
              {cached[currentSong.title] ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Cached for Offline
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Cache for Offline
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          size="lg"
          onClick={playPause}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" />
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={nextSong}
          className="w-14 h-14 rounded-full border-2"
        >
          <SkipForward className="w-6 h-6" />
        </Button>
      </div>

      {isPlaying && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
          <span className="text-base font-semibold">Now Playing</span>
        </motion.div>
      )}

      <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        {currentIndex + 1} of {songs.length} songs
      </div>
    </motion.div>
  );
}