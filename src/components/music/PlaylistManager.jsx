import React, { useState } from 'react';
import { Plus, Music, Play, Trash2, Save, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MusicSearch from './MusicSearch';

export default function PlaylistManager({ onBack }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('playlists');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistEra, setNewPlaylistEra] = useState('mixed');
  const [newPlaylistMood, setNewPlaylistMood] = useState('mixed');
  const [currentSongs, setCurrentSongs] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date'),
  });

  const createPlaylistMutation = useMutation({
    mutationFn: (data) => base44.entities.Playlist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setNewPlaylistName('');
      setCurrentSongs([]);
      setActiveTab('playlists');
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const handleAddSong = (song) => {
    setCurrentSongs([...currentSongs, {
      title: song.title,
      artist: song.artist,
      url: song.url,
      thumbnail: song.thumbnail,
      source: song.source
    }]);
  };

  const handleRemoveSong = (index) => {
    setCurrentSongs(currentSongs.filter((_, i) => i !== index));
  };

  const handleSavePlaylist = () => {
    if (!newPlaylistName.trim() || currentSongs.length === 0) {
      alert('Please add a name and at least one song');
      return;
    }

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      era: newPlaylistEra,
      mood: newPlaylistMood,
      songs: currentSongs,
      is_ai_generated: false
    });
  };

  const handleGenerateAISuggestions = async () => {
    setGeneratingSuggestions(true);
    try {
      const response = await base44.functions.invoke('suggestMusic', {
        mood: newPlaylistMood !== 'mixed' ? newPlaylistMood : undefined,
        era: newPlaylistEra !== 'mixed' ? newPlaylistEra : undefined,
        context: 'Creating a new playlist'
      });

      if (response.data.suggestions) {
        alert(`AI suggested ${response.data.suggestions.length} songs! Search for them in the Search tab.`);
        console.log('AI Suggestions:', response.data.suggestions);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      alert('Failed to get AI suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Music & Playlists</h2>
          <p className="text-slate-600 dark:text-slate-400">Search songs and create personalized playlists</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="playlists">My Playlists</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="search">Search Songs</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="space-y-4">
          {playlists.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No playlists yet</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Playlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            playlists.map((playlist) => (
              <Card key={playlist.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {playlist.is_ai_generated && <Sparkles className="w-4 h-4 text-purple-500" />}
                        {playlist.name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {playlist.era}
                        </span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {playlist.mood}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {playlist.songs?.length || 0} songs
                  </p>
                  <div className="space-y-2">
                    {playlist.songs?.slice(0, 3).map((song, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <Play className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{song.title}</span>
                        <span className="text-slate-500 dark:text-slate-500">- {song.artist}</span>
                      </div>
                    ))}
                    {(playlist.songs?.length || 0) > 3 && (
                      <p className="text-xs text-slate-500 ml-6">+ {playlist.songs.length - 3} more songs</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Playlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Playlist Name *</label>
                <Input
                  placeholder="e.g., Dad's Favorite Songs"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Era</label>
                  <Select value={newPlaylistEra} onValueChange={setNewPlaylistEra}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="1940s">1940s</SelectItem>
                      <SelectItem value="1960s">1960s</SelectItem>
                      <SelectItem value="1980s">1980s</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={newPlaylistMood} onValueChange={setNewPlaylistMood}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateAISuggestions}
                disabled={generatingSuggestions}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generatingSuggestions ? 'Generating...' : 'Get AI Song Suggestions'}
              </Button>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Songs ({currentSongs.length})</h3>
                {currentSongs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Go to "Search Songs" tab to add music
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentSongs.map((song, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {song.thumbnail && (
                            <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{song.title}</p>
                            <p className="text-xs text-slate-500 truncate">{song.artist}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSong(idx)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSavePlaylist}
                disabled={!newPlaylistName.trim() || currentSongs.length === 0}
                className="w-full min-h-[48px] bg-blue-500 hover:bg-blue-600"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Playlist
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Music</CardTitle>
            </CardHeader>
            <CardContent>
              <MusicSearch onAddToPlaylist={handleAddSong} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}