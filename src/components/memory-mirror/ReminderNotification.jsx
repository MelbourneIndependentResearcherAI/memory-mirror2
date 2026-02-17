import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, X, Pill, Activity, Utensils, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function ReminderNotification() {
  const queryClient = useQueryClient();
  const [activeReminder, setActiveReminder] = useState(null);
  const [checkedReminders, setCheckedReminders] = useState(new Set());

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list()
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ reminder }) => {
      // Update reminder
      await base44.entities.Reminder.update(reminder.id, {
        last_acknowledged: new Date().toISOString(),
        acknowledgement_count: (reminder.acknowledgement_count || 0) + 1
      });

      // Log to Care Journal
      await base44.entities.CareJournal.create({
        title: `Reminder Acknowledged: ${reminder.title}`,
        notes: `User acknowledged reminder at ${new Date().toLocaleTimeString()}${reminder.description ? `. Details: ${reminder.description}` : ''}`,
        entry_date: new Date().toISOString(),
        activities: [reminder.reminder_type]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['careJournal'] });
      toast.success('Reminder acknowledged');
    }
  });

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      for (const reminder of reminders) {
        if (!reminder.is_active) continue;
        if (checkedReminders.has(reminder.id)) continue;

        let shouldShow = false;

        if (reminder.schedule_type === 'daily' && reminder.time_of_day === currentTime) {
          shouldShow = true;
        } else if (reminder.schedule_type === 'weekly' && 
                   reminder.days_of_week?.includes(currentDay) && 
                   reminder.time_of_day === currentTime) {
          shouldShow = true;
        }

        if (shouldShow) {
          setActiveReminder(reminder);
          setCheckedReminders(prev => new Set(prev).add(reminder.id));

          // Speak the reminder if enabled
          if (reminder.speak_prompt) {
            const message = reminder.voice_prompt || `Time for ${reminder.title}`;
            speakReminder(message);
          }

          break;
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders, checkedReminders]);

  const speakReminder = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAcknowledge = () => {
    if (activeReminder) {
      acknowledgeMutation.mutate({ reminder: activeReminder });
      setActiveReminder(null);
    }
  };

  const handleDismiss = () => {
    setActiveReminder(null);
  };

  return (
    <AnimatePresence>
      {activeReminder && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-2xl p-6 border-4 border-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                {typeof reminderTypeIcons[activeReminder.reminder_type] === 'string' ? (
                  <span className="text-3xl">{reminderTypeIcons[activeReminder.reminder_type]}</span>
                ) : React.createElement(reminderTypeIcons[activeReminder.reminder_type] || Clock, {
                  className: "w-8 h-8"
                })}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{activeReminder.title}</h3>
                {activeReminder.description && (
                  <p className="text-white/90 mb-4">{activeReminder.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleAcknowledge}
                    className="flex-1 bg-white text-blue-600 hover:bg-white/90"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Done
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}