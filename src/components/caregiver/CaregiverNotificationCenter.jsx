import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, AlertTriangle, Heart, Camera, BookOpen, Moon, 
  Clock, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaregiverNotificationCenter({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all, unread, urgent
  const [expandedId, setExpandedId] = useState(null);
  const [actionNote, setActionNote] = useState('');

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['caregiverNotifications', patientProfileId],
    queryFn: async () => {
      if (!patientProfileId) return [];
      const all = await base44.entities.CaregiverNotification.filter(
        { patient_profile_id: patientProfileId },
        '-created_date',
        50
      );
      return all;
    },
    enabled: !!patientProfileId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const notification = notifications.find(n => n.id === notificationId);
      const readBy = notification.read_by || [];
      if (!readBy.includes(currentUser?.email)) {
        readBy.push(currentUser.email);
      }
      return await base44.entities.CaregiverNotification.update(notificationId, { read_by: readBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caregiverNotifications']);
    }
  });

  // Acknowledge and take action
  const acknowledgeMutation = useMutation({
    mutationFn: async ({ notificationId, action }) => {
      const notification = notifications.find(n => n.id === notificationId);
      const acknowledgedBy = notification.acknowledged_by || [];
      if (!acknowledgedBy.includes(currentUser?.email)) {
        acknowledgedBy.push(currentUser.email);
      }
      return await base44.entities.CaregiverNotification.update(notificationId, {
        acknowledged_by: acknowledgedBy,
        action_taken: action,
        action_taken_by: currentUser?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caregiverNotifications']);
      setExpandedId(null);
      setActionNote('');
      toast.success('Action recorded');
    }
  });

  const handleAcknowledge = (notificationId) => {
    if (!actionNote.trim()) {
      toast.error('Please describe the action taken');
      return;
    }
    acknowledgeMutation.mutate({ notificationId, action: actionNote });
  };

  const typeIcons = {
    high_anxiety: <AlertTriangle className="w-5 h-5 text-red-500" />,
    safety_concern: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    new_journal_entry: <BookOpen className="w-5 h-5 text-blue-500" />,
    new_media_upload: <Camera className="w-5 h-5 text-purple-500" />,
    care_adjustment_needed: <Heart className="w-5 h-5 text-pink-500" />,
    night_incident: <Moon className="w-5 h-5 text-indigo-500" />,
    missed_interaction: <Clock className="w-5 h-5 text-amber-500" />,
    general: <Bell className="w-5 h-5 text-slate-500" />
  };

  const severityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const isRead = (notification) => {
    return notification.read_by?.includes(currentUser?.email);
  };

  const isAcknowledged = (notification) => {
    return notification.acknowledged_by?.includes(currentUser?.email);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !isRead(n);
    if (filter === 'urgent') return n.severity === 'urgent' || n.severity === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !isRead(n)).length;
  const urgentCount = notifications.filter(n => 
    (n.severity === 'urgent' || n.severity === 'high') && !isAcknowledged(n)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-sm text-slate-600">
              {unreadCount} unread · {urgentCount} urgent
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('urgent')}
          >
            Urgent ({urgentCount})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification) => {
            const read = isRead(notification);
            const acknowledged = isAcknowledged(notification);
            const expanded = expandedId === notification.id;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    !read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  } ${
                    notification.severity === 'urgent' ? 'border-red-300' : ''
                  }`}
                  onClick={() => {
                    if (!read) markReadMutation.mutate(notification.id);
                    setExpandedId(expanded ? null : notification.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {typeIcons[notification.notification_type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>
                          <Badge className={severityColors[notification.severity]}>
                            {notification.severity}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.created_date).toLocaleString()}
                          </span>
                          {acknowledged && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Acknowledged
                            </span>
                          )}
                          {notification.read_by?.length > 0 && (
                            <span>
                              {notification.read_by.length} read
                            </span>
                          )}
                        </div>

                        {/* Additional Data */}
                        {expanded && notification.data && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm">
                            {notification.data.anxiety_level && (
                              <div className="mb-1">
                                <strong>Anxiety Level:</strong> {notification.data.anxiety_level}/10
                              </div>
                            )}
                            {notification.data.trigger_words?.length > 0 && (
                              <div className="mb-1">
                                <strong>Triggers:</strong> {notification.data.trigger_words.join(', ')}
                              </div>
                            )}
                            {notification.triggered_by && (
                              <div>
                                <strong>Source:</strong> {notification.triggered_by}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Taken */}
                        {expanded && notification.action_taken && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-green-900">Action Taken</div>
                                <div className="text-green-700">{notification.action_taken}</div>
                                <div className="text-xs text-green-600 mt-1">
                                  by {notification.action_taken_by}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Acknowledge Form */}
                        {expanded && !acknowledged && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Acknowledge & Record Action
                            </label>
                            <Textarea
                              placeholder="Describe what action you took (e.g., 'Called patient, provided reassurance')"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              className="mb-2"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(null);
                                  setActionNote('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(notification.id);
                                }}
                                disabled={acknowledgeMutation.isPending}
                              >
                                {acknowledgeMutation.isPending ? 'Saving...' : 'Acknowledge'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-sm text-slate-600">
                {filter === 'unread' 
                  ? 'All caught up! No unread notifications.' 
                  : filter === 'urgent'
                  ? 'No urgent notifications at this time.'
                  : 'Notifications will appear here when events occur.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}