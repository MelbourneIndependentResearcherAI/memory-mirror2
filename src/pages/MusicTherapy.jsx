import React, { useState, useRef } from 'react';
import { Music, Upload, Play, Pause, X, Video, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function MusicTherapy() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMediaType, setUploadMediaType] = useState('audio'); // 'audio' | 'video'
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ['musicTracks'],
    queryFn: () => base44.entities.Music.list()
  });

  // Videos stored in FamilyMedia with media_type='video' tagged as therapy
  const { data: therapyVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['therapyVideos'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'video' })
  });

  const uploadAudioMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Music.create({
        title: uploadTitle || file.name.replace(/\.[^/.]+$/, ''),
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
      resetUpload();
    },
    onError: () => toast.error('Failed to upload music')
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const me = await base44.auth.me();
      return base44.entities.FamilyMedia.create({
        title: uploadTitle || file.name.replace(/\.[^/.]+$/, ''),
        media_url: file_url,
        media_type: 'video',
        era: 'present',
        caption: 'Therapy video',
        uploaded_by_name: me?.full_name || 'Caregiver'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapyVideos'] });
      toast.success('Video added successfully!');
      resetUpload();
    },
    onError: () => toast.error('Failed to upload video')
  });

  const resetUpload = () => {
    setShowUpload(false);
    setUploadTitle('');
    setPreviewUrl(null);
    setUploading(false);
    if (audioRef.current) audioRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
  };

  const handleFileChange = (e, _type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const file = uploadMediaType === 'audio'
      ? audioRef.current?.files?.[0]
      : videoRef.current?.files?.[0];
    if (!file) { toast.error(`Please select a ${uploadMediaType} file`); return; }
    setUploading(true);
    try {
      if (uploadMediaType === 'audio') {
        await uploadAudioMutation.mutateAsync(file);
      } else {
        await uploadVideoMutation.mutateAsync(file);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 dark:from-purple-900 dark:via-pink-900 dark:to-purple-800 p-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:text-purple-900 min-h-[44px]">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <Button onClick={() => setShowUpload(!showUpload)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4" /> Add Media
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-10 h-10 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Music Therapy</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Therapeutic music and videos for comfort and wellbeing</p>
        </div>

        {/* Upload Panel */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Therapeutic Media</h2>
                <button onClick={resetUpload} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              {/* Type toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setUploadMediaType('audio'); setPreviewUrl(null); if (videoRef.current) videoRef.current.value = ''; }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition ${uploadMediaType === 'audio' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  <Music className="w-4 h-4" /> Audio
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadMediaType('video'); setPreviewUrl(null); if (audioRef.current) audioRef.current.value = ''; }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition ${uploadMediaType === 'video' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input placeholder="e.g., Calming Nature Sounds" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
                </div>

                {/* Drop zone */}
                {uploadMediaType === 'audio' ? (
                  <div
                    className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-6 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                    onClick={() => audioRef.current?.click()}
                  >
                    {previewUrl ? (
                      <audio src={previewUrl} controls className="w-full" />
                    ) : (
                      <>
                        <Music className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                        <p className="text-sm text-slate-500">Click to choose an audio file (MP3, WAV, etc.)</p>
                      </>
                    )}
                    <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileChange(e, 'audio')} />
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-6 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                    onClick={() => videoRef.current?.click()}
                  >
                    {previewUrl ? (
                      <video src={previewUrl} controls className="max-h-40 mx-auto rounded-lg" />
                    ) : (
                      <>
                        <Video className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                        <p className="text-sm text-slate-500">Click to choose a video file (MP4, MOV, etc.)</p>
                      </>
                    )}
                    <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                  </div>
                )}

                <Button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Uploading...' : `Upload ${uploadMediaType === 'audio' ? 'Audio' : 'Video'}`}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <Tabs defaultValue="music">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="w-4 h-4" /> Music ({songs.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Videos ({therapyVideos.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Music tab ── */}
          <TabsContent value="music">
            {songsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading music...</div>
            ) : songs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow">
                <Music className="w-14 h-14 mx-auto text-purple-300 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No music yet. Add your first track!</p>
                <Button onClick={() => { setUploadMediaType('audio'); setShowUpload(true); }} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" /> Add Music
                </Button>
              </div>
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{song.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{song.artist}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {song.mood && <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">{song.mood}</span>}
                          {song.era && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{song.era}</span>}
                        </div>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); setSelectedSong(song); setIsPlaying(!isPlaying); }}
                        className="rounded-full p-3 bg-purple-600 hover:bg-purple-700 text-white ml-3 flex-shrink-0"
                      >
                        {isPlaying && selectedSong?.id === song.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Videos tab ── */}
          <TabsContent value="videos">
            {videosLoading ? (
              <div className="text-center py-8 text-slate-500">Loading videos...</div>
            ) : therapyVideos.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow">
                <Video className="w-14 h-14 mx-auto text-purple-300 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No therapy videos yet. Add one!</p>
                <Button onClick={() => { setUploadMediaType('video'); setShowUpload(true); }} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" /> Add Video
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {therapyVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border-l-4 border-purple-500"
                  >
                    <video src={video.media_url} controls className="w-full max-h-72 bg-black" preload="metadata" />
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{video.title}</h3>
                      {video.uploaded_by_name && <p className="text-sm text-slate-500 mt-1">By {video.uploaded_by_name}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Now Playing Bar */}
        {selectedSong && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold">{selectedSong.title}</h3>
                <p className="text-white/80 text-sm">{selectedSong.artist}</p>
              </div>
              <button onClick={() => { setSelectedSong(null); setIsPlaying(false); }} className="hover:bg-white/20 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <audio
              src={selectedSong.audio_file_url}
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => { setIsPlaying(false); setSelectedSong(null); }}
              className="w-full"
              controls
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}