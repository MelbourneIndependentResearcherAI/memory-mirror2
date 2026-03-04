import React, { useState } from 'react';
import { Upload, Music, Trash2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function MusicUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);
  const queryClient = useQueryClient();

  // Fetch uploaded music
  const { data: uploadedMusic = [] } = useQuery({
    queryKey: ['uploadedMusic'],
    queryFn: () => base44.entities.Music.list(),
  });

  // Delete music mutation
  const deleteMusic = useMutation({
    mutationFn: (musicId) => base44.entities.Music.delete(musicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploadedMusic'] });
      toast.success('Music deleted');
      setNowPlaying(null);
      setIsPlaying(false);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file (MP3, WAV, etc)');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const uploadedFile = await base44.integrations.Core.UploadFile({
        file: file
      });

      // Create music entity
      await base44.entities.Music.create({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Uploaded',
        audio_file_url: uploadedFile.file_url,
        is_custom_upload: true,
        mood: 'uplifting',
        duration_seconds: 0
      });

      queryClient.invalidateQueries({ queryKey: ['uploadedMusic'] });
      toast.success('Music uploaded successfully!');
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload music');
    } finally {
      setIsUploading(false);
    }
  };

  const playMusic = async (music) => {
    if (nowPlaying?.id === music.id && isPlaying) {
      // Pause current
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio();
      audioRef.current.src = music.audio_file_url;
      audioRef.current.volume = 0.7;

      // Announce song
      const utterance = new SpeechSynthesisUtterance(
        `Now playing ${music.title}`
      );
      utterance.rate = 0.95;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);

      await audioRef.current.play();
      setNowPlaying(music);
      setIsPlaying(true);
      toast.success(`🎵 Now playing: ${music.title}`);

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play music');
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border-2 border-dashed border-purple-200 dark:border-purple-800">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Upload Your Music
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Add MP3, WAV, or other audio formats
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </label>
        </div>
      </div>

      {/* Uploaded Music List */}
      {uploadedMusic.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            My Music ({uploadedMusic.length})
          </h3>
          <div className="space-y-2">
            {uploadedMusic.filter(m => m.is_custom_upload).map((music) => (
              <div
                key={music.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  nowPlaying?.id === music.id
                    ? 'bg-purple-100 dark:bg-purple-900/20 border-purple-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <button
                  onClick={() => playMusic(music)}
                  className="flex-shrink-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {nowPlaying?.id === music.id && isPlaying ? (
                    <Pause className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Play className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {music.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {music.artist}
                  </p>
                </div>

                <button
                  onClick={() => deleteMusic.mutate(music.id)}
                  disabled={deleteMusic.isPending}
                  className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedMusic.filter(m => m.is_custom_upload).length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No music uploaded yet</p>
        </div>
      )}
    </div>
  );
}