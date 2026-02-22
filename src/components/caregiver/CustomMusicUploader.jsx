import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Music, Link as LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomMusicUploader({ onUploadComplete }) {
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'youtube'
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    era: 'custom',
    genre: 'custom',
    mood: 'calm',
    personal_significance: '',
    youtube_url: '',
    audio_file: null
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      setFormData({ ...formData, audio_file: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (uploadType === 'file' && !formData.audio_file) {
      toast.error('Please select an audio file');
      return;
    }

    if (uploadType === 'youtube' && !formData.youtube_url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setUploading(true);

    try {
      let audio_file_url = null;

      // Upload audio file if provided
      if (uploadType === 'file' && formData.audio_file) {
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: formData.audio_file
        });
        audio_file_url = uploadResult.file_url;
      }

      // Create Music record
      const musicData = {
        title: formData.title,
        artist: formData.artist || 'Unknown Artist',
        era: formData.era,
        genre: formData.genre,
        mood: formData.mood,
        personal_significance: formData.personal_significance,
        uploaded_by_family: true,
        is_custom_upload: uploadType === 'file',
        ...(uploadType === 'youtube' && { youtube_url: formData.youtube_url }),
        ...(audio_file_url && { audio_file_url })
      };

      await base44.entities.Music.create(musicData);

      toast.success('Music added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        artist: '',
        era: 'custom',
        genre: 'custom',
        mood: 'calm',
        personal_significance: '',
        youtube_url: '',
        audio_file: null
      });

      if (onUploadComplete) onUploadComplete();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload music');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Add Custom Music
        </CardTitle>
        <CardDescription>
          Upload audio files or add YouTube links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadType === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadType('file')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadType === 'youtube' ? 'default' : 'outline'}
              onClick={() => setUploadType('youtube')}
              className="flex-1"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              YouTube Link
            </Button>
          </div>

          {/* File Upload */}
          {uploadType === 'file' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Audio File (MP3, WAV, etc.)
              </label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {formData.audio_file && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.audio_file.name}
                </p>
              )}
            </div>
          )}

          {/* YouTube URL */}
          {uploadType === 'youtube' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                YouTube URL
              </label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Song Title *
            </label>
            <Input
              type="text"
              placeholder="e.g., Dancing Queen"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Artist
            </label>
            <Input
              type="text"
              placeholder="e.g., ABBA"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            />
          </div>

          {/* Era */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Era
            </label>
            <Select value={formData.era} onValueChange={(val) => setFormData({ ...formData, era: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1940s">1940s</SelectItem>
                <SelectItem value="1960s">1960s</SelectItem>
                <SelectItem value="1980s">1980s</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mood
            </label>
            <Select value={formData.mood} onValueChange={(val) => setFormData({ ...formData, mood: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uplifting">Uplifting</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="nostalgic">Nostalgic</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personal Significance */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Significance (Optional)
            </label>
            <Textarea
              placeholder="Why is this song meaningful? (e.g., 'Their wedding song')"
              value={formData.personal_significance}
              onChange={(e) => setFormData({ ...formData, personal_significance: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Music
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}