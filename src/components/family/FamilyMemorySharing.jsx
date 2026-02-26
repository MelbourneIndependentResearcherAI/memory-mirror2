import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, Music, BookOpen, Video, Heart, MessageCircle, Eye, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function FamilyMemorySharing() {
  const queryClient = useQueryClient();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    memory_type: 'story',
    era: 'present',
    shared_by_name: '',
    people_involved: '',
    tags: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sharedMemories = [], isLoading } = useQuery({
    queryKey: ['sharedMemories'],
    queryFn: () => base44.entities.SharedMemory.list('-created_date'),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['caregiverTeam'],
    queryFn: () => base44.entities.CaregiverTeam.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: async (memoryData) => base44.entities.SharedMemory.create(memoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedMemories'] });
      toast.success('Memory shared with family!');
      setShowUploadForm(false);
      resetForm();
    }
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SharedMemory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedMemories'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      memory_type: 'story',
      era: 'present',
      shared_by_name: '',
      people_involved: '',
      tags: ''
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const memoryData = {
        ...formData,
        media_url: file_url,
        shared_by_email: user?.email || '',
        people_involved: formData.people_involved.split(',').map(p => p.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        shared_with: teamMembers.map(m => m.caregiver_email)
      };

      await uploadMutation.mutateAsync(memoryData);
    } catch (error) {
      toast.error('Failed to upload memory');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in title and content');
      return;
    }

    setUploading(true);
    try {
      const memoryData = {
        ...formData,
        shared_by_email: user?.email || '',
        people_involved: formData.people_involved.split(',').map(p => p.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        shared_with: teamMembers.map(m => m.caregiver_email)
      };

      await uploadMutation.mutateAsync(memoryData);
    } catch (error) {
      toast.error('Failed to share memory');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (memoryId) => {
    if (!newComment.trim()) return;

    const memory = sharedMemories.find(m => m.id === memoryId);
    const updatedComments = [
      ...(memory.comments || []),
      {
        author_name: user?.full_name || 'Family Member',
        author_email: user?.email || '',
        comment: newComment,
        timestamp: new Date().toISOString()
      }
    ];

    await updateMemoryMutation.mutateAsync({
      id: memoryId,
      data: { comments: updatedComments }
    });

    setNewComment('');
    toast.success('Comment added');
  };

  const handleToggleFavorite = async (memory) => {
    await updateMemoryMutation.mutateAsync({
      id: memory.id,
      data: { is_favorite: !memory.is_favorite }
    });
  };

  const handleIncrementView = async (memoryId) => {
    const memory = sharedMemories.find(m => m.id === memoryId);
    if (memory) {
      await updateMemoryMutation.mutateAsync({
        id: memoryId,
        data: { view_count: (memory.view_count || 0) + 1 }
      });
    }
  };

  const getMemoryIcon = (type) => {
    switch (type) {
      case 'photo': return <Image className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Share2 className="w-8 h-8 text-pink-600" />
            Family Memory Library
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Share stories, photos, and audio with your loved one and care team
          </p>
        </div>
        <Button
          onClick={() => setShowUploadForm(true)}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Share Memory
        </Button>
      </div>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share a Memory with Family</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <Input
                value={formData.shared_by_name}
                onChange={(e) => setFormData({ ...formData, shared_by_name: e.target.value })}
                placeholder="e.g., Sarah (Daughter)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Memory Type *</label>
              <select
                value={formData.memory_type}
                onChange={(e) => setFormData({ ...formData, memory_type: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-slate-800"
              >
                <option value="story">📖 Written Story</option>
                <option value="photo">📸 Photo</option>
                <option value="audio">🎵 Audio Clip</option>
                <option value="video">🎥 Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Christmas 1965"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.memory_type === 'story' ? 'Story / Description *' : 'Description'}
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tell the story or describe what this memory means..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <option value="present">Present</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">People in Memory</label>
                <Input
                  value={formData.people_involved}
                  onChange={(e) => setFormData({ ...formData, people_involved: e.target.value })}
                  placeholder="Names (comma separated)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (optional)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="family, vacation, celebration (comma separated)"
              />
            </div>

            {formData.memory_type !== 'story' && (
              <div>
                <label className="block text-sm font-medium mb-2">Upload File *</label>
                <input
                  type="file"
                  accept={
                    formData.memory_type === 'photo' ? 'image/*' :
                    formData.memory_type === 'audio' ? 'audio/*' :
                    'video/*'
                  }
                  onChange={handleFileUpload}
                  disabled={uploading || !formData.title || !formData.shared_by_name}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  resetForm();
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              {formData.memory_type === 'story' && (
                <Button
                  onClick={handleSubmitStory}
                  disabled={uploading || !formData.title || !formData.content || !formData.shared_by_name}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? 'Sharing...' : 'Share Story'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared Memories Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-600">Loading memories...</div>
      ) : sharedMemories.length === 0 ? (
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
          <CardContent className="text-center py-12">
            <Share2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No shared memories yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start building your family memory library by sharing photos, stories, and audio clips
            </p>
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Share Your First Memory
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedMemories.map((memory) => (
            <Card 
              key={memory.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                handleIncrementView(memory.id);
                setSelectedMemory(memory);
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {getMemoryIcon(memory.memory_type)}
                    <span className="line-clamp-1">{memory.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(memory);
                    }}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <Heart className={`w-5 h-5 ${memory.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{memory.era}</Badge>
                  <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                    {memory.memory_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {memory.media_url && memory.memory_type === 'photo' && (
                  <img 
                    src={memory.media_url} 
                    alt={memory.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                {memory.media_url && memory.memory_type === 'audio' && (
                  <audio controls src={memory.media_url} className="w-full" />
                )}

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {memory.content}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>by {memory.shared_by_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {memory.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {memory.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Memory Detail Modal */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedMemory && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getMemoryIcon(selectedMemory.memory_type)}
                  {selectedMemory.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedMemory.era}</Badge>
                  <Badge className="bg-pink-100 text-pink-800">{selectedMemory.memory_type}</Badge>
                  {selectedMemory.is_favorite && (
                    <Badge className="bg-red-100 text-red-800">⭐ Favorite</Badge>
                  )}
                </div>

                {selectedMemory.media_url && (
                  <div className="rounded-lg overflow-hidden">
                    {selectedMemory.memory_type === 'photo' && (
                      <img src={selectedMemory.media_url} alt={selectedMemory.title} className="w-full" />
                    )}
                    {selectedMemory.memory_type === 'audio' && (
                      <audio controls src={selectedMemory.media_url} className="w-full" />
                    )}
                    {selectedMemory.memory_type === 'video' && (
                      <video controls src={selectedMemory.media_url} className="w-full" />
                    )}
                  </div>
                )}

                {selectedMemory.content && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedMemory.content}
                    </p>
                  </div>
                )}

                {selectedMemory.people_involved?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">People in this memory:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.people_involved.map((person, idx) => (
                        <Badge key={idx} variant="outline">{person}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Shared by {selectedMemory.shared_by_name} • {selectedMemory.view_count || 0} views
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Family Comments ({selectedMemory.comments?.length || 0})
                  </h4>
                  
                  {selectedMemory.comments?.map((comment, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{comment.author_name}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{comment.comment}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAddComment(selectedMemory.id)}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}