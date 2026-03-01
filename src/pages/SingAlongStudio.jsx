import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function SingAlongStudio() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['singAlongSongs'],
    queryFn: () => base44.entities.SingAlongSong.list()
  });

  const playNext = () => {
    if (selectedSong && selectedSong.lyrics && currentLineIndex < selectedSong.lyrics.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
    }
  };

  const playPrev = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900 dark:via-orange-900 dark:to-red-800 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🎤</span>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Sing Along</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Your favorite songs with lyrics to follow</p>
        </div>

        {!selectedSong ? (
          /* Song Selection */
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Songs</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading songs...</div>
            ) : (
              songs.map((song) => (
                <motion.button
                  key={song.id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setSelectedSong(song);
                    setCurrentLineIndex(0);
                  }}
                  className="w-full bg-white dark:bg-slate-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left border-l-4 border-orange-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{song.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{song.artist}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                          {song.mood}
                        </span>
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          {song.difficulty}
                        </span>
                      </div>
                    </div>
                    <Play className="w-8 h-8 text-orange-600" />
                  </div>
                </motion.button>
              ))
            )}
          </div>
        ) : (
          /* Sing Along Player */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
          >
            {/* Song Header */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedSong.title}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">{selectedSong.artist}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 uppercase tracking-wide">{selectedSong.era} • {selectedSong.mood}</p>
            </div>

            {/* Lyrics Display */}
            <div className="bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-8 mb-6 min-h-[200px] flex flex-col justify-between">
              {/* Current Line - LARGE */}
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-bold text-orange-600 dark:text-orange-400 leading-tight">
                  {selectedSong.lyrics?.[currentLineIndex]?.line}
                </p>
              </div>

              {/* Next Line - Small */}
              {currentLineIndex < selectedSong.lyrics.length - 1 && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 italic">
                  Next: {selectedSong.lyrics[currentLineIndex + 1]?.line}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Line {currentLineIndex + 1} of {selectedSong.lyrics?.length || 0}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentLineIndex + 1) / (selectedSong.lyrics?.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-4">
              <Button
                onClick={playPrev}
                disabled={currentLineIndex === 0}
                className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:opacity-50"
              >
                ← Previous
              </Button>
              <Button
                onClick={playNext}
                disabled={currentLineIndex === selectedSong.lyrics?.length - 1}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                Next →
              </Button>
            </div>

            {/* Full Lyrics Button */}
            <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-4 max-h-[200px] overflow-y-auto">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedSong.full_lyrics}</p>
            </div>

            {/* Back Button */}
            <Button
              onClick={() => {
                setSelectedSong(null);
                setCurrentLineIndex(0);
              }}
              variant="outline"
              className="w-full"
            >
              ← Back to Songs
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}