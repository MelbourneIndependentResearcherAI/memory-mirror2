import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';

export default function RoyaltyFreeMusicLibrary() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [category, setCategory] = useState('classical');
  const audioRef = useRef(null);

  // Royalty-free music library (YouTube Audio Library style)
  const musicLibrary = {
    classical: [
      { title: 'Peaceful Piano', artist: 'Ambient', duration: '3:45', mood: 'calm' },
      { title: 'Morning Light', artist: 'Classical', duration: '4:20', mood: 'uplifting' },
      { title: 'Gentle Strings', artist: 'Orchestra', duration: '5:12', mood: 'nostalgic' },
    ],
    '1940s': [
      { title: 'Swing Time', artist: 'Big Band', duration: '3:15', mood: 'energetic' },
      { title: 'Moonlight Serenade', artist: 'Jazz Orchestra', duration: '4:05', mood: 'romantic' },
      { title: 'Victory Dance', artist: 'Swing Band', duration: '2:50', mood: 'uplifting' },
    ],
    '1960s': [
      { title: 'Groovy Days', artist: 'Pop Rock', duration: '3:30', mood: 'energetic' },
      { title: 'Summer Breeze', artist: 'Folk Rock', duration: '4:15', mood: 'nostalgic' },
      { title: 'Dancing Shoes', artist: 'Rock & Roll', duration: '2:45', mood: 'uplifting' },
    ],
    nature: [
      { title: 'Forest Ambience', artist: 'Nature Sounds', duration: '10:00', mood: 'calm' },
      { title: 'Ocean Waves', artist: 'Nature Sounds', duration: '10:00', mood: 'calm' },
      { title: 'Gentle Rain', artist: 'Nature Sounds', duration: '10:00', mood: 'calm' },
      { title: 'Bird Songs', artist: 'Nature Sounds', duration: '8:30', mood: 'uplifting' },
    ],
    therapeutic: [
      { title: 'Deep Relaxation', artist: 'Meditation', duration: '6:00', mood: 'calm' },
      { title: 'Peaceful Mind', artist: 'Ambient', duration: '5:30', mood: 'calm' },
      { title: 'Stress Relief', artist: 'Wellness', duration: '7:15', mood: 'calm' },
    ]
  };

  const tracks = musicLibrary[category];
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-6 h-6 text-blue-600" />
          Music Therapy Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(musicLibrary).map((cat) => (
              <Button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setCurrentTrackIndex(0);
                  setIsPlaying(false);
                }}
                variant={category === cat ? 'default' : 'outline'}
                className="capitalize"
              >
                {cat.replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Now Playing Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                <Music className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold mb-1">{currentTrack.title}</p>
                <p className="text-sm opacity-90">{currentTrack.artist}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {currentTrack.mood}
                  </span>
                  <span className="text-xs">{currentTrack.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={handlePrev}
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              onClick={handlePlayPause}
              size="lg"
              className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>

            <Button
              onClick={handleNext}
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-semibold w-12 text-right">{volume}%</span>
          </div>

          {/* Playlist */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Playlist</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {tracks.map((track, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    idx === currentTrackIndex
                      ? 'bg-blue-100 border-2 border-blue-500 font-semibold'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{track.title}</p>
                      <p className="text-xs text-gray-600">{track.artist}</p>
                    </div>
                    <span className="text-xs text-gray-500">{track.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}