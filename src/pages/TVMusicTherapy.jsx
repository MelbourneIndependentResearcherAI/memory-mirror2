import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function TVMusicTherapyPage() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list()
  });

  const { data: music = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list()
  });

  const playlist = playlists[0] || null;
  const tracks = playlist?.song_ids ? 
    music.filter(m => playlist.song_ids.includes(m.id)) : 
    music.slice(0, 10);

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 mx-auto min-h-[44px] text-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            Back
          </button>
          <p className="text-white text-3xl">No music available</p>
        </div>
      </div>
    );
  }

  const currentSong = tracks[currentTrack];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4 gap-8">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 min-h-[44px] text-lg"
      >
        <ArrowLeft className="w-6 h-6" />
        Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-2xl">
        {/* Album Art Placeholder */}
        <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl flex items-center justify-center">
          <div className="text-8xl">♫</div>
        </div>

        {/* Song Info */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-3">
            {currentSong?.title || 'Unknown Title'}
          </h1>
          <p className="text-3xl text-purple-300">
            {currentSong?.artist || 'Unknown Artist'}
          </p>
          <p className="text-2xl text-slate-400 mt-4">
            {currentTrack + 1} / {tracks.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentTrack(Math.max(0, currentTrack - 1))}
            disabled={currentTrack === 0}
            className="p-6 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white transition-all min-h-[80px] min-w-[80px]"
          >
            <SkipBack className="w-8 h-8 mx-auto" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all min-h-[100px] min-w-[100px] shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 mx-auto" />
            ) : (
              <Play className="w-10 h-10 mx-auto" />
            )}
          </button>

          <button
            onClick={() => setCurrentTrack(Math.min(tracks.length - 1, currentTrack + 1))}
            disabled={currentTrack === tracks.length - 1}
            className="p-6 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white transition-all min-h-[80px] min-w-[80px]"
          >
            <SkipForward className="w-8 h-8 mx-auto" />
          </button>
        </div>

        {/* Mood */}
        {currentSong?.mood && (
          <p className="text-2xl text-purple-300">
            Mood: <span className="font-semibold capitalize">{currentSong.mood}</span>
          </p>
        )}
      </div>

      {/* Playlist Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-xl">
        Music Therapy Session • {playlist?.name || 'Default Playlist'}
      </div>
    </div>
  );
}