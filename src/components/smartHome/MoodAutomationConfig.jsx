import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Save, X, Lightbulb, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MoodAutomationConfig() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mood_label: 'anxious',
    anxiety_threshold: 6,
    device_actions: [],
    music_playlist_id: '',
    auto_trigger: false,
    description: '',
    is_enabled: true
  });

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['moodAutomations'],
    queryFn: () => base44.entities.MoodBasedAutomation.list()
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['smartDevices'],
    queryFn: () => base44.entities.SmartDevice.list()
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodBasedAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodAutomations'] });
      resetForm();
      toast.success('Mood automation created');
    },
    onError: (error) => toast.error('Failed to create automation: ' + error.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MoodBasedAutomation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodAutomations'] });
      resetForm();
      toast.success('Mood automation updated');
    },
    onError: (error) => toast.error('Failed to update automation: ' + error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MoodBasedAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodAutomations'] });
      toast.success('Mood automation deleted');
    },
    onError: (error) => toast.error('Failed to delete automation: ' + error.message)
  });

  const resetForm = () => {
    setFormData({
      name: '',
      mood_label: 'anxious',
      anxiety_threshold: 6,
      device_actions: [],
      music_playlist_id: '',
      auto_trigger: false,
      description: '',
      is_enabled: true
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (automation) => {
    setFormData(automation);
    setEditingId(automation.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Automation name is required');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addDeviceAction = () => {
    setFormData(prev => ({
      ...prev,
      device_actions: [
        ...prev.device_actions,
        { device_id: '', action: 'set_brightness', parameters: { brightness: 30 } }
      ]
    }));
  };

  const updateDeviceAction = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      device_actions: prev.device_actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const removeDeviceAction = (index) => {
    setFormData(prev => ({
      ...prev,
      device_actions: prev.device_actions.filter((_, i) => i !== index)
    }));
  };

  const moodOptions = ['calm', 'anxious', 'happy', 'confused', 'agitated', 'peaceful'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mood-Based Automations</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? 'Edit Automation' : 'Create New Automation'}</span>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Anxiety Relief, Calm Evening"
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this automation do?"
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Trigger Mood</label>
                <select
                  value={formData.mood_label}
                  onChange={(e) => setFormData({ ...formData, mood_label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                >
                  {moodOptions.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Anxiety Threshold</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.anxiety_threshold}
                  onChange={(e) => setFormData({ ...formData, anxiety_threshold: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoTrigger"
                checked={formData.auto_trigger}
                onChange={(e) => setFormData({ ...formData, auto_trigger: e.target.checked })}
              />
              <label htmlFor="autoTrigger" className="text-sm">Auto-apply without asking (instead of suggesting)</label>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Device Actions</label>
                <Button size="sm" variant="outline" onClick={addDeviceAction} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Device
                </Button>
              </div>

              <div className="space-y-3">
                {formData.device_actions.map((action, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-700 rounded-lg border">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 space-y-2">
                        <select
                          value={action.device_id}
                          onChange={(e) => updateDeviceAction(idx, { device_id: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-600"
                        >
                          <option value="">Select device...</option>
                          {devices.map(dev => (
                            <option key={dev.id} value={dev.id}>{dev.name}</option>
                          ))}
                        </select>

                        <select
                          value={action.action}
                          onChange={(e) => updateDeviceAction(idx, { action: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-600"
                        >
                          <option value="turn_on">Turn On</option>
                          <option value="turn_off">Turn Off</option>
                          <option value="set_brightness">Set Brightness</option>
                          <option value="set_temperature">Set Temperature</option>
                          <option value="play_audio">Play Audio</option>
                        </select>

                        {(action.action === 'set_brightness' || action.action === 'set_temperature') && (
                          <input
                            type="number"
                            placeholder={action.action === 'set_brightness' ? 'Brightness (0-100)' : 'Temperature (°F)'}
                            value={action.parameters?.[action.action === 'set_brightness' ? 'brightness' : 'temperature'] || ''}
                            onChange={(e) => updateDeviceAction(idx, {
                              parameters: {
                                ...action.parameters,
                                [action.action === 'set_brightness' ? 'brightness' : 'temperature']: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded dark:bg-slate-600"
                          />
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeDeviceAction(idx)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Optional: Play Music</label>
              <select
                value={formData.music_playlist_id}
                onChange={(e) => setFormData({ ...formData, music_playlist_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="">No music</option>
                {playlists.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'} Automation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading automations...</div>
      ) : automations.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-800">
          <CardContent className="py-8 text-center text-slate-500">
            No mood-based automations yet. Create one to automatically adjust your environment based on detected mood.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {automations.map(automation => (
            <Card key={automation.id} className={`${!automation.is_enabled ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    {automation.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{automation.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(automation)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(automation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Mood</span>
                    <p className="font-semibold capitalize">{automation.mood_label}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Trigger at Anxiety</span>
                    <p className="font-semibold">≥ {automation.anxiety_threshold}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Mode</span>
                    <p className="font-semibold">{automation.auto_trigger ? 'Auto' : 'Suggest'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <p className="font-semibold text-green-600">{automation.is_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Devices:</p>
                  <div className="flex flex-wrap gap-2">
                    {automation.device_actions.map((action, idx) => {
                      const device = devices.find(d => d.id === action.device_id);
                      return (
                        <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          {device?.name || 'Unknown'}: {action.action}
                        </span>
                      );
                    })}
                    {automation.music_playlist_id && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        <Volume2 className="w-3 h-3 inline mr-1" />
                        Play Music
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}