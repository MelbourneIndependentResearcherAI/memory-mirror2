import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export default function PlaylistScheduler() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
    playlist_id: '',
    schedule_time: '09:00',
    days_of_week: [],
    auto_play: false,
    repeat_weekly: true
  });

  // Fetch playlists
  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 100)
  });

  // Fetch schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['playlist-schedules'],
    queryFn: () => base44.entities.PlaylistSchedule.list('-created_date', 100)
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData) => {
      const user = await base44.auth.me();
      const playlist = playlists.find(p => p.id === scheduleData.playlist_id);
      
      return base44.entities.PlaylistSchedule.create({
        ...scheduleData,
        playlist_name: playlist?.name || 'Unknown Playlist',
        created_by_name: user?.full_name || 'Caregiver',
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist-schedules']);
      toast.success('Schedule created!');
      setIsCreating(false);
      resetForm();
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id) => base44.entities.PlaylistSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist-schedules']);
      toast.success('Schedule deleted');
    }
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.PlaylistSchedule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist-schedules']);
    }
  });

  const resetForm = () => {
    setNewSchedule({
      playlist_id: '',
      schedule_time: '09:00',
      days_of_week: [],
      auto_play: false,
      repeat_weekly: true
    });
  };

  const toggleDay = (dayValue) => {
    const days = newSchedule.days_of_week;
    if (days.includes(dayValue)) {
      setNewSchedule({
        ...newSchedule,
        days_of_week: days.filter(d => d !== dayValue)
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        days_of_week: [...days, dayValue].sort()
      });
    }
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.playlist_id) {
      toast.error('Please select a playlist');
      return;
    }

    createScheduleMutation.mutate(newSchedule);
  };

  const getDayLabels = (days) => {
    if (!days || days.length === 0) return 'Every day';
    if (days.length === 7) return 'Every day';
    return days.map(d => DAYS[d].label).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Playlist Schedules</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Playlist</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Select Playlist */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Playlist *
                </label>
                <Select
                  value={newSchedule.playlist_id}
                  onValueChange={(val) => setNewSchedule({ ...newSchedule, playlist_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time *
                </label>
                <Input
                  type="time"
                  value={newSchedule.schedule_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, schedule_time: e.target.value })}
                />
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Days (leave empty for every day)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      size="sm"
                      variant={newSchedule.days_of_week.includes(day.value) ? 'default' : 'outline'}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-play */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-play</p>
                  <p className="text-xs text-gray-500">
                    Start playing automatically (or just show notification)
                  </p>
                </div>
                <Switch
                  checked={newSchedule.auto_play}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, auto_play: checked })}
                />
              </div>

              {/* Repeat Weekly */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Repeat Weekly</p>
                  <p className="text-xs text-gray-500">
                    Schedule repeats every week
                  </p>
                </div>
                <Switch
                  checked={newSchedule.repeat_weekly}
                  onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, repeat_weekly: checked })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateSchedule}
                  disabled={createScheduleMutation.isLoading}
                  className="flex-1"
                >
                  Create Schedule
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

      {/* Existing Schedules */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No schedules yet. Create one to automatically play playlists at specific times!
            </CardContent>
          </Card>
        ) : (
          schedules.map(schedule => (
            <Card key={schedule.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <p className="font-medium">{schedule.playlist_name}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{schedule.schedule_time}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getDayLabels(schedule.days_of_week)}
                      </span>
                      {schedule.auto_play && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Auto-play
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={(checked) =>
                        toggleScheduleMutation.mutate({ id: schedule.id, is_active: checked })
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}