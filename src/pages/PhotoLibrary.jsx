import React, { useState, useRef } from 'react';
import { ImagePlus, ChevronRight, ChevronLeft, ArrowLeft, Upload, Loader2, X, Plus, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function PhotoLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState('photo'); // 'photo' | 'video'
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const photoFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['familyMedia', 'photo'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'photo' })
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['familyMedia', 'video'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'video' })
  });

  const currentPhoto = photos[selectedIndex];

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      const me = await base44.auth.me();
      return base44.entities.FamilyMedia.create({
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        caption,
        media_url: result.file_url,
        media_type: type,
        era: 'present',
        uploaded_by_name: me?.full_name || 'Family'
      });
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['familyMedia'] });
      toast.success(`${type === 'photo' ? 'Photo' : 'Video'} uploaded successfully!`);
      setShowUpload(false);
      setTitle('');
      setCaption('');
      setPreviewUrl(null);
      if (photoFileRef.current) photoFileRef.current.value = '';
      if (videoFileRef.current) videoFileRef.current.value = '';
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    }
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadType(type);
    if (type === 'photo') {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(URL.createObjectURL(file));
    }
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const file = uploadType === 'photo'
      ? photoFileRef.current?.files?.[0]
      : videoFileRef.current?.files?.[0];
    if (!file) { toast.error(`Please select a ${uploadType}`); return; }
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, type: uploadType });
    } finally {
      setUploading(false);
    }
  };

  const isLoading = photosLoading || videosLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-amber-950 dark:to-yellow-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ImagePlus className="w-10 h-10 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Photo & Video Library</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Cherished memories in photos and videos</p>
        </div>

        {/* Upload Panel */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upload Media</h2>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setUploadType('photo'); setPreviewUrl(null); if (videoFileRef.current) videoFileRef.current.value = ''; }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition ${uploadType === 'photo' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  <ImagePlus className="w-4 h-4" /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadType('video'); setPreviewUrl(null); if (photoFileRef.current) photoFileRef.current.value = ''; }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition ${uploadType === 'video' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'}`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <Input
                    placeholder={uploadType === 'photo' ? 'e.g., Family Reunion 1968' : 'e.g., Christmas Morning 1975'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Caption</label>
                  <Textarea
                    placeholder={`Describe this ${uploadType}...`}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* File Picker */}
                {uploadType === 'photo' ? (
                  <div
                    className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                    onClick={() => photoFileRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="w-10 h-10 mx-auto mb-2 text-amber-400" />
                        <p className="text-sm text-slate-500">Click to choose a photo (JPG, PNG, etc.)</p>
                      </>
                    )}
                    <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} />
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                    onClick={() => videoFileRef.current?.click()}
                  >
                    {previewUrl ? (
                      <video src={previewUrl} className="max-h-48 mx-auto rounded-lg" controls />
                    ) : (
                      <>
                        <Video className="w-10 h-10 mx-auto mb-2 text-amber-400" />
                        <p className="text-sm text-slate-500">Click to choose a video (MP4, MOV, etc.)</p>
                      </>
                    )}
                    <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                  </div>
                )}

                <Button type="submit" disabled={uploading} className="w-full bg-amber-500 hover:bg-amber-600">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Uploading...' : `Upload ${uploadType === 'photo' ? 'Photo' : 'Video'}`}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs for Photos / Videos */}
        <Tabs defaultValue="photos">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Videos ({videos.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Photos tab ── */}
          <TabsContent value="photos">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : currentPhoto ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-6"
                >
                  <div className="relative bg-black">
                    <img
                      src={currentPhoto.media_url}
                      alt={currentPhoto.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <Button
                        onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                        disabled={selectedIndex === 0}
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </Button>
                      <Button
                        onClick={() => setSelectedIndex(Math.min(photos.length - 1, selectedIndex + 1))}
                        disabled={selectedIndex === photos.length - 1}
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 disabled:opacity-30"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPhoto.title}</h2>
                    {currentPhoto.caption && (
                      <p className="text-slate-600 dark:text-slate-400 mt-2">{currentPhoto.caption}</p>
                    )}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {currentPhoto.era && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                          {currentPhoto.era}
                        </span>
                      )}
                      {currentPhoto.uploaded_by_name && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                          By {currentPhoto.uploaded_by_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                      {selectedIndex + 1} of {photos.length}
                    </p>
                  </div>
                </motion.div>

                {/* Thumbnails */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Photos ({photos.length})</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, idx) => (
                    <motion.button
                      key={photo.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative rounded-lg overflow-hidden border-4 transition-all ${
                        selectedIndex === idx
                          ? 'border-amber-500 shadow-lg'
                          : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      <img src={photo.media_url} alt={photo.title} className="w-full h-20 object-cover" />
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow">
                <ImagePlus className="w-16 h-16 mx-auto text-amber-300 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No photos yet. Add your first memory!</p>
                <Button onClick={() => { setUploadType('photo'); setShowUpload(true); }} className="bg-amber-500 hover:bg-amber-600 gap-2">
                  <Plus className="w-4 h-4" /> Add Photo
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Videos tab ── */}
          <TabsContent value="videos">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : videos.length > 0 ? (
              <div className="space-y-6">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <video
                      src={video.media_url}
                      controls
                      className="w-full max-h-96 bg-black"
                      preload="metadata"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{video.title}</h3>
                      {video.caption && <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">{video.caption}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {video.era && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                            {video.era}
                          </span>
                        )}
                        {video.uploaded_by_name && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                            By {video.uploaded_by_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow">
                <Play className="w-16 h-16 mx-auto text-amber-300 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No videos yet. Add your first video memory!</p>
                <Button onClick={() => { setUploadType('video'); setShowUpload(true); }} className="bg-amber-500 hover:bg-amber-600 gap-2">
                  <Plus className="w-4 h-4" /> Add Video
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}