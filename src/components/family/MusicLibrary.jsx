import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Music, Trash2, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MusicLibrary() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    era: '1960s',
    genre: 'rock',
    youtube_url: '',
    mood: 'calm',
    personal_significance: '',
    uploaded_by_family: true,
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Music.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music'] });
      setShowForm(false);
      setFormData({
        title: '',
        artist: '',
        era: '1960s',
        genre: 'rock',
        youtube_url: '',
        mood: 'calm',
        personal_significance: '',
        uploaded_by_family: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Music.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.era) {
      createMutation.mutate(formData);
    }
  };

  const songsByEra = {
    '1940s': songs.filter(s => s.era === '1940s'),
    '1960s': songs.filter(s => s.era === '1960s'),
    '1980s': songs.filter(s => s.era === '1980s'),
    'present': songs.filter(s => s.era === 'present'),
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
        <Music className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-900 dark:text-purple-100">
          <strong>Music Library:</strong> Add meaningful songs that the AI can play during conversations to comfort and engage.
        </AlertDescription>
      </Alert>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Song
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Song to Library</CardTitle>
            <CardDescription>Songs that are meaningful to your loved one</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Song Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Blue Moon"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Artist/Band</label>
                  <Input
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="e.g., Frank Sinatra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Era *</label>
                  <Select value={formData.era} onValueChange={(v) => setFormData({ ...formData, era: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1940s">1940s</SelectItem>
                      <SelectItem value="1960s">1960s</SelectItem>
                      <SelectItem value="1980s">1980s</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="big_band">Big Band</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="folk">Folk</SelectItem>
                      <SelectItem value="disco">Disco</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">YouTube URL (optional)</label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Why is this song special?</label>
                <Textarea
                  value={formData.personal_significance}
                  onChange={(e) => setFormData({ ...formData, personal_significance: e.target.value })}
                  placeholder="e.g., This was their wedding song, or they used to dance to this..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Adding...' : 'Add Song'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {Object.entries(songsByEra).map(([era, eraSongs]) => (
        eraSongs.length > 0 && (
          <div key={era} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{era} Music ({eraSongs.length})</h3>
            <div className="grid gap-3">
              {eraSongs.map((song) => (
                <Card key={song.id} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Music className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">{song.title}</span>
                        </div>
                        {song.artist && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{song.artist}</p>
                        )}
                        {song.personal_significance && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 dark:bg-slate-900/50 rounded">
                            <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 dark:text-slate-300">{song.personal_significance}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(song.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}