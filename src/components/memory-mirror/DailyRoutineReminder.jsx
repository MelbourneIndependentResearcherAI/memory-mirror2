import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const activityIcons = {
  meal: '🍽️',
  medication: '💊',
  exercise: '🚶',
  rest: '😴',
  activity: '🎮',
  social: '👥',
  personal_care: '🚿',
  walk: '🌳'
};

export default function DailyRoutineReminder({ 
  routine, 
  onActivityCompleted,
  upcomingReminders 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [nextActivity, setNextActivity] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!routine?.routine_activities) return;

    const now = currentTime;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find next uncompleted activity
    const upcoming = routine.routine_activities.find(activity => {
      const completed = completedActivities.has(activity.activity);
      return !completed && activity.scheduled_time >= currentTimeStr;
    });

    setNextActivity(upcoming || null);
  }, [currentTime, routine, completedActivities]);

  const handleActivityCompleted = (activity) => {
    setCompletedActivities(prev => new Set([...prev, activity]));
    
    if (onActivityCompleted) {
      onActivityCompleted(activity);
    }
  };

  if (!routine?.routine_activities) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>No routine set up yet</p>
      </div>
    );
  }

  const timeUntilNext = nextActivity 
    ? calculateTimeUntil(nextActivity.scheduled_time, currentTime)
    : null;

  return (
    <div className="space-y-4">
      {/* Next Activity Alert */}
      {nextActivity && timeUntilNext !== null && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">Next activity in {timeUntilNext}:</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mt-1">
            {activityIcons[nextActivity.activity.split('_')[0]] || '⏰'} {nextActivity.activity}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{nextActivity.gentle_prompt}</p>
        </motion.div>
      )}

      {/* Daily Routine Timeline */}
      <Card className="p-4 dark:bg-slate-800">
        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Today's Schedule</h3>
        
        <div className="space-y-2">
          {routine.routine_activities.map((activity, idx) => {
            const isCompleted = completedActivities.has(activity.activity);
            const isUpcoming = nextActivity?.activity === activity.activity;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-3 rounded-lg flex items-center justify-between transition-all ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                    : isUpcoming
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 ring-2 ring-blue-100'
                    : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">
                    {activityIcons[activity.activity.split('_')[0]] || '⏰'}
                  </span>
                  
                  <div>
                    <p className={`font-semibold ${
                      isCompleted ? 'text-green-700 dark:text-green-300 line-through' : 'text-slate-900 dark:text-white'
                    }`}>
                      {activity.activity}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.scheduled_time}
                      {activity.duration_minutes && ` • ${activity.duration_minutes} min`}
                    </p>
                  </div>
                </div>

                {!isCompleted && (
                  <Button
                    onClick={() => handleActivityCompleted(activity.activity)}
                    variant="outline"
                    className="ml-2 text-sm h-8"
                  >
                    Done
                  </Button>
                )}

                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Routine Health Summary */}
      <Card className="p-4 dark:bg-slate-800 bg-slate-50">
        <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Today's Progress</h4>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                style={{
                  width: `${(completedActivities.size / routine.routine_activities.length) * 100}%`
                }}
              />
            </div>
          </div>
          
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {completedActivities.size}/{routine.routine_activities.length}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          You're doing great! {
            completedActivities.size === routine.routine_activities.length
              ? '🎉 All activities completed for today!'
              : `${routine.routine_activities.length - completedActivities.size} activities remaining`
          }
        </p>
      </Card>

      {/* Gentle Encouragement */}
      {completedActivities.size > 0 && completedActivities.size < routine.routine_activities.length && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg text-center"
        >
          <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
            💫 Keep going! You're doing wonderfully today.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function calculateTimeUntil(scheduledTime, currentTime) {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const scheduled = new Date(currentTime);
  scheduled.setHours(hours, minutes, 0);

  if (scheduled < currentTime) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  const diffMs = scheduled - currentTime;
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins === 1) return '1 minute';
  if (diffMins < 60) return `${diffMins} minutes`;

  const hours_until = Math.floor(diffMins / 60);
  const mins_until = diffMins % 60;

  if (hours_until === 1 && mins_until === 0) return '1 hour';
  if (hours_until === 1) return `1 hour ${mins_until} minutes`;
  
  return `${hours_until} hours`;
}