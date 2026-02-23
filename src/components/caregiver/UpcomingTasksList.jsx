import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, AlertCircle, Pill, Stethoscope, Droplet, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const reminderTypeConfig = {
  medication: { icon: Pill, color: 'bg-red-100 text-red-700', label: 'Medication' },
  appointment: { icon: Stethoscope, color: 'bg-blue-100 text-blue-700', label: 'Appointment' },
  hydration: { icon: Droplet, color: 'bg-cyan-100 text-cyan-700', label: 'Hydration' },
  exercise: { icon: Activity, color: 'bg-green-100 text-green-700', label: 'Exercise' },
  meal: { icon: AlertCircle, color: 'bg-orange-100 text-orange-700', label: 'Meal' },
  social_call: { icon: AlertCircle, color: 'bg-purple-100 text-purple-700', label: 'Social Call' },
  custom: { icon: Clock, color: 'bg-slate-100 text-slate-700', label: 'Reminder' },
};

export default function UpcomingTasksList({ reminders, isLoading }) {
  const queryClient = useQueryClient();

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reminder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const handleAcknowledge = async (reminder) => {
    await updateReminderMutation.mutate({
      id: reminder.id,
      data: {
        last_acknowledged: new Date().toISOString(),
        acknowledgement_count: (reminder.acknowledgement_count || 0) + 1,
      },
    });
  };

  const sortedReminders = reminders.sort((a, b) => {
    const timeA = parseInt(a.time_of_day?.replace(':', '') || '0');
    const timeB = parseInt(b.time_of_day?.replace(':', '') || '0');
    return timeA - timeB;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Tasks & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Upcoming Tasks & Reminders
          {sortedReminders.length > 0 && (
            <Badge variant="secondary">{sortedReminders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedReminders.length > 0 ? (
          <div className="space-y-3">
            {sortedReminders.map((reminder) => {
              const config = reminderTypeConfig[reminder.reminder_type] || reminderTypeConfig.custom;
              const Icon = config.icon;

              return (
                <div
                  key={reminder.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleAcknowledge(reminder)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded ${config.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <h4 className="font-semibold text-sm">{reminder.title}</h4>
                      <Badge variant="outline" className="ml-auto">
                        {reminder.time_of_day}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {reminder.description}
                      </p>
                    )}
                    {reminder.voice_prompt && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Voice: {reminder.voice_prompt}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No upcoming reminders scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}