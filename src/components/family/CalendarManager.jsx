import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Trash2, MapPin, Clock, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';

export default function CalendarManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'other',
    location: '',
    reminder_enabled: true,
    created_by_name: '',
  });

  const { data: events = [] } = useQuery({
    queryKey: ['family-events'],
    queryFn: () => base44.entities.FamilyEvent.list('-event_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-events'] });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_type: 'other',
        location: '',
        reminder_enabled: true,
        created_by_name: '',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyEvent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family-events'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.event_date && formData.created_by_name) {
      createMutation.mutate(formData);
    }
  };

  const upcomingEvents = events.filter(e => isFuture(parseISO(e.event_date)) || isToday(parseISO(e.event_date)));
  const pastEvents = events.filter(e => isPast(parseISO(e.event_date)) && !isToday(parseISO(e.event_date)));

  const eventTypeColors = {
    birthday: 'bg-pink-100 border-pink-300 dark:bg-pink-950 dark:border-pink-700',
    appointment: 'bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-700',
    family_gathering: 'bg-purple-100 border-purple-300 dark:bg-purple-950 dark:border-purple-700',
    reminder: 'bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-700',
    other: 'bg-slate-100 border-slate-300 dark:bg-slate-900 dark:border-slate-700',
  };

  const eventTypeIcons = {
    birthday: '🎂',
    appointment: '🏥',
    family_gathering: '👨‍👩‍👧‍👦',
    reminder: '🔔',
    other: '📅',
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <Calendar className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>Family Calendar:</strong> Share important dates, appointments, and events. The AI can remind your loved one about upcoming occasions.
        </AlertDescription>
      </Alert>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Event
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Calendar Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Doctor's Appointment"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Event Type</label>
                  <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Birthday 🎂</SelectItem>
                      <SelectItem value="appointment">Appointment 🏥</SelectItem>
                      <SelectItem value="family_gathering">Family Gathering 👨‍👩‍👧‍👦</SelectItem>
                      <SelectItem value="reminder">Reminder 🔔</SelectItem>
                      <SelectItem value="other">Other 📅</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., 123 Main St or Dr. Smith's Office"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the event..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Name *</label>
                <Input
                  value={formData.created_by_name}
                  onChange={(e) => setFormData({ ...formData, created_by_name: e.target.value })}
                  placeholder="Who is adding this event?"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.reminder_enabled}
                  onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">Enable AI reminders for this event</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Adding...' : 'Add Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Events ({upcomingEvents.length})</h3>
          <div className="grid gap-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className={`border-2 ${eventTypeColors[event.event_type]}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{eventTypeIcons[event.event_type]}</span>
                        <span className="font-semibold text-lg">{event.title}</span>
                        {event.reminder_enabled && <Bell className="w-4 h-4 text-blue-500" />}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(parseISO(event.event_date), 'PPpp')}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.description && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{event.description}</p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400">Added by {event.created_by_name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(event.id)}
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
      )}

      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Past Events ({pastEvents.length})</h3>
          <div className="grid gap-3 opacity-60">
            {pastEvents.slice(0, 5).map((event) => (
              <Card key={event.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{eventTypeIcons[event.event_type]}</span>
                        <span className="font-semibold">{event.title}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(parseISO(event.event_date), 'PPP')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(event.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}