import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MusicPlayer({ currentEra, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = React.useRef(null);

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
      setCurrentIndex(0);
    }
  }, [songs]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const extractYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const playPause = () => {
    if (isPlaying) {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (currentSong) {
        // Announce song
        const utterance = new SpeechSynthesisUtterance(
          `Now playing ${currentSong.title}${currentSong.artist ? ` by ${currentSong.artist}` : ''}`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);

        // Play YouTube video
        if (currentSong.youtube_url) {
          initializePlayer();
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

  const initializePlayer = () => {
    const videoId = extractYouTubeID(currentSong.youtube_url);
    if (!videoId) return;

    const onYouTubeIframeAPIReady = () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              nextSong();
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
    
    const nextIdx = (currentIndex + 1) % songs.length;
    setCurrentIndex(nextIdx);
    setCurrentSong(songs[nextIdx]);
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
      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

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
          {currentSong.personal_significance && (
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-3 italic bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              💝 {currentSong.personal_significance}
            </p>
          )}
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