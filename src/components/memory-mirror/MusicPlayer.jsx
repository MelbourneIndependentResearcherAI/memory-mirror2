import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, X, Download, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';
import PlaylistGenerator from '../music/PlaylistGenerator';

// Curated music library with era-appropriate songs
const MUSIC_LIBRARY = {
  '1940s': [
    { title: 'Moonlight Serenade', artist: 'Glenn Miller Orchestra', genre: 'big_band', url: 'https://ia801409.us.archive.org/15/items/78_moonlight-serenade_glenn-miller-and-his-orchestra-mitchell-parish-glenn-mille_gbia0000281a/01%20-%20Moonlight%20Serenade%20-%20Glenn%20Miller%20and%20his%20Orchestra-restored.mp3' },
    { title: 'In The Mood', artist: 'Glenn Miller Orchestra', genre: 'big_band', url: 'https://ia802808.us.archive.org/29/items/78_in-the-mood_glenn-miller-and-his-orchestra-joe-garland-andy-razaf_gbia0001355a/In%20The%20Mood%20-%20Glenn%20Miller%20and%20his%20Orchestra-restored.mp3' },
    { title: 'Sing Sing Sing', artist: 'Benny Goodman', genre: 'jazz', url: 'https://ia904707.us.archive.org/21/items/78_sing-sing-sing-with-a-swing_benny-goodman-and-his-orchestra-louis-prima_gbia0026267a/Sing%2C%20Sing%2C%20Sing%20%28With%20a%20Swing%29%20-%20Benny%20Goodman%20and%20his%20Orchestra-restored.mp3' },
    { title: 'String of Pearls', artist: 'Glenn Miller', genre: 'big_band', url: 'https://ia801504.us.archive.org/27/items/78_string-of-pearls_glenn-miller-and-his-orchestra-eddie-delange-jerry-gray_gbia0001371a/String%20Of%20Pearls%20-%20Glenn%20Miller%20and%20his%20Orchestra-restored.mp3' },
  ],
  '1960s': [
    { title: 'Stand By Me', artist: 'Ben E. King', genre: 'rock', url: 'https://ia801905.us.archive.org/16/items/cd_the-very-best-of-ben-e-king_ben-e-king/disc1/01.%20Stand%20By%20Me_ben-e-king_gbia0049741a_01.mp3' },
    { title: 'What A Wonderful World', artist: 'Louis Armstrong', genre: 'jazz', url: 'https://ia804709.us.archive.org/23/items/cd_what-a-wonderful-world_louis-armstrong/disc1/01.%20What%20A%20Wonderful%20World_louis-armstrong_gbia0049750a_01.mp3' },
    { title: 'Unchained Melody', artist: 'The Righteous Brothers', genre: 'pop', url: 'https://ia801907.us.archive.org/8/items/cd_unchained-melody_the-righteous-brothers/disc1/01.%20Unchained%20Melody_the-righteous-brothers_gbia0049735a_01.mp3' },
  ],
  '1980s': [
    { title: 'Billie Jean', artist: 'Michael Jackson', genre: 'pop', url: 'https://ia902205.us.archive.org/13/items/cd_thriller_michael-jackson/disc1/02.%20Billie%20Jean_michael-jackson_gbia0049736a_02.mp3' },
    { title: 'Sweet Dreams', artist: 'Eurythmics', genre: 'pop', url: 'https://ia801602.us.archive.org/18/items/cd_sweet-dreams-are-made-of-this_eurythmics/disc1/01.%20Sweet%20Dreams%20%28Are%20Made%20Of%20This%29_eurythmics_gbia0049729a_01.mp3' },
    { title: 'Every Breath You Take', artist: 'The Police', genre: 'rock', url: 'https://ia801409.us.archive.org/29/items/cd_every-breath-you-take_the-police/disc1/01.%20Every%20Breath%20You%20Take_the-police_gbia0049728a_01.mp3' },
  ],
  'present': [
    { title: 'Peaceful Piano', artist: 'Relaxing Music', genre: 'classical', url: 'https://ia801406.us.archive.org/27/items/relaxing-classical-piano/Relaxing%20Classical%20Piano%20Music.mp3' },
    { title: 'Morning Meditation', artist: 'Calm Sounds', genre: 'classical', url: 'https://ia801909.us.archive.org/16/items/meditation-relaxing-music/Meditation%20Relaxing%20Music.mp3' },
    { title: 'Soft Jazz', artist: 'Jazz Collection', genre: 'jazz', url: 'https://ia601408.us.archive.org/6/items/soft-jazz-music/Soft%20Jazz%20Music.mp3' },
  ]
};

export default function MusicPlayer({ currentEra, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cached, setCached] = useState({});
  const [showPlaylistGenerator, setShowPlaylistGenerator] = useState(false);
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
    if (!currentSong) {
      toast.error('No song selected');
      return;
    }

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        console.log('🔇 Paused audio');
      }
      setIsPlaying(false);
      toast.info('Paused');
    } else {
      try {
        console.log('🎵 Starting playback:', currentSong.title);
        
        // Announce song with voice
        const utterance = new SpeechSynthesisUtterance(
          `Now playing ${currentSong.title}${currentSong.artist ? ` by ${currentSong.artist}` : ''}`
        );
        utterance.rate = 0.95;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);

        // Create audio element if needed
        if (!audioRef.current) {
          console.log('🔊 Creating new Audio element');
          audioRef.current = new Audio();
          audioRef.current.crossOrigin = 'anonymous';
          
          audioRef.current.addEventListener('ended', () => {
            console.log('✅ Song ended, playing next');
            nextSong();
          });
          
          audioRef.current.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            console.error('Audio error details:', audioRef.current?.error);
            toast.error(`Audio error: ${audioRef.current?.error?.message || 'Failed to load'}`);
            setIsPlaying(false);
          });
          
          audioRef.current.addEventListener('canplay', () => {
            console.log('✅ Audio ready to play');
          });
          
          audioRef.current.addEventListener('loadedmetadata', () => {
            console.log('✅ Audio metadata loaded, duration:', audioRef.current?.duration);
          });
        }

        // Set source and play
        const audioUrl = cached[currentSong.title] || currentSong.url;
        console.log('📡 Loading audio from:', audioUrl.substring(0, 80) + '...');
        
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 0.7;
        audioRef.current.load(); // Force load
        
        console.log('▶️ Attempting to play...');
        await audioRef.current.play();
        
        setIsPlaying(true);
        console.log('✅ PLAYBACK STARTED SUCCESSFULLY');
        toast.success(`🎵 Now playing: ${currentSong.title}`);
        
        // Log activity
        offlineEntities.create('ActivityLog', {
          activity_type: 'memory_viewed',
          details: { type: 'music', title: currentSong.title, era: currentEra }
        }).catch(() => {});
      } catch (error) {
        console.error('❌ Playback failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        toast.error(`Cannot play: ${error.message}`);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPlaylistGenerator(true)}
            className="h-8 w-8"
            title="Create AI Playlist"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showPlaylistGenerator && (
        <PlaylistGenerator
          onPlaylistGenerated={() => {
            setShowPlaylistGenerator(false);
            toast.success('Playlist added to your collection');
          }}
          onClose={() => setShowPlaylistGenerator(false)}
        />
      )}

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