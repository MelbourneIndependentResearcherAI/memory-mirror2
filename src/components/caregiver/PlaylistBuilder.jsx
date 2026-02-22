import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Music, Trash2, GripVertical, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function PlaylistBuilder() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    mood: 'mixed',
    era: 'mixed',
    song_ids: []
  });

  const [selectedSongs, setSelectedSongs] = useState([]);

  // Fetch all music
  const { data: allMusic = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list('-created_date', 200)
  });

  // Fetch all playlists
  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 100)
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData) => {
      const user = await base44.auth.me();
      return base44.entities.Playlist.create({
        ...playlistData,
        is_custom: true,
        created_by_name: user?.full_name || 'Caregiver'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      toast.success('Playlist created!');
      setIsCreating(false);
      resetForm();
    }
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      toast.success('Playlist deleted');
    }
  });

  const resetForm = () => {
    setNewPlaylist({
      name: '',
      description: '',
      mood: 'mixed',
      era: 'mixed',
      song_ids: []
    });
    setSelectedSongs([]);
  };

  const toggleSongSelection = (song) => {
    const isSelected = selectedSongs.find(s => s.id === song.id);
    if (isSelected) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } else {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedSongs);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setSelectedSongs(items);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylist.name) {
      toast.error('Please enter a playlist name');
      return;
    }

    if (selectedSongs.length === 0) {
      toast.error('Please add at least one song');
      return;
    }

    createPlaylistMutation.mutate({
      ...newPlaylist,
      song_ids: selectedSongs.map(s => s.id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Playlists</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Playlist Details */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist Name *
                </label>
                <Input
                  placeholder="e.g., Morning Calm, Dad's Favorites"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Describe this playlist..."
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Selected Songs (Draggable) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selected Songs ({selectedSongs.length})
                </label>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="selected-songs">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 min-h-[100px] bg-gray-50 p-4 rounded-lg"
                      >
                        {selectedSongs.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">
                            No songs selected. Add songs from the library below.
                          </p>
                        ) : (
                          selectedSongs.map((song, index) => (
                            <Draggable key={song.id} draggableId={song.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-2 bg-white p-3 rounded-lg border"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <Music className="w-4 h-4 text-blue-500" />
                                  <div className="flex-1">
                                    <p className="font-medium">{song.title}</p>
                                    <p className="text-xs text-gray-500">{song.artist}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSongSelection(song)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Available Music Library */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Songs from Library
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {allMusic
                    .filter(song => !selectedSongs.find(s => s.id === song.id))
                    .map(song => (
                      <div
                        key={song.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => toggleSongSelection(song)}
                      >
                        <Music className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{song.title}</p>
                          <p className="text-xs text-gray-500">{song.artist}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={createPlaylistMutation.isLoading}
                  className="flex-1"
                >
                  Create Playlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Playlists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists.filter(p => p.is_custom).map(playlist => (
          <Card key={playlist.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {playlist.name}
              </CardTitle>
              <CardDescription>
                {playlist.song_ids?.length || 0} songs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {playlist.description}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}