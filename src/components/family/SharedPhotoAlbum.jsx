import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image as ImageIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedPhotoAlbum() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    era: 'present',
    people_in_media: []
  });

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['family-photos'],
    queryFn: () => base44.entities.FamilyMedia.filter({ media_type: 'photo' }, '-created_date')
  });

  const uploadMutation = useMutation({
    mutationFn: async (photoData) => {
      return await base44.entities.FamilyMedia.create(photoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-photos'] });
      toast.success('Photo uploaded successfully!');
      setShowUpload(false);
      setFormData({ title: '', caption: '', era: 'present', people_in_media: [] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const photoData = {
        ...formData,
        media_url: file_url,
        media_type: 'photo',
        uploaded_by_name: familyMemberName || 'Family Member'
      };

      await uploadMutation.mutateAsync(photoData);
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            📸 Shared Family Album
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Everyone can add photos to share with your loved one
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {showUpload && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={familyMemberName}
                onChange={(e) => setFamilyMemberName(e.target.value)}
                placeholder="e.g., Sarah (Daughter)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photo Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Christmas 1985"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Caption / Story</label>
              <Textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Tell the story behind this photo..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Era</label>
              <select
                value={formData.era}
                onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800"
              >
                <option value="1940s">1940s</option>
                <option value="1960s">1960s</option>
                <option value="1980s">1980s</option>
                <option value="present">Present Day</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || !formData.title}
                className="w-full"
              />
              {!formData.title && (
                <p className="text-xs text-amber-600 mt-1">Please add a title first</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUpload(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading photos...
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <ImageIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No photos yet. Be the first to add one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative">
                <img
                  src={photo.media_url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1">{photo.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {photo.caption?.substring(0, 60)}...
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.era}</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Added by {photo.uploaded_by_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}