import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Play, Pause, SkipForward, SkipBack, Clock, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const eraColors = {
  '1940s': 'from-amber-500 to-orange-500',
  '1960s': 'from-orange-500 to-red-500',
  '1980s': 'from-purple-500 to-pink-500',
  'present': 'from-blue-500 to-cyan-500'
};

const moodColors = {
  'uplifting': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'calm': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'nostalgic': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'energetic': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'romantic': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
};

export default function MusicTherapy() {
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['music', selectedEra, selectedMood],
    queryFn: async () => {
      let allSongs = await base44.entities.Music.list();
      
      if (selectedEra !== 'all') {
        allSongs = allSongs.filter(s => s.era === selectedEra);
      }
      if (selectedMood !== 'all') {
        allSongs = allSongs.filter(s => s.mood === selectedMood);
      }
      
      return allSongs;
    }
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list()
  });

  const handlePlayPause = (song) => {
    if (currentlyPlaying?.id === song.id && isPlaying) {
      setIsPlaying(false);
      toast.info('Paused');
    } else {
      setCurrentlyPlaying(song);
      setIsPlaying(true);
      toast.success(`Now playing: ${song.title}`);
    }
  };

  const handleSkipBack = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentlyPlaying?.id);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentlyPlaying(songs[prevIndex]);
    setIsPlaying(true);
    toast.success(`Now playing: ${songs[prevIndex].title}`);
  };

  const handleSkipForward = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentlyPlaying?.id);
    const nextIndex = currentIndex >= songs.length - 1 ? 0 : currentIndex + 1;
    setCurrentlyPlaying(songs[nextIndex]);
    setIsPlaying(true);
    toast.success(`Now playing: ${songs[nextIndex].title}`);
  };

  const eras = ['all', '1940s', '1960s', '1980s', 'present'];
  const moods = ['all', 'uplifting', 'calm', 'nostalgic', 'energetic', 'romantic'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Music className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Music Therapy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Era-specific songs and therapeutic playlists designed for dementia care
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {eras.map((era) => (
            <Button
              key={era}
              onClick={() => setSelectedEra(era)}
              variant={selectedEra === era ? 'default' : 'outline'}
              className={`capitalize min-h-[44px] ${
                selectedEra === era && era !== 'all'
                  ? `bg-gradient-to-r ${eraColors[era]} text-white`
                  : ''
              }`}
            >
              {era === 'all' ? 'All Eras' : era}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          {moods.map((mood) => (
            <Button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              variant={selectedMood === mood ? 'default' : 'outline'}
              className="capitalize min-h-[44px]"
            >
              {mood === 'all' ? 'All Moods' : mood}
            </Button>
          ))}
        </div>

        {/* Now Playing */}
        {currentlyPlaying && (
          <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <p className="text-sm text-white/70 mb-1">Now Playing</p>
                  <h2 className="text-3xl font-bold">{currentlyPlaying.title}</h2>
                  <p className="text-lg text-white/90 mt-2">{currentlyPlaying.artist}</p>
                </div>
                <Volume2 className="w-12 h-12 animate-pulse" />
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkipBack}
                  className="min-h-[60px] min-w-[60px] rounded-full bg-white/20 hover:bg-white/30 text-white border-white/40"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="lg"
                  className="min-h-[80px] min-w-[80px] rounded-full bg-white hover:bg-white/90 text-purple-600"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkipForward}
                  className="min-h-[60px] min-w-[60px] rounded-full bg-white/20 hover:bg-white/30 text-white border-white/40"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Playlists */}
        {playlists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Curated Playlists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => toast.info(`Playing ${playlist.name}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${eraColors[playlist.era] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{playlist.name}</h3>
                        <p className="text-sm text-slate-500">{playlist.song_ids?.length || 0} songs</p>
                      </div>
                    </div>
                    {playlist.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {playlist.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge className={moodColors[playlist.mood] || 'bg-slate-100 text-slate-800'}>
                        {playlist.mood}
                      </Badge>
                      <Badge variant="outline">{playlist.era}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Song List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            All Songs ({songs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((song) => (
              <Card
                key={song.id}
                className={`hover:shadow-lg transition-all ${
                  currentlyPlaying?.id === song.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{song.title}</h3>
                      {song.artist && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {song.artist}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handlePlayPause(song)}
                      size="lg"
                      className={`min-h-[56px] min-w-[56px] rounded-full ${
                        currentlyPlaying?.id === song.id && isPlaying
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {currentlyPlaying?.id === song.id && isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={moodColors[song.mood] || 'bg-slate-100 text-slate-800'}>
                      {song.mood}
                    </Badge>
                    <Badge variant="outline">{song.era}</Badge>
                    {song.duration_seconds && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(song.duration_seconds / 60)}:{(song.duration_seconds % 60).toString().padStart(2, '0')}
                      </Badge>
                    )}
                  </div>

                  {song.personal_significance && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">
                      "{song.personal_significance}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {songs.length === 0 && !isLoading && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <Music className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                No songs found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try different filters or ask your caregiver to add music
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}