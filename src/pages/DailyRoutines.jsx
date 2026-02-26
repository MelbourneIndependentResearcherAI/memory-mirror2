import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DailyRoutineReminder from '@/components/memory-mirror/DailyRoutineReminder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Heart, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function DailyRoutinesPage() {
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({ adherence: 0, completedDays: 0 });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles?.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
      }
    };

    fetchProfile();
  }, []);

  // Fetch routines for today
  const { data: routines } = useQuery({
    queryKey: ['daily-routines'],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const patientProfiles = await base44.entities.PatientProfile.list();
      if (!patientProfiles?.length) return [];

      const routineData = await base44.entities.DailyRoutinePattern.filter({
        patient_profile_id: patientProfiles[0].id,
        is_active: true
      });

      return routineData || [];
    },
    enabled: !!userProfile
  });

  useEffect(() => {
    if (routines?.length > 0 && !currentRoutine) {
      setCurrentRoutine(routines[0]);
    }
  }, [routines]);

  const handleActivityCompleted = async (activity) => {
    try {
      // Log the activity completion
      await base44.entities.ActivityLog.create({
        activity_type: 'routine_activity_completed',
        details: {
          activity_name: activity,
          completed: true,
          completed_at: new Date().toISOString()
        }
      });

      toast.success(`Great! "${activity}" completed! 🎉`);

      // Update weekly stats
      setWeeklyStats(prev => ({
        ...prev,
        adherence: Math.min(100, prev.adherence + 5)
      }));
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Your Daily Routine
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Stay on track with gentle reminders and a caring companion
          </p>
        </div>

        {/* Today's Date & Greeting */}
        <Card className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Good {getGreeting()}, {userProfile?.loved_one_name || 'Friend'}!
              </h2>
            </div>
            <Heart className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
        </Card>

        {/* Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">This Week's Adherence</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {weeklyStats.adherence}%
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed Days</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {weeklyStats.completedDays}/7
                </p>
              </div>
              <Calendar className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Main Routine Display */}
        {currentRoutine ? (
          <>
            <DailyRoutineReminder
              routine={currentRoutine}
              onActivityCompleted={handleActivityCompleted}
              upcomingReminders={true}
            />
          </>
        ) : (
          <Card className="p-12 text-center dark:bg-slate-800">
            <Clock className="w-16 h-16 mx-auto text-slate-400 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No routine set up yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your caregiver will create a personalized routine for you soon.
            </p>
            <Button variant="outline">
              Learn About Daily Routines
            </Button>
          </Card>
        )}

        {/* Other Routines */}
        {routines && routines.length > 1 && (
          <Card className="p-6 dark:bg-slate-800">
            <h3 className="font-bold text-lg mb-4">Other Routines</h3>
            <div className="flex flex-wrap gap-2">
              {routines.map(routine => (
                <Button
                  key={routine.id}
                  onClick={() => setCurrentRoutine(routine)}
                  variant={currentRoutine?.id === routine.id ? 'default' : 'outline'}
                  className="text-sm"
                >
                  {routine.routine_name}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Helpful Tips */}
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <h3 className="font-bold text-lg mb-3 text-amber-900 dark:text-amber-200">
            💡 Helpful Tips
          </h3>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
            <li>✓ Try to follow the routine at the same times each day</li>
            <li>✓ It's okay to be a little flexible - life happens!</li>
            <li>✓ Your caregiver is always here to help if you need anything</li>
            <li>✓ Completing activities helps your caregiver care for you better</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}