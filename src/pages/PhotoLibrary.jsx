import React, { useState, useRef } from 'react';
import { ImagePlus, ChevronRight, ChevronLeft, ArrowLeft, Upload, Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const photoFileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'photo' })
  });

  const currentPhoto = photos[selectedIndex];

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.FamilyMedia.create({
        title: title || file.name,
        caption,
        media_url: result.file_url,
        media_type: 'photo',
        era: 'present',
        uploaded_by_name: (await base44.auth.me())?.full_name || 'Family'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMedia'] });
      toast.success('Photo uploaded successfully!');
      setShowUpload(false);
      setTitle('');
      setCaption('');
      setPreviewUrl(null);
      if (photoFileRef.current) photoFileRef.current.value = '';
    },
    onError: (error) => {
      toast.error('Failed to upload photo: ' + error.message);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const file = photoFileRef.current?.files?.[0];
    if (!file) { toast.error('Please select a photo'); return; }
    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

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
            Add Photo
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ImagePlus className="w-10 h-10 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Photo Library</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Cherished memories in photos</p>
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
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upload a Photo</h2>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <Input
                    placeholder="e.g., Family Reunion 1968"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Caption</label>
                  <Textarea
                    placeholder="Describe what's in this photo..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* File Picker */}
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
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <Button type="submit" disabled={uploading} className="w-full bg-amber-500 hover:bg-amber-600">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Photo Display */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : currentPhoto ? (
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
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow">
            <ImagePlus className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No photos yet. Add your first memory!</p>
            <Button onClick={() => setShowUpload(true)} className="bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" /> Add Photo
            </Button>
          </div>
        )}

        {/* Thumbnail Grid */}
        {photos.length > 0 && (
          <div>
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
                  <img
                    src={photo.media_url}
                    alt={photo.title}
                    className="w-full h-20 object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}