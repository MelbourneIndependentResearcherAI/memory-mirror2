import React, { useState } from 'react';
import { Music, Upload, Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MusicTherapy() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['musicTracks'],
    queryFn: () => base44.entities.Music.list()
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Music.create({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Custom Upload',
        era: 'present',
        genre: 'custom',
        mood: 'calm',
        audio_file_url: file_url,
        is_custom_upload: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musicTracks'] });
      toast.success('Music added successfully!');
      setUploading(false);
    },
    onError: () => {
      toast.error('Failed to upload music');
      setUploading(false);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 dark:from-purple-900 dark:via-pink-900 dark:to-purple-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Music Therapy</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Therapeutic music for comfort and wellbeing</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Your Own Music</h2>
          <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-4 border-dashed border-purple-300 dark:border-purple-600 rounded-xl cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="w-12 h-12 text-purple-500 mb-3" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Click to upload music</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">MP3, WAV, or other audio formats</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          {uploading && <p className="text-center mt-3 text-purple-600 font-semibold">Uploading...</p>}
        </div>

        {/* Pre-loaded Music */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Therapeutic Music Library</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading music...</div>
          ) : (
            <div className="grid gap-3">
              {songs.map((song) => (
                <motion.div
                  key={song.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedSong(song)}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{song.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{song.artist}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {song.mood}
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {song.era}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSong(song);
                        setIsPlaying(!isPlaying);
                      }}
                      className="rounded-full p-3 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isPlaying && selectedSong?.id === song.id ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Now Playing */}
        {selectedSong && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{selectedSong.title}</h3>
                <p className="text-white/80 text-sm">{selectedSong.artist}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSong(null);
                  setIsPlaying(false);
                }}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <audio
              src={selectedSong.audio_file_url}
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setSelectedSong(null);
              }}
              className="w-full"
              controls
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                onClick={() => {
                  setSelectedSong(null);
                  setIsPlaying(false);
                }}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}