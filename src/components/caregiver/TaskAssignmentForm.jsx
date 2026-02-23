import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function TaskAssignmentForm({ careTeam, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    reminder_type: 'custom',
    schedule_type: 'daily',
    time_of_day: '09:00',
  });

  const createReminderMutation = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Task assigned successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to assign task');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.assigned_to) {
      toast.error('Please fill in all required fields');
      return;
    }

    createReminderMutation.mutate({
      title: formData.title,
      description: formData.description,
      reminder_type: formData.reminder_type,
      schedule_type: formData.schedule_type,
      time_of_day: formData.time_of_day,
      is_active: true,
      show_notification: true,
      speak_prompt: false,
      assigned_to: formData.assigned_to,
    });
  };

  const assignedCaregiver = careTeam.find((m) => m.id === formData.assigned_to);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Task Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., Give medication"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Additional details about this task..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 min-h-20"
        />
      </div>

      {/* Assign To */}
      <div>
        <Label htmlFor="assigned_to" className="text-sm font-medium">
          Assign To *
        </Label>
        <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select team member..." />
          </SelectTrigger>
          <SelectContent>
            {careTeam.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.caregiver_name} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task Type */}
      <div>
        <Label htmlFor="reminder_type" className="text-sm font-medium">
          Task Type
        </Label>
        <Select value={formData.reminder_type} onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medication">Medication</SelectItem>
            <SelectItem value="appointment">Appointment</SelectItem>
            <SelectItem value="meal">Meal</SelectItem>
            <SelectItem value="exercise">Exercise</SelectItem>
            <SelectItem value="hydration">Hydration</SelectItem>
            <SelectItem value="social_call">Social Call</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schedule Type */}
      <div>
        <Label htmlFor="schedule_type" className="text-sm font-medium">
          Schedule
        </Label>
        <Select value={formData.schedule_type} onValueChange={(value) => setFormData({ ...formData, schedule_type: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="specific_time">Specific Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time */}
      <div>
        <Label htmlFor="time_of_day" className="text-sm font-medium">
          Time
        </Label>
        <Input
          id="time_of_day"
          type="time"
          value={formData.time_of_day}
          onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Summary */}
      {assignedCaregiver && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p>
            Task will be assigned to <strong>{assignedCaregiver.caregiver_name}</strong> ({assignedCaregiver.role})
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={createReminderMutation.isPending}
          className="flex-1"
        >
          {createReminderMutation.isPending ? 'Assigning...' : 'Assign Task'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}