import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SafeZonesManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: [],
    era_preference: 'any'
  });

  const queryClient = useQueryClient();

  const { data: zones = [] } = useQuery({
    queryKey: ['safeZones'],
    queryFn: () => base44.entities.SafeMemoryZone.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SafeMemoryZone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safeZones'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SafeMemoryZone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safeZones'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SafeMemoryZone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safeZones'] });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', keywords: [], era_preference: 'any' });
    setEditingZone(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (zone) => {
    setFormData({
      title: zone.title,
      description: zone.description,
      keywords: zone.keywords || [],
      era_preference: zone.era_preference || 'any'
    });
    setEditingZone(zone);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Safe Memory Zones & Positive Topics</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Safe Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg mb-6 space-y-4">
              <Input
                placeholder="Topic Title (e.g., 'Family Gatherings')"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description - How the AI should redirect conversations to this topic..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
              <Input
                placeholder="Keywords (comma separated, e.g., 'family, children, holidays')"
                value={formData.keywords.join(', ')}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
              <Select value={formData.era_preference} onValueChange={(value) => setFormData({ ...formData, era_preference: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Era Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Era</SelectItem>
                  <SelectItem value="1940s">1940s</SelectItem>
                  <SelectItem value="1960s">1960s</SelectItem>
                  <SelectItem value="1980s">1980s</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingZone ? 'Update' : 'Create'} Zone
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="grid gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        {zone.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(zone.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-3">{zone.description}</p>
                  {zone.keywords && zone.keywords.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {zone.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  )}
                  <Badge variant="outline">{zone.era_preference}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {zones.length === 0 && !showForm && (
            <div className="text-center py-12 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No safe zones configured yet. Add topics that bring comfort and joy.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}