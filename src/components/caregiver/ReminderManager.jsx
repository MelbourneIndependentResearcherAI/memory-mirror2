import React, { useState } from 'react';
import { Plus, Clock, Pill, Activity, Utensils, Phone, Calendar, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const reminderTypeIcons = {
  medication: Pill,
  exercise: Activity,
  meal: Utensils,
  social_call: Phone,
  appointment: Calendar,
  hydration: '💧',
  custom: Clock
};

export default function ReminderManager({ onBack }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'medication',
    schedule_type: 'daily',
    time_of_day: '09:00',
    days_of_week: [],
    interval_hours: 4,
    is_active: true,
    voice_prompt: '',
    show_notification: true,
    speak_prompt: true
  });

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created successfully');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reminder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder updated');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_type: 'medication',
      schedule_type: 'daily',
      time_of_day: '09:00',
      days_of_week: [],
      interval_hours: 4,
      is_active: true,
      voice_prompt: '',
      show_notification: true,
      speak_prompt: true
    });
    setEditingReminder(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_type: reminder.reminder_type,
      schedule_type: reminder.schedule_type,
      time_of_day: reminder.time_of_day,
      days_of_week: reminder.days_of_week || [],
      interval_hours: reminder.interval_hours || 4,
      is_active: reminder.is_active,
      voice_prompt: reminder.voice_prompt || '',
      show_notification: reminder.show_notification !== false,
      speak_prompt: reminder.speak_prompt !== false
    });
    setShowForm(true);
  };

  const toggleDayOfWeek = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Reminder Management</h2>
            <p className="text-sm text-muted-foreground">Set up gentle reminders for daily activities</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Reminder
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Take morning medication"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={formData.reminder_type} onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">💊 Medication</SelectItem>
                      <SelectItem value="exercise">🏃 Exercise</SelectItem>
                      <SelectItem value="meal">🍽️ Meal</SelectItem>
                      <SelectItem value="social_call">📞 Social Call</SelectItem>
                      <SelectItem value="appointment">📅 Appointment</SelectItem>
                      <SelectItem value="hydration">💧 Hydration</SelectItem>
                      <SelectItem value="custom">⏰ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Schedule</label>
                  <Select value={formData.schedule_type} onValueChange={(value) => setFormData({ ...formData, schedule_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Specific Days</SelectItem>
                      <SelectItem value="interval">Every Few Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.schedule_type !== 'interval' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time</label>
                    <Input
                      type="time"
                      value={formData.time_of_day}
                      onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                      required
                    />
                  </div>
                )}

                {formData.schedule_type === 'interval' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Every (hours)</label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={formData.interval_hours}
                      onChange={(e) => setFormData({ ...formData, interval_hours: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {formData.schedule_type === 'weekly' && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">Days of Week</label>
                    <div className="flex gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDayOfWeek(idx)}
                          className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                            formData.days_of_week.includes(idx)
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Voice Prompt (Optional)</label>
                  <Textarea
                    value={formData.voice_prompt}
                    onChange={(e) => setFormData({ ...formData, voice_prompt: e.target.value })}
                    placeholder="e.g., It's time for your morning medication. Would you like some water?"
                    rows={2}
                  />
                </div>

                <div className="col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Notification</label>
                    <Switch
                      checked={formData.show_notification}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_notification: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Voice Announcement</label>
                    <Switch
                      checked={formData.speak_prompt}
                      onCheckedChange={(checked) => setFormData({ ...formData, speak_prompt: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Active</label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReminder ? 'Update' : 'Create'} Reminder
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reminders set up yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Create Your First Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => {
            const Icon = typeof reminderTypeIcons[reminder.reminder_type] === 'string' 
              ? () => <span className="text-2xl">{reminderTypeIcons[reminder.reminder_type]}</span>
              : reminderTypeIcons[reminder.reminder_type] || Clock;
            
            return (
              <Card key={reminder.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>⏰ {reminder.time_of_day}</span>
                            <span>📅 {reminder.schedule_type}</span>
                            {reminder.acknowledgement_count > 0 && (
                              <span>✅ {reminder.acknowledgement_count} times</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(reminder.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {!reminder.is_active && (
                        <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}