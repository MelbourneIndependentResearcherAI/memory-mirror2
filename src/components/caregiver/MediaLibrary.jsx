import React, { useState, useRef } from 'react';
import { Upload, Music, Image, Video, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function MediaLibrary({ onBack }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [musicTitle, setMusicTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const musicInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { data: musicFiles = [] } = useQuery({
    queryKey: ['musicFiles'],
    queryFn: () => base44.entities.Music.filter({ uploaded_by_family: true }),
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['familyPhotos'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'photo' }),
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['familyVideos'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'video' }),
  });

  const uploadMusicMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Music.create({
        title: musicTitle || file.name,
        youtube_url: result.file_url,
        era: 'present',
        uploaded_by_family: true,
        genre: 'other'
      });
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: ['musicFiles'] });
      const previousMusic = queryClient.getQueryData(['musicFiles']);
      
      const optimisticMusic = {
        id: `temp_${Date.now()}`,
        title: musicTitle || file.name,
        youtube_url: 'pending',
        era: 'present',
        uploaded_by_family: true,
        genre: 'other',
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['musicFiles'], (old = []) => [...old, optimisticMusic]);
      
      return { previousMusic };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['musicFiles'], context.previousMusic);
      toast.error('Failed to upload music');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musicFiles'] });
      setMusicTitle('');
      toast.success('Music uploaded successfully!');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.FamilyMedia.create({
        title: photoCaption || file.name,
        caption: photoCaption,
        media_url: result.file_url,
        media_type: 'photo',
        era: 'present'
      });
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: ['familyPhotos'] });
      const previousPhotos = queryClient.getQueryData(['familyPhotos']);
      
      const optimisticPhoto = {
        id: `temp_${Date.now()}`,
        title: photoCaption || file.name,
        caption: photoCaption,
        media_url: URL.createObjectURL(file),
        media_type: 'photo',
        era: 'present',
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['familyPhotos'], (old = []) => [...old, optimisticPhoto]);
      
      return { previousPhotos };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['familyPhotos'], context.previousPhotos);
      toast.error('Failed to upload photo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyPhotos'] });
      setPhotoCaption('');
      toast.success('Photo uploaded successfully!');
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.FamilyMedia.create({
        title: file.name,
        media_url: result.file_url,
        media_type: 'video',
        era: 'present'
      });
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: ['familyVideos'] });
      const previousVideos = queryClient.getQueryData(['familyVideos']);
      
      const optimisticVideo = {
        id: `temp_${Date.now()}`,
        title: file.name,
        media_url: URL.createObjectURL(file),
        media_type: 'video',
        era: 'present',
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['familyVideos'], (old = []) => [...old, optimisticVideo]);
      
      return { previousVideos };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['familyVideos'], context.previousVideos);
      toast.error('Failed to upload video');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyVideos'] });
      toast.success('Video uploaded successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      if (type === 'music') {
        return base44.entities.Music.delete(id);
      } else {
        return base44.entities.FamilyMedia.delete(id);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'music') {
        queryClient.invalidateQueries({ queryKey: ['musicFiles'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['familyPhotos', 'familyVideos'] });
      }
    },
  });

  const handleMusicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }
    setUploading(true);
    try {
      await uploadMusicMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      if (musicInputRef.current) musicInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setUploading(true);
    try {
      await uploadPhotoMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setUploading(true);
    try {
      await uploadVideoMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Media Library</h2>
          <p className="text-slate-600 dark:text-slate-400">Upload music, photos, and videos for memory recall</p>
        </div>
      </div>

      <Tabs defaultValue="music" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music">
          <Card>
            <CardHeader>
              <CardTitle>Upload Music</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Song Title</label>
                <Input
                  placeholder="e.g., My Favorite Song"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                <Music className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Upload MP3, WAV, or other audio files
                </p>
                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => musicInputRef.current?.click()}
                  disabled={uploading}
                  className="min-h-[44px]"
                >
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                  Choose Audio File
                </Button>
              </div>

              <div className="space-y-3 mt-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Uploaded Music</h3>
                {musicFiles.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No music uploaded yet</p>
                ) : (
                  musicFiles.map((music) => (
                    <div key={music.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Music className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{music.title}</p>
                          <audio controls src={music.youtube_url} className="h-8 mt-1" />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate({ id: music.id, type: 'music' })}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Photo Caption</label>
                <Input
                  placeholder="e.g., Family vacation 1965"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                <Image className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Upload JPG, PNG, or other image files
                </p>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  className="min-h-[44px]"
                >
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                  Choose Photo
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.media_url}
                      alt={photo.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate({ id: photo.id, type: 'photo' })}
                        className="text-white hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{photo.caption || photo.title}</p>
                  </div>
                ))}
                {photos.length === 0 && (
                  <p className="col-span-2 text-sm text-slate-500 text-center py-8">No photos uploaded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Upload Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                <Video className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Upload MP4, MOV, or other video files
                </p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                  className="min-h-[44px]"
                >
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                  Choose Video
                </Button>
              </div>

              <div className="space-y-4 mt-6">
                {videos.map((video) => (
                  <div key={video.id} className="relative">
                    <video
                      src={video.media_url}
                      controls
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: video.id, type: 'video' })}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{video.title}</p>
                  </div>
                ))}
                {videos.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">No videos uploaded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}