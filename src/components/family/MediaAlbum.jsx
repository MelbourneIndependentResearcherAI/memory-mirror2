import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image, Video, Trash2, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MediaAlbum() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    media_url: '',
    media_type: 'photo',
    uploaded_by_name: '',
    era: 'unknown',
    people_in_media: [],
  });

  const { data: mediaItems = [] } = useQuery({
    queryKey: ['family-media'],
    queryFn: () => base44.entities.FamilyMedia.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMedia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-media'] });
      setShowForm(false);
      setFormData({
        title: '',
        caption: '',
        media_url: '',
        media_type: 'photo',
        uploaded_by_name: '',
        era: 'unknown',
        people_in_media: [],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMedia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-media'] });
      setSelectedMedia(null);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, media_url: result.file_url, media_type: file.type.startsWith('video') ? 'video' : 'photo' });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.media_url && formData.uploaded_by_name) {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
        <Image className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-900 dark:text-purple-100">
          <strong>Family Album:</strong> Share photos and videos that bring joy and comfort. The AI can reference these during conversations.
        </AlertDescription>
      </Alert>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Upload Photo/Video
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Upload File *</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="text-blue-600">Uploading...</div>
                    ) : formData.media_url ? (
                      <div className="text-green-600">✓ File uploaded</div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload photo or video</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Vacation 1985"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Caption/Story</label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Share the story behind this memory..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={formData.era} onValueChange={(v) => setFormData({ ...formData, era: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="1940s">1940s</SelectItem>
                      <SelectItem value="1960s">1960s</SelectItem>
                      <SelectItem value="1980s">1980s</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name *</label>
                  <Input
                    value={formData.uploaded_by_name}
                    onChange={(e) => setFormData({ ...formData, uploaded_by_name: e.target.value })}
                    placeholder="Who is uploading this?"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">People in Photo/Video</label>
                <Input
                  value={formData.people_in_media.join(', ')}
                  onChange={(e) => setFormData({ ...formData, people_in_media: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g., Mom, Dad, Sarah (comma separated)"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isLoading || uploading || !formData.media_url}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Adding...' : 'Add to Album'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMedia(item)}>
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 relative">
              {item.media_type === 'photo' ? (
                <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-semibold truncate">{item.title}</p>
              {item.era !== 'unknown' && (
                <p className="text-xs text-slate-500">{item.era}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{selectedMedia.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMedia(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMedia.media_type === 'photo' ? (
                <img src={selectedMedia.media_url} alt={selectedMedia.title} className="w-full rounded-lg" />
              ) : (
                <video src={selectedMedia.media_url} controls className="w-full rounded-lg" />
              )}
              
              {selectedMedia.caption && (
                <p className="text-slate-700 dark:text-slate-300">{selectedMedia.caption}</p>
              )}
              
              <div className="flex flex-wrap gap-2 text-sm">
                {selectedMedia.era !== 'unknown' && (
                  <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">{selectedMedia.era}</span>
                )}
                {selectedMedia.people_in_media?.length > 0 && (
                  <span className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
                    {selectedMedia.people_in_media.join(', ')}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-slate-500">Uploaded by {selectedMedia.uploaded_by_name}</p>
              
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedMedia.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete from Album
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}