import React, { useState, useEffect, useRef } from 'react';
import { Music2, Play, Pause, Volume2, SkipForward, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SingAlongPlayer({ 
  currentEra = 'timeless', 
  onClose,
  mood = 'happy' 
}) {
  const [isSinging, setIsSinging] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [highlightedLine, setHighlightedLine] = useState(0);
  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch sing-along songs
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['singAlongSongs', currentEra, mood],
    queryFn: async () => {
      const allSongs = await base44.entities.SingAlongSong.list();
      return allSongs.filter(song => 
        song.singalong_enabled && 
        (song.era === currentEra || song.era === 'timeless') &&
        (mood === 'any' || song.mood === mood)
      );
    }
  });

  // Mutation to track song usage
  const updateSongMutation = useMutation({
    mutationFn: ({ id, times_sung }) => 
      base44.entities.SingAlongSong.update(id, { times_sung }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singAlongSongs'] });
    }
  });

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0]);
    }
  }, [songs, currentSong]);

  useEffect(() => {
    return () => {
      stopSinging();
    };
  }, []);

  const stopSinging = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSinging(false);
    setCurrentLineIndex(0);
    setHighlightedLine(0);
  };

  const singLine = (lineObj, index) => {
    if (!lineObj || !isSinging) return;

    setHighlightedLine(index);

    const utterance = new SpeechSynthesisUtterance(lineObj.line);
    
    // Configure voice for singing
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Adjust based on tempo
    const tempoSettings = {
      'very_slow': { rate: 0.6, pitch: 1.0 },
      'slow': { rate: 0.75, pitch: 1.0 },
      'medium': { rate: 0.85, pitch: 1.05 },
      'fast': { rate: 1.0, pitch: 1.1 }
    };

    const settings = tempoSettings[currentSong?.tempo || 'medium'];
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1.0;

    utteranceRef.current = utterance;

    utterance.onend = () => {
      if (!isSinging) return;

      const pauseDuration = (lineObj.timing || 1.5) * 1000;
      
      timeoutRef.current = setTimeout(() => {
        const nextIndex = index + 1;
        
        if (nextIndex < currentSong.lyrics.length && isSinging) {
          setCurrentLineIndex(nextIndex);
          singLine(currentSong.lyrics[nextIndex], nextIndex);
        } else {
          // Song finished
          setIsSinging(false);
          setCurrentLineIndex(0);
          setHighlightedLine(0);
          toast.success('🎵 Song complete! Would you like to sing another?');
          
          // Update times sung
          if (currentSong?.id) {
            updateSongMutation.mutate({
              id: currentSong.id,
              times_sung: (currentSong.times_sung || 0) + 1
            });
          }
        }
      }, pauseDuration);
    };

    utterance.onerror = (error) => {
      console.error('Speech error:', error);
      setIsSinging(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startSinging = () => {
    if (!currentSong || !currentSong.lyrics || currentSong.lyrics.length === 0) {
      toast.error('No lyrics available for this song');
      return;
    }

    if (isSinging) {
      stopSinging();
      return;
    }

    // Announce song start
    const intro = new SpeechSynthesisUtterance(
      `Let's sing together! ${currentSong.title}. Ready? Here we go!`
    );
    intro.rate = 0.95;
    intro.pitch = 1.1;
    intro.volume = 0.9;

    intro.onend = () => {
      setIsSinging(true);
      setCurrentLineIndex(0);
      setTimeout(() => {
        singLine(currentSong.lyrics[0], 0);
      }, 1000);
    };

    window.speechSynthesis.speak(intro);
  };

  const selectSong = (song) => {
    stopSinging();
    setCurrentSong(song);
    setCurrentLineIndex(0);
    setHighlightedLine(0);
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    
    stopSinging();
    const currentIdx = songs.findIndex(s => s.id === currentSong?.id);
    const nextIdx = (currentIdx + 1) % songs.length;
    setCurrentSong(songs[nextIdx]);
    setCurrentLineIndex(0);
    setHighlightedLine(0);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-slate-500">Loading songs...</p>
      </Card>
    );
  }

  if (songs.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="text-center">
          <Music2 className="w-12 h-12 mx-auto mb-3 text-blue-400 opacity-50" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No sing-along songs available yet.
          </p>
          <p className="text-xs text-slate-500">
            Caregivers can add songs in the Content Library
          </p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Sing-Along Time 🎤
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px]"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Current Song Display */}
        {currentSong && (
          <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-2 border-purple-200 dark:border-purple-700">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {currentSong.title}
              </h3>
              {currentSong.artist && (
                <p className="text-slate-600 dark:text-slate-400">
                  {currentSong.artist}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  {currentSong.category?.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {currentSong.mood}
                </span>
              </div>
            </div>

            {/* Lyrics Display */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {currentSong.lyrics?.map((lyric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: isSinging ? (idx === highlightedLine ? 1 : 0.4) : 1,
                      scale: isSinging && idx === highlightedLine ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className={`text-xl leading-relaxed mb-3 ${
                      isSinging && idx === highlightedLine
                        ? 'text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lyric.line}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={startSinging}
                className={`w-24 h-24 rounded-full shadow-2xl transition-all ${
                  isSinging
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                }`}
              >
                {isSinging ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white ml-1" />
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={nextSong}
                className="w-16 h-16 rounded-full border-2"
              >
                <SkipForward className="w-8 h-8" />
              </Button>
            </div>

            {isSinging && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center justify-center gap-2 mt-4 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg"
              >
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">Singing line {highlightedLine + 1} of {currentSong.lyrics?.length}</span>
              </motion.div>
            )}
          </Card>
        )}

        {/* Song Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Choose a Song
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {songs.map((song) => (
              <motion.div
                key={song.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectSong(song)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  currentSong?.id === song.id
                    ? 'bg-purple-200 dark:bg-purple-800 border-2 border-purple-400 dark:border-purple-600'
                    : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {song.title}
                    </p>
                    {song.artist && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {song.artist}
                      </p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {song.popular && (
                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      )}
                      <span className="text-xs text-slate-500">
                        {song.lyrics?.length || 0} lines
                      </span>
                    </div>
                  </div>
                  {song.times_sung > 0 && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Sung {song.times_sung}×
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}