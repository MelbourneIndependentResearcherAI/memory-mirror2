import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Trash2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StoryLibrary() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    era: 'any',
    theme: 'family',
    mood: 'peaceful',
    length: 'short',
    narrator_note: '',
    uploaded_by_family: true,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Story.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        era: 'any',
        theme: 'family',
        mood: 'peaceful',
        length: 'short',
        narrator_note: '',
        uploaded_by_family: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Story.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.content && formData.theme) {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-900 dark:text-amber-100">
          <strong>Story Library:</strong> Add personal stories, family tales, or comforting narratives for the AI to tell.
        </AlertDescription>
      </Alert>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Story
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Story to Library</CardTitle>
            <CardDescription>Personal stories that bring comfort and joy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Story Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., The Summer Picnic"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Story Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the story here... Keep it simple, warm, and easy to follow."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme *</label>
                  <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="comfort">Comfort</SelectItem>
                      <SelectItem value="childhood">Childhood</SelectItem>
                      <SelectItem value="holidays">Holidays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Era Setting</label>
                  <Select value={formData.era} onValueChange={(v) => setFormData({ ...formData, era: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Era</SelectItem>
                      <SelectItem value="1940s">1940s</SelectItem>
                      <SelectItem value="1960s">1960s</SelectItem>
                      <SelectItem value="1980s">1980s</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="peaceful">Peaceful</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="exciting">Exciting</SelectItem>
                      <SelectItem value="comforting">Comforting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Length</label>
                  <Select value={formData.length} onValueChange={(v) => setFormData({ ...formData, length: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 min)</SelectItem>
                      <SelectItem value="medium">Medium (3-4 min)</SelectItem>
                      <SelectItem value="long">Long (5+ min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Narrator Note (optional)</label>
                <Textarea
                  value={formData.narrator_note}
                  onChange={(e) => setFormData({ ...formData, narrator_note: e.target.value })}
                  placeholder="e.g., Tell this in grandma's voice, or emphasize the happy ending..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Adding...' : 'Add Story'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Story Collection ({stories.length})
        </h3>
        {stories.length === 0 ? (
          <p className="text-slate-500 text-sm">No stories added yet</p>
        ) : (
          <div className="grid gap-3">
            {stories.map((story) => (
              <Card key={story.id} className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold">{story.title}</span>
                        {story.uploaded_by_family && (
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                        {story.content}
                      </p>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <span className="bg-amber-200 dark:bg-amber-800 px-2 py-1 rounded">{story.theme}</span>
                        <span className="bg-orange-200 dark:bg-orange-800 px-2 py-1 rounded">{story.mood}</span>
                        {story.era !== 'any' && (
                          <span className="bg-rose-200 dark:bg-rose-800 px-2 py-1 rounded">{story.era}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(story.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}