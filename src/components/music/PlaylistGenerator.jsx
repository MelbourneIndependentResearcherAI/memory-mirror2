import React, { useState } from 'react';
import { Music, Sparkles, X, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MOOD_OPTIONS = [
  { id: 'peaceful', label: 'Peaceful', emoji: '☮️' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🌟' },
  { id: 'uplifting', label: 'Uplifting', emoji: '🌈' },
  { id: 'calming', label: 'Calming', emoji: '🧘' }
];

const GENRE_OPTIONS = [
  'big_band', 'jazz', 'rock', 'pop', 'folk', 'disco', 'country', 'classical'
];

const ERA_OPTIONS = ['1940s', '1960s', '1980s', 'present', 'mixed'];

export default function PlaylistGenerator({ onPlaylistGenerated, onClose }) {
  const [selectedMood, setSelectedMood] = useState('peaceful');
  const [selectedGenres, setSelectedGenres] = useState(['jazz']);
  const [selectedEra, setSelectedEra] = useState('mixed');
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const generatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please name your playlist');
      return;
    }

    if (selectedGenres.length === 0) {
      toast.error('Select at least one genre');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generatePlaylist', {
        name: playlistName,
        mood: selectedMood,
        genres: selectedGenres,
        era: selectedEra
      });

      if (response.data?.playlist) {
        toast.success('Playlist created!');
        onPlaylistGenerated?.(response.data.playlist);
        onClose();
      }
    } catch (error) {
      console.error('Playlist generation failed:', error);
      toast.error('Failed to create playlist');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Create Your Playlist
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Playlist Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Playlist Name
          </label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="e.g., Sunday Afternoon Memories"
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Select Mood
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MOOD_OPTIONS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-3 rounded-lg transition-all text-center ${
                  selectedMood === mood.id
                    ? 'bg-purple-500 text-white border-2 border-purple-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-purple-300'
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-semibold">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Select Genres
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`p-3 rounded-lg transition-all text-xs font-semibold ${
                  selectedGenres.includes(genre)
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {genre.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Era Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Musical Era
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ERA_OPTIONS.map(era => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`p-2 rounded-lg transition-all text-xs font-semibold ${
                  selectedEra === era
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePlaylist}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg h-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Playlist...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Playlist
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}