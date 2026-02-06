import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MemoryManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    era: 'present',
    emotional_tone: 'joyful',
    people_involved: [],
    location: '',
    tags: [],
    image_url: ''
  });

  const queryClient = useQueryClient();

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onMutate: async (newMemory) => {
      await queryClient.cancelQueries({ queryKey: ['memories'] });
      const previousMemories = queryClient.getQueryData(['memories']);
      
      queryClient.setQueryData(['memories'], (old) => [
        { ...newMemory, id: `temp-${Date.now()}`, created_date: new Date().toISOString() },
        ...(old || [])
      ]);
      
      return { previousMemories };
    },
    onError: (err, newMemory, context) => {
      queryClient.setQueryData(['memories'], context.previousMemories);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Memory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Memory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      era: 'present',
      emotional_tone: 'joyful',
      people_involved: [],
      location: '',
      tags: [],
      image_url: ''
    });
    setEditingMemory(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMemory) {
      updateMutation.mutate({ id: editingMemory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (memory) => {
    setFormData({
      title: memory.title,
      description: memory.description,
      era: memory.era || 'present',
      emotional_tone: memory.emotional_tone || 'joyful',
      people_involved: memory.people_involved || [],
      location: memory.location || '',
      tags: memory.tags || [],
      image_url: memory.image_url || ''
    });
    setEditingMemory(memory);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Memory Gallery</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg mb-6 space-y-4">
              <Input
                placeholder="Memory Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Describe this memory in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.era} onValueChange={(value) => setFormData({ ...formData, era: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Era" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1940s">1940s</SelectItem>
                    <SelectItem value="1960s">1960s</SelectItem>
                    <SelectItem value="1980s">1980s</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.emotional_tone} onValueChange={(value) => setFormData({ ...formData, emotional_tone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joyful">Joyful</SelectItem>
                    <SelectItem value="peaceful">Peaceful</SelectItem>
                    <SelectItem value="proud">Proud</SelectItem>
                    <SelectItem value="loving">Loving</SelectItem>
                    <SelectItem value="nostalgic">Nostalgic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                placeholder="People involved (comma separated)"
                value={formData.people_involved.join(', ')}
                onChange={(e) => setFormData({ ...formData, people_involved: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
              <Input
                placeholder="Image URL (optional)"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingMemory ? 'Update' : 'Create'} Memory
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{memory.title}</CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline">{memory.era}</Badge>
                        <Badge className="bg-pink-100 text-pink-800">{memory.emotional_tone}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(memory)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(memory.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {memory.image_url && (
                    <img src={memory.image_url} alt={memory.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <p className="text-slate-600 text-sm mb-3">{memory.description}</p>
                  {memory.location && (
                    <p className="text-slate-500 text-xs mb-2">📍 {memory.location}</p>
                  )}
                  {memory.people_involved && memory.people_involved.length > 0 && (
                    <p className="text-slate-500 text-xs mb-2">👥 {memory.people_involved.join(', ')}</p>
                  )}
                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {memory.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {memories.length === 0 && !showForm && (
            <div className="text-center py-12 text-slate-500">
              <BookHeart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No memories added yet. Click "Add Memory" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}